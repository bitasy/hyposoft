from django.utils.timezone import now
from rest_framework import views
from rest_framework.response import Response
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from equipment.models import Asset
from network.models import NetworkPort
from power.models import Powered
from django.core.exceptions import ValidationError


def create_asset_diffs(changeplan):
    changed_assets = Asset.objects.filter(version=changeplan)
    for changed_asset in changed_assets:
        try:
            live_asset = Asset.objects.get(
                asset_number=changed_asset.asset_number,
                version_id=0
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


class AssetChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.get(name=name)
        if changeplan:
            create_asset_diffs(changeplan)
            asset_diffs = AssetDiff.objects.filter(changeplan=changeplan)
            diffs = [
                {
                    "changeplan": asset_diff.changeplan.name,
                    "live_asset": asset_diff.live_asset,
                    "changed_asset": asset_diff.changed_asset,
                    "message": asset_diff.message
                }
                for asset_diff
                in asset_diffs
            ]
            return Response(diffs)
        else:
            return Response([])


def create_networkport_diffs(changeplan):
    changed_networkports = NetworkPort.objects.filter(version=changeplan)
    for changed_networkport in changed_networkports:
        try:
            live_networkport = NetworkPort.objects.get(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version_id=0
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


class NetworkPortChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.get(name=name)
        if changeplan:
            create_networkport_diffs(changeplan)
            networkport_diffs = NetworkPortDiff.objects.filter(changeplan=changeplan)
            diffs = [
                {
                    "changeplan": networkport_diff.changeplan.name,
                    "live_networkport": networkport_diff.live_networkport,
                    "changed_networkport": networkport_diff.changed_networkport,
                    "message": networkport_diff.message
                }
                for networkport_diff
                in networkport_diffs
            ]
            return Response(diffs)
        else:
            return Response([])


def create_powered_diffs(changeplan):
    changed_powereds = Powered.objects.filter(version=changeplan)
    for changed_powered in changed_powereds:
        try:
            live_powered = Powered.objects.get(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version_id=0
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


class PoweredChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.get(name=name)
        if changeplan:
            create_powered_diffs(changeplan)
            powered_diffs = PoweredDiff.objects.filter(changeplan=changeplan)
            diffs = [
                {
                    "changeplan": powered_diff.changeplan.name,
                    "live_powered": powered_diff.live_networkport,
                    "changed_powered": powered_diff.changed_networkport,
                    "message": powered_diff.message
                }
                for powered_diff
                in powered_diffs
            ]
            return Response(diffs)
        else:
            return Response([])


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
            Asset.objects.create(
                asset_number=changed_asset.asset_number,
                hostname=changed_asset.hostname,
                datacenter=changed_asset.datacenter,
                rack=changed_asset.rack,
                rack_position=changed_asset.rack_position,
                itmodel=changed_asset.itmodel,
                owner=changed_asset.owner,
                comment=changed_asset.comment,
                version_id=0,
                commissioned=changed_asset.commissioned,
                decommissioned_timestamp=changed_asset.decommissioned_timestamp,
                decommissioned_by=changed_asset.decommissioned_by
            )
        changed_asset.destroy()


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
            NetworkPort.objects.create(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                mac_address=changed_networkport.mac_address,
                connection=changed_networkport.connection,
                version_id=0
            )
        changed_networkport.destroy()


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
            Powered.objects.create(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                on=changed_powered.on,
                special=changed_powered.special,
                version_id=0
            )
        changed_powered.destroy()


class ExecuteChangePlan(views.APIView):
    def execute(self, request, name):
        try:
            # Get ChangePlan
            changeplan = ChangePlan.objects.get(
                name=name,
                executed=False,
                owner=request.user
            )
            children = changeplan.changeplan_set.all()
            # Update Objects
            execute_assets(changeplan)
            execute_networkports(changeplan)
            execute_powereds(changeplan)
            changeplan.executed = True
            changeplan.time_executed = now()
            changeplan.save()
            for child in children:
                execute_assets(child)
                execute_networkports(child)
                execute_powereds(child)
                child.executed = True
                child.time_executed = now()
                child.save()

        except:
            raise ValidationError("This ChangePlan is not valid.")
