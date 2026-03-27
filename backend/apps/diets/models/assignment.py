from django.db import models
from django.core.exceptions import ValidationError

from apps.users.models import Client, Dietician


class DieticianAssignment(models.Model):

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


    class AssignmentType(models.TextChoices):
        AI = 'AI', 'Yapay Zeka Diyetisteni'
        DIETICIAN = 'Dietician','Diyetisyen'


    class VerificationStatus(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        ACCEPTED = 'Accepted', 'Kabul Edildi'
        REJECTED = 'Rejected', 'Reddedildi'


    class Duration(models.TextChoices):
        ONE_MONTH = '1M', '1 Ay'
        THREE_MONTHS = '3M', '3 Ay'
        SIX_MONTHS = '6M', '6 Ay'
        ONE_YEAR = '12M', '1 Yıl'


    class Status(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        CANCELED = 'Canceled', 'İptal edildi'
        INPROGRESS = 'InProgress', 'Devam ediyor'
        ENDED = 'Ended', 'Sonlandırıldı'


    client = models.ForeignKey(Client, on_delete=models.SET_NULL, related_name='assignments', null=True, blank=True)
    dietician = models.ForeignKey(Dietician, on_delete=models.SET_NULL, related_name='assignments', null=True, blank=True)

    client_note = models.TextField(blank=True)
    dietician_note = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    is_pregnant = models.BooleanField(default=False)
    is_breastfeeding = models.BooleanField(default=False)
    alcohol_use = models.BooleanField(default=False)
    smoking_use = models.BooleanField(default=False)
    medications = models.TextField(blank=True)
    dislike_foods = models.JSONField(default=list, blank=True, null=True)


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

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        null=True,
        blank=True
    )

    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING,
    )

    assignment_type = models.CharField(
        max_length=20,
        choices=AssignmentType.choices
    )

    goal = models.CharField(
        max_length=20,
        choices=Goal.choices
    )

    duration = models.CharField(
        max_length=20,
        choices=Duration.choices,
    )


    class Meta:
        verbose_name = 'Diyetisyen Ataması'
        verbose_name_plural ='Diyetisyen Atamaları'
        unique_together = ('client', 'dietician')

    @property
    def is_ai_plan(self):
        return self.plan_type == self.PlanType.AI

    def __str__(self):
        client_name = self.client.full_name if self.client else ''
        dietician_name = self.dietician.full_name if self.dietician else 'Yapay Zeka Diyetisteni'
        return f'{client_name} -> {dietician_name} - {self.goal}'