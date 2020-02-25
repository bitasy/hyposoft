import threading
import time

from django.contrib.auth.models import AnonymousUser
from django_filters.rest_framework import DjangoFilterBackend
from requests import ConnectTimeout
from rest_framework import filters, generics, views
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, serializers
from .filters import ITModelFilter, AssetFilter, PoweredFilter
from system_log.models import ActionLog, display_name, username
from .models import ITModel, Datacenter, Asset, Powered, PDU, Rack, NetworkPort
from .serializers import *

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
        code = response.status_code
        # The following regex extracts the state of each port on the pdu
        # The format is a list of tuples, e.g. [('1', 'OFF'), ('2', 'ON'), ...]
        result = re.findall(r"<td>(\d{1,2})<td><span style=\'background-color:#[0-9a-f]{3}\'>(ON|OFF)", response.text)
        # If there are no matches, the post failed so return the error text
        if len(result) == 0:
            result = response.text
            code = 400
    except ConnectTimeout:
        return "couldn't connect", 400
    return result, code


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


def process_asset(asset_id, func):
    asset = Asset.objects.get(id=asset_id)
    rack = asset.rack.rack
    ports = Powered.objects.filter(asset=asset)
    for port in ports:
        func(rack, port)


@api_view(['POST'])
def switchPDU(request):
    if request.data['state'].upper() not in ("ON", "OFF"):
        raise serializers.ValidationError(
            "Powered state must be either ON or OFF"
        )
    state = request.data['state'].upper()
    responses = {}

    def process_port(rack, port):
        res = post_pdu(rack, port.pdu.position, port.plug_number, state)
        responses[str(port.id)] = (
            port.pdu.id,
            port.asset.id,
            res[0],
            res[1]
        )
        if res[1] < 400:
            old = "ON" if port.on else "OFF"
            port.on = state == 'ON'
            port.save()
            ActionLog.objects.create(
                action=ActionLog.Action.UPDATE,
                username=username(request.user),
                display_name=display_name(request.user),
                model=port.__class__.__name__,
                instance_id=port.id,
                field_changed="on",
                old_value=old,
                new_value=state
            ).save()

    process_asset(request.data['asset'], process_port)
    return Response(responses)


@api_view(['POST'])
def cycleAsset(request):

    responses = {}

    def delay_start(rack, position, port):
        time.sleep(2)
        res = post_pdu(rack, position, port, 'on')
        if res[1] < 400:
            port.on = True
            port.save()
            ActionLog.objects.create(
                action=ActionLog.Action.UPDATE,
                username=username(request.user),
                display_name=display_name(request.user),
                model=port.__class__.__name__,
                instance_id=port.id,
                field_changed="on",
                old_value="OFF",
                new_value="ON"
            ).save()

    def process_port(rack, port):
        res = post_pdu(rack, port.pdu.position, port.plug_number, 'off')
        responses[str(port.id)] = (
            port.pdu.id,
            port.asset.id,
            res[0],
            res[1]
        )

        if res[1] < 400 and port.on:
            old = "ON" if port.on else "OFF"
            port.on = False
            port.save()
            ActionLog.objects.create(
                action=ActionLog.Action.UPDATE,
                username=username(request.user),
                display_name=display_name(request.user),
                model=port.__class__.__name__,
                instance_id=port.id,
                field_changed="on",
                old_value=old,
                new_value="OFF"
            ).save()
        t = threading.Thread(target=delay_start, args=(rack, port.pdu.position, port.plug_number))
        t.start()

    process_asset(request.data['asset'], process_port)
    # Return only the responses for turning off the ports as to not block.
    return Response(responses)


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
        pdus = PDU.objects.filter(
            id__in=to_check,
            networked=True).distinct()
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
                old = "ON" if entry.on else "OFF"
                if old != state[1]:
                    updated = True
                    entry.on = state[1] == 'ON'
                    entry.save()
                    anon = AnonymousUser()
                    ActionLog.objects.create(
                        action=ActionLog.Action.UPDATE,
                        username=username(anon),
                        display_name=display_name(anon),
                        model=entry.__class__.__name__,
                        instance_id=entry.id,
                        field_changed="on",
                        old_value=old,
                        new_value=state[1]
                    ).save()

        # Recalculate response if necessary
        return super().get(self, request, *args, **kwargs) if updated else response


class FreePowerPorts(views.APIView):
    def get(self, request, rack_id, asset_id):
        pdus = PDU.objects.filter(rack=rack_id)
        pdu_ids = [pdu.id for pdu in pdus]
        powereds = Powered.objects.filter(pdu__in=pdu_ids)
        free_ports = { pdu_id: list(range(1, 25)) for pdu_id in pdu_ids }
        for powered in powereds:
            if powered.asset.id != asset_id:
                free_ports[powered.pdu.id].remove(powered.plug_number)

        return Response(free_ports)


def getNetworkPorts(datacenter_id, filter):
   dc = Datacenter.objects.filter(id=datacenter_id).first()
   if dc:
       assets = Asset.objects.filter(datacenter=dc.id)
       asset_ids = [a.id for a in assets]
       free_network_ports = [
           {
               "id": network_port.id,
               "label": NetworkPortLabelSerializer(instance=network_port.label).data,
               "asset": network_port.asset.id,
               "asset_str": str(network_port.asset)
           }
           for network_port 
           in NetworkPort.objects.filter(asset__in=asset_ids, **filter)
       ]
       return Response(free_network_ports)
   else: 
       return Response([])


class AllNetworkPorts(views.APIView):
    def get(self, request, datacenter_id):
        return getNetworkPorts(datacenter_id, {})


class FreeNetworkPorts(views.APIView):
    def get(self, request, datacenter_id):
        return getNetworkPorts(datacenter_id, { "connection": None })


class PoweredDeleteByAsset(views.APIView):
    def delete(self, request, asset_id):
        Powered.objects.filter(asset=asset_id).delete()
        return Response()


class NetworkPortDeleteByAsset(views.APIView):
    def delete(self, request, asset_id):
        NetworkPort.objects.filter(asset=asset_id).delete()
        return Response()


@api_view()
def net_graph(request, asset_id):
    asset = Asset.objects.get(id=asset_id)
    assets = set()
    for e in asset.networkport_set.select_related('asset'):
        if e.connection:
            assets.add(e.connection.asset)

    edges = NetworkPort.objects.filter(asset__in=assets).distinct()
    two_hops = set()
    for e in edges.select_related('asset'):
        if e and e.connection:
            two_hops.add(e.asset)
            two_hops.add(e.connection.asset)


    def orderedEdge(edge):
        a = edge.asset.id
        b = edge.connection.asset.id
        return (min(a, b), max(a, b))

    return Response({
        'verticies': [AssetSerializer(data).data for data in two_hops],
        'edges': set([orderedEdge(edge) for edge in edges if edge.connection])
    })
