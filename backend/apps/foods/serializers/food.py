from rest_framework import serializers

from apps.foods.models import FoodCategory, Food


class FoodCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodCategory
        fields = ['id', 'name', 'name_tr', 'slug']


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = [
            'id', 'name', 'name_tr', 'category',
            'calories', 'proteins', 'carbs', 'fat',
            'fiber', 'sugar', 'sodium',
            'image_url', 'source', 'is_verified', 'barcode',
        ]

class FoodDetailSerializer(serializers.ModelSerializer):
    nutrition_for_amount = serializers.SerializerMethodField()
    class Meta(FoodSerializer.Meta):
        fields = FoodSerializer.Meta.fields + ['nutrition_for_amount']

    def get_nutrition_for_amount(self, obj):
        amount = float(self.context.get('amount', 100))
        unit = self.context.get('unit', 'g')
        nutrition = obj.get_nutrition_for_amount(amount, unit)
        return {
            'amount': amount,
            'unit': unit,
            'calories': nutrition.calories,
            'proteins': nutrition.proteins,
            'carbs': nutrition.carbs,
            'fat': nutrition.fat,
            'fiber': nutrition.fiber,
            'sugar': nutrition.sugar,
            'sodium': nutrition.sodium,
        }