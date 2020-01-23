from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class ITModel(models.Model):
    vendor = models.CharField(
        max_length=64
    )
    model_number = models.CharField(
        max_length=64
    )
    height = models.IntegerField()
    display_color = models.CharField(
        max_length=10,
        validators=[
            RegexValidator("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$") # Color code
        ],
        default="#ddd",
    )
    ethernet_ports = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0)
        ]
    )
    power_ports = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0)
        ]
    )
    cpu = models.CharField(
        max_length=64,
        blank=True
    )
    memory = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0)
        ]
    )
    storage = models.CharField(
        max_length=64,
        blank=True
    )
    comment = models.TextField()


class Rack(models.Model):
    row = models.CharField(
        max_length=2
    )
    number = models.IntegerField(
        validators=[
            MinValueValidator(0)
        ]
    )


class Instance(models.Model):
    itmodel = models.ForeignKey(
        ITModel,
        on_delete=models.PROTECT
    )
    hostname = models.CharField(
        max_length=64
    )
    rack = models.ForeignKey(
        Rack,
        on_delete=models.PROTECT
    )
    rack_u = models.IntegerField()
    owner = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET(None)
    )
    comment = models.TextField()

    def clean(self, *args, **kwargs):
        if self.itmodel.height < self.rack_u + self.itmodel.height - 1:
            raise ValidationError("The instance does not fit on the specified rack.")
