from rest_framework import serializers

from apps.diets.models import Meal, MealItem


class MealCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'


class MealDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'


class MealItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = '__all__'

class MealItemDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealItem
        fields = '__all__'
