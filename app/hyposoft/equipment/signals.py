from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import ITModel, Asset, Powered, Rack, PDU
from .views import get_pdu
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


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    num_powered = len(Powered.objects.filter(asset=instance.asset))
    if instance not in Powered.objects.all() and num_powered == instance.asset.itmodel.power_ports:
        raise serializers.ValidationError("All the power port connections have already been used.")
    if instance.pdu.assets.count() > 24:
        raise serializers.ValidationError("This PDU is already full.")
    if instance.pdu.rack != instance.asset.rack:
        raise serializers.ValidationError(
            "PDU must be on the same rack as the asset.")


@receiver(pre_save, sender=PDU)
def set_connected(sender, instance, *args, **kwargs):
    if instance.rack.datacenter.abbr.lower() == 'rtp1':
        response = get_pdu(instance.rack.rack, instance.position)
        instance.networked = response[1] < 400
    else:
        instance.networked = False


@receiver(post_save, sender=Rack)
def add_PDUs(sender, instance, created, *args, **kwargs):
    if created:
        left = PDU.objects.create(rack=instance, position=PDU.Position.LEFT)
        left.save()
        right = PDU.objects.create(rack=instance, position=PDU.Position.RIGHT)
        right.save()
