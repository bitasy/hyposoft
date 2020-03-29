# Generated by Django 3.0.2 on 2020-03-29 04:05

from django.db import migrations
import multiselectfield.db.fields


class Migration(migrations.Migration):

    dependencies = [
        ('hypo_auth', '0006_remove_permission_datacenter_perm'),
    ]

    operations = [
        migrations.AddField(
            model_name='permission',
            name='datacenter_perm',
            field=multiselectfield.db.fields.MultiSelectField(blank=True, choices=[], max_length=200, verbose_name='Datacenter Permission'),
        ),
    ]
