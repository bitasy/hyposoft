from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, serializers

from .filters import ITModelFilter, AssetFilter, PoweredFilter
from .models import ITModel, Datacenter, Asset, Powered
from .serializers import ITModelSerializer, AssetSerializer, PDUSerializer, PoweredSerializer

import requests
import re

PDU_url = "http://hyposoft-mgt.colab.duke.edu:8008/"
GET_suf = "pdu.php"
POST_suf = "power.php"
rack_pre = "hpdu-rtp1-"


# Filters the Rack and Asset ListAPIViews based on the datacenter in the request
class FilterByDatacenterMixin(object):
    def get_queryset(self):
        datacenter = self.request.META.get('HTTP_X_DATACENTER', None)
        queryset = self.get_serializer_class().Meta.model.objects.all()
        if datacenter is not None and len(datacenter) > 0:
            if not Datacenter.objects.filter(abbr=datacenter).exists():
                raise serializers.ValidationError("Datacenter does not exist")
            return queryset.filter(datacenter=int(datacenter))
        return queryset


# This mixin makes the destroy view return the deleted item
class DestroyWithPayloadMixin(object):
    def destroy(self, *args, **kwargs):
        serializer = self.get_serializer(self.get_object())
        super().destroy(*args, **kwargs)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view()
def getPDU(request, rack, position):
    response = requests.get(PDU_url + GET_suf, params={'pdu': rack_pre + rack + position})
    # The following regex extracts the state of each port on the pdu
    # The format is a list of tuples, e.g. [('1', 'OFF'), ('2', 'ON'), ...]
    result = re.findall(r"<td>(\d{1,2})<td><span style=\'background-color:#[0-9a-f]{3}\'>(ON|OFF)", response.text)
    # If there are no matches, the post failed so return the error text
    result = result if len(result) > 0 else response.text
    return Response(result, status=response.status_code)


@api_view(['POST'])
def switchPDU(request):
    response = requests.post(PDU_url + POST_suf, {
        'pdu': rack_pre + request.data['rack'] + request.data['position'],
        'port': request.data['port'],
        'v': request.data['state']
    })
    # The following regex extracts the result string from the HTML response text
    # If there are no matches, the post failed so return the error text
    result = re.findall(r'(set .*)\n', response.text)
    result = result[0] if len(result) > 0 else response.text
    return Response(result, status=response.status_code)


class ITModelFilterView(generics.ListAPIView):
    """
    Class for returning ITModels after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = [
        'vendor',
        'model_number',
        'cpu',
        'storage'
    ]
    ordering_fields = [
        'vendor',
        'model_number',
        'height',
        'display_color',
        'power_ports',
        'cpu',
        'memory',
        'storage'
    ]

    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
    filterset_class = ITModelFilter


class AssetFilterView(generics.ListAPIView, FilterByDatacenterMixin):
    """
    Class for returning Assets after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend, filters.OrderingFilter]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'mac_address',
        'owner__username',
        'owner__first_name',
        'owner__last_name'
    ]
    ordering_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'rack__rack',
        'rack_position',
        'owner'
    ]

    queryset = Asset.objects.all()
    serializer_class = AssetSerializer
    filterset_class = AssetFilter


class PoweredFilterView(generics.ListAPIView, FilterByDatacenterMixin):
    """
    Class for returning PDU by Rack Range.
    """

    filter_backends = [DjangoFilterBackend]

    queryset = Powered.objects.all()
    serializer_class = PoweredSerializer
    filterset_class = PoweredFilter
