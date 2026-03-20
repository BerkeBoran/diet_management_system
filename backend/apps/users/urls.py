from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import MyTokenObtainPairView
from apps.users.views.register import ClientRegisterView, DieticianRegisterView

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/client/', ClientRegisterView.as_view(), name='client_register'),
    path('register/dietician/', DieticianRegisterView.as_view(), name='dietician_register'),

]