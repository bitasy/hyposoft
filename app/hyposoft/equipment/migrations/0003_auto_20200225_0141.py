# Generated by Django 3.0.3 on 2020-02-25 01:41

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0002_auto_20200225_0140'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='networkportlabel',
            unique_together={('special',), ('name', 'itmodel')},
        ),
    ]
