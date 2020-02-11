from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Asset


@receiver(pre_save, sender=Asset)
def auto_fill_asset(sender, instance, *args, **kwargs):
    instance.datacenter = instance.rack.datacenter
    instance.asset_number = instance.id + 100000
