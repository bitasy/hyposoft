# Generated by Django 3.0.3 on 2020-03-29 05:52

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('equipment', '0023_auto_20200329_0106'),
    ]

    operations = [
        migrations.AlterField(
            model_name='asset',
            name='decommissioned_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='decommissioned_assets', to=settings.AUTH_USER_MODEL),
        ),
    ]
