from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.diets.models.assignment import DieticianAssignment
from apps.subscription.models.ai_dietician_subscription import AIDieticianSubscription
from apps.subscription.serializers.ai_dietician_subscription import AiDieticianSubscriptionSerializer


class SubscriptionStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        client = request.user.client

        ai_subscription = AIDieticianSubscription.objects.filter(client=client).order_by('-started_at').first()

        ai_active = ai_subscription is not None and ai_subscription.is_active

        dietician_subscription = DieticianAssignment.objects.filter(
            client=client,
            status=DieticianAssignment.Status.INPROGRESS
        ).order_by('-created_at').first()

        if ai_active:
            redirect_to = 'ai'
        elif dietician_subscription:
            redirect_to = 'dietician'
        else:
            redirect_to = 'none'


        data = {
            'redirect_to': redirect_to,
            'ai_subscription': None,
            'dietician_subscription': None
        }

        if ai_subscription:
            data['ai_subscription'] = AiDieticianSubscriptionSerializer(ai_subscription).data

        if dietician_subscription:
            data['dietician_subscription'] = {
                'id': dietician_subscription.id,
                'duration': dietician_subscription.duration,
            }

        return Response(data)

