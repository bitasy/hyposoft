# Generated by Django 3.0.3 on 2020-02-11 06:07

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0024_auto_20200211_0603'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pdu',
            name='assets',
        ),
        migrations.AddField(
            model_name='pdu',
            name='on',
            field=models.BooleanField(default=False),
            preserve_default=False,
        ),
    ]