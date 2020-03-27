from rest_framework import views
from rest_framework.response import Response
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from equipment.models import Asset
from network.models import NetworkPort
from power.models import Powered


def create_asset_diffs(changeplan):
    changed_assets = Asset.objects.filter(version=changeplan)
    asset_fields = Asset._meta.get_all_field_names()
    for changed_asset in changed_assets:
        message = ''
        try:
            live_asset = Asset.objects.filter(
                asset_number=changed_asset.asset_number,
                version=0
            )
            diff_fields = filter(
                lambda field:
                getattr(live_asset,field,None) != getattr(changed_asset,field,None),
                asset_fields
            )
            print(diff_fields)
            message += ('UPDATED ASSET' + '\n')
            for field in diff_fields:
                message += ('OlD ' + str(field) + ': ' + str(live_asset.field) + '\n')
                message += ('NEW ' + str(field) + ': ' + str(changed_asset.field) + '\n')
            AssetDiff.objects.create(
                changeplan=changeplan,
                live_asset=live_asset,
                changed_asset=changed_asset,
                message=message
            )
        except:
            message += ('CREATED ASSET' + '\n')
            for field in asset_fields:
                message += (str(field) + str(changed_asset.field) + '\n')
            AssetDiff.objects.create(
                changeplan=changeplan,
                changed_asset=changed_asset,
                message=message
            )


class AssetChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.filter(name=name)
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
    networkport_fields = NetworkPortDiff._meta.get_all_field_names()
    for changed_networkport in changed_networkports:
        message = ''
        try:
            live_networkport = NetworkPort.objects.filter(
                asset=changed_networkport.asset,
                label=changed_networkport.label,
                version=0
            )
            diff_fields = filter(
                lambda field:
                getattr(live_networkport,field,None) != getattr(changed_networkport,field,None),
                networkport_fields
            )
            print(diff_fields)
            message += ('UPDATED NETWORKPORT' + '\n')
            for field in diff_fields:
                message += ('OlD ' + str(field) + ': ' + str(live_networkport.field) + '\n')
                message += ('NEW ' + str(field) + ': ' + str(changed_networkport.field) + '\n')
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                live_networkport=live_networkport,
                changed_networkport=changed_networkport,
                message=message
            )
        except:
            message += ('CREATED NETWORKPORT' + '\n')
            for field in networkport_fields:
                message += (str(field) + str(changed_networkport.field) + '\n')
            NetworkPortDiff.objects.create(
                changeplan=changeplan,
                changed_networkport=changed_networkport,
                message=message
            )


class NetworkPortChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.filter(name=name)
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
    powered_fields = Powered._meta.get_all_field_names()
    for changed_powered in changed_powereds:
        message = ''
        try:
            live_powered = Powered.objects.filter(
                plug_number=changed_powered.plug_number,
                pdu=changed_powered.pdu,
                asset=changed_powered.asset,
                version=0
            )
            diff_fields = filter(
                lambda field:
                getattr(live_powered,field,None) != getattr(changed_powered,field,None),
                powered_fields
            )
            print(diff_fields)
            message += ('UPDATED POWERED' + '\n')
            for field in diff_fields:
                message += ('OlD ' + str(field) + ': ' + str(live_powered.field) + '\n')
                message += ('NEW ' + str(field) + ': ' + str(changed_powered.field) + '\n')
            PoweredDiff.objects.create(
                changeplan=changeplan,
                live_networkport=live_powered,
                changed_networkport=changed_powered,
                message=message
            )
        except:
            message += ('CREATED POWERED' + '\n')
            for field in powered_fields:
                message += (str(field) + str(changed_powered.field) + '\n')
            PoweredDiff.objects.create(
                changeplan=changeplan,
                changed_powered=changed_powered,
                message=message
            )


class PoweredChangePlanDiff(views.APIView):
    def get(self, request, name):
        changeplan = ChangePlan.objects.filter(name=name)
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