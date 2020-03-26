from rest_framework import serializers
from .models import ActionLog


class LogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActionLog
        fields = '__all__'
