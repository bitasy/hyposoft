# Generated by Django 3.0.3 on 2020-03-28 20:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0021_auto_20200324_0555'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asset',
            name='asset_number',
            field=models.IntegerField(null=True),
        ),
    ]