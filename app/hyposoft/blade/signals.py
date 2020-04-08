from django.db.models.signals import pre_save
from django.dispatch import receiver
from rest_framework import serializers

from .models import Blade, BladeChassis


@receiver(pre_save, sender=Blade)
def validate_blade(instance, *args, **kwargs):
    if not isinstance(instance.chassis.itmodel, BladeChassis):
        raise serializers.ValidationError(
            "Blade must reference Blade Chassis asset."
        )
