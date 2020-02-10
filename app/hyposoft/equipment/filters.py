from django_filters import rest_framework as filters
from .models import ITModel


class ITModelFilter(filters.FilterSet):

    # Range Filters
    height = filters.RangeFilter()
    ethernet_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'ethernet_ports', 'power_ports', 'memory']
