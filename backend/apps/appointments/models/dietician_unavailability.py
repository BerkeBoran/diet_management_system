from datetime import date

from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Dietician


class DieticianUnavailability(models.Model):
    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE, related_name='unavailabilities')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    reason = models.CharField()
    is_full_day = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)


    def clean(self):
        if self.start_time >= self.end_time:
            raise ValidationError("Bitiş saati, başlangıç saatinden sonra olmalıdır")

        if self.date < date.today():
            raise ValidationError("Seçilen gün geçmişte olamaz")


    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Müsait Olmama Durumu'
        verbose_name_plural = 'Müsait Olmama Durumları'