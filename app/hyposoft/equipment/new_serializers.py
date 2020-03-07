from rest_framework import serializers

from .models import *
from network.models import NetworkPortLabel


class ITModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITModel
        fields = [
            'vendor',
            'model_number',
            'height',
            'power_ports',
            'network_ports',
            'display_color',
            'cpu',
            'memory',
            'storage',
            'comments',
        ]

    def to_internal_value(self, data):

        labels = data.get('network_port_labels')
        if not labels:
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
