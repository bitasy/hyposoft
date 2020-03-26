from django_filters import rest_framework as filters
from .models import Powered


class PoweredFilter(filters.FilterSet):

    pdu__id = filters.NumberFilter()
    asset__id = filters.NumberFilter()

    class Meta:
        model = Powered
        fields = ['pdu__id', 'asset__id']
