# Generated by Django 3.0.3 on 2020-03-30 06:07

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('changeplan', '0001_initial'),
        ('equipment', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='NetworkPortLabel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=16)),
                ('order', models.IntegerField()),
                ('itmodel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.ITModel')),
            ],
            options={
                'unique_together': {('name', 'itmodel'), ('itmodel', 'order')},
            },
        ),
        migrations.CreateModel(
            name='NetworkPort',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mac_address', models.CharField(blank=True, max_length=17, null=True, validators=[django.core.validators.RegexValidator('^([0-9a-fA-F]{2}[:_-]{0,1}){5}[0-9a-fA-F]{2}$', message='Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).')])),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset')),
                ('connection', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='network.NetworkPort')),
                ('label', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='network.NetworkPortLabel')),
                ('version', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='changeplan.ChangePlan')),
            ],
            options={
                'unique_together': {('asset', 'label', 'version')},
            },
        ),
    ]
