from rest_framework import generics, views
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

        in_range = True
        curr = r1

        while in_range: # Hacky do-while loop
            for c in range(c1, c2):
                Rack.objects.create(
                    datacenter=request.data['datacenter'],
                    version=request.META.get('HTTP_X_CHANGE_PLAN', 0),
                    rack=curr + str(c)
                )

            if curr == r2:
                break
            curr = next_char(r1)
