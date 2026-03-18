from django.db import models
from django.core.exceptions import ValidationError

from apps.users.models import Client, Dietician


class DieticianAssignment(models.Model):

    class Goal(models.TextChoices):
        LOSE = 'Lose','Kilo Vermek'
        Gain = 'Gain', 'Kilo Almak'
        MAINTAIN = 'Maintain', 'Formumu Korumak'

    class AssignmentType(models.TextChoices):
        AI = 'AI', 'Yapay Zeka Diyetisteni'
        DIETICIAN = 'Dietician','Diyetisyen'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        ACCEPTED = 'Accepted', 'Kabul Edildi'
        REJECTED = 'Rejected', 'Reddedildi'
        ENDED = 'Ended', 'Sonlandırıldı'


    client = models.ForeignKey(Client, on_delete=models.SET_NULL, related_name='assignments', null=True, blank=True)
    dietician = models.ForeignKey(Dietician, on_delete=models.SET_NULL, related_name='assignments', null=True, blank=True)

    client_note = models.TextField(blank=True)
    dietician_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    assignment_type = models.CharField(
        max_length=20,
        choices=AssignmentType.choices
    )
    goal = models.CharField(
        max_length=20,
        choices=Goal.choices
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