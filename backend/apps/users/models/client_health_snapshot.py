from django.db import models

from apps.users.models import Client


class ClientHealthSnapshot(models.Model):
    client = models.ForeignKey('users.Client', on_delete=models.CASCADE, related_name='client_health_snapshots', null=True, blank=True)
    class DietaryPreference(models.TextChoices):
        VEGAN = 'VEGAN', 'Vegan'
        VEGETARIAN = 'VEGETARIAN', 'Vejetaryan'
        NORMAL = 'NORMAL', 'Normal'

    class SugarIntake(models.TextChoices):
        NONE = 'NONE', 'Hiç'
        LOW = 'LOW', 'Haftada 1-2 kez'
        MEDIUM = 'MEDIUM', 'Haftada 3-4 kez'
        HIGH = 'HIGH', 'Her gün'
        CRAVINGS = 'CRAVINGS', 'Anlık gelen tatlı krizlerim var'


    class ActivityLevel(models.TextChoices):
        NONE = 'NONE', 'Hiç'
        LOW = 'LOW', 'Haftada 1-2 kez'
        MEDIUM = 'MEDIUM', 'Haftada 3-4 kez'
        HIGH = 'HIGH', 'Haftada 4-5 kez'
        VERY_HIGH = 'VERY_HIGH', 'Her gün'


    class Goal(models.TextChoices):
        LOSE = 'Lose','Kilo Vermek'
        Gain = 'Gain', 'Kilo Almak'
        MAINTAIN = 'Maintain', 'Formumu Korumak'

    dietary_preference = models.CharField(
        max_length=20,
        choices=DietaryPreference.choices,
        default=DietaryPreference.NORMAL
    )
    sugar_intake = models.CharField(
        max_length=20,
        choices=SugarIntake.choices,
        default=SugarIntake.NONE
    )
    activity_level = models.CharField(
        max_length=20,
        choices=ActivityLevel.choices,
        default=ActivityLevel.NONE
    )
    goal = models.CharField(
        max_length=20,
        choices=Goal.choices
    )

    is_pregnant = models.BooleanField(default=False)
    is_breastfeeding = models.BooleanField(default=False)
    alcohol_use = models.BooleanField(default=False)
    smoking_use = models.BooleanField(default=False)
    medications = models.JSONField(blank=True)
    dislike_foods = models.JSONField(default=list, blank=True, null=True)

