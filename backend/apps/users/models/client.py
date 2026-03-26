from .base import User
from django.db import models


class Client(User):

    class Gender(models.TextChoices):
        MALE = 'Male', 'Erkek'
        FEMALE = 'Female', 'Kadın'
        OTHER = 'Other', 'Diğer'


    height = models.FloatField(default=0)
    weight = models.FloatField(default=0)
    gender = models.CharField(max_length=50, choices=Gender.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    allergies = models.JSONField(default=list, blank=True, null=True, verbose_name="Alerjiler")

    class Meta:
        verbose_name = 'Danışan Profili'
        verbose_name_plural = 'Danışan Profilleri'

    def __str__(self):
        return f"{self.full_name}"

    def save(self, *args, **kwargs):
        self.role = User.Role.CLIENT
        super().save(*args, **kwargs)