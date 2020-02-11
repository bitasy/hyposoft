from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Asset, Powered, NetworkPortLabel
from django.core.exceptions import ValidationError


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    instance.datacenter = instance.rack.datacenter
    instance.asset_number = instance.id + 100000


@receiver(pre_save, sender=Powered)
def check_pdu(sender, instance, *args, **kwargs):
    if instance.pdu.assets.count() > 24:
        raise ValidationError("This PDU is already full.")


@receiver(pre_save, sender=NetworkPortLabel)
def set_default_npl(sender, instance, *args, **kwargs):
    if instance.name == "":
        labels = sender.objects.all()
        highest = 1
        for label in labels:
            if label.name.isnumeric():
                digit = int(label.name[0])
                if digit > highest:
                    highest = digit
        instance.name = str(highest)
