import threading
import time

from django.contrib.auth.models import AnonymousUser
from django_filters.rest_framework import DjangoFilterBackend
from requests import ConnectTimeout
from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT

from .filters import PoweredFilter
from system_log.models import ActionLog, display_name, username
from equipment.views import FilterByDatacenterMixin
from .serializers import *
from .models import *

import requests
import re

PDU_url = "http://hyposoft-mgt.colab.duke.edu:8008/"
GET_suf = "pdu.php"
POST_suf = "power.php"
rack_pre = "hpdu-rtp1-"


def get_pdu(rack, position):
    try:
        split = re.search(r"\d", rack).start()
        rack = rack[:split] + "0" + rack[split:]
        response = requests.get(PDU_url + GET_suf, params={'pdu': rack_pre + rack + position}, timeout=0.5)
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
        split = re.search(r"\d", rack).start()
        rack = rack[:split] + "0" + rack[split:]
        response = requests.post(PDU_url + POST_suf, {
            'pdu': rack_pre + rack + position,
            'port': port,
            'v': state
        }, timeout=0.5)
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
def post_asset(request):
    if request.data['state'].lower() not in ("on", "off"):
        raise serializers.ValidationError(
            "Powered state must be either 'on' or 'off'"
        )
    state = request.data['state'].lower()

    def process_port(rack, port):
        res = post_pdu(rack, port.pdu.position, port.plug_number, state)
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

    process_asset(request.data['asset_id'], process_port)
    return Response(HTTP_204_NO_CONTENT)


@api_view()
def get_asset(request, asset_id):

    networked = [False]
    powered = [False]

    def process_port(rack, port):
        res = get_pdu(rack, port.pdu.position)
        if res[1] < 400:
            networked[0] = True
            state = dict(res[0])
            if state.get(str(port.plug_number)) == "ON":
                powered[0] = True

    process_asset(asset_id, process_port)

    if networked[0]:
        return Response("On" if powered[0] else "Off", HTTP_200_OK)
    else:
        return Response("Unavailable", HTTP_200_OK)


@api_view(['POST'])
def cycle_asset(request):

    threads = []

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
        threads.append(t)
        t.start()

    process_asset(request.data['asset_id'], process_port)
    for thread in threads:
        thread.join()
    return Response(HTTP_204_NO_CONTENT)


@api_view()
def freePowerPorts(request, rack_id, asset_id):
    pdus = PDU.objects.filter(rack=rack_id)
    pdu_ids = [pdu.id for pdu in pdus]
    powereds = Powered.objects.filter(pdu__in=pdu_ids)
    free_ports = {pdu_id: list(range(1, 25)) for pdu_id in pdu_ids}
    for powered in powereds:
        if powered.asset.id != asset_id:
            free_ports[powered.pdu.id].remove(powered.plug_number)

    return Response(free_ports)


@api_view()
def poweredDeleteByAsset(request, asset_id):
    Powered.objects.filter(asset=asset_id).delete()
    return Response()


class PoweredFilterView(FilterByDatacenterMixin, generics.ListAPIView):
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
