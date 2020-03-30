# Generated by Django 3.0.3 on 2020-03-21 03:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('changeplan', '0002_changeplan_auto_created'),
        ('equipment', '0019_auto_20200321_0044'),
    ]

    operations = [
        migrations.RenameField(
            model_name='asset',
            old_name='decommissioned',
            new_name='commissioned',
        ),
        migrations.AlterUniqueTogether(
            name='asset',
            unique_together={('asset_number', 'version'), ('hostname', 'version', 'commissioned')},
        ),
    ]