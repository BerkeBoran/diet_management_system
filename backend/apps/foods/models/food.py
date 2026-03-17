from dataclasses import dataclass
from django.db import models

from apps.foods.models.category import FoodCategory


@dataclass
class NutritionResult:
        calories: float
        proteins: float
        carbs: float
        fat: float
        fiber: float
        sugar: float
        sodium: float


class Food(models.Model):

    class Source(models.TextChoices):
        MANUAL = 'MANUAL', 'Manuel'
        OPENFOODFACTS ='OPENFOODFACTS', 'OpenFoodFacts'
        USDA = 'USDA', 'USDA'


    name = models.CharField(max_length=255)
    name_tr = models.CharField(max_length=255, blank=True)
    category = models.ForeignKey(
        FoodCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='foods',
    )

    #API İÇİN GEREKLİ OLANLAR

    barcode = models.CharField(max_length=255, blank=True, unique=True)
    source = models.CharField(
        max_length=255,
        choices=Source.choices,
        default=Source.MANUAL,
    )
    external_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    calories = models.FloatField(default=0)
    proteins = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    fiber = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    sodium = models.FloatField(default=0)

    image_url = models.URLField(blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_nutrition_for_amount(self, amount: float, unit: str = 'g') -> NutritionResult:
        units = {
            'g': amount / 100,
            'kg': amount * 10,
            'ml': amount / 100,
            'l': amount * 10,
        }
        ratio = units.get(unit, amount / 100)

        fields = ['calories', 'proteins', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']

        return NutritionResult(**{
            field: round(getattr(self, field) * ratio, 1)
            for field in fields
        })

    class Meta:
        verbose_name = 'Besin'
        verbose_name_plural = 'Besinler'
        ordering = ['name_tr', 'name']

    def __str__(self):
        return self.name_tr or self.name



