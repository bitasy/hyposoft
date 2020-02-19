from rest_framework import generics
from .serializers import *
from .models import *
from .views import DestroyWithPayloadMixin, FilterByDatacenterMixin


# Datacenter
class DatacenterCreateView(generics.CreateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterRetrieveView(generics.RetrieveAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterUpdateView(generics.UpdateAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


class DatacenterListView(generics.ListAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer


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


class AssetListView(DestroyWithPayloadMixin, generics.ListAPIView, FilterByDatacenterMixin):
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


class RackListView(generics.ListAPIView, FilterByDatacenterMixin):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer


# PDU
class PDUCreateView(generics.CreateAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDURetrieveView(generics.RetrieveAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUUpdateView(generics.UpdateAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


class PDUListView(generics.ListAPIView):
    queryset = PDU.objects.all()
    serializer_class = PDUSerializer


# NetworkPortLabel
class NetworkPortLabelCreateView(generics.CreateAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelRetrieveView(generics.RetrieveAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelUpdateView(generics.UpdateAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


class NetworkPortLabelListView(generics.ListAPIView):
    queryset = NetworkPortLabel.objects.all()
    serializer_class = NetworkPortLabelSerializer


# NetworkPort
class NetworkPortCreateView(generics.CreateAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortRetrieveView(generics.RetrieveAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortUpdateView(generics.UpdateAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class NetworkPortListView(generics.ListAPIView):
    queryset = NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer


class PoweredCreateView(generics.CreateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredRetrieveView(generics.RetrieveAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredUpdateView(generics.UpdateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredDestroyView(DestroyWithPayloadMixin, generics.DestroyAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredListView(generics.ListAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer
