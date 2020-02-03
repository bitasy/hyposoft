from rest_framework import serializers
from .models import ITModel, Instance, Rack
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

class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instance
        fields = '__all__'

    def to_representation(self, instance):
        response = super().to_representation(instance)
        response['itmodel'] = ITModelSerializer(instance.itmodel).data
        response['rack'] = RackSerializer(instance.rack).data
        response['owner'] = UserSerializer(instance.owner).data
        return response
