# Generated by Django 3.0.2 on 2020-02-02 22:42

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('equipment', '0013_auto_20200202_2239'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='instance',
            unique_together={('hostname', 'itmodel')},
        ),
    ]
