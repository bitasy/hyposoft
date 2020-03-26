from rest_framework import generics

from equipment.list_views import FilterByDatacenterMixin
from .models import Powered
from .serializers import PoweredSerializer


class PowerPortList(FilterByDatacenterMixin, generics.ListAPIView):
    def get_queryset(self):
        rack = self.request.query_params.get('rack_id', None)
        if rack:
            return Powered.objects.filter(pdu__rack_id=rack)
        return Powered.objects.all()

    serializer_class = PoweredSerializer
