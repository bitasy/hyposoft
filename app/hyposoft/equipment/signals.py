from django.db.models.signals import pre_save, post_save, pre_delete
from django.dispatch import receiver
from .models import Asset, Powered, NetworkPortLabel, Rack, PDU
from django.core.exceptions import ValidationError


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    instance.datacenter = instance.rack.datacenter
    if len(instance.hostname) == 0:
        instance.hostname = None
    if len(instance.mac_address) == 0:
        instance.mac_address = None


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    if instance.pdu.assets.count() > 24:
        raise ValidationError("This PDU is already full.")


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


@receiver(post_save, sender=Rack)
def add_PDUs(sender, instance, *args, **kwargs):
    print("Adding pdus for rack {}".format(instance.rack))
    if instance.left_pdu is None:
        left = PDU.objects.create()
        left.save()
        instance.left_pdu = left
        instance.save()
    if instance.right_pdu is None:
        right = PDU.objects.create()
        right.save()
        instance.right_pdu = right
        instance.save()


@receiver(pre_delete, sender=Rack)
def remove_PDUs(sender, instance, *args, **kwargs):
    print("Deleting pdus for rack {}".format(instance.rack))
    if instance.left_pdu:
        instance.left_pdu.delete()
    if instance.right_pdu:
        instance.right_pdu.delete()
