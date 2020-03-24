from django.db import models
from django.contrib.auth.models import User
from equipment.models import Datacenter


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
    DATACENTER_CHOICES = [
        ('GLOBAL', 'Global'),
    ]
    datacenters = Datacenter.objects.all()
    for datacenter in datacenters:
        choice = (datacenter.abbr, datacenter.name)
        DATACENTER_CHOICES.append(choice)
    print(DATACENTER_CHOICES)
    datacenter_perm = models.CharField(
        max_length=200,
        verbose_name='Datacenter Permission',
        choices=DATACENTER_CHOICES,
        default=''
    )
