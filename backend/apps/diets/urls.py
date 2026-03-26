from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.diets.views.assignment import DieticianAssignmentViewSet
from apps.diets.views.dietician_clients import DieticianClientsViewSet

router = DefaultRouter()
router.register(r'dieticians', DieticianAssignmentViewSet, basename='dieticians')
router.register(r'assignment', DieticianAssignmentViewSet, basename='assignment')
router.register(r'dietician-clients', DieticianClientsViewSet, basename='dietician-clients')


urlpatterns = [
    path('', include(router.urls)),
]