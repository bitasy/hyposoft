from rest_framework import generics

from equipment.list_views import FilterBySiteMixin
from .models import NetworkPort
from .serializers import NetworkPortSerializer


class NetworkPortList(FilterBySiteMixin, generics.ListAPIView):
    def get_queryset(self):
        return NetworkPort.objects.filter(asset__decommissioned_timestamp=None)

    serializer_class = NetworkPortSerializer
