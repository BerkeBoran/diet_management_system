from django.db import models


class FoodCategory(models.Model):
    name = models.CharField(max_length=100)
    name_tr = models.CharField(max_length=100)
    slug = models.SlugField(max_length=100, unique=True)

    class Meta:
        verbose_name = 'Besin Kategorisi'
        verbose_name_plural = 'Besin Kategorileri'
        ordering = ['name_tr']

    def __str__(self):
        return self.name_tr