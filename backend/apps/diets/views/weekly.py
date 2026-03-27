from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django.core.exceptions import PermissionDenied

from apps.diets.models import DailyPlan, WeeklyPlan
from apps.diets.serializers.weekly import DietWeeklyPlanCreateSerializer, DietWeeklyPlanDetailSerializer, DietDailyPlanCreateSerializer, DietDailyPlanDetailSerializer


class WeeklyPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'dietician'):
            return WeeklyPlan.objects.filter(diet_plan__assignment__dietician=user)

        if hasattr(user, 'client'):
            return WeeklyPlan.objects.filter(diet_plan__assignment__client=user)


    def get_serializer_class(self):
        if self.action == 'create':
            return DietWeeklyPlanCreateSerializer
        return DietWeeklyPlanDetailSerializer


    def perform_create(self, serializer):
        diet_plan = serializer.validated_data.get('diet_plan')
        if diet_plan is None:
            raise ValidationError({"diet_plan": "Geçerli bir diet planı id si gönderilmedi."})

        assignment = diet_plan.assignment
        if assignment is None:
            raise ValidationError({"assignment": "Geçerli bir assignment ID'si gönderilmelidir."})

        if assignment.dietician != self.request.user.dietician:
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        serializer.save()

class DailyPlanViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'dietician'):
            return DailyPlan.objects.filter(weekly_plan__diet_plan__assignment__dietician=user)

        if hasattr(user, 'client'):
            return DailyPlan.objects.filter(weekly_plan__diet_plan__assignment__client=user)


    def get_serializer_class(self):
        if self.action == 'create':
            return DietDailyPlanCreateSerializer
        return DietDailyPlanDetailSerializer


    def perform_create(self, serializer):
        weekly_plan = serializer.validated_data.get('weekly_plan')
        if weekly_plan is None:
            raise ValidationError({"weekly_plan": "Geçerli bir weekly diet planı id si gönderilmedi."})

        assignment = weekly_plan.diet_plan.assignment
        if assignment is None:
            raise ValidationError({"assignment": "Geçerli bir kayıt yok."})

        if assignment.dietician != self.request.user.dietician:
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        serializer.save()

