from rest_framework import serializers
from .models import *


class PoweredSerializer(serializers.ModelSerializer):
    class Meta:
        model = Powered
        fields = '__all__'


class PDUSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDU
        fields = '__all__'
