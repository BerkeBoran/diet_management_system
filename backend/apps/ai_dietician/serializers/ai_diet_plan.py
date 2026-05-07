from rest_framework import serializers

from apps.ai_dietician.models.ai_diet_plan import AiDietPlan, AiDietMeal, AiDietMealItem


class AiDietMealItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AiDietMealItem
        fields = ['id', 'food_name', 'amount', 'unit']


class AiDietMealSerializer(serializers.ModelSerializer):
    items = AiDietMealItemSerializer(many=True, read_only=True)

    class Meta:
        model = AiDietMeal
        fields = ['id', 'day', 'meal_type', 'contents', 'calories', 'items']


class AiDietPlanListSerializer(serializers.ModelSerializer):
    class Meta:
        model =AiDietPlan
        fields = ['id', 'summary', 'created_at']


class AiDietPlanDetailSerializer(serializers.ModelSerializer):
    meals = AiDietMealSerializer(many=True, read_only=True)

    class Meta:
        model = AiDietPlan
        fields = ['id', 'content', 'summary', 'analysis_notes', 'client_snapshot', 'created_at', 'meals']