from django.db import IntegrityError
from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK
from hyposoft.utils import generate_racks, add_rack, add_asset, add_network_conn, versioned_object
from system_log.views import CreateAndLogMixin, UpdateAndLogMixin, DeleteAndLogMixin, log_decommission
from .handlers import create_rack_extra
from .serializers import *
from .models import *
import logging


class DatacenterCreate(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class ITModelCreate(CreateAndLogMixin, generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetCreate(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    def create(self, request, *args, **kwargs):
        version = ChangePlan.objects.get(id=get_version(request))
        if version.id != 0:
            rack = Rack.objects.get(id=request.data['rack'])
            versioned_rack = versioned_object(rack, version, Rack.IDENTITY_FIELDS)
            if not versioned_rack:
                versioned_rack = add_rack(rack, version)
            request.data['rack'] = versioned_rack.id
        return super(AssetCreate, self).create(request, *args, **kwargs)


class RackRangeCreate(views.APIView):
    def post(self, request):
        r1 = request.data['r1']
        r2 = request.data['r2']
        c1 = request.data['c1']
        c2 = request.data['c2']

        racks = generate_racks(r1, r2, c1, c2)

        version = ChangePlan.objects.get(id=get_version(request))
        created = []
        warns = []
        err = []

        for rack in racks:
            try:
                new = Rack(
                    datacenter=Datacenter.objects.get(id=request.data['datacenter']),
                    version=version,
                    rack=rack
                )
                new.save()
                create_rack_extra(new, version)
                created.append(new)
            except IntegrityError:
                warns.append(rack + ' already exists.')
            except Exception as e:
                err.append(str(e))

        return Response({
            'created': [RackSerializer(rack).data for rack in created],
            'warn': warns,
            'err': err
        })


class ITModelUpdate(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetUpdate(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer

    @transaction.atomic()
    def update(self, request, *args, **kwargs):
        version = ChangePlan.objects.get(id=get_version(request))
        asset = self.get_object()
        asset_ver = asset.version
        if version != asset_ver:
            data = request.data
            rack = versioned_object(asset.rack, version, Rack.IDENTITY_FIELDS)
            if not rack:
                rack = add_rack(asset.rack, version)
                create_rack_extra(rack, version)
            old_pdus = {port['id']: port['position']
                        for port in asset.rack.pdu_set.order_by('position').values('id', 'position')}
            new_pdus = {port['position']: port['id']
                        for port in rack.pdu_set.order_by('position').values('id', 'position')}
            data['rack'] = rack.id
            for i, port in enumerate(request.data['power_connections']):
               data['power_connections'][i]['pdu_id'] = new_pdus[old_pdus[port['pdu_id']]]

            for i, port in enumerate(request.data['network_ports']):
                if port['connection'] is not None:
                    versioned_conn = add_network_conn(NetworkPort.objects.get(id=port['connection']), version)
                    data['network_ports'][i]['connection'] = versioned_conn.id

            serializer = AssetSerializer(data=data, context={'request': request, 'version': version.id})
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(data=serializer.data, status=HTTP_200_OK)

        else:
            return super(AssetUpdate, self).update(request, *args, **kwargs)


class DatacenterUpdate(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DestroyWithIdMixin(object):
    def destroy(self, *args, **kwargs):
        id = self.get_object().id
        super().destroy(*args, **kwargs)
        return Response(id, status=status.HTTP_200_OK)


class ITModelDestroy(DeleteAndLogMixin, DestroyWithIdMixin, generics.DestroyAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class VendorList(views.APIView):
    def get(self, request):
        vendors = ITModel.objects.values('vendor')
        return Response([v['vendor'] for v in vendors])


class AssetDestroy(DeleteAndLogMixin, DestroyWithIdMixin, generics.DestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class RackRangeDestroy(views.APIView):
    def post(self, request):
        r1 = request.data['r1']
        r2 = request.data['r2']
        c1 = request.data['c1']
        c2 = request.data['c2']
        datacenter = request.data['datacenter']

        version = get_version(request)
        removed = []
        warns = []
        err = []

        racks = generate_racks(r1, r2, c1, c2)

        for rackname in racks:
            try:
                rack = Rack.objects.get(rack=rackname, datacenter_id=datacenter, version=version)
                rack_id = rack.id
                rack.delete()
                removed.append(rack_id)
            except Rack.DoesNotExist:
                warns.append(rackname + ' does not exist: rack skipped.')
            except ProtectedError as e:
                decommission = True
                for asset in e.args[1]:
                    if asset.commissioned:
                        decommission = False
                        break
                if decommission:
                    rack.decommissioned = True
                    rack.save()
                    warns.append('Decommissioned assets exist on ' + rackname + ': rack decommissioned.')
                else:
                    err.append('Assets exist on ' + rackname + ': rack skipped.')
            except Exception as e:
                logging.exception(e, exc_info=True)
                err.append('Unexpected error when deleting ' + rackname + '.')

        return Response({
            'removed': removed,
            'warn': warns,
            'err': err
        })


class DatacenterDestroy(DeleteAndLogMixin, DestroyWithIdMixin, generics.DestroyAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class ITModelRetrieve(generics.RetrieveAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetRetrieve(generics.RetrieveAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetDetailRetrieve(generics.RetrieveAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetDetailSerializer


class RackView(views.APIView):
    def post(self, request):
        rack_ids = request.data['rack_ids']
        racks = [Rack.objects.get(id=id) for id in rack_ids]
        return Response({
            rack.id: {
                "rack": RackSerializer(rack).data,
                "assets": [{"asset": AssetSerializer(asset).data, "model": ITModelSerializer(asset.itmodel).data}
                           for asset in rack.asset_set.order_by('rack_position')]}
            for rack in racks}, status=HTTP_200_OK)


class DecommissionAsset(views.APIView):
    serializer_class = AssetDetailSerializer

    @transaction.atomic()
    def post(self, request, asset_id):
        try:
            asset = Asset.objects.get(id=asset_id)
            user = request.user
            version = ChangePlan.objects.get(id=get_version(request))

            change_plan = ChangePlan.objects.create(
                owner=user,
                name='_DECOMMISSION_' + str(asset.id),
                executed=version.executed,
                executed_at=version.executed_at,
                auto_created=True,
                parent=version
            )

            # Freeze Asset - Copy all data to new change plan
            # Requires resetting of all foreign keys


            old_rack = Rack.objects.get(id=asset.rack.id)
            old_asset = Asset.objects.get(id=asset.id)

            asset = add_asset(asset, change_plan)

            rack = asset.rack
            asset.commissioned = None
            asset.decommissioned_by = user
            asset.decommissioned_timestamp = datetime.datetime.now()
            asset.save()

            # if the loop variable name is 'asset' it overrides the 'asset' at this scope
            for a in old_rack.asset_set.exclude(id=old_asset.id):
                add_asset(a, change_plan)

            for pdu in old_rack.pdu_set.filter(version=version):
                old_pdu = PDU.objects.get(id=pdu.id)
                pdu.id = None
                pdu.rack = rack
                pdu.networked = False
                pdu.version = change_plan
                pdu.save()

                for power in old_pdu.powered_set.filter(version=version):
                    power.id = None
                    power.pdu = pdu
                    power.asset = asset
                    power.version = change_plan
                    power.save()

            def loop_ports(old_asset, recurse):
                for port in old_asset.networkport_set.all():
                    old_port = NetworkPort.objects.get(id=port.id)
                    other = old_port.connection
                    port = add_network_conn(port, change_plan)
                    if other:
                        if recurse:
                            loop_ports(other.asset, False)
                        other = add_network_conn(other, change_plan)
                        other.connection = port
                        port.connection = other
                        other.save()
                        port.save()

            loop_ports(old_asset, True)

            log_decommission(self, old_asset)

            if old_asset.version == version:
                old_asset.delete()


            response = DecommissionedAssetSerializer(asset, context={'request': request, 'version': version.id})
            return Response(response.data, status=status.HTTP_202_ACCEPTED)
        except Asset.DoesNotExist:
            raise serializers.ValidationError(
                'Asset does not exist.'
            )
        except ChangePlan.DoesNotExist:
            raise serializers.ValidationError(
                'Change Plan does not exist.'
            )
