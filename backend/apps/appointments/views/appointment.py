from datetime import datetime, timedelta, date

from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.appointments.models.appointment import Appointment
from apps.appointments.models.dietician_unavailability import DieticianUnavailability
from apps.appointments.serializers.appointment import AppointmentDetailSerializer, \
    AppointmentCreateSerializer
from apps.users.models import  Dietician
from apps.users.models.dietician import DieticianSchedule


class AppointmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == user.Role.DIETICIAN:
            return Appointment.objects.filter(dietician=user.dietician)
        return Appointment.objects.filter(client=user.client)

    def get_serializer_class(self):
        if self.action == 'create':
            return AppointmentCreateSerializer
        return AppointmentDetailSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    def partial_update(self, request, *args, **kwargs):
        appointment = self.get_object()
        new_status = request.data.get('status')

        if new_status == Appointment.Status.CANCELED:
            if appointment.date < date.today():
                return Response(
                    {'detail': 'Geçmiş randevu iptal edilemez.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        appointment.status = new_status
        appointment.save()
        serializer = AppointmentDetailSerializer(appointment)
        return Response(serializer.data)


class AvailableSlotsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        dietician_id = request.query_params.get('dietician_id')
        date_str = request.query_params.get('date')

        if not dietician_id or not date_str:
            return Response(
                {'detail': 'dietician_id ve date zorunludur.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            selected_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            dietician = Dietician.objects.get(pk=dietician_id)
        except ValueError:
            return Response(
                {'detail': 'Geçersiz tarih formatı. YYYY-MM-DD kullanın.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Dietician.DoesNotExist:
            return Response(
                {'detail': 'Diyetisyen bulunamadı.'},
                status=status.HTTP_404_NOT_FOUND
            )

        schedule = DieticianSchedule.objects.filter(dietician=dietician).first()
        if not schedule:
            return Response(
                {'detail': 'Bu diyetisyenin çalışma takvimi tanımlanmamış.'},
                status=status.HTTP_404_NOT_FOUND
            )

        is_weekend = selected_date.weekday() in [5, 6]
        if is_weekend and not schedule.weekend_workings:
            return Response({'date': date_str, 'slots': []})

        work_start = schedule.weekend_work_time_start if is_weekend else schedule.work_time_start
        work_end = schedule.weekend_work_time_end if is_weekend else schedule.work_time_end
        duration = schedule.appointment_duration

        unavailabilities = DieticianUnavailability.objects.filter(
            dietician=dietician,
            date=selected_date,
        )
        existing_appointments = Appointment.objects.filter(
            dietician=dietician,
            date=selected_date,
        ).exclude(status=Appointment.Status.CANCELED)

        slots = []
        current = datetime.combine(selected_date, work_start)
        end = datetime.combine(selected_date, work_end)

        while current + timedelta(minutes=duration) <= end:
            slot_start = current.time()
            slot_end = (current + timedelta(minutes=duration)).time()
            is_available = True

            for u in unavailabilities:
                if u.is_full_day:
                    is_available = False
                    break
                if u.start_time < slot_end and u.end_time > slot_start:
                    is_available = False
                    break

            if is_available:
                for a in existing_appointments:
                    if a.start_time < slot_end and a.end_time > slot_start:
                        is_available = False
                        break

            slots.append({
                'start_time': slot_start.strftime('%H:%M'),
                'end_time': slot_end.strftime('%H:%M'),
                'is_available': is_available,
            })

            current += timedelta(minutes=duration)

        return Response({'date': date_str, 'slots': slots})
