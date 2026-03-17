from django.db import models

from apps.users.models import Client, Dietician


class DietPlan(models.Model):


    class Goal(models.TextChoices):
        LOSE = 'Lose','Kilo Vermek'
        Gain = 'Gain', 'Kilo Almak'
        MAINTAIN = 'Maintain', 'Formumu Korumak'

    class PlanType(models.TextChoices):
        AI = 'AI', 'Yapay Zeka Diyetisteni'
        DIETICIAN = 'Dietician','Diyetisyen'

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        ACTIVE = 'Active',   'Aktif'
        COMPLETED = 'Completed', 'Tamamlandı'
        CANCELED = 'Canceled',   'İptal Edildi'

    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='diet_plans'
    )
    dietician = models.ForeignKey(
        Dietician, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_diet_plans'
    )

    plan_type = models.CharField(max_length=20, choices=PlanType.choices)
    goal = models.CharField(max_length=20, choices=Goal.choices)
    status = models.CharField(max_length=20, choices=Status.choices)

    start_weight = models.FloatField()
    target_weight = models.FloatField()

    daily_calories = models.IntegerField()
    daily_protein = models.FloatField()
    daily_carbs = models.FloatField()
    daily_fat = models.FloatField()
    daily_water = models.FloatField()

    start_date = models.DateField()
    end_date = models.DateField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Diyet Planı'
        verbose_name_plural = 'Diyet Planları'
        ordering = ('-created_at',)

    def __str__(self):
        dietician_name = self.dietician.full_name if self.dietician else 'Yapay Zeka Diyetisteni'
        return f'{self.client.full_name} -> {dietician_name} - {self.goal} - {self.plan_type}'

    @property
    def age(self):
        return self.client.age

    @property
    def height(self):
        return self.client.height

    @property
    def is_ai_plan(self):
        return self.plan_type == self.PlanType.AI




