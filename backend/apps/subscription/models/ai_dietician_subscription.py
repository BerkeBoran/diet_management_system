from django.utils import timezone
from dateutil.relativedelta import relativedelta

from django.db import models


class AIDieticianSubscription(models.Model):
    class SubscriptionDuration(models.TextChoices):
        ONE_MONTH = '1M', '1 Ay'
        SIX_MONTHS = '6M', '6 Ay'
        ONE_YEAR = '12M', '12 Ay'

    DURATION_MAP = {
        '1M': 1,
        '6M': 6,
        '12M': 12,
    }

    client = models.ForeignKey('users.Client', on_delete=models.CASCADE, related_name='ai_dietician_subscriptions')
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    subscription_duration = models.CharField(
        max_length=5,
        choices=SubscriptionDuration.choices,
    )

    class Meta:
        ordering = ['-started_at']

    def save(self, *args, **kwargs):
        if not self.pk:
            months = self.DURATION_MAP.get(self.subscription_duration, 1)
            self.expires_at = timezone.now() + relativedelta(months=months)

        super().save(*args, **kwargs)


    @property
    def is_active(self):
        return self.expires_at > timezone.now()

