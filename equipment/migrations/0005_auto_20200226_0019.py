# Generated by Django 3.0.3 on 2020-02-26 00:19

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0004_auto_20200226_0011'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='asset',
            unique_together=set(),
        ),
    ]