from datetime import datetime

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.appointments.models.appointment import Appointment
from apps.appointments.serializers.appointment import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentSerializer

    def perform_create(self, serializer):
        serializer.save()

class DieticianAvailabilityViewSet(viewsets.ModelViewSet):

    @action(methods=['get'], detail=True)
    def daily_slots(self, request, pk=None):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Tarih gerekli'}, status=status.HTTP_400_BAD_REQUEST)

        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()