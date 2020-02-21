from django.db.models import Max
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Asset, Powered, NetworkPortLabel, Rack, PDU, NetworkPort
from .views import get_pdu
from rest_framework import serializers


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    if instance.asset_number == 0:
        max_an = Asset.objects.all().aggregate(Max('asset_number'))
        instance.asset_number = max_an + 1

    if instance.datacenter is not None and instance.datacenter != instance.rack.datacenter:
        raise serializers.ValidationError(
            "Asset datacenter cannot be different from rack datacenter.")
    instance.datacenter = instance.rack.datacenter
    if not instance.mac_address == "":
        new = (instance.mac_address or "").lower().replace('-', '').replace('_', '').replace(':', '')
        new = ':'.join([new[b:b+2] for b in range(0, 12, 2)])
        instance.mac_address = new


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    if instance.pdu.assets.count() > 24:
        raise serializers.ValidationError("This PDU is already full.")
    if instance.pdu.rack != instance.asset.rack:
        raise serializers.ValidationError(
            "PDU must be on the same rack as the asset.")


@receiver(pre_save, sender=NetworkPortLabel)
def set_default_npl(sender, instance, *args, **kwargs):
    if instance.name == "":
        labels = sender.objects.filter(itmodel=instance.itmodel)
        highest = 0
        for label in labels:
            if label.name.isnumeric():
                digit = int(label.name[0])
                if digit > highest:
                    highest = digit
        instance.name = str(highest + 1)


@receiver(pre_save, sender=PDU)
def set_connected(sender, instance, *args, **kwargs):
    response = get_pdu(instance.rack.rack, instance.position)
    instance.networked = response[1] < 400


@receiver(post_save, sender=Rack)
def add_PDUs(sender, instance, created, *args, **kwargs):
    if created:
        left = PDU.objects.create(rack=instance, position=PDU.Position.LEFT)
        left.save()
        right = PDU.objects.create(rack=instance, position=PDU.Position.RIGHT)
        right.save()


@receiver(pre_save, sender=NetworkPort)
def check_connection(sender, instance, *args, **kwargs):
    if instance.connection.asset.datacenter != instance.asset.datacenter:
        raise serializers.ValidationError(
            "Connections must be in the same datacenter.")
