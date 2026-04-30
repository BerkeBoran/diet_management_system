from django.db import models

class Meal(models.Model):

    daily_plan = models.ForeignKey('DailyPlan', on_delete=models.CASCADE, related_name='meals')
    meal_type = models.CharField(max_length=50)
    calories = models.PositiveIntegerField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)

    class Meta:
        verbose_name = 'Öğün'
        verbose_name_plural = 'Öğünler'
        ordering = ['meal_type']
        unique_together = (('daily_plan', 'meal_type'),)

    def __str__(self):
        return f"{self.daily_plan} - {self.meal_type}"

class MealItem(models.Model):
    meal = models.ForeignKey('Meal', on_delete=models.CASCADE, related_name='meal_items')
    food_name = models.CharField(max_length=255)
    amount = models.FloatField()
    unit = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.food_name} - {self.amount} {self.unit}"