from rest_framework import serializers

from apps.chat.models import Message


class MessageSerializer(serializers.ModelSerializer):

    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_name = serializers.SerializerMethodField(read_only=True)
    sender_title = serializers.SerializerMethodField(read_only=True)
    is_mine = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ('id', 'sender_id', 'sender_title', 'sender_name', 'content', 'timestamp', 'is_read', 'is_mine')


    def get_sender_name(self, obj):
        if obj.sender:
            return obj.sender.full_name
        return "Silinmiş Kullanıcı"

    def get_is_mine(self, obj):
        request = self.context.get('request')
        return request and obj.sender == request

    def get_sender_title(self, obj):
        sender = obj.sender

        if not sender:
            return ""

        if hasattr(sender, 'dietician') and sender.dietician:

            if getattr(sender.dietician, 'title', None):
                return sender.dietician.get_title_display()

        return ""



