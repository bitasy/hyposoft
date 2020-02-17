from django_filters import rest_framework as filters
from .models import ITModel, Asset


class ITModelFilter(filters.FilterSet):

    height = filters.RangeFilter()
    ethernet_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'ethernet_ports', 'power_ports', 'memory']


class AssetFilter(filters.FilterSet):
    rack_position = filters.RangeFilter()

    class Meta:
        model = Asset
        fields = ['rack_position']
