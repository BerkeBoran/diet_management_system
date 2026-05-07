from rest_framework import serializers

from apps.ai_dietician.models.ai_diet_plan import AiDietPlan, AiDietMeal


class AiDietMealSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiDietMeal
        fields = ['id', 'day', 'meal_type', 'contents', 'calories']


class AiDietPlanListSerializer(serializers.ModelSerializer):
    class Meta:
        model =AiDietPlan
        fields = ['id', 'summary', 'created_at']

class AiDietPlanDetailSerializer(serializers.ModelSerializer):
    meals = AiDietMealSerializer(many=True, read_only=True)

    class Meta:
        model = AiDietPlan
        fields = ['id', 'content', 'summary', 'analysis_notes', 'client_snapshot', 'created_at', 'meals']