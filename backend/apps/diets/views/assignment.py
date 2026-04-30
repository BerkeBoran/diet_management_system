from rest_framework.decorators import action
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.diets.serializers.assignment import DieticianAssignmentSerializer, AssignmentResponseSerializer
from apps.diets.models.assignment import DieticianAssignment
from apps.users.models import Client


class DieticianAssignmentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = DieticianAssignmentSerializer

    def get_queryset(self):
        user = self.request.user

        if hasattr(user, 'dietician'):
            return DieticianAssignment.objects.filter(dietician=user.dietician)

        if hasattr(user, 'client'):
            return DieticianAssignment.objects.filter(client=user.client)
        return DieticianAssignment.objects.none()

    def perform_create(self, serializer):
        client = Client.objects.get(pk=self.request.user.pk)
        serializer.save(client=client)


    @action(detail=True, methods=['patch'], url_path='respond')
    def respond(self, request, pk=None):
        try:
            assignment = DieticianAssignment.objects.get(
                pk=pk,
                dietician=request.user
            )
        except DieticianAssignment.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        serializer = AssignmentResponseSerializer(assignment, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)