from rest_framework import serializers
from .models import NetworkPortLabel, NetworkPort


class NetworkPortLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkPortLabel
        fields = '__all__'


class NetworkPortSerializer(serializers.ModelSerializer):
    asset_str = serializers.StringRelatedField(source="asset")
    label = serializers.StringRelatedField(source="label.name")

    class Meta:
        model = NetworkPort
        fields = ['id', 'asset_str', 'label', 'mac_address', 'connection']


class NodeSerializer(NetworkPortSerializer):

    class Meta:
        model = NetworkPort
        fields = ['id', 'label', 'asset']


class EdgeSerializer(NetworkPortSerializer):

    class Meta:
        model = NetworkPort
        fields = ['asset', 'connection']

    def to_representation(self, edge):
        response = super().to_representation(edge)
        response['connection'] = NodeSerializer(edge.connection).data
        return response

