# Generated by Django 3.0.3 on 2020-02-25 01:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0004_auto_20200225_0141'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='networkportlabel',
            unique_together={('name', 'itmodel', 'special')},
        ),
    ]
