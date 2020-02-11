from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.models import User


class Datacenter(models.Model):
    abbr = models.CharField(
        max_length=6
    )
    name = models.CharField(
        max_length=64
    )


class ITModel(models.Model):
    vendor = models.CharField(
        max_length=64
    )
    model_number = models.CharField(
        max_length=64,
    )
    height = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Height must be at least 1.")
        ]
    )
    display_color = models.CharField(
        max_length=10,
        blank=True,
        validators=[
            RegexValidator("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
                           message="Please enter a valid color code.")  # Color code
        ],
        default="#ddd"
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
        max_length=128,
        blank=True
    )
    comment = models.TextField(
        blank=True,
        validators=[
                   RegexValidator("(?m)""(?![ \t]*(,|$))",
                                  message="Comments must be enclosed by double quotes if comment contains line breaks.")
        ]
    )

    class Meta:
        unique_together = ('vendor', 'model_number')
        verbose_name = "Model"
        verbose_name_plural = "Models"

    def __str__(self):
        return '{} by {}'.format(self.model_number, self.vendor)


class PDU(models.Model):
    assets = models.ManyToManyField(
        "Asset",
        through='Powered'
    )


class Rack(models.Model):
    rack = models.CharField(
        unique=True,
        max_length=4,
        validators=[
            RegexValidator("^[A-Z]{1,2}[1-9][0-9]{0,1}$",
                           message="Row number must be specified by one or two capital letters.")
        ]
    )
    datacenter = models.ForeignKey(
        Datacenter,
        on_delete=models.PROTECT
    )
    left_pdu = models.OneToOneField(
        PDU,
        related_name="left_for_rack",
        on_delete=models.SET_NULL,
        null=True
    )
    right_pdu = models.OneToOneField(
        PDU,
        related_name="right_for_rack",
        on_delete=models.SET_NULL,
        null=True
    )

    def __str__(self):
        return "Rack {}".format(self.rack)


class Asset(models.Model):
    itmodel = models.ForeignKey(
        ITModel,
        on_delete=models.PROTECT,
        verbose_name="Model"
    )
    hostname = models.CharField(
        unique=True,
        null=True,
        max_length=64,
        validators=[
            RegexValidator(r"^([a-zA-Z0-9](?:(?:[a-zA-Z0-9-]*|(?<!-)\.(?![-.]))*[a-zA-Z0-9]+)?)$",
                           message="Hostname must be compliant with RFC 1034.")
        ]
    )
    rack = models.ForeignKey(
        Rack,
        on_delete=models.PROTECT
    )

    datacenter = models.ForeignKey(
        Datacenter,
        blank=True,
        on_delete=models.PROTECT,
    )
    rack_position = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Rack position must be at least 1.")
        ]
    )
    owner = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET(None)
    )
    comment = models.TextField(
        blank=True,
        validators=[
            RegexValidator("(?m)""(?![ \t]*(,|$))",
                           message="Comments must be enclosed by double quotes if value contains line breaks.")
        ]
    )
    mac_address = models.CharField(
        unique=True,
        max_length=17,
        validators=[
            RegexValidator("^([0-9a-f]{2}:){5}[0-9a-f]{2}$",
                           message="Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).")
        ]
    )

    asset_number = models.IntegerField(
        blank=True,
        unique=True,
    )

    class Meta:
        unique_together = ('hostname', 'itmodel')

    def __str__(self):
        return "{}: Rack {} U{} in {}".format(self.hostname, self.rack.rack, self.rack_position, self.datacenter)

    def clean(self, *args, **kwargs):
        if 42 < self.rack_position + self.itmodel.height - 1:
            raise ValidationError("The asset does not fit on the specified rack.")


class NetworkPortLabel(models.Model):
    name = models.CharField(
        max_length=16,
        blank=True
    )
    itmodel = models.ForeignKey(
        ITModel,
        on_delete=models.CASCADE
    )

    unique_together = ['name', 'itmodel']


class NetworkPort(models.Model):
    label = models.ForeignKey(
        NetworkPortLabel,
        on_delete=models.PROTECT
    )
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE
    )
    connection = models.OneToOneField(
        "self",
        null=True,
        on_delete=models.SET_NULL
    )

    unique_together = ['label', 'asset']


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

    unique_together = ['plug_number', 'pdu']
