from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from allauth.account.models import EmailAddress
from apps.users.serializers.dietician_register import  DieticianRegisterSerializer
from apps.users.serializers.client_register import ClientRegisterSerializer


class DieticianRegisterView(APIView):

    permission_classes = [AllowAny]
    parser_classes     = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = DieticianRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()


        email_address, created = EmailAddress.objects.get_or_create(
            user=user,
            email=user.email,
            defaults={'primary': True, 'verified': False}
        )

        email_address.send_confirmation(request, signup=True)

        return Response(
            {
                "detail": (
                    "Kayıt başarılı. Hesabınızı aktifleştirmek için "
                    "e-posta adresinize gönderilen doğrulama linkine tıklayın."
                ),
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class ClientRegisterView(APIView):

    permission_classes = [AllowAny]
    parser_classes     = [JSONParser]

    def post(self, request):
        serializer = ClientRegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        email_address, created = EmailAddress.objects.get_or_create(
            user=user,
            email=user.email,
            defaults={'primary': True, 'verified': False}
        )

        email_address.send_confirmation(request, signup=True)

        return Response(
            {
                "detail": (
                    "Kayıt başarılı. Hesabınızı aktifleştirmek için "
                    "e-posta adresinize gönderilen doğrulama linkine tıklayın."
                ),
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )
