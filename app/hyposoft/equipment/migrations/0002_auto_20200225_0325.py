# Generated by Django 3.0.2 on 2020-02-25 03:25

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='networkportlabel',
            unique_together={('name', 'itmodel'), ('itmodel', 'special')},
        ),
    ]