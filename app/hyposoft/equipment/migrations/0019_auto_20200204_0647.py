# Generated by Django 3.0.2 on 2020-02-04 06:47

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0018_auto_20200204_0643'),
    ]

    operations = [
        migrations.AddField(
            model_name='rack',
            name='rack',
            field=models.CharField(default='A1', max_length=4, validators=[django.core.validators.RegexValidator('^[A-Z]{1,2}[1-9][0-9]{0,1}$', message='Row number must be specified by one or two capital letters.')]),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='rack',
            name='row',
            field=models.CharField(default='A', max_length=2),
        ),
    ]