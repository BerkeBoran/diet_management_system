from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.users.models import Dietician
from apps.users.serializers.review import DieticianReviewSerializer, CreateDieticianReviewSerializer


class DieticianReviewView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, dietician_id):
        try:
            dietician = Dietician.objects.get(pk=dietician_id)
        except Dietician.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = DieticianReviewSerializer(dietician.reviews.all(), many=True)
        return Response({
            'average_rating': dietician.average_rating,
            'review_count': dietician.review_count,
            'reviews': serializer.data,
        })

    def post(self, request, dietician_id):
        try:
            dietician = Dietician.objects.get(pk=dietician_id)
        except Dietician.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = CreateDieticianReviewSerializer(
            data=request.data,
            context={'request': request, 'dietician': dietician}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
