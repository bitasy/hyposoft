from django_filters import rest_framework as filters
from .models import ITModel, Instance
from rest_framework.filters import BaseFilterBackend
from django.db import models


class ITModelFilter(filters.FilterSet):

    height = filters.RangeFilter()
    ethernet_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'ethernet_ports', 'power_ports', 'memory']


class InstanceFilter(filters.FilterSet):
    rack_position = filters.RangeFilter()

    class Meta:
        model = Instance
        fields = ['rack_position']
