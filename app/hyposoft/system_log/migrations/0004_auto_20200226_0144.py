# Generated by Django 3.0.3 on 2020-02-26 01:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('system_log', '0003_actionlog_identifier'),
    ]

    operations = [
        migrations.AlterField(
            model_name='actionlog',
            name='identifier',
            field=models.CharField(blank=True, max_length=128),
        ),
    ]
