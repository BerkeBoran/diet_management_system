from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.appointments.views.appointment import AppointmentViewSet, AvailableSlotsView
from apps.appointments.views.dietician_unavailability import DieticianUnavailabilityViewSet

router = DefaultRouter()
router.register(r'unavailabilities', DieticianUnavailabilityViewSet, basename='unavailability')
router.register(r'appointment', AppointmentViewSet, basename='appointment')

urlpatterns = [
    path('', include(router.urls)),

    path('available-slots/', AvailableSlotsView.as_view(), name='available-slots')
]