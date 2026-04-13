from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models.client_health_snapshot import ClientHealthSnapshot
from apps.users.serializers.client_health_snapshot import ClientHealthSnapshotSerializer


class ClientHealthSnapshotViewSet(viewsets.ModelViewSet):
    serializer_class = ClientHealthSnapshotSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return ClientHealthSnapshot.objects.filter(client=self.request.user.client)

    def perform_create(self, serializer):
        serializer.save(client=self.request.user.client)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)

        return Response(
            {"message": "Verileriniz başarıyla kaydedildi.", "data": serializer.data},
            status=status.HTTP_201_CREATED
        )

    def get_latest(self, request):

        latest_snapshot = self.get_queryset().first()
        if not latest_snapshot:
            return Response({"error": "Bir kayıt bulunmamaktadır"},status=status.HTTP_404_NOT_FOUND)

        serializer = ClientHealthSnapshotSerializer(latest_snapshot)
        return Response(serializer.data)