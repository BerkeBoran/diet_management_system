from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.diets.models import DietPlan
from apps.diets.serializers.plan import DietPlanCreateSerializer, DietPlanListSerializer, DietPlanDetailSerializer, \
    DietPlanFullDetailSerializer


class DietPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        DietPlan.objects.prefetch_related(
            'weekly_plan__daily_plan__meals__items'
        )

        if hasattr(user, 'dietician'):
            return DietPlan.objects.filter(assignment__dietician=user)
        if hasattr(user, 'client'):
            return DietPlan.objects.filter(assignment__client=user)

        return DietPlan.objects.none()

    def get_serializer_class(self):
        if self.action == 'create':
            return DietPlanCreateSerializer
        elif self.action == 'list':
            return DietPlanListSerializer
        return DietPlanFullDetailSerializer

    def perform_create(self, serializer):
        assignment = serializer.validated_data.get('assignment')

        if assignment is None:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"assignment": "Geçerli bir atama (assignment) ID'si gönderilmelidir."})

        if assignment.dietician != self.request.user.dietician:
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        serializer.save()

