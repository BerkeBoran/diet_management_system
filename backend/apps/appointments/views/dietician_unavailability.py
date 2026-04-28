from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.appointments.models.dietician_unavailability import DieticianUnavailability
from apps.appointments.serializers.dietician_unavailability import DieticianUnavailabilitySerializer


class DieticianUnavailabilityViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DieticianUnavailabilitySerializer

    def get_queryset(self):
        return DieticianUnavailability.objects.filter(
            dietician=self.request.user.dietician
        )

    def get_serializer_context(self):
        return {'request': self.request}

    def perform_create(self, serializer):
        serializer.save(dietician=self.request.user.dietician)
