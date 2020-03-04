from rest_framework import generics

from system_log.views import CreateAndLogMixin, UpdateAndLogMixin, DeleteAndLogMixin
from equipment.views import DestroyWithPayloadMixin
from .serializers import *
from .models import *


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
