from django.db import transaction

from .handlers import create_asset_extra, create_itmodel_extra
from .models import *
from network.models import NetworkPort, NetworkPortLabel
from power.models import PDU, Powered

from rest_framework import serializers


class DatacenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datacenter
        fields = '__all__'


class ITModelSerializer(serializers.ModelSerializer):
    network_port_labels = serializers.ListField(
        child=serializers.CharField(
            allow_blank=True
        ),
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
            if not self.partial:
                data['network_ports'] = 0
            return super(ITModelSerializer, self).to_internal_value(data)
        if not isinstance(labels, list):
            raise serializers.ValidationError({
                'network_port_labels': 'This field must be a list.'
            })
        data['network_ports'] = len(labels)

        return super(ITModelSerializer, self).to_internal_value(data)

    @transaction.atomic()
    def create(self, validated_data):

        labels = validated_data.pop('network_port_labels')

        # Validate the new model and save it to the database
        itmodel = super(ITModelSerializer, self).create(validated_data)

        # At this point, model has been validated and created
        if labels:
            create_itmodel_extra(itmodel, labels)

        return itmodel

    @transaction.atomic()
    def update(self, instance, validated_data):
        if 'network_port_labels' in validated_data:
            NetworkPortLabel.objects.filter(itmodel=instance).delete()
            create_itmodel_extra(instance, validated_data['network_port_labels'])
        return super(ITModelSerializer, self).update(instance, validated_data)

    def to_representation(self, instance):
        data = super(ITModelSerializer, self).to_representation(instance)
        ports = NetworkPortLabel.objects.filter(itmodel=instance)
        data['network_port_labels'] = [name for name in ports.values_list('name', flat=True).order_by('order')]

        return data

    def validate_network_port_labels(self, value):
        has_digits = False
        has_blanks = False

        for label in value:
            if label.isdigit():
                has_digits = True
            if len(label) == 0:
                has_blanks = True
            if has_digits and has_blanks:
                raise serializers.ValidationError(
                    "If integer label names are used, all label names must be specified."
                )

        # This ensures that the response to the API call is correct
        # The logic is duplicated in handers.py for bulk import
        # It may not be necessary there depending on how that ends up being implemented
        for i in range(1, len(value) + 1):
            if len(value[i - 1]) == 0:
                value[i - 1] = str(i)

        return value


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

    asset_number = serializers.IntegerField(
        allow_null=True
    )

    class Meta:
        model = Asset
        fields = '__all__'

    def to_internal_value(self, data):
        req = self.context['request']
        # Value of 0 represents live, and is the default
        version = req.META.get('HTTP_X_CHANGE_PLAN', 0)
        data['version'] = version

        return super(AssetSerializer, self).to_internal_value(data)

    @transaction.atomic
    def create(self, validated_data):
        power_connections = validated_data.pop('power_connections')
        net_ports = validated_data.pop('network_ports')

        # Validate the new asset and save it to the database
        asset = super(AssetSerializer, self).create(validated_data)

        # At this point, asset has been validated and created
        create_asset_extra(asset, validated_data['version'], power_connections, net_ports)

        return asset

    @transaction.atomic()
    def update(self, instance, validated_data):
        power_connections = validated_data.pop('power_connections', None)
        net_ports = validated_data.pop('network_ports', None)

        if power_connections:
            Powered.objects.filter(asset=instance).delete()
        if net_ports:
            NetworkPort.objects.filter(asset=instance).delete()

        create_asset_extra(instance, validated_data['version'], power_connections, net_ports)

        return super(AssetSerializer, self).update(instance, validated_data)

    def to_representation(self, instance):
        data = super(AssetSerializer, self).to_representation(instance)
        connections = Powered.objects.filter(asset=instance)
        data['power_connections'] = [
            {'pdu_id': conn['pdu'], 'plug': conn['plug_number']} for conn in
            connections.values('pdu', 'plug_number')]
        ports = NetworkPort.objects.filter(asset=instance)
        data['network_ports'] = [
            port for port in ports.values('id', 'mac_address', 'connection')
        ]
        return data

    def validate_asset_number(self, value):
        if value is None:
            max_an = Asset.objects.all().aggregate(Max('asset_number'))
            asset_number = (max_an['asset_number__max'] or 100000) + 1
            return asset_number

        return value

    def validate_hostname(self, value):
        return None if value == "" else value


class RackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = ["id", "rack", "datacenter", "decommissioned"]
