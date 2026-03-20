from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.models import Client, Dietician
from apps.users.serializers.users import ClientProfileSerializer, DieticianProfileSerializer


class ProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if hasattr(request.user, 'client'):
            client = Client.objects.get(id=request.user.id)
            serializer = ClientProfileSerializer(client)
            return Response(serializer.data)

        if hasattr(request.user, 'dietician'):
            dietician = Dietician.objects.get(id=request.user.dietician_id)
            serializer = DieticianProfileSerializer(dietician)
            return Response(serializer.data)