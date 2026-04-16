from django.contrib import admin

from apps.appointments.models.appointment import Appointment


# Register your models here.

@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('dietician', 'client', 'date', 'start_time')