from django.urls import path

from apps.payment.views.payment import InitiateAISubscriptionPaymentView, AISubscriptionPaymentCallbackView, \
    PaymentStatusView

urlpatterns = [
    path('ai-subscription/initiate/',InitiateAISubscriptionPaymentView.as_view(), name='ai_subscription_payment_initiate'),
    path('ai-subscription/callback/',AISubscriptionPaymentCallbackView.as_view(),name='ai_subscription_payment_callback'),
    path('status/<int:payment_id>/',PaymentStatusView.as_view(),name='payment_status'),
]
