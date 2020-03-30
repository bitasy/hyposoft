from django.utils.timezone import now
from rest_framework import views
from django.core.exceptions import ValidationError
from rest_framework import generics
from equipment.models import Rack
from power.models import PDU
from .models import ChangePlan
from .handlers import *
from .serializers import ChangePlanSerializer, ChangePlanDetailSerializer


class AssetChangePlanDiff(views.APIView):
    def get(self, changeplan, target):
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


class NetworkPortChangePlanDiff(views.APIView):
    def get(self, changeplan, target):
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


class PoweredChangePlanDiff(views.APIView):
    def get(self, changeplan, target):
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


class UserChangePlansMixin():
    def get_queryset(self):
        return ChangePlan.objects.filter(owner=self.request.user, auto_created=False, id__gt=0)


class ChangePlanList(UserChangePlansMixin, generics.ListAPIView):
    serializer_class = ChangePlanSerializer


class ChangePlanDetails(UserChangePlansMixin, generics.RetrieveAPIView):
    serializer_class = ChangePlanDetailSerializer


class ChangePlanCreate(UserChangePlansMixin, generics.CreateAPIView):
    serializer_class = ChangePlanSerializer


class ChangePlanDestroy(UserChangePlansMixin, generics.DestroyAPIView):
    serializer_class = ChangePlanSerializer

    def destroy(self, request, *args, **kwargs):
        version = self.get_object()

        # Order matters!
        for model in (Powered, NetworkPort, Asset, PDU, Rack):
            model.objects.filter(version=version).delete()

        return super(ChangePlanDestroy, self).destroy(request, *args, **kwargs)


class ChangePlanUpdate(UserChangePlansMixin, generics.UpdateAPIView):
    serializer_class = ChangePlanSerializer

