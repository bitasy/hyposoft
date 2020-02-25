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


class AssetListView(DestroyWithPayloadMixin, generics.ListAPIView, FilterByDatacenterMixin):
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


class RackListView(generics.ListAPIView, FilterByDatacenterMixin):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


# PDU
class PDUCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDURetrieveView(generics.RetrieveAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUListView(generics.ListAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


# NetworkPortLabel
class NetworkPortLabelCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelRetrieveView(generics.RetrieveAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelListView(generics.ListAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


# NetworkPort
class NetworkPortCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortRetrieveView(generics.RetrieveAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortListView(generics.ListAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class PoweredCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer
