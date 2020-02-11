from rest_framework import generics
from .models import ITModel, Asset, Rack
from .serializers import ITModelSerializer, AssetSerializer, RackSerializer
from rest_framework.response import Response
from rest_framework import status

# This mixin makes the destroy view return the deleted item
class DestroyWithPayloadMixin(object):
    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)

# ITModel
class ITModelCreateView(generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelRetrieveView(generics.RetrieveAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelUpdateView(generics.UpdateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelListView(generics.ListAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


# Asset
class AssetCreateView(generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetRetrieveView(generics.RetrieveAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetUpdateView(generics.UpdateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetDestroyView(generics.DestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetListView(DestroyWithPayloadMixin, generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


# Rack
class RackCreateView(generics.CreateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackRetrieveView(generics.RetrieveAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackUpdateView(generics.UpdateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackListView(generics.ListAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer





