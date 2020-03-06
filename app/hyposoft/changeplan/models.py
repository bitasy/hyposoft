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
