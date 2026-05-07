from django.urls import include, path
from rest_framework.routers import DefaultRouter

from apps.subscription.views.ai_dietician_subscription import AIDieticianSubscriptionView
from apps.subscription.views.subscription_status import SubscriptionStatusView

router = DefaultRouter()
router.register(r'ai_dietician_subscription', AIDieticianSubscriptionView, basename='ai_dietician_subscription')


urlpatterns =[
    path('', include(router.urls)),

    path('status/', SubscriptionStatusView.as_view(), name='subscription_status'),
]