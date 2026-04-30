from django.db import transaction
from rest_framework import serializers

from apps.diets.models import DietPlan, MealItem, DailyPlan, WeeklyPlan, Meal
from apps.diets.models.assignment import DieticianAssignment
from apps.diets.serializers.weekly import DietWeeklyPlanCreateSerializer


class DietPlanCreateSerializer(serializers.ModelSerializer):
    weekly_plan = DietWeeklyPlanCreateSerializer(many=True)
    class Meta:
        model = DietPlan
        fields = ['assignment', 'start_date', 'end_date', 'start_weight', 'target_weight', 'daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat', 'daily_water', 'weekly_plan']

    def validate_weekly_plan(self, value):
        if len(value) > 4:
            raise serializers.ValidationError('En fazla 4 haftalık plan girilebilir.')
        week_numbers = [w['week_number'] for w in value]
        if len(week_numbers) != len(set(week_numbers)):
            raise serializers.ValidationError('Aynı hafta numarası iki kez kullanılamaz.')
        return value

    def validate(self, data):
        request = self.context['request']
        assignment = data.get('assignment')

        if assignment.dietician_id != request.user.pk:
            raise serializers.ValidationError('Bu atama size ait değil.')

        if assignment.status != DieticianAssignment.Status.INPROGRESS:
            raise serializers.ValidationError('Sadece aktif atamalara plan eklenebilir.')
        return data

    def create(self, validated_data):
        weekly_plans_data = validated_data.pop('weekly_plan')

        with transaction.atomic():
            diet_plan = DietPlan.objects.create(**validated_data)

            for week_data in weekly_plans_data:
                daily_plans_data = week_data.pop('daily_plan')
                weekly_plan = WeeklyPlan.objects.create(diet_plan=diet_plan, **week_data)

                for day_data in daily_plans_data:
                    meals_data = day_data.pop('meals')
                    daily_plan = DailyPlan.objects.create(weekly_plan=weekly_plan, **day_data)

                    for meal_data in meals_data:
                        items_data = meal_data.pop('meal_items')
                        meal = Meal.objects.create(daily_plan=daily_plan, **meal_data)
                        MealItem.objects.bulk_create([
                            MealItem(meal=meal, **item) for item in items_data
                        ])

        return diet_plan



class DietPlanStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietPlan
        fields = ['status']

    def validate_status(self, value):
        allowed = ['Active', 'Completed', 'Canceled']
        if value not in allowed:
            raise serializers.ValidationError('Geçersiz durum.')
        return value


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
        fields = ['id', 'day', 'meals']


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

