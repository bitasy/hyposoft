from django.db.models import Max

from power.models import Powered
from network.models import NetworkPortLabel, NetworkPort
from equipment.models import Asset

"""
Functions to be used by both bulk import and model serializers.
They should be called after validation (signals)
"""


def create_itmodel_extra(itmodel, labels):
    i = 1
    for label in labels:
        NetworkPortLabel.objects.create(
            name=label,
            itmodel=itmodel,
            special=i if i <= 4 else None
        )
        i += 1


def create_asset_extra(asset, version, power_connections, net_ports):
    # Fields
    if asset.asset_number is None:
        max_an = Asset.objects.all().aggregate(Max('asset_number'))
        asset.asset_number = (max_an['asset_number__max'] or 100000) + 1
    
    # Other objects
    i = 1
    for connection in power_connections:
        Powered.objects.create(
            pdu=connection['pdu_id'],
            plug_number=connection['plug'],
            version=version,
            asset=asset,
            special=i if i <= 2 else None
        )
        i += 1

    for port in net_ports:
        NetworkPort.objects.create(
            asset=asset,
            label=NetworkPortLabel.objects.get(
                itmodel=asset.itmodel,
                name=port['label']
            ),
            mac_address=port['mac_address'],
            connection=port.get('connection'),
            version=version,
        )
