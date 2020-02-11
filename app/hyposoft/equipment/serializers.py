from rest_framework import serializers
from .models import ITModel, Asset, Rack
from django.contrib.auth.models import User

class ITModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITModel
        fields = '__all__'

class RackSerializer(serializers.ModelSerializer):
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
