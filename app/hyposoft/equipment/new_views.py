from django.db import IntegrityError
from django.db.models import ProtectedError
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

        version = request.META.get('HTTP_X_CHANGE_PLAN', 0)
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

        version = request.META.get('HTTP_X_CHANGE_PLAN', 0)
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
