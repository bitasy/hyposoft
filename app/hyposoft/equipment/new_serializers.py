from django.db import transaction

from handlers import create_asset_extra, create_itmodel_extra
from .models import *
from network.models import NetworkPortLabel, NetworkPort
from power.models import Powered, PDU

from rest_framework import serializers


class ITModelSerializer(serializers.ModelSerializer):
    network_port_labels = serializers.ListField(
        child=serializers.CharField(),
        # Without the following line, Django will raise an error when
        # attempting to read the field from the database
        # (it doesn't exist there)
        required=False
    )

    class Meta:
        model = ITModel
        # using __all__ syntax is required to bypass check that would
        # otherwise throw error for network_port_labels
        fields = "__all__"

    def to_internal_value(self, data):

        labels = data.get('network_port_labels')
        if labels is None:
            data['network_ports'] = 0
            return
        if not isinstance(labels, list):
            raise serializers.ValidationError({
                'network_port_labels': 'This field must be a list.'
            })
        data['network_ports'] = len(labels)

        return super(ITModelSerializer, self).to_internal_value(data)

    def create(self, validated_data):

        labels = validated_data.pop('network_port_labels')
        itmodel = super(ITModelSerializer, self).create(validated_data)

        if labels:
            create_itmodel_extra(itmodel, labels)

        return itmodel

    def to_representation(self, instance):
        data = super(ITModelSerializer, self).to_representation(instance)
        data['network_port_labels'] = self.validated_data['network_port_labels']

        return data


class AssetSerializer(serializers.ModelSerializer):
    class PowerConnSerializer(serializers.Serializer):
        pdu_id = serializers.PrimaryKeyRelatedField(
            queryset=PDU.objects.all()
        )
        plug = serializers.IntegerField()

    power_connections = PowerConnSerializer(required=False, many=True)

    class NetPortSerializer(serializers.Serializer):
        label = serializers.CharField()
        mac_address = serializers.CharField(
            allow_null=True
        )
        connection = serializers.PrimaryKeyRelatedField(
            queryset=NetworkPort.objects.all(),
            allow_null=True
        )

    network_ports = NetPortSerializer(required=False, many=True)

    class Meta:
        model = Asset
        fields = '__all__'

    def to_internal_value(self, data):

        req = self.context['request']
        # Value of 0 represents live
        version = req.META.get('HTTP_X_CHANGE_PLAN', 0)
        data['version'] = version

        return super(AssetSerializer, self).to_internal_value(data)

    @transaction.atomic
    # Atomicity used for validation errors on Powered and NetworkPort entries
    def create(self, validated_data):

        power_connections = validated_data.pop('power_connections')
        net_ports = validated_data.pop('network_ports')

        asset = super(AssetSerializer, self).create(validated_data)

        create_asset_extra(asset, validated_data['version'], power_connections, net_ports)

        return asset

    def to_representation(self, instance):
        data = super(AssetSerializer, self).to_representation(instance)
        data['power_connections'] = self.power_connections
        data['network_ports'] = self.network_ports
