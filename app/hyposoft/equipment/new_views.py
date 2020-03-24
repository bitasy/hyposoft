from django.db import IntegrityError
from django.db.models import ProtectedError
from django.utils import timezone
from rest_framework import generics, views, status
from rest_framework.response import Response

from hyposoft.utils import generate_racks
from .handlers import create_rack_extra
from .new_serializers import *
from .models import *

import logging

class DatacenterCreate(generics.CreateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class ITModelCreate(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetCreate(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class RackRangeCreate(views.APIView):
    def post(self, request):
        r1 = request.data['r1']
        r2 = request.data['r2']
        c1 = request.data['c1']
        c2 = request.data['c2']

        racks = generate_racks(r1, r2, c1, c2)

        version = get_version(request)
        created = []
        warns = []
        err = []

        for rack in racks:
            try:
                new = Rack(
                    datacenter=Datacenter.objects.get(id=request.data['datacenter']),
                    version=ChangePlan.objects.get(id=version),
                    rack=rack
                )
                new.save()
                create_rack_extra(new, version)
                created.append(new)
            except IntegrityError:
                warns.append(rack + " already exists.")
            except Exception as e:
                err.append(str(e))

        return Response({
            "created": [RackSerializer(rack).data for rack in created],
            "warn": warns,
            "err": err
        })


class ITModelUpdate(generics.UpdateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetUpdate(generics.UpdateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class DatacenterUpdate(generics.UpdateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DestroyWithIdMixin(object):
    def destroy(self, *args, **kwargs):
        id = self.get_object().id
        super().destroy(*args, **kwargs)
        return Response(id, status=status.HTTP_200_OK)


class ITModelDestroy(DestroyWithIdMixin, generics.DestroyAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetDestroy(DestroyWithIdMixin, generics.DestroyAPIView):
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
                warns.append(rackname + " does not exist: rack skipped.")
            except ProtectedError as e:
                decommission = True
                for asset in e.args[1]:
                    if asset.commissioned:
                        decommission = False
                        break
                if decommission:
                    rack.decommissioned = True
                    rack.save()
                    warns.append("Decommissioned assets exist on " + rackname + ": rack decommissioned.")
                else:
                    err.append("Assets exist on " + rackname + ": rack skipped.")
            except Exception as e:
                logging.exception(e, exc_info=True)
                err.append("Unexpected error when deleting " + rackname + ".")

        return Response({
            "removed": removed,
            "warn": warns,
            "err": err
        })


class DatacenterDestroy(DestroyWithIdMixin, generics.DestroyAPIView):
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


class DecommissionAsset(views.APIView):
    @transaction.atomic()
    def post(self, request, asset_id):
        try:
            asset = Asset.objects.get(id=asset_id)
            user = request.user
            version = ChangePlan.objects.get(id=get_version(request))
            now = timezone.now()

            change_plan = ChangePlan.objects.create(
                owner=user,
                name="_DECOMMISSION_" + str(asset.asset_number),
                executed=version.executed,
                time_executed=now,
                auto_created=True,
                parent=version
            )

            ### Freeze Asset - Copy all data to new change plan
            # Requires resetting of all foreign keys

            def add_rack(rack):
                rack.id = None
                rack.version = change_plan
                rack.save()
                return rack

            old_rack = asset.rack
            rack = add_rack(asset.rack)

            old_asset = asset

            def add_asset(prev_asset, new_rack):
                prev_asset.id = None
                prev_asset.version = change_plan
                prev_asset.rack = new_rack
                prev_asset.save()
                return prev_asset

            asset = add_asset(asset, rack)
            asset.commissioned = None
            asset.decommissioned_by = user
            asset.decommissioned_timestamp = now

            old_asset.rack = None

            for asset in old_rack.asset_set:
                add_asset(asset, rack)

            for pdu in old_rack.pdu_set:
                old_pdu = pdu
                pdu.id = None
                pdu.rack = rack
                pdu.networked = False
                pdu.version = change_plan
                pdu.save()

                for power in old_pdu.powered_set:
                    power.id = None
                    power.pdu = pdu
                    power.asset = asset
                    power.verion = change_plan

            def add_port(port):
                new_port = NetworkPort.objects.filter(
                    version=change_plan,
                    asset__asset_number=port.asset.asset_number,
                    label=port.label).first()
                if new_port:
                    return new_port
                port_asset = port.asset
                port_rack = port_asset.rack
                new_port_rack = Rack.objects.filter(version=change_plan, rack=port_rack.rack).first()
                if new_port_rack is None:
                    new_port_rack = add_rack(port_rack)
                new_port_asset = Asset.objects.filter(version=change_plan, asset_number=port_asset.asset_number).first()
                if new_port_asset is None:
                    new_port_asset = add_asset(port_asset, new_port_rack)
                port.id = None
                port.asset = new_port_asset
                port.version = change_plan
                port.connection = None
                port.save()
                return port

            def loop_ports(old_asset, recurse):
                for port in old_asset.networkport_set:
                    old_port = port
                    other = old_port.connection
                    port = add_port(port)
                    if other:
                        if recurse:
                            loop_ports(other.asset, False)
                        other = add_port(other)
                        other.connection = port
                        port.connection = other
                        other.save()
                        port.save()

            loop_ports(old_asset, True)

            old_asset.delete()

            response = AssetDetailSerializer(asset, context={"request": request, "version": 0})
            return Response(response.data, status=status.HTTP_202_ACCEPTED)
        except Asset.DoesNotExist:
            raise serializers.ValidationError(
                "Asset does not exist."
            )
        except ChangePlan.DoesNotExist:
            raise serializers.ValidationError(
                "Change Plan does not exist."
            )
