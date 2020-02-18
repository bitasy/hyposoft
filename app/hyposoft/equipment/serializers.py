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
        return response


class NetworkPortLabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkPortLabel
        fields = '__all__'


class NetworkPortSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkPort
        fields = '__all__'


class PoweredSerializer(serializers.ModelSerializer):
    class Meta:
        model = Powered
        fields = '__all__'
