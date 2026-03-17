from backend.apps.users.models.base import User
from django.db import models


class Client(User):

    class Gender(models.TextChoices):
        MALE = 'Male' 'Erkek'
        FEMALE = 'Female' 'Kadın'
        OTHER = 'Other' 'Diğer'

    height = models.FloatField(default=0)
    weight = models.FloatField(default=0)
    age = models.IntegerField(default=0)
    gender = models.CharField(choices=Gender.choices)
    created_at = models.DateTimeField(auto_now_add=True)
