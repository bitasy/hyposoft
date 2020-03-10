from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import ITModel, Asset

from rest_framework import serializers


@receiver(pre_save, sender=ITModel)
def check_deployed_assets(sender, instance, *args, **kwargs):
    if instance.asset_set.count() == 0:
        return

    def throw():
        raise serializers.ValidationError(
            "Cannot modify interconnected ITModel attributes while assets are deployed."
        )

    try:
        old = ITModel.objects.get(id=instance.id)
        if old.power_ports != instance.power_ports:
            throw()
        if old.network_ports != instance.network_ports:
            throw()
        if old.height != instance.height:
            throw()

    except ITModel.DoesNotExist:
        pass


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    if instance.datacenter is not None and instance.datacenter != instance.rack.datacenter:
        raise serializers.ValidationError(
            "Asset datacenter cannot be different from rack datacenter.")

    instance.datacenter = instance.rack.datacenter
    if not instance.mac_address == "":
        new = (instance.mac_address or "").lower().replace('-', '').replace('_', '').replace(':', '')
        new = ':'.join([new[b:b + 2] for b in range(0, 12, 2)])
        instance.mac_address = new
