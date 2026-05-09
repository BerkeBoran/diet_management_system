from django.contrib import admin
from apps.subscription.models.ai_dietician_subscription import AIDieticianSubscription


@admin.register(AIDieticianSubscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('id', 'is_active', 'subscription_duration', 'expires_at', 'started_at')
