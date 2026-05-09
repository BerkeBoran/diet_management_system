from django.db import models


class Payment(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Bekliyor'
        SUCCESS = 'success', 'Tamamlandı'
        FAILED = 'failed', 'Başarısız'
        CANCELED = 'canceled', 'İptal Edildi'


    class PaymentType(models.TextChoices):
        AI_SUBSCRIPTION = 'ai_subscription', 'AI Diyetisyen Aboneliği'


    client = models.ForeignKey(
        'users.Client',
        on_delete=models.SET_NULL,
        null=True,
        related_name='payments',

    )

    payment_type = models.CharField(
        max_length=30,
        choices=PaymentType.choices,
        default=PaymentType.AI_SUBSCRIPTION,
    )

    status = models.CharField(
        max_length=30,
        choices=Status.choices,
        default=Status.PENDING,
    )

    subscription = models.OneToOneField(
        'subscription.AIDieticianSubscription',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='payment',
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='TRY')

    iyzico_token = models.CharField(max_length=255, blank=True)
    iyzico_payment_id = models.CharField(max_length=255, blank=True)
    iyzico_conversation_id = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Ödeme'
        verbose_name_plural = 'Ödemeler'

    def __str__(self):
        return f"{self.client} - {self.payment_type} - {self.status}"

