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
    permission = PermissionSerializer()

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'permission']

        def to_representation(self, instance):
            data = super(UserPermSerializer, self).to_representation(instance)
            perm = Permission.objects.get(user=instance)
            data['permission'] = {}
            data['permission']['model_perm'] = perm.model_perm
            data['permission']['asset_perm'] = perm.asset_perm
            data['permission']['power_perm'] = perm.power_perm
            data['permission']['audit_perm'] = perm.audit_perm
            data['permission']['admin_perm'] = perm.admin_perm
            data['permission']['site_perm'] = perm.site_perm
            return data

        def to_internal_value(self, data):
            req = self.context['request']
            permission = data.pop['permission']
            return super(UserPermSerializer, self).to_internal_value(data)

