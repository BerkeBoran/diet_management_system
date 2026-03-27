from rest_framework import serializers

from apps.diets.models import DietPlan


class DietPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ['assignment', 'start_date', 'end_date', 'start_weight', 'target_weight', 'daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat', 'daily_water']

class DietPlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        exclude = ['created_at', 'updated_at']

class DietPlanListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ['id', 'status', 'start_date', 'end_date']
