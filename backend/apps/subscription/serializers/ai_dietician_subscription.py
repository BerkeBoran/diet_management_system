from rest_framework import serializers
from apps.subscription.models.ai_dietician_subscription import AIDieticianSubscription


class AiDieticianSubscriptionSerializer(serializers.ModelSerializer):
    is_active = serializers.BooleanField(read_only=True)

    class Meta:
        model = AIDieticianSubscription

        fields = ['id', 'is_active', 'subscription_duration', 'expires_at', 'started_at']
        read_only_fields = ['id', 'is_active', 'expires_at', 'started_at']


    def create(self, validated_data):
        client = self.context['request'].user.client
        return AIDieticianSubscription.objects.create(client=client, **validated_data)


