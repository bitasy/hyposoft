# Generated by Django 3.0.3 on 2020-02-11 06:03

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0023_auto_20200211_0341'),
    ]

    operations = [
        migrations.CreateModel(
            name='PDU',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
            ],
        ),
        migrations.AlterField(
            model_name='asset',
            name='asset_number',
            field=models.IntegerField(blank=True, unique=True),
        ),
        migrations.CreateModel(
            name='Powered',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plug_number', models.IntegerField(validators=[django.core.validators.MinValueValidator(1, message='Asset must be plugged into a plug from 1 to 24 on this PDU.'), django.core.validators.MaxValueValidator(24, message='Asset must be plugged into a plug from 1 to 24 on this PDU.')])),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset')),
                ('pdu', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.PDU')),
            ],
        ),
        migrations.AddField(
            model_name='pdu',
            name='assets',
            field=models.ManyToManyField(through='equipment.Powered', to='equipment.Asset'),
        ),
        migrations.AddField(
            model_name='rack',
            name='left_pdu',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='left_for_rack', to='equipment.PDU'),
        ),
        migrations.AddField(
            model_name='rack',
            name='right_pdu',
            field=models.OneToOneField(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='right_for_rack', to='equipment.PDU'),
        ),
    ]
