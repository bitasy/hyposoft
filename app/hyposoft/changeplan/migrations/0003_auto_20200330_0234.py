# Generated by Django 3.0.3 on 2020-03-30 02:34

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('changeplan', '0002_auto_20200327_0018'),
    ]

    operations = [
        migrations.AddField(
            model_name='changeplan',
            name='executed_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterUniqueTogether(
            name='changeplan',
            unique_together={('owner', 'name')},
        ),
        migrations.RemoveField(
            model_name='changeplan',
            name='time_executed',
        ),
    ]
