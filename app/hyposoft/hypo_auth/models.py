from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import User
from equipment.models import Datacenter
from rest_framework import serializers


class Permission(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    model_perm = models.BooleanField(
        verbose_name='Model Management',
        default=False,
    )
    asset_perm = models.BooleanField(
        verbose_name='Asset Management',
        default=False
    )
    power_perm = models.BooleanField(
        verbose_name='Power Permission',
        default=False
    )
    audit_perm = models.BooleanField(
        verbose_name='Audit Permission',
        default=False
    )
    admin_perm = models.BooleanField(
        verbose_name='Admin Permission',
        default=False
    )
    datacenter_perm = models.CharField(
        blank=True,
        verbose_name="Datacenter Permission (Enter existing datacenter abbreviations comma-separated. For global, enter 'Global')",
        max_length=10000
    )

    def clean(self):
        if not self.datacenter_perm:
            return
        dcs = self.datacenter_perm.split(',')
        for dc in dcs:
            if dc == 'Global':
                return
            try:
                Datacenter.objects.get(abbr=dc)
            except:
                raise ValidationError(
                    "Please enter existing datacenter abbreviations comma-separated. For global permission, enter 'Global'."
                )

    def __str__(self):
        return self.user.username + ' Permissions'
