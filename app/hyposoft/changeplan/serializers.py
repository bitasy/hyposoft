from rest_framework import serializers

from views import AssetChangePlanDiff, PoweredChangePlanDiff, NetworkPortChangePlanDiff
from .models import ChangePlan


class ChangePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangePlan
        fields = ['id', 'name', 'executed_at']

    def to_internal_value(self, data):
        data = super(ChangePlanSerializer, self).to_internal_value(data)
        data['owner'] = self.context['request'].user
        return data

    def to_representation(self, instance):
        data = super(ChangePlanSerializer, self).to_representation(instance)
        data['has_conflicts'] = False
        return data


class ChangePlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangePlan
        fields = ['id', 'name', 'executed_at']

    def to_representation(self, instance):
        target = ChangePlan.objects.get(id=0)
        data = super(ChangePlanDetailSerializer, self).to_representation(instance)
        data['diffs'] = {
            'asset': AssetChangePlanDiff.get(None, instance, target),
            'power': PoweredChangePlanDiff.get(None, instance, target),
            'network': NetworkPortChangePlanDiff.get(None, instance, target)
        }
        return data
