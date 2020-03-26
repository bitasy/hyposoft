from rest_framework import serializers
from .models import Perms


class PermsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perms
        fields = '__all__'
