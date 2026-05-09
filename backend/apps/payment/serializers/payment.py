from rest_framework import serializers

from apps.payment.models.payment import Payment


class InitiatePaymentSerializer(serializers.Serializer):
    subscription_duration = serializers.ChoiceField(
        choices=['1M','6M', '12M']
    )


class PaymentStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['id', 'status', 'amount', 'currency', 'payment_type', 'created_at', 'paid_at']
        read_only_fields = fields
