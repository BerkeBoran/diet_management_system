from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from apps.users.views import CustomTokenObtainPairView
from apps.users.views.auth import GoogleLoginView, AppleLoginView
from apps.users.views.client_health_snapshot import ClientHealthSnapshotViewSet
from apps.users.views.register import ClientRegisterView, DieticianRegisterView
from apps.users.views.review import DieticianReviewView
from apps.users.views.users import ProfileView, DieticianViewSet

router = DefaultRouter()
router.register(r'dieticians', DieticianViewSet, basename='dietician')
router.register(r'client-health-snapshots', ClientHealthSnapshotViewSet, basename='client-health-snapshot')

urlpatterns = [
    path('', include(router.urls)),

    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/client/', ClientRegisterView.as_view(), name='client_register'),
    path('register/dietician/', DieticianRegisterView.as_view(), name='dietician_register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('reviews/', DieticianReviewView.as_view(), name='dietician_review'),
    path("social/google/", GoogleLoginView.as_view(), name="google-login"),
    path("social/apple/", AppleLoginView.as_view(), name="apple-login"),

]
