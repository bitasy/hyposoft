# Generated by Django 3.0.3 on 2020-04-08 03:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('hypo_auth', '0002_auto_20200402_0556'),
    ]

    operations = [
        migrations.AlterField(
            model_name='permission',
            name='site_perm',
            field=models.CharField(blank=True, max_length=10000, verbose_name="Site Permission (Enter existing site abbreviations comma-separated. For global, enter 'Global')"),
        ),
    ]
