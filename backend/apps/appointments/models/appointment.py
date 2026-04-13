from django.db import models

from apps.users.models import Dietician, Client



class Appointment(models.Model):

    class Status(models.TextChoices):
        SCHEDULED = 'SCHEDULED'
        COMPLETED = 'COMPLETED'
        CANCELED = 'CANCELED'

    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.SCHEDULED
    )

