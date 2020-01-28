from rest_framework import serializers
from .models import ITModel, Instance, Rack


class ITModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = ITModel
        fields = '__all__'


class InstanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instance
        depth = 2
        fields = '__all__'


class RackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rack
        fields = '__all__'

