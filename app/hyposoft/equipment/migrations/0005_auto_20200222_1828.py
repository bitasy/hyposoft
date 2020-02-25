# Generated by Django 3.0.3 on 2020-02-22 18:28

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0004_itmodel_network_port_name_1'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='itmodel',
            name='network_port_name_1',
        ),
        migrations.AddField(
            model_name='powered',
            name='special',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1, message='Special network port ID must be at least 1'), django.core.validators.MaxValueValidator(2, message='Special network port ID must be no greater than 2')]),
        ),
        migrations.AlterUniqueTogether(
            name='powered',
            unique_together={('plug_number', 'pdu', 'special')},
        ),
    ]