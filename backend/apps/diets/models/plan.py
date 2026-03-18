from django.db import models


class DietPlan(models.Model):

    class Status(models.TextChoices):
        PENDING = 'Pending', 'Beklemede'
        ACTIVE = 'Active',   'Aktif'
        COMPLETED = 'Completed', 'Tamamlandı'
        CANCELED = 'Canceled',   'İptal Edildi'

    assignment= models.ForeignKey('diets.DieticianAssignment', on_delete=models.SET_NULL, null=True, blank=True, related_name='plans')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)

    start_weight = models.FloatField(blank=True, null=True)
    target_weight = models.FloatField(blank=True, null=True, default=0)

    daily_calories = models.IntegerField(blank=True, null=True, default=0)
    daily_protein = models.FloatField(blank=True, null=True, default=0)
    daily_carbs = models.FloatField(blank=True, null=True, default=0)
    daily_fat = models.FloatField(blank=True, null=True, default=0)
    daily_water = models.FloatField(blank=True, null=True, default=0)

    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Diyet Planı'
        verbose_name_plural = 'Diyet Planları'
        ordering = ('-created_at',)

    def __str__(self):
        client_name = self.client.full_name if self.client else ''
        dietician_name = self.dietician.full_name if self.dietician else 'Yapay Zeka Diyetisteni'
        return f'{client_name} -> {dietician_name}'

    @property
    def age(self):
        return self.client.age

    @property
    def height(self):
        return self.client.height

    @property
    def client(self):
        return self.assignment.client if self.assignment else None

    @property
    def dietician(self):
        return self.assignment.dietician if self.assignment else None




