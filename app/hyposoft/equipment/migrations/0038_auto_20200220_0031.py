# Generated by Django 3.0.3 on 2020-02-20 00:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0037_pdu_networked'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='rack',
            unique_together={('rack', 'datacenter')},
        ),
    ]