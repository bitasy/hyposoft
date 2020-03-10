from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.db.models import Max
from rest_framework import serializers
from django.contrib.auth.models import User


class Datacenter(models.Model):
    abbr = models.CharField(
        max_length=6,
        unique=True
    )
    name = models.CharField(
        max_length=64
    )

    def __str__(self):
        return str(self.abbr).upper()


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
    network_ports = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(0,
                              message="Number of network ports must be at least 0.")
        ]
    )
    cpu = models.CharField(
        max_length=64,
        blank=True
    )
    memory = models.IntegerField(
        null=True,
        blank=True,
        verbose_name="Memory (GB)",
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


class Rack(models.Model):
    rack = models.CharField(
        max_length=4,
        validators=[
            RegexValidator("^[A-Z]{1,2}[0-9]{2}$",
                           message="Row number must be specified by one or two capital letters.")
        ],
        default="A0"
    )
    datacenter = models.ForeignKey(
        Datacenter,
        on_delete=models.PROTECT,
        default=""
    )

    def __str__(self):
        return "Rack {} Datacenter {}".format(self.rack, self.datacenter.abbr)

    class Meta:
        unique_together = ['rack', 'datacenter']


class Asset(models.Model):
    asset_number = models.IntegerField(
        unique=True,
        default=0
    )
    hostname = models.CharField(
        unique=True,
        blank=True,
        null=False,
        max_length=64,
        validators=[
            RegexValidator(r"^&|([a-zA-Z0-9](?:(?:[a-zA-Z0-9-]*|(?<!-)\.(?![-.]))*[a-zA-Z0-9]+)?)$",
                           message="Hostname must be compliant with RFC 1034.")
        ]
    )
    datacenter = models.ForeignKey(
        Datacenter,
        on_delete=models.PROTECT,
    )
    rack = models.ForeignKey(
        Rack,
        on_delete=models.PROTECT
    )
    rack_position = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Rack position must be at least 1.")
        ]
    )
    itmodel = models.ForeignKey(
        ITModel,
        on_delete=models.PROTECT,
        verbose_name="Model"
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
        blank=True,
        max_length=17,
        validators=[
            RegexValidator("^$|^([0-9a-fA-F]{2}[:_-]{0,1}){5}[0-9a-fA-F]{2}$",
                           message="Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).")
        ]
    )

    def __str__(self):
        if self.hostname is not None and len(self.hostname) > 0:
            return self.hostname
        return "#{}: Rack {} U{} in {}".format(self.asset_number, self.rack.rack, self.rack_position, self.datacenter)

    def save(self, *args, **kwargs):
        if self.asset_number == 0:
            max_an = Asset.objects.all().aggregate(Max('asset_number'))
            self.asset_number = (max_an['asset_number__max'] or 100000) + 1

        if self.asset_number > 999999:
            raise serializers.ValidationError(
                "The asset number is too large. Please try manually setting it to be 6 digits.")

        if self.asset_number < 100000:
            raise serializers.ValidationError(
                "The asset number is too small. Please try manually setting it to be 6 digits.")

        if 42 < self.rack_position + self.itmodel.height - 1:
            raise serializers.ValidationError(
                "The asset does not fit on the specified rack from the given position.")

        blocked = Asset.objects.filter(
            rack=self.rack,
            rack_position__range=(self.rack_position,
                                  self.rack_position + self.itmodel.height),
        ).exclude(id=self.id)

        if len(blocked) > 0:
            raise serializers.ValidationError(
                "There is already an asset in this area of the specified rack.")

        i = self.rack_position - 1
        while i > 0:
            under = Asset.objects.filter(
                rack=self.rack,
                rack_position=i
            ).exclude(id=self.id)
            if len(under) > 0:
                asset = under.values_list(
                    'rack_position', 'itmodel__height')[0]
                if asset[0] + asset[1] > self.rack_position:
                    raise serializers.ValidationError(
                        "There is already an asset in this area of the specified rack.")
                else:
                    break
            i -= 1

        super().save(*args, **kwargs)