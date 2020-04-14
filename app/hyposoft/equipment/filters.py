from django_filters import rest_framework as filters
from rest_framework.filters import BaseFilterBackend

from changeplan.models import ChangePlan
from .models import ITModel, Asset
from hyposoft.utils import generate_racks, get_version, versioned_queryset


class ITModelFilter(filters.FilterSet):
    height = filters.RangeFilter()
    network_ports = filters.RangeFilter()
    power_ports = filters.RangeFilter()
    memory = filters.RangeFilter()

    class Meta:
        model = ITModel
        fields = ['height', 'network_ports', 'power_ports', 'memory']


class RackRangeFilter(BaseFilterBackend):
    template = 'rest_framework/filters/search.html'

    def filter_queryset(self, request, queryset, view):
        r1 = request.query_params.get('r1')
        r2 = request.query_params.get('r2')
        c1 = request.query_params.get('c1')
        c2 = request.query_params.get('c2')

        if r1 and r2 and c1 and c2:
            return queryset.filter(
                rack__rack__in=generate_racks(r1, r2, c1, c2)
            )
        else:
            return queryset


class AssetFilter(filters.FilterSet):
    rack_position = filters.RangeFilter()

    class Meta:
        model = Asset
        fields = ['itmodel', 'rack_position', 'asset_number', 'site__offline']


class ChangePlanFilter(BaseFilterBackend):
    def filter_queryset(self, request, queryset, view):
        version = get_version(request)
        return versioned_queryset(
            queryset,
            ChangePlan.objects.get(id=version),
            view.serializer_class.Meta.model.IDENTITY_FIELDS)
