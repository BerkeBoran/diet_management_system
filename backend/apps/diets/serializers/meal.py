from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from apps.diets.models import Meal, MealItem

class MealItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = ['food_name', 'amount', 'unit']

    def validate_food_name(self, value):
        if not value.strip():
            raise ValidationError("Besin ismi boş olamaz.")
        return value.strip()

    def validate_amount(self, value):
        if not value:
            raise ValidationError("Besin sayısı en az 1 olmalıdır.")
        return value

class MealCreateSerializer(serializers.ModelSerializer):
    meal_items = MealItemCreateSerializer(many=True)
    class Meta:
        model = Meal
        fields = ['meal_type', 'meal_items', 'calories', 'fat', 'carbs', 'protein']

    def validate_meal_items(self, value):
        if not value:
            raise ValidationError("Öğün için en az bir besin eklenmelidir.")
        return value

    def validate_meal_type(self, value):
        if not value.strip():
            raise ValidationError("Öğün tipi girilmelidir.")
        return value.strip()


class MealDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'


class MealItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = '__all__'
