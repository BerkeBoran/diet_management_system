from django.db.models import Q
from rest_framework import serializers
from rest_framework.utils import timezone

from apps.appointments.models.appointment import Appointment
from apps.appointments.models.availability import Availability


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ('date', 'start_time', 'end_time', 'is_active')


    def validate(self, data):
        dietician = data.get('dietician')
        date = data.get('date')
        start_time = data.get('start_time')
        end_time = data.get('end_time')

        days_map = {
            0: 'Monday',
            1: 'Tuesday',
            2: 'Wednesday',
            3: 'Thursday',
            4: 'Friday',
            5: 'Saturday',
            6: 'Sunday',
        }
        current_day_text = days_map[date.weekday()]

        if date <= timezone.now().date():
            raise serializers.ValidationError()

        if start_time >= end_time:
            raise serializers.ValidationError()

        is_available = (Availability.objects.filter(
            dietician=dietician,
            days=current_day_text.upper(),
            start_time__lt=start_time,
            end_time__gt=end_time
        ).exists())

        if not is_available:
            raise serializers.ValidationError()

        overlapping = Appointment.objects.filter(
            dietician=dietician,
            date=date,
            status='SCHEDULED',
        ).filter(
            start_time__lt=end_time,
            end_time__gt=start_time
        )

        if overlapping.exists():
            raise serializers.ValidationError()

        return data


