from django.db import models

from apps.users.models import User


class AiDietPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="ai_diets")

    content = models.TextField()
    client_snapshot = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    summary = models.CharField(max_length=500)
    analysis_notes = models.JSONField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AI Diet for {self.user.full_name} - {self.created_at.date()}"



class AiDietMeal(models.Model):
    diet_plan = models.ForeignKey(AiDietPlan,on_delete=models.CASCADE,related_name="meals")
    day = models.CharField(max_length=50)
    meal_type = models.CharField(max_length=50,)
    contents = models.TextField()
    calories = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Öğün"
        verbose_name_plural = "Öğünler"
        ordering = ['id']

    def __str__(self):
        username = self.diet_plan.user.username if self.diet_plan.user else "Bilinmeyen"
        return f"{username} | {self.day} - {self.meal_type}"
