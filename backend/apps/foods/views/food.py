from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.foods.models import Food, FoodCategory
from apps.foods.serializers import FoodSerializer, FoodDetailSerializer, FoodCategorySerializer
from apps.foods.services import FoodService


class FoodViewSet(viewsets.ReadOnlyModelViewSet):  # Sadece okuma yapacaksan ReadOnly daha güvenli
    permission_classes = [IsAuthenticated]
    queryset = Food.objects.all()

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FoodDetailSerializer
        return FoodSerializer

    def list(self, request, *args, **kwargs):
        query = request.query_params.get('q', '')
        if query:
            # Arama varsa servis üzerinden sonuçları getir
            service = FoodService()
            results = service.search(query)
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)

        # Arama yoksa standart listeleme yap
        return super().list(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        # DRF'in kendi get_object() metodunu kullanmak daha 'best practice'
        instance = self.get_object()

        # Query param'ları alırken varsayılan değerleri güvenli tut
        try:
            amount = float(request.query_params.get('amount', 100))
        except ValueError:
            amount = 100.0

        unit = request.query_params.get('unit', 'g')

        serializer = FoodDetailSerializer(
            instance,
            context={'amount': amount, 'unit': unit}
        )
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='barcode/(?P<barcode>[^/.]+)')
    def barcode(self, request, barcode=None):
        # Barkodu URL path'inden almak daha RESTful bir yaklaşımdır
        if not barcode:
            return Response({'error': 'Barkod gerekli'}, status=status.HTTP_400_BAD_REQUEST)

        service = FoodService()
        food = service.get_by_barcode(barcode)

        if not food:
            return Response({'error': 'Ürün bulunamadı'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(food)
        return Response(serializer.data)