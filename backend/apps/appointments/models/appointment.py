from datetime import date

from django.core.exceptions import ValidationError
from django.db import models

from apps.users.models import Dietician, Client



class Appointment(models.Model):

    class Status(models.TextChoices):
        PENDING = 'PENDING'
        CONFIRMED = 'CONFIRMED'
        COMPLETED = 'COMPLETED'
        CANCELED = 'CANCELED'

    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE, related_name='appointments')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    date = models.DateField()
    start_time = models.TimeField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


    def clean(self):
        if self.date < date.today():
            raise ValidationError("Randevu tarihi geçmişte olamaz.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = 'Randevu'
        verbose_name_plural = 'Randevular'
