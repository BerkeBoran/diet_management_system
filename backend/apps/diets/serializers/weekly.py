from rest_framework import serializers

from apps.diets.models import DailyPlan, WeeklyPlan


class DietWeeklyPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyPlan
        fields = '__all__'


class DietWeeklyPlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyPlan
        fields = '__all__'


class DietDailyPlanCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPlan
        fields = ['weekly_plan', 'day', 'total_calories', 'total_fat', 'total_proteins', 'total_carbs']


class DietDailyPlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPlan
        fields = ['weekly_plan', 'day', 'total_calories', 'total_fat', 'total_proteins', 'total_carbs', 'id']

