from rest_framework_simplejwt.views import TokenObtainPairView

from apps.users.serializers.auth import MyTokenObtainPairSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer