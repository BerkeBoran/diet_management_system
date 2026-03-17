from django.db import models

class Meal(models.Model):

    class MealType(models.TextChoices):
        BREAKFAST = 'Breakfast', 'Kahvaltı'
        SNACK_AM = 'SnackAm', 'Kuşluk Ara Öğünü'
        LUNCH = 'Lunch', 'Öğle Yemeği'
        SNACK_PM = 'SnackPM', 'İkindi Ara Öğünü'
        DINNER = 'Dinner', 'Akşam Yemeği'


    daily_plan = models.ForeignKey('DailyPlan', on_delete=models.CASCADE, related_name='meals')
    meal_type = models.CharField(max_length=50, choices=MealType.choices)
    calories = models.PositiveIntegerField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)

    class Meta:
        ordering = ['-meal_type']
        unique_together = (('daily_plan', 'meal_type'),)

    def __str__(self):
        return f"{self.daily_plan} - {self.meal_type}"

class MealItem(models.Model):
    meal = models.ForeignKey('Meal', on_delete=models.CASCADE, related_name='items')
    food_name = models.CharField(max_length=255)
    amount = models.FloatField()
    unit = models.CharField(max_length=255)
    calories = models.PositiveIntegerField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)

    def __str__(self):
        return f"{self.food_name} - {self.amount} {self.unit}"