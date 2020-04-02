from equipment.models import Asset
from network.models import NetworkPort
from power.models import Powered
from hyposoft.utils import versioned_object
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
    changed_assets = Asset.objects.filter(changeplan=changeplan)
    for changed_asset in changed_assets:
        try:
            live = ChangePlan.objects.get(id=0)
            live_asset = versioned_object(changed_asset, live, Asset.IDENTITY_FIELDS)
            if live_asset is None:
                live_asset = versioned_object(changed_asset, live, ['hostname'])

            live_asset.asset_number = changed_asset.asset_number
            live_asset.hostname = changed_asset.hostname
            live_asset.datacenter = changed_asset.datacenter
            live_asset.rack = changed_asset.rack
            live_asset.rack_position = changed_asset.rack_position
            live_asset.itmodel = changed_asset.itmodel
            live_asset.owner = changed_asset.owner
            live_asset.comment = changed_asset.comment
            live_asset.commissioned = changed_asset.commissioned
            live_asset.decommissioned_timestamp = changed_asset.decommissioned_timestamp
            live_asset.decommissioned_by = changed_asset.decommissioned_by
            live_asset.save()

        except:
            create_live_asset(changed_asset)
        changed_asset.destroy()


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
    changed_networkports = NetworkPort.objects.filter(changeplan=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live = ChangePlan.objects.get(id=0)
            live_networkport = versioned_object(changed_networkport, live, NetworkPort.IDENTITY_FIELDS)

            live_networkport.asset = changed_networkport.asset
            live_networkport.label = changed_networkport.label
            live_networkport.mac_address = changed_networkport.mac_address
            live_networkport.connection = changed_networkport.connection
            live_networkport.save()

        except:
            create_live_networkport(changed_networkport)
        changed_networkport.destroy()


def execute_decommissioned_networkports(changeplan):
    changed_networkports = NetworkPort.objects.filter(changeplan=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live = ChangePlan.objects.get(id=0)
            live_networkport = versioned_object(changed_networkport, live, NetworkPort.IDENTITY_FIELDS)

            live_networkport.destroy()
            create_live_networkport(changed_networkport)
        except:
            create_live_networkport(changed_networkport)


def create_live_powered(changed_powered):
    changed_powered.id = None
    changed_powered.version = 0
    changed_powered.save()


def execute_powereds(changeplan):
    changed_powereds = Powered.objects.filter(changeplan=changeplan)
    for changed_powered in changed_powereds:
        try:
            live = ChangePlan.objects.get(id=0)
            live_powered = versioned_object(changed_powered, live, Powered.IDENTITY_FIELDS)

            live_powered.plug_number = changed_powered.plug_number
            live_powered.pdu = changed_powered.pdu
            live_powered.asset = changed_powered.asset
            live_powered.on = changed_powered.on
            live_powered.special = changed_powered.special
            live_powered.save()

        except:
            create_live_powered(changed_powered)
        changed_powered.destroy()


def execute_decommissioned_powereds(changeplan):
    changed_powereds = Powered.objects.filter(changeplan=changeplan)
    for changed_powered in changed_powereds:
        try:
            live = ChangePlan.objects.get(id=0)
            live_powered = versioned_object(changed_powered, live, Powered.IDENTITY_FIELDS)

            live_powered.destroy()
            create_live_powered(changed_powered)
        except:
            create_live_powered(changed_powered)


def get_asset(changeplan, target):
    if changeplan:
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
        AssetDiff.objects.filter(changeplan=changeplan).delete()  # Make sure we recalculate diff every request
        return diffs
    else:
        return []


def get_network(changeplan, target):
    if changeplan:
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
        NetworkPortDiff.objects.filter(changeplan=changeplan).delete()  # Make sure we recalculate diff every request
        return diffs
    else:
        return []


def get_power(changeplan, target):
    if changeplan:
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
        PoweredDiff.objects.filter(changeplan=changeplan).delete()  # Make sure we recalculate diff every request
        return diffs
    else:
        return []
