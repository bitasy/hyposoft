from django import forms
from django_filters import rest_framework as filters, fields
from .models import ITModel, Asset, Powered


class ITModelFilter(filters.FilterSet):

    height = filters.RangeFilter()
    network_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'network_ports', 'power_ports', 'memory']


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
        fields = ['rack__rack', 'rack_position']


class PoweredFilter(filters.FilterSet):

    pdu__id = filters.NumberFilter()
    asset__id = filters.NumberFilter()

    class Meta:
        model = Powered
        fields = ['pdu__id', 'asset__id']
