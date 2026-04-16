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

    def perform_create(self, serializer):
        serializer.save()


class DieticianAvailabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AvailabilitySerializer
    queryset = Availability.objects.all()

    @action(methods=['get'], detail=True)
    def daily_slots(self, request, pk=None):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Tarih gerekli'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            dietician = Dietician.objects.get(pk=pk)
        except Dietician.DoesNotExist:
            return Response({'error': 'Diyetisyen seçilmeli'}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({'error:' 'Tarih formatı yanlış'})

        start_time = dietician.work_time_start
        end_time = dietician.work_time_end
        duration = dietician.appointment_duration

        booked_slots = Appointment.objects.filter(
            dietician_id=pk,
            date=target_date,
            status__in=['SCHEDULED', 'COMPLETED'],
        )

        slots=[]

        current_date_time = datetime.combine(target_date, start_time)
        end_date_time = datetime.combine(target_date, end_time)

        while current_date_time + timedelta(minutes=duration) <= end_date_time:
            slot_time = current_date_time.time()

            is_booked = slot_time in booked_slots

            slots.append({
                'time': slot_time.strftime('%H:%M'),
                'is_available': not is_booked,
            })
            current_date_time += timedelta(minutes=duration)

        return Response({
            'dietician': dietician.full_name,
            'date': date_str,
            'slots': slots,

        })
