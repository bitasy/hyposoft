from rest_framework import serializers
from .models import *


class PoweredSerializer(serializers.ModelSerializer):
    pdu_id = serializers.PrimaryKeyRelatedField(
        source='pdu',
        queryset=PDU.objects.all()
    )
    plug = serializers.IntegerField(source='plug_number')
    asset_id = serializers.PrimaryKeyRelatedField(
        source='asset',
        queryset=Asset.objects.all()
    )

    class Meta:
        model = Powered
        fields = ['pdu_id', 'asset_id', 'plug']

    def to_representation(self, instance):
        data = super(PoweredSerializer, self).to_representation(instance)
        data['label'] = instance.pdu.position + str(instance.plug_number)
        return data


class PDUSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDU
        fields = '__all__'
