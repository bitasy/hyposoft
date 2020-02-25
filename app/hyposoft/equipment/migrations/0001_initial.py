# Generated by Django 3.0.3 on 2020-02-21 22:05

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
            name='Asset',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('asset_number', models.IntegerField(default=0, unique=True)),
                ('hostname', models.CharField(blank=True, max_length=64, null=True, unique=True, validators=[django.core.validators.RegexValidator('^&|([a-zA-Z0-9](?:(?:[a-zA-Z0-9-]*|(?<!-)\\.(?![-.]))*[a-zA-Z0-9]+)?)$', message='Hostname must be compliant with RFC 1034.')])),
                ('rack_position', models.IntegerField(validators=[django.core.validators.MinValueValidator(1, message='Rack position must be at least 1.')])),
                ('comment', models.TextField(blank=True, validators=[django.core.validators.RegexValidator('(?m)(?![ \t]*(,|$))', message='Comments must be enclosed by double quotes if value contains line breaks.')])),
                ('mac_address', models.CharField(blank=True, max_length=17, null=True, unique=True, validators=[django.core.validators.RegexValidator('^$|^([0-9a-fA-F]{2}[:-_]{0,1}){5}[0-9a-fA-F]{2}$', message='Your MAC Address must be in valid hexadecimal format (e.g. 00:1e:c9:ac:78:aa).')])),
            ],
        ),
        migrations.CreateModel(
            name='Datacenter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('abbr', models.CharField(max_length=6)),
                ('name', models.CharField(max_length=64)),
            ],
        ),
        migrations.CreateModel(
            name='ITModel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('vendor', models.CharField(max_length=64)),
                ('model_number', models.CharField(max_length=64)),
                ('height', models.IntegerField(validators=[django.core.validators.MinValueValidator(1, message='Height must be at least 1.')])),
                ('display_color', models.CharField(blank=True, default='#ddd', max_length=10, validators=[django.core.validators.RegexValidator('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Please enter a valid color code.')])),
                ('power_ports', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of power ports must be at least 0.')])),
                ('network_ports', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of network ports must be at least 0.')])),
                ('cpu', models.CharField(blank=True, max_length=64)),
                ('memory', models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of GB of memory must be at least 0.')], verbose_name='Memory (GB)')),
                ('storage', models.CharField(blank=True, max_length=128)),
                ('comment', models.TextField(blank=True, validators=[django.core.validators.RegexValidator('(?m)(?![ \t]*(,|$))', message='Comments must be enclosed by double quotes if comment contains line breaks.')])),
            ],
            options={
                'verbose_name': 'Model',
                'verbose_name_plural': 'Models',
                'unique_together': {('vendor', 'model_number')},
            },
        ),
        migrations.CreateModel(
            name='PDU',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('pdu_model', models.CharField(blank=True, default='PDU Networx 98 Pro', max_length=64)),
                ('position', models.CharField(choices=[('L', 'Left'), ('R', 'Right')], max_length=16)),
            ],
        ),
        migrations.CreateModel(
            name='Rack',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rack', models.CharField(default='A0', max_length=4, unique=True, validators=[django.core.validators.RegexValidator('^[A-Z]{1,2}[1-9][0-9]{0,1}$', message='Row number must be specified by one or two capital letters.')])),
                ('datacenter', models.ForeignKey(default='', on_delete=django.db.models.deletion.PROTECT, to='equipment.Datacenter')),
            ],
        ),
        migrations.CreateModel(
            name='Powered',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plug_number', models.IntegerField(validators=[django.core.validators.MinValueValidator(1, message='Asset must be plugged into a plug from 1 to 24 on this PDU.'), django.core.validators.MaxValueValidator(24, message='Asset must be plugged into a plug from 1 to 24 on this PDU.')])),
                ('on', models.BooleanField(default=False)),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset')),
                ('pdu', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.PDU')),
            ],
            options={
                'unique_together': {('plug_number', 'pdu')},
            },
        ),
        migrations.AddField(
            model_name='pdu',
            name='assets',
            field=models.ManyToManyField(through='equipment.Powered', to='equipment.Asset'),
        ),
        migrations.AddField(
            model_name='pdu',
            name='rack',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Rack'),
        ),
        migrations.CreateModel(
            name='NetworkPortLabel',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(blank=True, max_length=16)),
                ('itmodel', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.ITModel')),
            ],
            options={
                'unique_together': {('name', 'itmodel')},
            },
        ),
        migrations.AddField(
            model_name='asset',
            name='datacenter',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='equipment.Datacenter'),
        ),
        migrations.AddField(
            model_name='asset',
            name='itmodel',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='equipment.ITModel', verbose_name='Model'),
        ),
        migrations.AddField(
            model_name='asset',
            name='owner',
            field=models.ForeignKey(blank=True, null=True, on_delete=models.SET(None), to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='asset',
            name='rack',
            field=models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, to='equipment.Rack'),
        ),
        migrations.AlterUniqueTogether(
            name='pdu',
            unique_together={('rack', 'position')},
        ),
        migrations.CreateModel(
            name='NetworkPort',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('asset', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='equipment.Asset')),
                ('connection', models.OneToOneField(null=True, on_delete=django.db.models.deletion.SET_NULL, to='equipment.NetworkPort')),
                ('label', models.ForeignKey(default='1', on_delete=django.db.models.deletion.PROTECT, to='equipment.NetworkPortLabel')),
            ],
            options={
                'unique_together': {('label', 'asset')},
            },
        ),
        migrations.AlterUniqueTogether(
            name='asset',
            unique_together={('hostname', 'itmodel')},
        ),
    ]
