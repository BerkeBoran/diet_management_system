from django.db import models

from apps.users.models import User


class AiDietPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="ai_diets")

    content = models.TextField()
    client_snapshot = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    summary = models.CharField(max_length=500)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"AI Diet for {self.user.full_name} - {self.created_at.date()}"

