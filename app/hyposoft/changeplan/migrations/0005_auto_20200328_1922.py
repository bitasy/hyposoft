# Generated by Django 3.0.3 on 2020-03-28 19:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('changeplan', '0004_auto_20200328_1857'),
    ]

    operations = [
        migrations.AlterField(
            model_name='changeplan',
            name='executed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
