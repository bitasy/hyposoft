from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from equipment.models import ITModel, Asset
from changeplan.models import ChangePlan


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
        unique_together = [['name', 'itmodel'], ['itmodel', 'special']]

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
    version = models.ForeignKey(
        ChangePlan,
        on_delete=models.CASCADE
    )

    class Meta:
        unique_together = ['asset', 'label', 'version']

    def __str__(self):
        return '{} : {}'.format(self.asset.hostname, self.label.name)
