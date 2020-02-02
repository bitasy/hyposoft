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
            RegexValidator("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
                           message="Please enter a valid color code.")  # Color code
        ],
        default="#ddd",
    )
    ethernet_ports = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0,
                              message="Number of ethernet ports must be at least 0.")
        ]
    )
    power_ports = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0,
                              message="Number of power ports must be at least 0.")
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
            MinValueValidator(0,
                              message="Number of GB of memory must be at least 0.")
        ]
    )
    storage = models.CharField(
        max_length=64,
        blank=True
    )
    comment = models.TextField(
        blank=True
    )

    class Meta:
        unique_together = ('vendor', 'model_number')


class Rack(models.Model):
    row = models.CharField(
        max_length=2,
        validators=[
            RegexValidator("^[A-Z]{1,2}$",
                           message="Row number must be specified by one or two capital letters.")
        ]
    )
    number = models.IntegerField(
        validators=[
            MinValueValidator(0,
                              message="Rack number must be at least 0.")
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
    rack_u = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Rack units must be at least 1.")
        ]
    )
    owner = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET(None)
    )
    comment = models.TextField(
        blank=True
    )

    # causes error when running tests.py
    # can we put this somewhere else?
    """
    def clean(self, *args, **kwargs):
        if self.itmodel.height.astype(str).astype(int) < \
                (self.rack_u + self.itmodel.height.astype(str).astype(int) - 1):
            raise ValidationError("The instance does not fit on the specified rack.")
    """
