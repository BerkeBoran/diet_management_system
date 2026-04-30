from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response

from apps.diets.models import DietPlan
from apps.diets.serializers.plan import DietPlanCreateSerializer, DietPlanListSerializer, DietPlanFullDetailSerializer, \
    DietPlanStatusUpdateSerializer


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

        if not hasattr(self.request.user, 'dietician'):
            raise PermissionDenied("Plan oluşturma yetkiniz yok.")

        if assignment.status != 'InProgress':
            raise ValidationError("Sadece aktif danışanlara plan oluşturabilirsiniz")

        if assignment is None:
            raise ValidationError({"assignment": "Geçerli bir atama (assignment) ID'si gönderilmelidir."})

        if assignment.dietician != self.request.user.dietician:
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        if DietPlan.objects.filter(
                assignment=assignment,
                status__in=['Pending', 'InProgress']
        ).exists():
            raise ValidationError({'assignment': 'Bu danışanın zaten aktif bir planı var.'})

        serializer.save()

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        plan = self.get_object()

        if not hasattr(request.user, 'dietician'):
            raise PermissionDenied('Bu işlem için yetkiniz yok.')

        serializer = DietPlanStatusUpdateSerializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)