from django.db import models


class Food(models.Model):

    class Source(models.TextChoices):
        MANUAL = 'MANUAL', 'Manuel'
        FATSECRET = 'FATSECRET', 'Fatsecret'


    name = models.CharField(max_length=255)
    source = models.CharField(
        max_length=255,
        choices=Source.choices,
        default=Source.MANUAL,
    )
    external_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    serving_description = models.CharField(max_length=255, default="1 Porsiyon")

    calories = models.FloatField(default=0)
    protein = models.FloatField(default=0)
    carbs = models.FloatField(default=0)
    fat = models.FloatField(default=0)
    saturated_fat = models.FloatField(default=0)
    sugar = models.FloatField(default=0)
    sodium = models.FloatField(default=0)

    is_verified = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)



    class Meta:
        verbose_name = 'Besin'
        verbose_name_plural = 'Besinler'
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.serving_description})"



