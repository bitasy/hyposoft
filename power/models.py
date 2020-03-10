from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from equipment.models import Asset, Rack


class PDU(models.Model):
    pdu_model = models.CharField(
        max_length=64,
        blank=True,
        default="PDU Networx 98 Pro"
    )
    assets = models.ManyToManyField(
        "equipment.Asset",
        through='Powered'
    )

    rack = models.ForeignKey(
        Rack,
        on_delete=models.CASCADE
    )

    networked = models.BooleanField()

    class Position(models.TextChoices):
        LEFT = 'L', 'Left'
        RIGHT = 'R', 'Right'

    position = models.CharField(
        choices=Position.choices,
        max_length=16
    )

    class Meta:
        unique_together = ['rack', 'position']

    def __str__(self):
        return "{} PDU on {} in {}".format(
            self.position,
            str(self.rack),
            self.rack.datacenter
        )


class Powered(models.Model):
    plug_number = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Asset must be plugged into a plug from 1 to 24 on this PDU."),
            MaxValueValidator(24,
                              message="Asset must be plugged into a plug from 1 to 24 on this PDU.")
        ]
    )
    pdu = models.ForeignKey(
        PDU,
        on_delete=models.CASCADE
    )
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE
    )
    on = models.BooleanField(
        default=False
    )
    special = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1,
                              message="Special network port ID must be at least 1"),
            MaxValueValidator(2,
                              message="Special network port ID must be no greater than 2")
        ]
    )

    class Meta:
        unique_together = (('plug_number', 'pdu'), ('special', 'asset'))