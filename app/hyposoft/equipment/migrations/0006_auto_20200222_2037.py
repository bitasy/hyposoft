# Generated by Django 3.0.3 on 2020-02-22 20:37

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0005_auto_20200222_1828'),
    ]

    operations = [
        migrations.RenameField(
            model_name='networkport',
            old_name='asset',
            new_name='src_hostname',
        ),
        migrations.RenameField(
            model_name='networkport',
            old_name='label',
            new_name='src_port',
        ),
        migrations.AlterUniqueTogether(
            name='networkport',
            unique_together={('src_port', 'src_hostname')},
        ),
    ]
