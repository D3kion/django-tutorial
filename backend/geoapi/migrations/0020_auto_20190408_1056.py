# Generated by Django 2.1.7 on 2019-04-08 07:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geoapi', '0019_auto_20190405_1520'),
    ]

    operations = [
        migrations.AlterField(
            model_name='city',
            name='description',
            field=models.TextField(blank=True, null=True, verbose_name='description'),
        ),
        migrations.AlterField(
            model_name='city',
            name='name',
            field=models.CharField(max_length=100, unique=True, verbose_name='name'),
        ),
        migrations.AlterField(
            model_name='country',
            name='name',
            field=models.CharField(max_length=100, unique=True, verbose_name='name'),
        ),
    ]
