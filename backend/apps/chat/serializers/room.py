from rest_framework import serializers

from apps.chat.models import ChatRoom
from apps.chat.serializers import MessageSerializer


class ChatRoomListSerializer(serializers.ModelSerializer):

    chat_user = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_message_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'chat_user', 'last_message', 'unread_message_count')

    def get_chat_user(self, obj):
        user = self.context['request'].user
        chat_user = obj.client if user == obj.dietician else obj.dietician
        if not chat_user:
            return {'id': None, 'full_name': "Silinmiş Kullanıcı"}
        return {'id': chat_user.id, 'full_name': chat_user.full_name}

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'content': last.content,
                'timestamp': last.timestamp,
            }
        return None

    def get_unread_message_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class ChatRoomDetailSerializer(serializers.ModelSerializer):
    chat_user = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatRoom
        fields = ('id', 'chat_user', 'messages')

    def get_chat_user(self, obj):
        user = self.context['request'].user
        chat_user = obj.client if user == obj.dietician else obj.dietician
        if not chat_user:
            return {'id': None, 'full_name': "Silinmiş Kullanıcı"}
        return {'id': chat_user.id, 'full_name': chat_user.full_name}