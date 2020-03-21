from django.db import IntegrityError
from django.db.models import ProtectedError
from rest_framework import generics, views, status
from rest_framework.response import Response

from .handlers import create_rack_extra
from .new_serializers import *
from .models import *


class DatacenterCreate(generics.CreateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class ITModelCreate(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetCreate(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


# Used for RackRange views
def next_char(char):
    if len(char) == 1:
        if char < "Z":
            return chr(ord(char) + 1)
        else:
            return "AA"
    else:
        if char[-1] < "Z":
            return char[:-1] + next_char(char[-1])
        else:
            return next_char(char[:-1]) + "A"


class RackRangeCreate(views.APIView):
    def post(self, request):

        r1 = request.data['r1'].upper()
        r2 = request.data['r2'].upper()
        c1 = request.data['c1']
        c2 = request.data['c2']

        version = request.META.get('HTTP_X_CHANGE_PLAN', 0)

        curr = r1
        racks = []
        warns = []
        err = []

        while True:
            for c in range(c1, c2 + 1):
                rack = curr + str(c)
                try:
                    new = Rack(
                        datacenter=Datacenter.objects.get(id=request.data['datacenter']),
                        version=ChangePlan.objects.get(id=version),
                        rack=rack
                    )
                    new.save()
                    create_rack_extra(new, version)
                    racks.append(new)
                except IntegrityError:
                    warns.append(rack + " already exists.")
                except Exception as e:
                    err.append(str(e))

            if curr == r2:
                break

            curr = next_char(curr)

        return Response({
            "res": [RackSerializer(rack).data for rack in racks],
            "warn": warns if warns else None,
            "err": err if err else None
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
        r1 = request.data['r1'].upper()
        r2 = request.data['r2'].upper()
        c1 = request.data['c1']
        c2 = request.data['c2']
        datacenter = request.data['datacenter']

        version = request.META.get('HTTP_X_CHANGE_PLAN', 0)

        curr = r1
        racks = []
        warns = []
        err = []

        while True:
            for c in range(c1, c2 + 1):
                rackname = curr + str(c)
                try:
                    rack = Rack.objects.get(rack=rackname, datacenter_id=datacenter, version=version)
                    rack_id = rack.id
                    rack.delete()
                    racks.append(rack_id)
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
                    print(e)
                    err.append("Unexpected error when deleting " + rackname + ".")

            if curr == r2:
                break

            curr = next_char(curr)

        return Response({
            "res": racks,
            "warn": warns if warns else None,
            "err": err if err else None
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
