# Generated by Django 3.0.2 on 2020-01-25 19:48

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='itmodel',
            name='comment',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='itmodel',
            name='display_color',
            field=models.CharField(default='#ddd', max_length=10, validators=[django.core.validators.RegexValidator('^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$', message='Please enter a valid color code.')]),
        ),
        migrations.AlterField(
            model_name='itmodel',
            name='ethernet_ports',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of ethernet ports must be at least 0.')]),
        ),
        migrations.AlterField(
            model_name='itmodel',
            name='memory',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of GB of memory must be at least 0.')]),
        ),
        migrations.AlterField(
            model_name='itmodel',
            name='power_ports',
            field=models.IntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0, message='Number of power ports must be at least 0.')]),
        ),
        migrations.AlterField(
            model_name='rack',
            name='number',
            field=models.IntegerField(validators=[django.core.validators.MinValueValidator(0, message='Rack number must be at least 0.')]),
        ),
        migrations.AlterField(
            model_name='rack',
            name='row',
            field=models.CharField(max_length=2, validators=[django.core.validators.RegexValidator('^[A-Z]{1,2}$', message='Row number must be specified by one or two capital letters.')]),
        ),
        migrations.AlterUniqueTogether(
            name='itmodel',
            unique_together={('vendor', 'model_number')},
        ),
    ]