from django.http import JsonResponse
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.ai_dietician.agent.dietician_agent.graph import analysis_node
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

    def analyze_health_snapshot(self, request):
        updated_data = request.POST.get("snapshot_data")
        ai_analysis_result = analysis_node(updated_data)

        client_profile = request.user.client
        client_profile.static_analysis = ai_analysis_result
        client_profile.save()

        return JsonResponse({"status": "success", "analysis": ai_analysis_result})