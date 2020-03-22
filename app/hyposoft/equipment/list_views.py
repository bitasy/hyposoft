from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, generics
from rest_framework.pagination import PageNumberPagination

from .new_serializers import ITModelEntrySerializer, AssetEntrySerializer
from .filters import ITModelFilter, AssetFilter, RackRangeFilter
from .models import *


# Filters the Rack and Asset ListAPIViews based on the datacenter in the request
class FilterByDatacenterMixin(object):
    def get_queryset(self):
        datacenter = self.request.META.get('HTTP_X_DATACENTER', None)
        queryset = self.get_serializer_class().Meta.model.objects.all()
        if datacenter is not None and len(datacenter) > 0:
            if not Datacenter.objects.filter(abbr=datacenter).exists():
                raise serializers.ValidationError("Datacenter does not exist")
            return queryset.filter(datacenter__abbr=datacenter)
        return queryset


class PageSizePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"


class ITModelList(generics.ListAPIView):
    """
    Class for returning ITModels after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = [
        'vendor',
        'model_number',
        'cpu',
        'storage',
        'comment'
    ]
    ordering_fields = [
        'vendor',
        'model_number',
        'height',
        'display_color',
        'power_ports',
        'network_ports',
        'cpu',
        'memory',
        'storage'
    ]

    queryset = ITModel.objects.all()
    serializer_class = ITModelEntrySerializer
    filterset_class = ITModelFilter
    pagination_class = PageSizePagination


class AssetList(FilterByDatacenterMixin, generics.ListAPIView):
    """
    Class for returning Assets after filtering criteria.
    """

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
        RackRangeFilter
    ]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'mac_address',
        'owner__username',
        'owner__first_name',
        'owner__last_name',
        'asset_number'
    ]
    ordering_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'datacenter__abbr',
        'rack__rack',
        'rack_position',
        'owner'
    ]

    queryset = Asset.objects.all()
    serializer_class = AssetEntrySerializer
    filterset_class = AssetFilter
    pagination_class = PageSizePagination
