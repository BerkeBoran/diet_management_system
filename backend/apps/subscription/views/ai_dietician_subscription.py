from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from apps.subscription.models.ai_dietician_subscription import AIDieticianSubscription
from apps.subscription.serializers.ai_dietician_subscription import AiDieticianSubscriptionSerializer


class AIDieticianSubscriptionView(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AiDieticianSubscriptionSerializer
    http_method_names = ['get', 'post']


    def get_queryset(self):
        return AIDieticianSubscription.objects.filter(client=self.request.user.client)

    def perform_create(self, serializer):
        serializer.save()


