from rest_framework import serializers

from apps.foods.models import Food


class FoodSerializer(serializers.ModelSerializer):
    """Liste/arama yanıtları için. `external_id` slug olarak kullanılır
    (örn. /foods/kac-kalori/lahmacun)."""

    class Meta:
        model = Food
        fields = [
            'id', 'external_id', 'name', 'serving_description',
            'calories', 'protein', 'carbs', 'fat',
        ]


class FoodDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = [
            'id', 'external_id', 'name', 'serving_description',
            'calories', 'protein', 'carbs', 'fat',
            'saturated_fat', 'sugar', 'sodium', 'source',
        ]

