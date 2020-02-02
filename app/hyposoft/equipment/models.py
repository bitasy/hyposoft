from django.db import models
from django.core.validators import RegexValidator, MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class ITModel(models.Model):
    vendor = models.CharField(
        max_length=64,
        null=True,
        blank=False
    )
    model_number = models.CharField(
        max_length=64,
        null=True,
        blank=False
    )
    height = models.IntegerField(
        null=False,
        blank=False,
        validators=[
            MinValueValidator(1,
                              message="Height must be at least 1.")
        ]
    )
    display_color = models.CharField(
        max_length=10,
        null=True,
        blank=True,
        validators=[
            RegexValidator("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
                           message="Please enter a valid color code.")  # Color code
        ],
        default="#ddd"
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
        null=True,
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
        null=True,
        blank=True
    )
    comment = models.TextField(
        null=True,
        blank=True,
        validators=[
                   RegexValidator("(?m)""(?![ \t]*(,|$))",
                                  message="Comments must be enclosed by double quotes if value contains line breaks.")
        ]
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
        max_length=64,
        unique=True,
        null=True,
        blank=False,
        # validators=[
        #     RegexValidator("",
        #                    message="Hostname must be compliant with RFC 1034.")
        # ]
    )
    # rack = models.ForeignKey(
    #     Rack,
    #     null=True,
    #     blank=False,
    #     on_delete=models.PROTECT
    # )
    rack = models.CharField(
        max_length=5,
        null=True,
        blank=False
    )
    rack_position = models.IntegerField(
        null=True,
        blank=False,
        validators=[
            MinValueValidator(1,
                              message="Rack position must be at least 1.")
        ]
    )
    # owner = models.ForeignKey(
    #     User,
    #     null=True,
    #     blank=True,
    #     on_delete=models.SET(None)
    # )
    owner = models.CharField(
        max_length=64,
        null=True,
        blank=False
    )
    comment = models.TextField(
        null=True,
        blank=True,
        validators=[
            RegexValidator("(?m)""(?![ \t]*(,|$))",
                           message="Comments must be enclosed by double quotes if value contains line breaks.")
        ]
    )

    # def clean(self, *args, **kwargs):
    #     if self.itmodel.height < self.rack_position + self.itmodel.height - 1:
    #         raise ValidationError("The instance does not fit on the specified rack.")
