# Generated by Django 3.0.3 on 2020-02-26 08:06

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0007_merge_20200226_0532'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asset',
            name='mac_address',
            field=models.CharField(blank=True, max_length=17, validators=[django.core.validators.RegexValidator('^$|^([0-9a-fA-F]{2}[:_-]{0,1}){5}[0-9a-fA-F]{2}$', message='Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).')]),
        ),
    ]
