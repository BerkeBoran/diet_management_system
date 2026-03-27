from rest_framework import viewsets
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.permissions import IsAuthenticated

from apps.diets.models import Meal, MealItem
from apps.diets.serializers.meal import MealCreateSerializer, MealDetailSerializer, MealItemCreateSerializer, \
    MealItemDetailSerializer


class MealViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]


    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'dietician'):
            return Meal.objects.filter(daily_plan__weekly_plan__diet_plan__assignment__dietician=user)

        if hasattr(user, 'client'):
            return Meal.objects.filter(daily_plan__weekly_plan__diet_plan__assignment__client=user)


    def get_serializer_class(self):
        if self.action == 'create':
            return MealCreateSerializer
        return MealDetailSerializer

    def perform_create(self, serializer):
        daily_plan = serializer.validated_data['daily_plan']

        if daily_plan is None:
            raise ValidationError({"weekly_plan": "Geçerli bir daily diet planı id si gönderilmedi."})

        assignment = daily_plan.weekly_plan.diet_plan.assignment
        if assignment is None:
            raise ValidationError({"assignment": "Geçerli bir kayıt yok."})

        if assignment.dietician != self.request.user.dietician:
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        serializer.save()

class MealItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'dietician'):
            return MealItem.objects.filter(meal__daily_plan__weekly_plan__diet_plan__assignment__dietician=user)

        if hasattr(user, 'client'):
            return MealItem.objects.filter(meal__daily_plan__weekly_plan__diet_plan__assignment__client=user)

    def get_serializer_class(self):
        if self.action == 'create':
            return MealItemCreateSerializer
        return MealItemDetailSerializer

    def perform_create(self, serializer):
        meal = serializer.validated_data['meal']

        if meal is None:
            raise ValidationError({"weekly_plan": "Geçerli bir meal id si gönderilmedi."})

        assignment = meal.daily_plan.weekly_plan.diet_plan.assignment
        if assignment is None:
            raise ValidationError({"assignment": "Geçerli bir kayıt yok."})

        if assignment.dietician != self.request.user.dietician:
            raise PermissionDenied("Bu danışan size atanmamış. Plan oluşturamazsınız.")

        serializer.save()
