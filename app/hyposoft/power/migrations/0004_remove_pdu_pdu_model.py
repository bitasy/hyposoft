# Generated by Django 3.0.3 on 2020-03-25 23:12

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('power', '0003_auto_20200306_0525'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='pdu',
            name='pdu_model',
        ),
    ]