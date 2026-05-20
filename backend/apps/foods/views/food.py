from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from apps.foods.models import Food
from apps.foods.serializers import FoodSerializer, FoodDetailSerializer
from apps.foods.services import FoodService


class FoodViewSet(viewsets.ReadOnlyModelViewSet):
    """Besin veritabanı için read-only viewset.

    Endpoints:
        GET /api/foods/foods/?q=<terim>  → arama (liste döner)
        GET /api/foods/foods/<id>/       → detay
    Erişim:
        Public — "Kaç Kalori?" sayfası anonim kullanıcılar da arasın diye
        AllowAny tanımlandı. Veri read-only olduğu için güvenli.
    """

    permission_classes = [AllowAny]
    queryset = Food.objects.all().order_by('name')
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
            # Sonuçları kalori değerine göre değil, ismin "q" ile başlama
            # önceliğine göre sırala — kullanıcı için en alakalı önde olsun.
            q_lower = query.lower()
            results = sorted(
                results,
                key=lambda f: (
                    0 if (f.name or "").lower().startswith(q_lower) else 1,
                    (f.name or "").lower(),
                ),
            )
            serializer = self.get_serializer(results, many=True)
            return Response(serializer.data)

        return super().list(request, *args, **kwargs)


