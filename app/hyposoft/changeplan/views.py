from django.utils.timezone import now
from rest_framework import views
from rest_framework.response import Response
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from django.core.exceptions import ValidationError
from .handlers import *


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
                execute_decommissioned_assets(child)
                execute_decommissioned_networkports(child)
                execute_decommissioned_powereds(child)
                child.executed = True
                child.time_executed = now()
                child.save()

        except:
            raise ValidationError("This ChangePlan is not valid.")
