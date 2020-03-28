from rest_framework import serializers

from .models import ChangePlan


class ChangePlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangePlan
        fields = ['id', 'name', 'executed_at']

    def to_representation(self, instance):
        data = super(ChangePlanSerializer, self).to_representation(instance)
        data['has_conflicts'] = False
        return data
