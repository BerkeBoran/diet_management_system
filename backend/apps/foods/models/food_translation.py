from django.db import models


class FoodTranslation(models.Model):
    turkish = models.CharField(max_length=255, unique=True, db_index=True)
    english = models.CharField(max_length=255, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Besin çevirisi'
        verbose_name_plural = 'Besin çevirileri'
        ordering = ('turkish',)

    def __str__(self):
        return f"{self.turkish} -> {self.english}"