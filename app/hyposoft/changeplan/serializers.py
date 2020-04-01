import datetime

from rest_framework import serializers

from .handlers import get_asset, get_power, get_network
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
        data['has_conflicts'] = False #todo set appropriately

        data = super(ChangePlanSerializer, self).to_representation(instance)
        old_format = '%Y-%m-%dT%H:%M:%S.%fZ'
        new_format = '%d-%m-%Y %H:%M:%S'

        if data['executed_at'] is not None:
            data['executed_at'] = datetime.datetime.strptime(data['executed_at'], old_format).strftime(new_format)
        return data


class ChangePlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangePlan
        fields = ['id', 'name', 'executed_at']

    def to_representation(self, instance):
        target = ChangePlan.objects.get(id=0)
        data = super(ChangePlanDetailSerializer, self).to_representation(instance)
        data['diffs'] = {
            'asset': get_asset(instance, target),
            'power': get_power(instance, target),
            'network': get_network(instance, target)
        }
        return data
