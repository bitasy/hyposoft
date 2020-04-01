import threading
import time

from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT

from system_log.models import ActionLog, display_name, username
from .models import *
from .handlers import get_pdu, post_pdu


def process_asset(asset_id, func):
    asset = Asset.objects.get(id=asset_id)
    rack = asset.rack.rack
    ports = Powered.objects.filter(asset=asset)
    for port in ports:
        func(rack, port)


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
            port.on = state.upper() == 'ON'
            port.save()
            if old != state:
                ActionLog.objects.create(
                    action=ActionLog.Action.UPDATE,
                    username=username(request.user),
                    display_name=display_name(request.user),
                    model=port.__class__.__name__,
                    instance_id=port.id,
                    field_changed="state",
                    old_value=old,
                    new_value=state.upper()
                )

    process_asset(request.data['asset_id'], process_port)
    return Response(HTTP_204_NO_CONTENT)


@api_view(['POST'])
def cycle_asset(request):

    threads = []

    def delay_start(rack, position, port):
        time.sleep(2)
        res = post_pdu(rack, position, port.plug_number, 'on')
        if res[1] < 400:
            port.on = True
            port.save()

    def process_port(rack, port):
        res = post_pdu(rack, port.pdu.position, port.plug_number, 'off')

        if res[1] < 400:
            old = "ON" if port.on else "OFF"
            port.on = False
            port.save()
            ActionLog.objects.create(
                action=ActionLog.Action.UPDATE,
                username=username(request.user),
                display_name=display_name(request.user),
                model=port.__class__.__name__,
                instance_id=port.id,
                field_changed="state",
                old_value=old,
                new_value="CYCLED"
            )
        t = threading.Thread(target=delay_start, args=(rack, port.pdu.position, port))
        threads.append(t)
        t.start()

    process_asset(request.data['asset_id'], process_port)
    for thread in threads:
        thread.join()
    return Response(HTTP_204_NO_CONTENT)
