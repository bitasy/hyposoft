from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import Permission


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        user = authenticate(
            username=attrs['username'], password=attrs['password'])

        if not user:
            raise serializers.ValidationError('Incorrect email or password.')

        return {'user': user}


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['model_perm', 'asset_perm', 'power_perm', 'audit_perm', 'admin_perm', 'site_perm']


class UserPermSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']

    def to_representation(self, instance):
        data = super(UserPermSerializer, self).to_representation(instance)
        
        try:
            perm = Permission.objects.get(user=instance)
        except:
            perm = Permission(admin_perm=True, user=instance)
            perm.save()

        data['permission'] = PermissionSerializer(perm).data

        return data

    def to_internal_value(self, data):
        req = self.context['request']
        permission = data.pop['permission']
        return super(UserPermSerializer, self).to_internal_value(data)

