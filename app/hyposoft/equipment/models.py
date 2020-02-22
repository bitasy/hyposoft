from django.db import models
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from rest_framework import serializers
from django.contrib.auth.models import User


class Datacenter(models.Model):
    abbr = models.CharField(
        max_length=6
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
    # network_port_name_1
    # network_port_name_2
    # network_port_name_3
    # network_port_name_4

    class Meta:
        unique_together = ('vendor', 'model_number')
        verbose_name = "Model"
        verbose_name_plural = "Models"

    def __str__(self):
        return '{} by {}'.format(self.model_number, self.vendor)


class Rack(models.Model):
    class RackManager(models.Manager):
        def in_racks(self, start_rack, end_rack):
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, rack
                    FROM equipment_rack
                    WHERE rack BETWEEN '{}' AND '{}';
                    """.format(start_rack, end_rack))
                result_list = []
                for row in cursor.fetchall():
                    r = self.model(id=row[0], rack=row[1])
                    result_list.append(r)
                return result_list

    objects = RackManager()

    rack = models.CharField(
        unique=True,
        max_length=4,
        validators=[
            RegexValidator("^[A-Z]{1,2}[1-9][0-9]{0,1}$",
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
        return "Rack {}".format(self.rack)


class PDU(models.Model):
    pdu_model = models.CharField(
        max_length=64,
        blank=True,
        default="PDU Networx 98 Pro"
    )
    assets = models.ManyToManyField(
        "Asset",
        through='Powered'
    )

    rack = models.ForeignKey(
        Rack,
        on_delete=models.CASCADE
    )

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
        return "{} PDU on Rack {} in {}".format(
            self.position,
            str(self.rack),
            self.rack.datacenter.abbr
        )


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
        unique=True,
        null=True,
        blank=True,
        max_length=17,
        validators=[
            RegexValidator("^$|^([0-9a-fA-F]{2}[:-_]{0,1}){5}[0-9a-fA-F]{2}$",
                           message="Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).")
        ]
    )
    # power_port_connection_1
    # power_port_connection_2

    # class Meta:
    #     unique_together = ('hostname', 'itmodel')

    def __str__(self):
        return "{}: Rack {} U{} in {}".format(self.hostname, self.rack.rack, self.rack_position, self.datacenter)

    def save(self, *args, **kwargs):
        if self.asset_number == 0:
            nums = Asset.objects.all()
            highest = 99999
            for asset in nums:
                if asset.asset_number > highest:
                    highest = asset.asset_number
            self.asset_number = highest + 1
            if self.asset_number > 999999:
                raise serializers.ValidationError("The asset number is too large. Please try manually setting it to be 6 digits.")

        if 42 < self.rack_position + self.itmodel.height - 1:
            raise serializers.ValidationError("The asset does not fit on the specified rack from the given position.")

        blocked = Asset.objects.filter(
            rack=self.rack,
            rack_position__range=(self.rack_position, self.rack_position + self.itmodel.height))

        if len(blocked) > 0:
            raise serializers.ValidationError("There is already an asset in this area of the specified rack.")

        i = self.rack_position - 1
        while i > 0:
            under = Asset.objects.filter(
                rack=self.rack,
                rack_position=i
            )
            if len(under) > 0:
                asset = under.values_list('rack_position', 'itmodel__height')[0]
                if asset[0] + asset[1] > self.rack_position:
                    raise serializers.ValidationError("There is already an asset in this area of the specified rack.")
                else:
                    break
            i -= 1

        super().save(*args, **kwargs)


class NetworkPortLabel(models.Model):
    name = models.CharField(
        max_length=16,
        blank=True
    )
    itmodel = models.ForeignKey(
        ITModel,
        on_delete=models.CASCADE
    )
    special = models.IntegerField(
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1,
                              message="Special network port ID must be at least 1"),
            MaxValueValidator(4,
                              message="Special network port ID must be no greater than 4")
        ]
    )

    class Meta:
        unique_together = ['name', 'itmodel', 'special']

    def __str__(self):
        return '{} : {}'.format(self.name, self.itmodel)


class NetworkPort(models.Model):
    asset = models.ForeignKey(
        Asset,
        on_delete=models.CASCADE
    )
    label = models.ForeignKey(
        NetworkPortLabel,
        on_delete=models.PROTECT
    )
    connection = models.OneToOneField(
        "self",
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )

    class Meta:
        unique_together = ['asset', 'label']


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
        unique_together = ['plug_number', 'pdu', 'special']
