from django.db import models

from apps.users.models import User


class AiMealChecker(models.Model):

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ai_meal_checkers')
    meal_type = models.CharField(max_length=255)
    vision_data = models.JSONField()
    calorie_diff = models.FloatField()
    feedback = models.TextField()
    logged_at = models.DateField()
    is_cheat = models.BooleanField(default=False)


