from django import forms
from django_filters import rest_framework as filters, fields
from .models import ITModel, Asset, Powered
from django.db.models import Q


class ITModelFilter(filters.FilterSet):
    height = filters.RangeFilter()
    network_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'network_ports', 'power_ports', 'memory']
        power_ports = filters.Filter(method='power_ports__range')

    def power_ports__range(self, queryset, value, *args, **kwargs):
        try:
            [mini, maxi, include_null] =  args[0].split(',')
            if include_null == "true":
                queryset = queryset.filter(Q(power_ports__gte=mini, power_ports__lte=maxi) | Q(power_ports=None))
            else:
                queryset = queryset.filter(power_ports__gte=mini, power_ports__lte=maxi)
        except ValueError:
            pass

        return queryset


class CharRangeFilter(filters.RangeFilter):
    class CharRangeField(fields.RangeField):
        def __init__(self, *args, **kwargs):
            super().__init__(fields=(
                forms.CharField(),
                forms.CharField()
            ), *args, **kwargs)
    field_class = CharRangeField


class AssetFilter(filters.FilterSet):
    rack__rack = CharRangeFilter()
    rack_position = filters.RangeFilter()

    class Meta:
        model = Asset
        fields = ['itmodel__id', 'rack__rack', 'rack_position, asset_number']


class PoweredFilter(filters.FilterSet):

    pdu__id = filters.NumberFilter()
    asset__id = filters.NumberFilter()

    class Meta:
        model = Powered
        fields = ['pdu__id', 'asset__id']
