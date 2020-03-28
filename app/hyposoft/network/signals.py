from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from rest_framework import serializers

from .models import NetworkPort


@receiver(pre_save, sender=NetworkPort)
def check_connection(sender, instance, *args, **kwargs):
    if instance.connection:
        if instance.asset == instance.connection.asset:
            raise serializers.ValidationError(
                "Connections must be between different assets.")

        if instance.connection.asset.datacenter != instance.asset.datacenter:
            raise serializers.ValidationError(
                "Connections must be in the same datacenter.")

        try:
            other = instance.connection.connection
            if other and other.id is not instance.id:
                raise serializers.ValidationError(
                    "{} is already connected to {} on {}".format(
                        instance.connection.asset,
                        instance.connection.connection.asset,
                        instance.connection.label.name
                    )
                )
        except NetworkPort.DoesNotExist:
            pass

    old = NetworkPort.objects.filter(id=instance.id).first()
    if old and old.connection is not None:
        NetworkPort.objects.filter(id=old.connection.id).update(connection=None)  # Doesn't trigger pre-save signal


@receiver(post_save, sender=NetworkPort)
def set_connection(sender, instance, *args, **kwargs):
    if instance.connection:
        try:
            other = instance.connection.connection
            if not other or other.id is not instance.id:
                instance.connection.connection = instance
                instance.connection.save()
        except NetworkPort.DoesNotExist:
            instance.connection.connection = instance
            instance.connection.save()


@receiver(pre_save, sender=NetworkPort)
def set_mac_address(sender, instance, *args, **kwargs):
    if instance.mac_address:
        mac = instance.mac_address.lower().replace('-', '').replace('_', '').replace(':', '')
        instance.mac_address = ':'.join([mac[b:b + 2] for b in range(0, 12, 2)])
