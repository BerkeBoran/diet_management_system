from rest_framework import serializers

from apps.diets.models import DietPlan, MealItem, DailyPlan, WeeklyPlan, Meal


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


class MealItemNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = ['id', 'food_name', 'amount', 'unit', 'calories', 'protein', 'carbs', 'fat']

class MealNestedSerializer(serializers.ModelSerializer):
    items = MealItemNestedSerializer(many=True, read_only=True)
    class Meta:
        model = Meal
        fields = ['id', 'meal_type', 'calories', 'items']

class DailyPlanNestedSerializer(serializers.ModelSerializer):
    meals = MealNestedSerializer(many=True, read_only=True)
    class Meta:
        model = DailyPlan
        fields = ['id', 'day', 'total_calories', 'meals']

class WeeklyPlanNestedSerializer(serializers.ModelSerializer):
    daily_plan = DailyPlanNestedSerializer(many=True, read_only=True)
    class Meta:
        model = WeeklyPlan
        fields = ['id', 'week_number', 'start_date', 'end_date', 'daily_plan']

class DietPlanFullDetailSerializer(serializers.ModelSerializer):
    weekly_plan = WeeklyPlanNestedSerializer(many=True, read_only=True)
    client_name = serializers.ReadOnlyField(source='assignment.client.full_name')

    class Meta:
        model = DietPlan
        fields = ['id', 'client_name', 'status', 'weekly_plan', 'daily_calories']

