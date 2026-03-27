from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.diets.views.assignment import DieticianAssignmentViewSet
from apps.diets.views.dietician_clients import DieticianClientsViewSet, DieticianClientDetailViewSet
from apps.diets.views.plan import DietPlanViewSet
from apps.diets.views.weekly import WeeklyPlanViewSet, DailyPlanViewSet

router = DefaultRouter()
router.register(r'dieticians', DieticianAssignmentViewSet, basename='dieticians')
router.register(r'assignment', DieticianAssignmentViewSet, basename='assignment')
router.register(r'dietician-clients', DieticianClientsViewSet, basename='dietician-clients')
router.register(r'client-detail', DieticianClientDetailViewSet, basename='client-detail')
router.register(r'diet-plan', DietPlanViewSet, basename='diet-plan')
router.register(r'weekly-plan', WeeklyPlanViewSet, basename='weekly-plan')
router.register(r'daily-plan', DailyPlanViewSet, basename='daily-plan')

urlpatterns = [
    path('', include(router.urls)),
]