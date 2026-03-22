from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.diets.views.assignment import DieticianAssignmentViewSet

router = DefaultRouter()
router.register(r'dieticians', DieticianAssignmentViewSet, basename='dieticians')
router.register('assignment', DieticianAssignmentViewSet, basename='assignment')



urlpatterns = [
    path('', include(router.urls)),
]