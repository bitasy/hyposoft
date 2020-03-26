from rest_framework import generics

from equipment.list_views import FilterByDatacenterMixin
from .models import NetworkPort
from .serializers import NetworkPortSerializer


class NetworkPortList(FilterByDatacenterMixin, generics.ListAPIView):
    def get_queryset(self):
        asset = self.request.query_params.get('asset_id', None)
        if asset:
            return NetworkPort.objects.filter(asset_id=asset)
        return NetworkPort.objects.all()
    serializer_class = NetworkPortSerializer
