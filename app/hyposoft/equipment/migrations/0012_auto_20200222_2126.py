# Generated by Django 3.0.3 on 2020-02-22 21:26

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0011_auto_20200222_2124'),
    ]

    operations = [
        migrations.AlterField(
            model_name='networkport',
            name='src_hostname',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset'),
        ),
    ]