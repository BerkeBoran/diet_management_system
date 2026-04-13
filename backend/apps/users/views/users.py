from rest_framework import generics, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import Client, Dietician
from apps.users.serializers.review import DieticianReviewSerializer, CreateDieticianReviewSerializer
from apps.users.serializers.users import ClientProfileSerializer, DieticianProfileSerializer, DieticianListSerializer, \
    DieticianDetailSerializer


class ProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'client'):
            client = Client.objects.get(id=request.user.id)
            serializer = ClientProfileSerializer(client)
            return Response(serializer.data)

        if hasattr(request.user, 'dietician'):
            dietician = Dietician.objects.get(id=request.user.id)
            serializer = DieticianProfileSerializer(dietician)
            return Response(serializer.data)

class DieticianViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dietician.objects.filter(
            verification_status = 'Accepted',
        )

    def get_serializer_class(self):
        if self.action == 'list':
            return DieticianListSerializer
        return DieticianDetailSerializer

    @action(detail=True, methods=['get', 'post'], url_path='reviews')
    def reviews(self, request, pk=None):
        dietician = self.get_object()

        if request.method == 'GET':
            serializer = DieticianReviewSerializer(dietician.reviews.all(), many=True)

            return Response({
                'average_rating': dietician.average_rating,
                'review_count': dietician.review_count,
                'reviews': serializer.data,
            })
        serializer = CreateDieticianReviewSerializer(
            data=request.data,
            context={'request': request, 'dietician': dietician}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

