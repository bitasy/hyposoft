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
        message = ''
        try:
            live_asset = Asset.objects.get(
                asset_number=changed_asset.asset_number,
                version=0
            )
            message += ('UPDATED ASSET' + '\n')
            if changed_asset.asset_number != live_asset.asset_number:
                message += ('OLD ASSET NUMBER: ' + str(live_asset.asset_number) + '\n')
                message += ('NEW ASSET NUMBER: ' + str(changed_asset.asset_number) + '\n')
            if changed_asset.hostname != live_asset.hostname:
                message += ('OLD HOSTNAME: ' + str(live_asset.hostname) + '\n')
                message += ('NEW HOSTNAME: ' + str(changed_asset.hostname) + '\n')
            if changed_asset.rack != live_asset.rack:
                message += ('OLD RACK: ' + str(live_asset.rack.rack) + '\n')
                message += ('NEW RACK: ' + str(changed_asset.rack.rack) + '\n')
            if changed_asset.rack_position != live_asset.rack_position:
                message += ('OLD RACK POSITION: ' + str(live_asset.rack_position) + '\n')
                message += ('NEW RACK POSITION: ' + str(changed_asset.rack_position) + '\n')
            if changed_asset.itmodel != live_asset.itmodel:
                message += ('OLD ITMODEL: ' + str(live_asset.itmodel.model_number) + 'by' +
                            str(live_asset.itmodel.vendor) + '\n')
                message += ('NEW ITMODEL: ' + str(changed_asset.itmodel.model_number) + 'by' +
                            str(changed_asset.itmodel.vendor) + '\n')
            if changed_asset.owner != live_asset.owner:
                message += ('OLD OWNER: ' + str(live_asset.user.username) + '\n')
                message += ('NEW OWNER: ' + str(changed_asset.user.username) + '\n')
            if changed_asset.comment != live_asset.comment:
                message += ('OLD COMMENT: ' + str(live_asset.comment) + '\n')
                message += ('NEW COMMENT: ' + str(changed_asset.comment) + '\n')
            AssetDiff.objects.create(
                changeplan=changeplan,
                live_asset=live_asset,
                changed_asset=changed_asset,
                message=message
            )
        except:
            message += ('CREATED ASSET' + '\n')
            message += ('ASSET NUMBER: ' + str(changed_asset.asset_number) + '\n')
            message += ('HOSTNAME: ' + str(changed_asset.hostname) + '\n')
            message += ('RACK: ' + str(changed_asset.rack.rack) + '\n')
            message += ('RACK POSITION: ' + str(changed_asset.rack_position) + '\n')
            message += ('ITMODEL: ' + str(changed_asset.itmodel.model_number) + 'by' +
                        str(changed_asset.itmodel.vendor) + '\n')
            message += ('OWNER: ' + str(changed_asset.user.username) + '\n')
            message += ('COMMENT: ' + str(changed_asset.comment) + '\n')
            AssetDiff.objects.create(
                changeplan=changeplan,
                changed_asset=changed_asset,
                message=message
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
        message = ''
        try:
            live_networkport = NetworkPort.objects.get(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version=0
            )
            message += ('UPDATED NETWORKPORT' + '\n')
            if changed_networkport.asset != live_networkport.asset:
                message += ('OLD ASSET: ' + str(live_networkport.asset.asset_number) + '\n')
                message += ('NEW ASSET: ' + str(changed_networkport.asset.asset_number) + '\n')
            if changed_networkport.label != live_networkport.label:
                message += ('OLD LABEL: ' + str(live_networkport.label.name) + '\n')
                message += ('NEW LABEL: ' + str(changed_networkport.label.name) + '\n')
            if changed_networkport.mac_address != live_networkport.mac_address:
                message += ('OLD MAC ADDRESS: ' + str(live_networkport.mac_address) + '\n')
                message += ('NEW MAC ADDRESS: ' + str(changed_networkport.mac_address) + '\n')
            if changed_networkport.connection != live_networkport.connection:
                message += ('OLD CONNECTION: ' + str(live_networkport.connection.asset.asset_number) + ' ' +
                            str(live_networkport.connection.label.name) + '\n')
                message += ('NEW CONNECTION: ' + str(changed_networkport.connection.asset.asset_number) + ' ' +
                            str(changed_networkport.connection.label.name) + '\n')
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                live_networkport=live_networkport,
                changed_networkport=changed_networkport,
                message=message
            )
        except:
            message += ('CREATED NETWORKPORT' + '\n')
            message += ('ASSET: ' + str(changed_networkport.asset.asset_number) + '\n')
            message += ('LABEL: ' + str(changed_networkport.label.name) + '\n')
            message += ('MAC ADDRESS: ' + str(changed_networkport.mac_address) + '\n')
            message += ('CONNECTION: ' + str(changed_networkport.connection.asset.asset_number) + ' ' +
                        str(changed_networkport.connection.label.name) + '\n')
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                changed_networkport=changed_networkport,
                message=message
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
        message = ''
        try:
            live_powered = Powered.objects.get(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version=0
            )
            message += ('UPDATED POWERED' + '\n')
            if changed_powered.plug_number != live_powered.plug_number:
                message += ('OLD PLUG NUMBER: ' + str(live_powered.plug_number) + '\n')
                message += ('NEW PLUG NUMBER: ' + str(changed_powered.plug_number) + '\n')
            if changed_powered.pdu != live_powered.pdu:
                message += ('OLD PDU: ' + str(live_powered.pdu.rack.rack) + ' ' +
                            str(live_powered.pdu.position) + '\n')
                message += ('NEW PDU: ' + str(changed_powered.pdu.rack.rack) + ' ' +
                            str(changed_powered.pdu.position) + '\n')
            if changed_powered.asset != live_powered.asset:
                message += ('OLD ASSET: ' + str(live_powered.asset.asset_number) + '\n')
                message += ('NEW ASSET: ' + str(changed_powered.asset.asset_number) + '\n')
            if changed_powered.on != live_powered.on:
                message += ('OLD ON: ' + str(live_powered.on) + '\n')
                message += ('NEW ON: ' + str(changed_powered.on) + '\n')
            PoweredDiff.objects.create(
                changeplan=changeplan,
                live_networkport=live_powered,
                changed_networkport=changed_powered,
                message=message
            )
        except:
            message += ('CREATED POWERED' + '\n')
            message += ('PLUG NUMBER: ' + str(changed_powered.plug_number) + '\n')
            message += ('PDU: ' + str(changed_powered.pdu.rack.rack) + ' ' +
                        str(changed_powered.pdu.position) + '\n')
            message += ('ASSET: ' + str(changed_powered.asset.asset_number) + '\n')
            message += ('ON: ' + str(changed_powered.on) + '\n')
            PoweredDiff.objects.create(
                changeplan=changeplan,
                changed_powered=changed_powered,
                message=message
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
                changeplan=0
            )
            live_asset.asset_number = changed_asset.asset_number
            live_asset.hostname = changed_asset.hostname
            live_asset.datacenter = changed_asset.datacenter
            live_asset.rack = changed_asset.rack
            live_asset.rack_position = changed_asset.rack_position
            live_asset.itmodel = changed_asset.itmodel
            live_asset.owner = changed_asset.owner
            live_asset.comment = changed_asset.comment
            live_asset.version = 0
            live_asset.commissioned = changed_asset.commissioned
            live_asset.decommissioned_timestamp = changed_asset.decommissioned_timestamp
            live_asset.decommissioned_by = changed_asset.decommissioned_by
            live_asset.save()

        except:
            new_asset = Asset.objects.create(
                asset_number=changed_asset.asset_number,
                hostname=changed_asset.hostname,
                datacenter=changed_asset.datacenter,
                rack=changed_asset.rack,
                rack_position=changed_asset.rack_position,
                itmodel=changed_asset.itmodel,
                owner=changed_asset.owner,
                comment=changed_asset.comment,
                version=0,
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
                version=0
            )
            live_networkport.asset = changed_networkport.asset
            live_networkport.label = changed_networkport.label
            live_networkport.mac_address = changed_networkport.mac_address
            live_networkport.connection = changed_networkport.connection
            live_networkport.version = 0
            live_networkport.save()

        except:
            new_networkport = NetworkPort.objects.create(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                mac_address=changed_networkport.mac_address,
                connection=changed_networkport.connection,
                version=0
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
                version=0
            )
            live_powered.plug_number = changed_powered.plug_number
            live_powered.pdu = changed_powered.pdu
            live_powered.asset = changed_powered.asset
            live_powered.on = changed_powered.on
            live_powered.special = changed_powered.special
            live_powered.version = 0
            live_powered.save()

        except:
            new_powered = Powered.objects.create(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                on=changed_powered.on,
                special=changed_powered.special,
                version=0
            )
        changed_powered.destroy()


class ExecuteChangePlan(views.APIView):
    def execute(self, request, name):
        try:
            # Get ChangePlan
            changeplan = ChangePlan.objects.get(
                name=name,
                executed=False
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
