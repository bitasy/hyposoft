from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from equipment.models import ITModel


# Create your models here.
class BladeChassis(ITModel):
    def __init__(self):
        super().__init__()
        self.height = 9

    class Meta:
        verbose_name = "Blade Chassis"
        verbose_name_plural = "Blade Chassis"


class Blade(models.Model):
    chassis = models.ForeignKey(
        BladeChassis,
        on_delete=models.PROTECT
    )

    slot = models.IntegerField(
        validators=[
            MinValueValidator(1,
                              message="Chassis slot position must be at least 1."),
            MaxValueValidator(14,
                              message="Chassis slot position must be at most 14."),
        ]
    )

    class Meta:
        unique_together = ['chassis', 'slot']
        ordering = 'slot',
