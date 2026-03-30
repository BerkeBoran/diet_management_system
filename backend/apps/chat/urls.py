from django.urls import path
from rest_framework.routers import DefaultRouter

from apps.chat.views.room import ChatRoomViewSet

router = DefaultRouter()
router.register(r'chat-rooms', ChatRoomViewSet, basename='chat-rooms')

urlpatterns = router.urls