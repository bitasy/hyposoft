# Generated by Django 3.0.2 on 2020-02-01 18:47

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0003_auto_20200131_0203'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='itmodel',
            unique_together={('vendor', 'model_number')},
        ),
    ]
