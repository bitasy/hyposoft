from django.db import models
from django.contrib.auth.models import User


class Perms(models.Model):
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