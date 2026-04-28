from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.users.models.dietician import DieticianSchedule
from apps.users.serializers.dietician_schedule import DieticianScheduleSerializer


class DieticianScheduleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    seryalizer_class = DieticianScheduleSerializer

    def get_object(self):
        return DieticianSchedule.objects.get(dietician=self.request.user.dietician)