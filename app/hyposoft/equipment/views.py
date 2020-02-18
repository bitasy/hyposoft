from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .filters import ITModelFilter, AssetFilter
from .models import ITModel, Asset, Rack
from .serializers import ITModelSerializer, AssetSerializer

import requests
import re


class ITModelFilterView(generics.ListAPIView):
    """
    Class for returning ITModels after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['vendor', 'model_number', 'cpu', 'storage']

    queryset = ITModel.objects.all()
    serializer_class = ITModelSerializer
    filterset_class = ITModelFilter


class AssetFilterView(generics.ListAPIView):
    """
    Class for returning Assets after filtering criteria.
    """

    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = [
        'itmodel__vendor',
        'itmodel__model_number',
        'hostname',
        'owner__username',
        'owner__first_name',
        'owner__last_name'
    ]

    serializer_class = AssetSerializer
    filterset_class = AssetFilter

    def get_queryset(self):
        queryset = Asset.objects.all()
        rack_min = self.request.query_params.get("rack_min", None)
        rack_max = self.request.query_params.get("rack_max", None)
        if rack_max is not None and rack_max is not None:
            racks = Rack.objects.in_racks(rack_min, rack_max)
            queryset = queryset.filter(rack__in=racks)

        return queryset


PDU_url = "http://hyposoft-mgt.colab.duke.edu:8008/"
GET_suf = "pdu.php"
POST_suf = "power.php"
rack_pre = "hpdu-rtp1-"


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
