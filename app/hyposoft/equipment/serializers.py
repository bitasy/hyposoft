from .models import *
from django.contrib.auth.models import User


class DatacenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datacenter
        fields = '__all__'


class ITModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITModel
        fields = '__all__'

    def to_representation(self, itmodel):
        response = super().to_representation(itmodel)
        port_labels = NetworkPortLabel.objects.filter(itmodel=itmodel.id)
        serialized_port_labels = [
            NetworkPortLabelSerializer(instance=port_label).data
            for port_label
            in port_labels
        ]
        response['network_port_labels'] = serialized_port_labels
        return response


class PDUSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDU
        fields = '__all__'


class RackSerializer(serializers.ModelSerializer):
    pdu_set = PDUSerializer(read_only=True, many=True)

    class Meta:
        model = Rack
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'id')


class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

    def to_representation(self, asset):
        response = super().to_representation(asset)
        response['itmodel'] = ITModelSerializer(asset.itmodel).data
        response['rack'] = RackSerializer(asset.rack).data
        response['owner'] = UserSerializer(asset.owner).data
        response['power_connections'] = [
            { "pdu_id": powered.pdu.id, "position": powered.plug_number } for
            powered in
            Powered.objects.filter(asset=asset.id)
         ]
        return response


class NetworkPortLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkPortLabel
        fields = '__all__'


class NetworkPortSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkPort
        fields = '__all__'


class EdgeSerializer(NetworkPortSerializer):
    #asset = AssetSerializer()
    #connection = AssetSerializer(source='connection.asset')

    class Meta:
        model = NetworkPort
        fields = ['asset', 'connection']


class PoweredSerializer(serializers.ModelSerializer):
    class Meta:
        model = Powered
        fields = '__all__'
