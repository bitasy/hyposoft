from rest_framework import generics

from system_log.views import CreateAndLogMixin, UpdateAndLogMixin, DeleteAndLogMixin
from equipment.views import DestroyWithPayloadMixin
from .serializers import *
from .models import *


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