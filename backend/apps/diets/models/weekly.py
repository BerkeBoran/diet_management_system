from django.db import models


class WeeklyPlan(models.Model):

    diet_plan = models.ForeignKey('diets.DietPlan', on_delete=models.CASCADE, related_name='weekly_plan')
    week_number = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        verbose_name = 'Haftalık Plan'
        verbose_name_plural = 'Haftalık Planlar'
        ordering = ['week_number']

    def __str__(self):
        return f"{self.diet_plan} - Hafta: {self.week_number}"

class DailyPlan(models.Model):

    class DayOfWeek(models.TextChoices):
        MONDAY = 'Monday', 'Pazartesi'
        TUESDAY = 'Tuesday', 'Salı'
        WEDNESDAY = 'Wednesday', 'Çarşamba'
        THURSDAY = 'Thursday', 'Perşembe'
        FRIDAY = 'Friday', 'Cuma'
        SATURDAY = 'Saturday', 'Cumartesi'
        SUNDAY = 'Sunday', 'Pazar'

    weekly_plan = models.ForeignKey('WeeklyPlan', on_delete=models.CASCADE, related_name='daily_plan')
    day = models.CharField(max_length=10, choices=DayOfWeek.choices)
    total_calories = models.IntegerField()
    total_proteins = models.IntegerField()
    total_carbs = models.IntegerField()
    total_fat = models.IntegerField()

    class Meta:
        ordering = ['day']
        unique_together = (('weekly_plan', 'day'),)
        verbose_name = 'Günlük Plan'
        verbose_name_plural = 'Günlük Planlar'

    def __str__(self):
        return f"{self.weekly_plan} - {self.day}"