# Generated by Django 3.0.2 on 2020-02-01 22:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0008_auto_20200201_2255'),
    ]

    operations = [
        migrations.AlterField(
            model_name='instance',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='itmodel',
            name='comment',
            field=models.TextField(blank=True, null=True),
        ),
    ]