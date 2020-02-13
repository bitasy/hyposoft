from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Instance


# @receiver(pre_save, sender=Instance)
# def auto_fill_vendor(sender, instance, *args, **kwargs):
#     instance.vendor = instance.itmodel.vendor
#
#
# @receiver(pre_save, sender=Instance)
# def auto_fill_model_number(sender, instance, *args, **kwargs):
#     instance.model_number = instance.itmodel.model_number
