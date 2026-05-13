from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.foods.models import Food
from apps.foods.serializers import FoodSerializer, FoodDetailSerializer
from apps.foods.services import FoodService


class FoodViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Food.objects.all()
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FoodDetailSerializer
        return FoodSerializer

    def list(self, request, *args, **kwargs):
        query = request.query_params.get('q', '').strip()
        if query:
            service = FoodService()
            results = service.search(query)
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)


