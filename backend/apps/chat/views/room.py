from django.db.models import Q
from rest_framework import status, viewsets
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action


from apps.chat.models import ChatRoom
from apps.chat.serializers.room import ChatRoomDetailSerializer, ChatRoomListSerializer
from apps.users.models import User


class ChatRoomViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ChatRoomListSerializer
        return ChatRoomDetailSerializer


    def get_queryset(self):
        user = self.request.user

        return ChatRoom.objects.filter(
           Q(dietician=user) | Q(client=user)).prefetch_related('messages').select_related('dietician', 'client').order_by('-created_at')

    def list(self,request):
        serializer = self.get_serializer(self.get_queryset(), many=True)
        return Response(serializer.data)

    def retrieve(self,request,pk):
        chat_room = get_object_or_404(self.get_queryset(), pk=pk)
        chat_room.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
        serializer = self.get_serializer(chat_room)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='get_or_create')
    def get_or_create(self, request):
        chat_user_id = request.data.get('chat_user_id')
        if not chat_user_id:
            return Response({'error': 'Chat user id is required'}, status=status.HTTP_400_BAD_REQUEST)

        chat_user = get_object_or_404(User, pk=chat_user_id)
        user = request.user

        if getattr(user, 'dietician', False):
            dietician, client = user, chat_user
        else:
            dietician, client = chat_user, user

        chat_room, created = ChatRoom.objects.get_or_create(
            dietician=dietician,
            client=client,
        )
        serializer = self.get_serializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)