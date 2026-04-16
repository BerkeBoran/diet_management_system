from datetime import datetime, timedelta

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.appointments.models.appointment import Appointment
from apps.appointments.models.availability import Availability
from apps.appointments.serializers.appointment import AppointmentSerializer
from apps.appointments.serializers.availability import AvailabilitySerializer
from apps.users.models import  Dietician


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        dietician = request.data.get('dietician')
        date = request.data.get('date')
        start_time = request.data.get('start_time')

        is_taken = Appointment.objects.filter(
            dietician=dietician,
            date=date,
            start_time=start_time,
            status = 'SCHEDULED',
        ).exists()

        if is_taken:
            return Response({
                "error": "Diyetisyenin bu saatte başka bir randevusu var"},
                status=status.HTTP_400_BAD_REQUEST
            )

        return super().create(request, *args, **kwargs)

class DieticianAvailabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySerializer
    queryset = Availability.objects.all()

    @action(methods=['get'], detail=False)
    def daily_slots(self, request):
        dietician = request.query_params.get('dietician')
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Tarih gerekli'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            dietician = Dietician.objects.get(pk=dietician)

        except (ValueError, Dietician.DoesNotExist):
            return Response({'error': 'Tarih formatı yanlış veya diyetisyen bulunamadı'},
                            status=status.HTTP_400_BAD_REQUEST)

        start_time = dietician.work_time_start
        end_time = dietician.work_time_end
        duration = dietician.appointment_duration

        booked_slots = Appointment.objects.filter(
            dietician=dietician,
            date=target_date,
            status__in=['SCHEDULED', 'COMPLETED'],
        )
        if booked_slots.exists():
            print("TYPE:", type(booked_slots.first().start_time))
        else:
            print("Hiç randevu yok")
        booked_times = set(appt.start_time.strftime('%H:%M') for appt in booked_slots)
        slots=[]

        current_date_time = datetime.combine(target_date, start_time)
        end_date_time = datetime.combine(target_date, end_time)

        while current_date_time + timedelta(minutes=duration) <= end_date_time:
            formatted_time = current_date_time.strftime('%H:%M')
            is_booked = formatted_time in booked_times

            slots.append({
                'time': formatted_time,
                'is_available': not is_booked,
            })
            current_date_time += timedelta(minutes=duration)

        return Response({
            'dietician': dietician.full_name,
            'date': date_str,
            'slots': slots,

        })
