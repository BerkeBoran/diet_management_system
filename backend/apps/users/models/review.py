from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models

from apps.users.models import Client, Dietician


class DieticianReview(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='reviews')
    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE, related_name='reviews')
    rating = models.FloatField(validators= [MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Diyetisyen Değerlendirme'
        verbose_name_plural = 'Diyetisyen Değerlendirmeleri'
        unique_together = (('client', 'dietician'),)
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.client.full_name} -> {self.dietician.full_name} ({self.rating})'