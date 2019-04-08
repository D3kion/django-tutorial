import uuid
import os

from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _


def get_image_path(instance, filename):
    ext = filename.split('.')[-1]
    filename = f'{uuid.uuid4()}.{ext}'
    return os.path.join('uploads/', filename)


class Country(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('name'))
    geometry = models.GeometryField(verbose_name=_('geometry'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('country')
        verbose_name_plural = _('countries')


class City(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('name'))
    description = models.TextField(blank=True, null=True,
                                   verbose_name=_('description'))
    country = models.ForeignKey(Country, on_delete=models.DO_NOTHING,
                                null=True, verbose_name=_('country'))
    geometry = models.PointField(verbose_name=_('geometry'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('city')
        verbose_name_plural = _('cities')


class Image(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('name'))
    city = models.ForeignKey(City, on_delete=models.CASCADE,
                             verbose_name=_('city'))
    image = models.ImageField(upload_to=get_image_path,
                              verbose_name=_('image'))

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('image')
        verbose_name_plural = _('images')


class Capital(models.Model):
    city = models.OneToOneField(City, on_delete=models.CASCADE)
    capital_of = models.OneToOneField(Country, on_delete=models.DO_NOTHING)

    def __str__(self):
        return self.city.name

    class Meta:
        verbose_name = _('capital')
        verbose_name_plural = _('capitals')


class CountriesHelper(models.Model):
    name = models.CharField(max_length=100, verbose_name=_('name'))
    geometry = models.GeometryField(verbose_name=_('geometry'))
