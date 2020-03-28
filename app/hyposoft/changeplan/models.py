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
    executed_at = models.DateTimeField(
        null=True,
        blank=True
    )
    auto_created = models.BooleanField(
        # This field is used to track changesets that are
        # automatically created when an asset is decommissioned.
        # Used to create a snapshot of a decommissioned asset.
        default=False
    )
    parent = models.ForeignKey(
        # If this change plan is auto_created (i.e. contains a
        # decommissioned asset), this field records the real
        # change plan that it was decommissioned in (or live).
        # This field is null if and only if auto_created is false.
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
