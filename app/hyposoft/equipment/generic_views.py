from rest_framework import generics
from .serializers import *
from system_log.views import CreateAndLogMixin, UpdateAndLogMixin, DeleteAndLogMixin

from .models import *
from .views import DestroyWithPayloadMixin, FilterByDatacenterMixin


# Datacenter
class DatacenterCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterRetrieveView(generics.RetrieveAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterDestroyView(DeleteAndLogMixin, DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterListView(generics.ListAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


# ITModel
class ITModelCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelRetrieveView(generics.RetrieveAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


class ITModelListView(generics.ListAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer


# Asset
class AssetCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetRetrieveView(generics.RetrieveAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetDestroyView(DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


class AssetListView(FilterByDatacenterMixin, DestroyWithPayloadMixin, generics.ListAPIView):
    queryset = Asset.objects.all()
    serializer_class = AssetSerializer


# Rack
class RackCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackRetrieveView(generics.RetrieveAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


class RackListView(FilterByDatacenterMixin, generics.ListAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
