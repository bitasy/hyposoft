from django.db.models import Max

from power.models import Powered, PDU
from network.models import NetworkPortLabel, NetworkPort

"""
Functions to be used by both bulk import and model serializers.
They should be called after validation (signals)

The reason that post-save signals cannot be used is that they
cannot take additional parameters from the serializer as is
required by these functions.
"""


def create_itmodel_extra(itmodel, labels):
    order = 1
    for label in labels:
        if order > itmodel.network_ports:
            break
        NetworkPortLabel.objects.create(
            name=label if len(label) > 0 else str(order),
            itmodel=itmodel,
            order=order
        )
        order += 1


def create_asset_extra(asset, version, power_connections, net_ports):
    # Other objects
    if power_connections:
        i = 1
        for connection in power_connections:
            if i > asset.itmodel.power_ports:
                break
            Powered.objects.create(
                pdu=connection['pdu_id'],
                plug_number=connection['plug'],
                version=version,
                asset=asset,
                special=i if i <= 2 else None
            )
            i += 1

    if net_ports:
        i = 1
        for port in net_ports:
            if i > asset.itmodel.network_ports:
                break
            mac = port.get('mac_address')
            if mac and len(mac) == 0:
                mac = None

            NetworkPort.objects.create(
                asset=asset,
                label=NetworkPortLabel.objects.get(
                    itmodel=asset.itmodel,
                    name=port['label']
                ),
                mac_address=mac,
                connection=port.get('connection'),
                version=version,
            )
            i += 1


def create_rack_extra(rack, version):
    PDU.objects.create(rack=rack, position=PDU.Position.LEFT, version_id=version)
    PDU.objects.create(rack=rack, position=PDU.Position.RIGHT, version_id=version)
