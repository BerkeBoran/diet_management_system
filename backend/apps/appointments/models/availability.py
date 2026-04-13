from datetime import timedelta

from django.db import models

from apps.appointments.models.appointment import Appointment
from apps.users.models import Dietician


class Availability(models.Model):

    class Days(models.TextChoices):
        MONDAY = 'MONDAY'
        TUESDAY = 'TUESDAY'
        WEDNESDAY = 'WEDNESDAY'
        THURSDAY = 'THURSDAY'
        FRIDAY = 'FRIDAY'
        SATURDAY = 'SATURDAY'
        SUNDAY = 'SUNDAY'

    days = models.CharField(
        max_length=20,
        choices = Days.choices,
    )

    dietician = models.ForeignKey(Dietician, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_active = models.BooleanField(default=True)

    def get_availability_for_date(self, date):
        duration = getattr(self.dietician, 'appointment_duration', None)
        slot_duration = timedelta(minutes=duration)

        existing_appointments = Appointment.objects.filter(
            dietician=self.dietician,
            date=date,
            status='scheduled',
        )




