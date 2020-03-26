from rest_framework import generics

from system_log.views import CreateAndLogMixin, UpdateAndLogMixin, DeleteAndLogMixin
from equipment.views import DestroyWithPayloadMixin
from .serializers import *
from .models import *


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


class PoweredCreateView(CreateAndLogMixin, generics.CreateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredUpdateView(UpdateAndLogMixin, generics.UpdateAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer


class PoweredDestroyView(DestroyWithPayloadMixin, DeleteAndLogMixin, generics.DestroyAPIView):
    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer
