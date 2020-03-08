from django.db import models
from django.contrib.auth.models import User


class ChangePlan(models.Model):

    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    name = models.CharField(
        max_length=64
    )
    executed = models.BooleanField(
        default=False
    )
    time_executed = models.DateTimeField(
        null=True
    )
    auto_created = models.BooleanField(
        # This field is used to track changesets that are
        # automatically created when an asset is decommissioned.
        # Used to create a snapshot of a decommissioned asset.
        default=False
    )
