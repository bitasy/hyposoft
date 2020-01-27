# Generated by Django 3.0.2 on 2020-01-22 23:31

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ITModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vendor', models.CharField(max_length=64)),
                ('model_number', models.CharField(max_length=64)),
                ('height', models.IntegerField()),
                ('display_color', models.CharField(default='#ddd', max_length=10, validators=[django.core.validators.RegexValidator('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$')])),
                ('ethernet_ports', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)])),
                ('power_ports', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)])),
                ('cpu', models.CharField(blank=True, max_length=64)),
                ('memory', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)])),
                ('storage', models.CharField(blank=True, max_length=64)),
                ('comment', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='Rack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('row', models.CharField(max_length=2)),
                ('number', models.IntegerField(validators=[django.core.validators.MinValueValidator(0)])),
            ],
        ),
        migrations.CreateModel(
            name='Instance',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('hostname', models.CharField(max_length=64)),
                ('rack_u', models.IntegerField()),
                ('comment', models.TextField()),
                ('itmodel', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='equipment.ITModel')),
                ('owner', models.ForeignKey(null=True, on_delete=models.SET(None), to=settings.AUTH_USER_MODEL)),
                ('rack', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='equipment.Rack')),
            ],
        ),
    ]
