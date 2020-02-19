from django import forms
from django_filters import rest_framework as filters, fields
from .models import ITModel, Asset


class ITModelFilter(filters.FilterSet):

    height = filters.RangeFilter()
    ethernet_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'ethernet_ports', 'power_ports', 'memory']


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
