from allauth.socialaccount.providers.apple.views import AppleOAuth2Adapter
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from dj_rest_auth.registration.views import SocialLoginView
from rest_framework import status, settings
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from apps.users.serializers.auth import CustomTokenObtainPairSerializer


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class GoogleLoginView(SocialLoginView):

    adapter_class = GoogleOAuth2Adapter
    client_class  = OAuth2Client
    callback_url  = getattr(settings, "GOOGLE_CALLBACK_URL",
                            "http://localhost:8000/api/auth/social/google/callback/")

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = self.user
            if user.role == "dietician":
                from rest_framework_simplejwt.tokens import RefreshToken
                try:
                    refresh = RefreshToken(response.data.get("refresh"))
                    refresh.blacklist()
                except Exception:
                    pass
                return Response(
                    {"detail": "Diyetisyen hesapları Google ile giriş yapamaz."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return response


class AppleLoginView(SocialLoginView):

    adapter_class = AppleOAuth2Adapter
    client_class  = OAuth2Client
    callback_url  = getattr(settings, "APPLE_CALLBACK_URL",
                            "https://yourdomain.com/api/auth/social/apple/callback/")

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = self.user
            if user.role == "dietician":
                from rest_framework_simplejwt.tokens import RefreshToken
                try:
                    refresh = RefreshToken(response.data.get("refresh"))
                    refresh.blacklist()
                except Exception:
                    pass
                return Response(
                    {"detail": "Diyetisyen hesapları Apple ile giriş yapamaz."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        return response