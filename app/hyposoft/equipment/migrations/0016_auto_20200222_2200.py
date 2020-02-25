# Generated by Django 3.0.3 on 2020-02-22 22:00

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0015_auto_20200222_2144'),
    ]

    operations = [
        migrations.AlterField(
            model_name='networkport',
            name='src_hostname',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset', to_field='hostname'),
        ),
    ]
