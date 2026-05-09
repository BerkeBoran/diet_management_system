import json
import uuid
from decimal import Decimal

import iyzipay
from django.shortcuts import redirect
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.payment.models.payment import Payment
from apps.payment.serializers.payment import InitiatePaymentSerializer
from apps.subscription.models.ai_dietician_subscription import AIDieticianSubscription

SUBSCRIPTION_PRICES = {
    '1M': Decimal('99'),
    '6M': Decimal('500'),
    '12M': Decimal('800'),
}

def get_iyzico_options():
    return {
        'api_key': settings.IYZICO_API_KEY,
        'secret_key': settings.IYZICO_SECRET_KEY,
        'base_url': settings.IYZICO_BASE_URL,
    }


class InitiateAISubscriptionPaymentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = InitiatePaymentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        duration = serializer.validated_data['subscription_duration']
        amount = SUBSCRIPTION_PRICES[duration]
        client = request.user.client

        subscription = AIDieticianSubscription.objects.create(
            client=client,
            subscription_duration=duration,
            is_paid=False,
        )
        conversation_id = str(uuid.uuid4())
        payment_record = Payment.objects.create(
            client=client,
            subscription=subscription,
            payment_type=Payment.PaymentType.AI_SUBSCRIPTION,
            status=Payment.Status.PENDING,
            amount=amount,
            iyzico_conversation_id=conversation_id,
        )

        request_data = {
            'locale': 'tr',
            'conversationId': conversation_id,
            'price': str(amount),
            'paidPrice': str(amount),
            'currency': 'TRY',
            'basketId': str(payment_record.id),
            'paymentGroup': 'SUBSCRIPTION',
            'callbackUrl': request.build_absolute_uri('/api/payment/ai-subscription/callback/'),
            'enabledInstallments': [1, 2, 3, 6, 9],
            'buyer': {
                'id': str(client.id),
                'name': client.first_name,
                'surname': client.last_name,
                'email': client.email,
                'identityNumber': client.identity_number,
                'registrationAddress': 'Türkiye',
                'ip': _get_client_ip(request),
                'city': 'İstanbul',
                'country': 'Turkey'
            },
            'shippingAddress': {
                'contactName': f'{client.first_name} {client.last_name}',
                'city': 'Istanbul',
                'country': 'Turkey',
                'address': 'Türkiye'
            },
            'billingAddress': {
                'contactName': f'{client.first_name} {client.last_name}',
                'city': 'Istanbul',
                'country': 'Turkey',
                'address': 'Türkiye',
            },
            'basketItems': [
                {
                    'id': f'AI_SUB_{duration}',
                    'name': f'AI Diyetisyen Aboneliği — {duration}',
                    'category1': 'Abonelik',
                    'itemType': 'VIRTUAL',
                    'price': str(amount),
                }
            ],
        }
        checkout_from_initialize = iyzipay.CheckoutFormInitialize()
        raw_result = checkout_from_initialize.create(
            request_data,
            get_iyzico_options()
        )
        result = json.loads(raw_result.read().decode('utf-8'))

        if result.get('status') != 'success':
            payment_record.delete()
            subscription.delete()
            return Response({
                'detail': result.get('errorMessage', 'Ödeme başlatılamadı')
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        token = result.get('token')
        payment_record.iyzico_token = token
        payment_record.save()

        return Response({
            'token': token,
            'checkoutFormContent': result.get('checkoutFormContent'),
            'payment_id': payment_record.id,

        })


class AISubscriptionPaymentCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token') or request.POST.get('token')
        if not token:
            return Response({
                'detail': 'Token bulunamadı.'
            },
            status=status.HTTP_400_BAD_REQUEST)

        checkout_form_retrieve = iyzipay.CheckoutForm()
        raw_result = checkout_form_retrieve.retrieve({
            'locale': 'tr',
            'token': token,
        },
            get_iyzico_options()

        )
        result = json.loads(raw_result.read().decode('utf-8'))

        try:
            payment_record = Payment.objects.select_related(
                'subscription'
            ).get(iyzico_token=token)
        except Payment.DoesNotExist:
            return Response({'detail': 'Ödeme kaydı bulunamadı.'}, status=404)

        if result.get('status') == 'success' and result.get('paymentStatus') == 'SUCCESS':
            payment_record.status = Payment.Status.SUCCESS
            payment_record.iyzico_payment_id = result.get('paymentId', '')
            payment_record.paid_at = timezone.now()
            payment_record.save()

            subscription = payment_record.subscription
            subscription.is_paid = True
            subscription.payment_reference = result.get('paymentId', '')
            subscription.save()

            return redirect(
                f'{settings.FRONTEND_URL}/client/ai-dashboard?payment=success'
            )
        else:
            payment_record.status = Payment.Status.FAILED
            payment_record.save()

            return redirect(
                f'{settings.FRONTEND_URL}/client/subscribe-ai?payment=failed'
            )


class PaymentStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id,client=request.user.client)

        except Payment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        return Response({
            'status': payment.status,
            'paid_at': payment.paid_at,
            'subscription_active': (payment.subscription.is_active if payment.subscription else False),
        })


def _get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '0.0.0.0')
