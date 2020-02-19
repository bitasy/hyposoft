import threading
import time

from django_filters.rest_framework import DjangoFilterBackend
from requests import ConnectTimeout
from rest_framework import filters
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, serializers

from .filters import ITModelFilter, AssetFilter, PoweredFilter
from .models import ITModel, Datacenter, Asset, Powered, PDU
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


def get_pdu(rack, position):
    try:
        response = requests.get(PDU_url + GET_suf, params={'pdu': rack_pre + rack + position})
        # The following regex extracts the state of each port on the pdu
        # The format is a list of tuples, e.g. [('1', 'OFF'), ('2', 'ON'), ...]
        result = re.findall(r"<td>(\d{1,2})<td><span style=\'background-color:#[0-9a-f]{3}\'>(ON|OFF)", response.text)
        # If there are no matches, the post failed so return the error text
        result = result if len(result) > 0 else response.text
    except ConnectTimeout:
        return "couldn't connect", 400
    return result, response.status_code

def post_pdu(rack, position, port, state):
    try:
        response = requests.post(PDU_url + POST_suf, {
            'pdu': rack_pre + rack + position,
            'port': port,
            'v': state
        })
        # The following regex extracts the result string from the HTML response text
        # If there are no matches, the post failed so return the error text
        result = re.findall(r'(set .*)\n', response.text)
        result = result[0] if len(result) > 0 else response.text

    except ConnectTimeout:
        return "couldn't connect", 400
    return result, response.status_code

@api_view()
def getPDU(request, rack, position):
    return Response(*get_pdu(rack, position))


@api_view(['POST'])
def switchPDU(request):
    return Response(*post_pdu(**request.data))


@api_view(['POST'])
def cycleAsset(request):
    def delay_start(rack, position, port):
        time.sleep(2)
        post_pdu(rack, position, port, 'on')
    asset = Asset.objects.get(id=request.data['asset'])
    rack = asset.rack.id
    ports = Powered.objects.filter(asset=asset)
    response = {}
    for port in ports:
        response[str(port.id)] = (port.pdu.id, port.asset.id, *post_pdu(rack, port.position, port.plug_number, 'off'))
        t = threading.Thread(target=delay_start, args=(rack, port.position, port.plug_number))
        t.start()
    # Return only the responses for turning off the ports as to not block.
    return Response(response)


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

    def get(self, request, *args, **kwargs):
        """
        Heads up: This method is SLOW!!
        It makes many network requests and potentially multiple database queries!
        """
        response = super().get(self, request, *args, **kwargs)
        data = response.data
        to_check = [x['pdu'] for x in data]
        pdus = PDU.objects.filter(id__in=to_check, rack__datacenter__abbr__iexact='rtp1').distinct()
        to_get = [(pdu.rack.rack, pdu.position) for pdu in pdus]
        # Update Powered states that might have been changed from the Networx website
        # Only update PDUs that are being returned in this request
        updated = False
        for pdu in to_get:
            states, status_code = get_pdu(pdu[0], pdu[1])
            if status_code >= 400:
                break
            for state in states:
                try:
                    entry = Powered.objects.get(pdu__rack__rack=pdu[0], pdu__position=pdu[1], plug_number=state[0])
                except Powered.DoesNotExist:
                    continue
                updated = entry.on != (state[1] == 'ON')
                entry.on = state[1] == 'ON'
                entry.save()

        # Recalculate response if necessary
        return super().get(self, request, *args, **kwargs) if updated else response
