from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.diets.models.assignment import DieticianAssignment
from apps.diets.serializers.dietician_clients import DieticianClientsSerializer


class DieticianClientsViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DieticianClientsSerializer

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'dietician'):
            return DieticianAssignment.objects.filter(dietician=user, status__in=[DieticianAssignment.Status.INPROGRESS, DieticianAssignment.Status.ENDED])

