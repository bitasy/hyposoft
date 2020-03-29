# Generated by Django 3.0.2 on 2020-03-22 18:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hyposoft', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='permissions',
            name='permissions',
            field=models.CharField(blank=True, choices=[('MM', 'Model Management'), ('AM', 'Asset Management'), ('PP', 'Power Permission'), ('AP', 'Audit Permission'), ('A', 'Admin')], max_length=5, null=True),
        ),
    ]
