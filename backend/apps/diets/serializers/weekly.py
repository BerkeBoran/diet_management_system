from pydantic import ValidationError
from rest_framework import serializers

from apps.diets.models import DailyPlan, WeeklyPlan
from apps.diets.serializers.meal import MealCreateSerializer


class DietDailyPlanCreateSerializer(serializers.ModelSerializer):
    meals = MealCreateSerializer(many=True)
    class Meta:
        model = DailyPlan
        fields = ['day', 'meals']

    def validate_day(self, value):
        valid_day = [d.value for d in DailyPlan.DayOfWeek]
        if value not in valid_day:
            raise ValidationError("Geçersiz Gün")
        return value

    def validate_meals(self, value):
        meal_type = [m['meal_type'] for m in value]
        if len(meal_type) != len(set(meal_type)):
            raise ValidationError("Günde aynı öğünden 2 tane olamaz")
        return value



class DietWeeklyPlanCreateSerializer(serializers.ModelSerializer):
    daily_plan = DietDailyPlanCreateSerializer(many=True)
    class Meta:
        model = WeeklyPlan
        fields = ['week_number', 'start_date', 'end_date', 'daily_plan']

    def validate_week_number(self, value):
        if not 1 <= value <= 4:
            raise serializers.ValidationError('Hafta numarası 1-4 arasında olmalı.')
        return value

    def validate(self, data):
        if data['start_date'] >= data['end_date']:
            raise serializers.ValidationError('Bitiş tarihi başlangıçtan sonra olmalı.')
        return data

class DietDailyPlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyPlan
        fields = ['weekly_plan', 'day', 'total_calories', 'total_fat', 'total_proteins', 'total_carbs', 'id']


class DietWeeklyPlanDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeeklyPlan
        fields = '__all__'

