from django.db import IntegrityError
from rest_framework import generics, views
from rest_framework.response import Response

from .handlers import create_rack_extra
from .new_serializers import *
from .models import *


class ITModelCreate(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class AssetCreate(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class RackRangeCreate(views.APIView):
    def post(self, request):

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
