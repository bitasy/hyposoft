from django.db import transaction

from equipment.models import Asset, Rack
from equipment.handlers import decommission_asset
from network.models import NetworkPort
from power.models import Powered, PDU
from hyposoft.utils import versioned_object, add_network_conn, add_rack, add_asset
from .models import AssetDiff, NetworkPortDiff, PoweredDiff, ChangePlan


def create_asset_diffs(changeplan, target):
    changed_assets = Asset.objects.filter(version=changeplan)
    for changed_asset in changed_assets:
        try:
            live_asset = versioned_object(changed_asset, target, Asset.IDENTITY_FIELDS)
            if live_asset is None:
                live_asset = versioned_object(changed_asset, target, ['hostname'])
            AssetDiff.objects.create(
                changeplan=changeplan,
                live_asset=live_asset,
                changed_asset=changed_asset,
            )
        except Asset.DoesNotExist:
            AssetDiff.objects.create(
                changeplan=changeplan,
                changed_asset=changed_asset,
            )
        except Exception as e:
            print(e)


def create_networkport_diffs(changeplan, target):
    changed_networkports = NetworkPort.objects.filter(version=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live_networkport = versioned_object(changed_networkport, target, NetworkPort.IDENTITY_FIELDS)
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                live_networkport=live_networkport,
                changed_networkport=changed_networkport,
            )
        except:
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                changed_networkport=changed_networkport,
            )


def create_powered_diffs(changeplan, target):
    changed_powereds = Powered.objects.filter(version=changeplan)
    for changed_powered in changed_powereds:
        try:
            live_powered = versioned_object(changed_powered, target, Powered.IDENTITY_FIELDS)
            PoweredDiff.objects.create(
                changeplan=changeplan,
                live_powered=live_powered,
                changed_powered=changed_powered,
            )
        except:
            PoweredDiff.objects.create(
                changeplan=changeplan,
                changed_powered=changed_powered,
            )


def create_live_asset(changed_asset):
    changed_asset.id = None
    changed_asset.version_id = 0
    changed_asset.save()


def execute_assets(changeplan):
    changed_assets = Asset.objects.filter(version=changeplan)
    for changed_asset in changed_assets:
        try:
            live = ChangePlan.objects.get(id=0)
            live_asset = versioned_object(changed_asset, live, Asset.IDENTITY_FIELDS)
            if live_asset is None:
                live_asset = versioned_object(changed_asset, live, ['hostname'])

            if live_asset is None:
                Asset.objects.create(
                    hostname=changed_asset.hostname,
                    site=changed_asset.site,
                    rack=add_rack(changed_asset.rack, live),
                    rack_position=changed_asset.rack_position,
                    itmodel=changed_asset.itmodel,
                    owner=changed_asset.owner,
                    comment=changed_asset.comment
                )
            else:
                live_asset.asset_number = changed_asset.asset_number
                live_asset.hostname = changed_asset.hostname
                live_asset.site = changed_asset.site
                live_asset.rack = versioned_object(changed_asset.rack, live, Rack.IDENTITY_FIELDS)
                live_asset.rack_position = changed_asset.rack_position
                live_asset.itmodel = changed_asset.itmodel
                live_asset.owner = changed_asset.owner
                live_asset.comment = changed_asset.comment
                live_asset.save()
        except:
            create_live_asset(changed_asset)
        changed_asset.delete()


def execute_decommissioned_assets(changeplan):
    changed_assets = Asset.objects.filter(changeplan=changeplan)
    for changed_asset in changed_assets:
        try:
            live = ChangePlan.objects.get(id=0)
            live_asset = versioned_object(changed_asset, live, Asset.IDENTITY_FIELDS)
            if live_asset is None:
                live_asset = versioned_object(changed_asset, live, ['hostname'])

            live_asset.destroy()
            create_live_asset(changed_asset)
        except:
            create_live_asset(changed_asset)


def create_live_networkport(changed_networkport):
    changed_networkport.id = None
    changed_networkport.version_id = 0
    changed_networkport.save()


def execute_networkports(changeplan):
    changed_networkports = NetworkPort.objects.filter(version=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live = ChangePlan.objects.get(id=0)
            live_networkport = versioned_object(changed_networkport, live, NetworkPort.IDENTITY_FIELDS)

            if live_networkport is None:
                live_asset = add_asset(changed_networkport.asset, live)
                NetworkPort.objects.create(
                    asset=live_asset,
                    label=changed_networkport.label,
                    mac_address=changed_networkport.mac_address,
                    connection=add_network_conn(changed_networkport.connection, live),
                    version=live
                )
            else:
                live_networkport.label = changed_networkport.label
                live_networkport.mac_address = changed_networkport.mac_address
                if changed_networkport.connection:
                    live_networkport.connection = add_network_conn(changed_networkport.connection, live)
                live_networkport.save()

        except Exception as e:
            print(e)
            create_live_networkport(changed_networkport)
        changed_networkport.delete()


def create_live_powered(changed_powered):
    changed_powered.id = None
    changed_powered.version = 0
    changed_powered.save()


def execute_powereds(changeplan):
    changed_powereds = Powered.objects.filter(version=changeplan)
    for changed_powered in changed_powereds:
        try:
            live = ChangePlan.objects.get(id=0)
            live_powered = versioned_object(changed_powered, live, Powered.IDENTITY_FIELDS)

            live_powered.plug_number = changed_powered.plug_number
            live_powered.pdu = versioned_object(changed_powered.pdu, live, PDU.IDENTITY_FIELDS)
            new_asset = versioned_object(changed_powered.asset, live, Asset.IDENTITY_FIELDS)
            if new_asset is None:
                new_asset = versioned_object(changed_powered.asset, live, ['hostname'])
            live_powered.asset = new_asset
            live_powered.on = changed_powered.on
            live_powered.order = changed_powered.order
            live_powered.save()

        except:
            create_live_powered(changed_powered)
        changed_powered.destroy()


def get_asset(changeplan, target):
    if changeplan:
        if not changeplan.executed:
            create_asset_diffs(changeplan, target)

        asset_diffs = AssetDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": asset_diff.changeplan.name,
                "messages": asset_diff.messages,
                "conflicts": asset_diff.conflicts,
                "live": asset_diff.live_asset,
                "new": asset_diff.changed_asset
            }
            for asset_diff in asset_diffs
        ]

        if not changeplan.executed:
            AssetDiff.objects.filter(changeplan=changeplan).delete()  # Make sure we recalculate diff every request
        return diffs
    else:
        return []


def get_network(changeplan, target):
    if changeplan:
        if not changeplan.executed:
            create_networkport_diffs(changeplan, target)
        networkport_diffs = NetworkPortDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": networkport_diff.changeplan.name,
                "messages": networkport_diff.messages,
                "conflicts": networkport_diff.conflicts,
                "live": networkport_diff.live_networkport,
                "new": networkport_diff.changed_networkport
            }
            for networkport_diff
            in networkport_diffs
        ]
        if not changeplan.executed:
            NetworkPortDiff.objects.filter(changeplan=changeplan).delete()
        return diffs
    else:
        return []


def get_power(changeplan, target):
    if changeplan:
        if not changeplan.executed:
            create_powered_diffs(changeplan, target)
        powered_diffs = PoweredDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": powered_diff.changeplan.name,
                "messages": powered_diff.messages,
                "conflicts": powered_diff.conflicts,
                "live": powered_diff.live_powered,
                "new": powered_diff.changed_powered
            }
            for powered_diff
            in powered_diffs
        ]
        if not changeplan.executed:
            PoweredDiff.objects.filter(changeplan=changeplan).delete()
        return diffs
    else:
        return []
