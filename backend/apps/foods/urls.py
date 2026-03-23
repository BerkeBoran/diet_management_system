from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.foods.views import FoodViewSet

router = DefaultRouter()
router.register('foods', FoodViewSet, basename='food')

urlpatterns = [
    path('', include(router.urls)),
]