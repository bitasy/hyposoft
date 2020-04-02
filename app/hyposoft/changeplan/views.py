from django.utils.timezone import now
from rest_framework import views
from django.core.exceptions import ValidationError
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK

from equipment.models import Rack, Asset
from network.models import NetworkPort
from power.models import PDU, Powered
from .models import ChangePlan, AssetDiff, NetworkPortDiff, PoweredDiff
from .handlers import create_asset_diffs, create_networkport_diffs, create_powered_diffs, execute_assets, \
    execute_networkports, execute_powereds, execute_decommissioned_assets, execute_decommissioned_networkports, \
    execute_decommissioned_powereds, get_asset, get_power, get_network
from .serializers import ChangePlanSerializer, ChangePlanDetailSerializer





class ExecuteChangePlan(views.APIView):
    def post(self, request, name):
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


class ChangePlanActions(views.APIView):
    def get(self, request, pk):
        changeplan = ChangePlan.objects.get(id=pk)
        live = ChangePlan.objects.get(id=0)
        messages = []

        asset_diff = get_asset(changeplan, live)
        power_diff = get_power(changeplan, live)
        network_diff = get_network(changeplan, live)

        for diff in asset_diff + power_diff + network_diff:
            messages += diff['messages']

        return Response(messages, status=HTTP_200_OK)
