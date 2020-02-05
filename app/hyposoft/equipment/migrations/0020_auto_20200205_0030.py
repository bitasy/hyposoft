# Generated by Django 3.0.2 on 2020-02-05 00:30

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0019_auto_20200204_0647'),
    ]

    operations = [
        migrations.AlterField(
            model_name='rack',
            name='rack',
            field=models.CharField(blank=True, default='Z99', max_length=4, validators=[django.core.validators.RegexValidator('^[A-Z]{1,2}[1-9][0-9]{0,1}$', message='Row number must be specified by one or two capital letters.')]),
        ),
    ]
