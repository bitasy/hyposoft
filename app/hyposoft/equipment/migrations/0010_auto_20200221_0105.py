# Generated by Django 3.0.3 on 2020-02-21 01:05

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0009_auto_20200221_0046'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='networkport',
            unique_together={('src_label', 'src_asset', 'dest_label', 'dest_asset')},
        ),
    ]
