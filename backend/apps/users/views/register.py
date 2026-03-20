from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.serializers.register import ClientRegisterSerializer, DieticianRegisterSerializer


class ClientRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ClientRegisterSerializer(data=request.data)
        if serializer.is_valid():
            client = serializer.save()
            refresh = RefreshToken.for_user(client)
            return Response({
                'message': 'Kayıt Başarılı',
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': client.id,
                    'email': client.email,
                    'role': client.role,
                    'full_name': client.full_name,
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DieticianRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DieticianRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Başvurunuz alındı, onay bekleniyor',
            },status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
