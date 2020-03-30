from django_filters.rest_framework import DjangoFilterBackend
from django.utils import dateparse
from rest_framework import filters, generics
from rest_framework.pagination import PageNumberPagination
from hyposoft.utils import get_version, versioned_queryset
from .serializers import ITModelEntrySerializer, AssetEntrySerializer, DecommissionedAssetSerializer, \
    AssetSerializer, RackSerializer, DatacenterSerializer, ITModelPickSerializer
from .filters import ITModelFilter, AssetFilter, RackRangeFilter, ChangePlanFilter
from .models import *


# Filters the Rack and Asset ListAPIViews based on the datacenter in the request
class FilterByDatacenterMixin(object):
    def get_queryset(self):
        datacenter = self.request.META.get('HTTP_X_DATACENTER', None)
        model = self.get_serializer_class().Meta.model
        queryset = model.objects.all()
        if datacenter:
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
        'id',
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
    ordering = 'id'

    queryset = ITModel.objects.all()
    serializer_class = ITModelEntrySerializer
    filterset_class = ITModelFilter
    pagination_class = PageSizePagination


class ITModelPickList(generics.ListAPIView):
    queryset = ITModel.objects.all()
    serializer_class = ITModelPickSerializer


class AssetList(FilterByDatacenterMixin, generics.ListAPIView):
    """
    Class for returning Assets after filtering criteria.
    """

    filter_backends = [
        filters.SearchFilter,
        DjangoFilterBackend,
        filters.OrderingFilter,
        RackRangeFilter,
        ChangePlanFilter
    ]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'networkport__mac_address',
        'owner__username',
        'owner__first_name',
        'owner__last_name',
        'asset_number'
    ]
    ordering_fields = [
        'id',
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'datacenter__abbr',
        'rack__rack',
        'rack_position',
        'owner'
    ]
    ordering = 'id'

    def get_queryset(self):
        return super(AssetList, self).get_queryset().filter(commissioned=Asset.Decommissioned.COMMISSIONED)

    serializer_class = AssetEntrySerializer
    filterset_class = AssetFilter
    pagination_class = PageSizePagination


class AssetPickList(generics.ListAPIView):
    def get_queryset(self):
        queryset = versioned_queryset(Asset.objects.all(), get_version(self.request), Asset.IDENTITY_FIELDS)
        datacenter_id = self.request.query_params.get('datacenter_id', None)
        if datacenter_id is not None:
            queryset = queryset.filter(datacenter_id=datacenter_id)
        rack_id = self.request.query_params.get('rack_id', None)
        if rack_id is not None:
            queryset = queryset.filter(rack_id=rack_id)
        return queryset

    serializer_class = AssetSerializer
    filter_backends = [ChangePlanFilter]


class DecommissionedAssetList(generics.ListAPIView):
    filter_backends = [
        filters.OrderingFilter
    ]

    ordering_fields = [
        'id',
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'datacenter__abbr',
        'rack__rack',
        'rack_position',
        'owner',
        'decommissioned_by',
        'decommissioned_timestamp'
    ]
    ordering = 'id'

    def get_queryset(self):
        queryset = Asset.objects.filter(commissioned=None)
        user = self.request.query_params.get('username', None)
        time_from = self.request.query_params.get('timestamp_from', None)
        time_to = self.request.query_params.get('timestamp_to', None)
        datacenter = self.request.META.get('HTTP_X_DATACENTER', None)
        version = get_version(self.request)

        if datacenter:
            queryset = queryset.filter(datacenter__abbr=datacenter)

        if user:
            queryset = queryset.filter(owner__username=user)

        if time_from and time_to:
            dt_from = dateparse.parse_datetime(time_from)
            dt_to = dateparse.parse_datetime(time_to)

            queryset = queryset.filter(decommissioned_timestamp__range=(dt_from, dt_to))

        queryset.filter(version__parent=version)

        return queryset

    serializer_class = DecommissionedAssetSerializer
    pagination_class = PageSizePagination


class RackList(FilterByDatacenterMixin, generics.ListAPIView):
    queryset = Rack.objects.all()
    serializer_class = RackSerializer
    filter_backends = [ChangePlanFilter]


class DatacenterList(generics.ListAPIView):
    queryset = Datacenter.objects.all()
    serializer_class = DatacenterSerializer