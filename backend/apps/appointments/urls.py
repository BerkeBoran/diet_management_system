from rest_framework.routers import DefaultRouter

from apps.appointments.views.appointment import DieticianAvailabilityViewSet

router = DefaultRouter()
router.register(r'dietician-availability', DieticianAvailabilityViewSet, basename='dietician-availability')

urlpatterns = router.urls