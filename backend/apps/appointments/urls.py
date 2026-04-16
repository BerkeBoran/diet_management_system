from rest_framework.routers import DefaultRouter

from apps.appointments.views.appointment import DieticianAvailabilityViewSet, AppointmentViewSet

router = DefaultRouter()
router.register(r'dietician-availability', DieticianAvailabilityViewSet, basename='dietician-availability')
router.register(r'appointment', AppointmentViewSet, basename='appointment')

urlpatterns = router.urls