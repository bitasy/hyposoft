from django.db import transaction

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
            raise serializers.ValidationError({
                'network_port_labels': 'This field is required.'
            })
        if not isinstance(labels, list):
            raise serializers.ValidationError({
                'network_port_labels': 'This field must be a list.'
            })
        data['network_ports'] = len(labels)

        return super(ITModelSerializer, self).to_internal_value(data)

    def create(self, validated_data):

        labels = validated_data.get('network_port_labels')
        del validated_data['network_port_labels']
        obj = super(ITModelSerializer, self).create(validated_data)

        i = 1
        for label in labels:
            NetworkPortLabel.objects.create(
                name=label,
                itmodel=obj,
                special=i if i <= 4 else None
            )
            i += 1

        return obj


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
        version = req.META.get('HTTP_X_CHANGESET', 0)
        data['version'] = version

        return super(AssetSerializer, self).to_internal_value(data)

    @transaction.atomic
    # Atomicity used for validation errors on Powered and NetworkPort entries
    def create(self, validated_data):

        power_connections = validated_data.get('power_connections')
        net_ports = validated_data.get('network_ports')
        del validated_data['power_connections']
        del validated_data['network_ports']

        obj = super(AssetSerializer, self).create(validated_data)

        i = 1
        for connection in power_connections:
            Powered.objects.create(
                pdu=connection['pdu_id'],
                plug_number=connection['plug'],
                version=validated_data['version'],
                asset=obj,
                special=i if i <= 2 else None
            )
            i += 1

        for port in net_ports:
            NetworkPort.objects.create(
                asset=obj,
                label=NetworkPortLabel.objects.get(
                    itmodel=obj.itmodel,
                    name=port['label']
                ),
                mac_address=port['mac_address'],
                connection=port.get('connection'),
                version=validated_data['version'],
            )

        return obj
