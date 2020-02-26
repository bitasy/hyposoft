from django.db import models
from django.contrib.auth.models import User

from equipment.models import *


def username(user):
    return user.username if user.is_authenticated else "_anonymous"


def display_name(user):
    return "Admin" if user.username == 'admin' else \
        user.first_name + " " + user.last_name


class ActionLog(models.Model):

    MODELS = {
        'Datacenter': Datacenter,
        'ITModel': ITModel,
        'Rack': Rack,
        'PDU': PDU,
        'Asset': Asset,
        'NetworkPortLabel': NetworkPortLabel,
        'NetworkPort': NetworkPort,
        'Powered': Powered,
    }

    class Action(models.TextChoices):
        CREATE = 'C', 'Create'
        UPDATE = 'U', 'Update'
        DESTROY = 'D', 'Destroy'

    action = models.CharField(
        choices=Action.choices,
        max_length=16
    )
    username = models.CharField(
        max_length=150
    )
    display_name = models.CharField(
        max_length=185
    )
    model = models.CharField(
        max_length=128
    )
    instance_id = models.IntegerField()
    identifier = models.CharField(
        blank=True,
        max_length=128
    )
    field_changed = models.CharField(
        blank=True,
        max_length=64
    )
    old_value = models.CharField(
        blank=True,
        max_length=8192
    )
    new_value = models.CharField(
        blank=True,
        max_length=8192
    )
    timestamp = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        if self.model == 'Asset':
            asset = Asset.objects.get(self.instance_id)
            iden = "#" + str(asset.asset_number) + (": " + asset.hostname) if asset.hostname is not None else ""
            self.identifier = iden
        else:
            self.identifier = self.MODELS[self.model].objects.get(id=self.instance_id).__str__()
        super(ActionLog, self).save(*args, **kwargs)
