from equipment.models import Asset
from network.models import NetworkPort
from power.models import Powered
from .models import AssetDiff, NetworkPortDiff, PoweredDiff, ChangePlan




def create_asset_diffs(changeplan, target):
    changed_assets = Asset.objects.filter(version=changeplan)
    for changed_asset in changed_assets:
        try:
            live_asset = Asset.objects.get(
                asset_number=changed_asset.asset_number,
                version=target
            )
            AssetDiff.objects.create(
                changeplan=changeplan,
                live_asset=live_asset,
                changed_asset=changed_asset,
            )
        except:
            AssetDiff.objects.create(
                changeplan=changeplan,
                changed_asset=changed_asset,
            )


def create_networkport_diffs(changeplan, target):
    changed_networkports = NetworkPort.objects.filter(version=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live_networkport = NetworkPort.objects.get(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version=target
            )
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
            live_powered = Powered.objects.get(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version=target
            )
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
            live_asset = Asset.objects.get(
                asset_number=changed_asset.asset_number,
                version_id=0
            )
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
            live_asset = Asset.objects.get(
                asset_number=changed_asset.asset_number,
                version_id=0
            )
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
            live_networkport = NetworkPort.objects.get(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version_id=0
            )
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
            live_networkport = NetworkPort.objects.get(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version_id=0
            )
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
            live_powered = Powered.objects.get(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version_id=0
            )
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
            live_powered = Powered.objects.get(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version_id=0
            )
            live_powered.destroy()
            create_live_powered(changed_powered)
        except:
            create_live_powered(changed_powered)

def get_asset(changeplan, target):
    live = ChangePlan.objects.get(id=target)
    if changeplan:
        create_asset_diffs(changeplan, live)
        asset_diffs = AssetDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": asset_diff.changeplan.name,
                "message": asset_diff.message
            }
            for asset_diff
            in asset_diffs
        ]
        return diffs
    else:
        return []


def get_network(changeplan, target):
    live = ChangePlan.objects.get(id=target)
    if changeplan:
        create_networkport_diffs(changeplan, live)
        networkport_diffs = NetworkPortDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": networkport_diff.changeplan.name,
                "message": networkport_diff.message
            }
            for networkport_diff
            in networkport_diffs
        ]
        return diffs
    else:
        return []


def get_power(changeplan, target):
    live = ChangePlan.objects.get(id=target)
    if changeplan:
        create_powered_diffs(changeplan, live)
        powered_diffs = PoweredDiff.objects.filter(changeplan=changeplan)
        diffs = [
            {
                "changeplan": powered_diff.changeplan.name,
                "message": powered_diff.message
            }
            for powered_diff
            in powered_diffs
        ]
        return diffs
    else:
        return []