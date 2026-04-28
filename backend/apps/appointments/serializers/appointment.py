from datetime import datetime, timedelta

from pydantic import ValidationError
from rest_framework import serializers
from django.db.models import Q

from apps.appointments.models.appointment import Appointment
from apps.appointments.models.dietician_unavailability import DieticianUnavailability
from apps.users.serializers import dietician_schedule


class AppointmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['dietician', 'date', 'start_time', 'notes']


        def validate(self,attrs):
            dietician = attrs.get('dietician')
            selected_date = attrs.get('date')
            start_time = attrs.get('start_time')

            duration = dietician_schedule.appointment_duration
            end_time = (datetime.combine(selected_date, start_time) + timedelta(minutes=duration)).time()

            unavailability_exists = DieticianUnavailability.objects.filter(
                dietician=dietician,
                date=selected_date,
            ).filter(
                Q(is_full_day=True) | Q(start_time__lt=end_time, end_time__gt=start_time)
            ).exists()

            if unavailability_exists:
                raise ValidationError("Seçilen saat diyetisyen tarafından kapatılmış.")


            appointment_exists = Appointment.objects.filter(
                dietician=dietician,
                date=selected_date,
                start_time__lt=end_time,
                end_time__gt=start_time,
            ).exclude(status=Appointment.status.CANCELLED).exists()

            if appointment_exists:
                raise ValidationError("Seçilen saat diliminde aktif bir randevu var.")

            attrs['end_time'] = end_time
            return attrs


        def create(self, validated_data):
            client = self.context['request'].user.client
            validated_data['client'] = client
            return super().create(validated_data)



class AppointmentDetailSerializer(serializers.ModelSerializer):
    dietician_name = serializers.CharField(source='dietician.full_name', read_only=True)
    client_name = serializers.CharField(source='client.full_name', read_only=True)

    class Meta:
        model = Appointment
        fields = ['id','dietician', 'dietician_name','client', 'client_name', 'date', 'start_time', 'end_time', 'notes', 'status', 'created_at']
        read_only_fields = ['end_time', 'created_at']