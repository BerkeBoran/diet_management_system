from .base import User
from django.db import models


class Client(User):

    class Gender(models.TextChoices):
        MALE = 'Male', 'Erkek'
        FEMALE = 'Female', 'Kadın'
        OTHER = 'Other', 'Diğer'

    assignment= models.ForeignKey('diets.DieticianAssignment', on_delete=models.SET_NULL, null=True, blank=True, related_name='dietplans')
    height = models.FloatField(default=0)
    weight = models.FloatField(default=0)
    gender = models.CharField(max_length=50, choices=Gender.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    allergies = models.JSONField(default=list, blank=True, null=True, verbose_name="Alerjiler")
    chronic_conditions = models.JSONField(default=list, blank=True, null=True, verbose_name="Kalıcı hastalıklar")
    static_analysis = models.JSONField(default=list, blank=True, null=True, verbose_name="Analizler")

    class Meta:
        verbose_name = 'Danışan Profili'
        verbose_name_plural = 'Danışan Profilleri'

    def __str__(self):
        return f"{self.full_name}"

    def save(self, *args, **kwargs):
        self.role = User.Role.CLIENT
        super().save(*args, **kwargs)


    @property
    def activity_level(self):
        return self.assignment.activity_level if self.assignment else None

    @property
    def sugar_intake(self):
        return self.assignment.sugar_intake if self.assignment else None


class WeightLog(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.client.full_name} - {self.weight}kg - {self.created_at}"