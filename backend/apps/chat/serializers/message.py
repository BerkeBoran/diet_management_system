from rest_framework import serializers

from apps.chat.models import Message


class MessageSerializer(serializers.ModelSerializer):

    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_name = serializers.SerializerMethodField(read_only=True)
    is_mine = serializers.SerializerMethodField()
    timestamp = serializers.DateTimeField(format='%H:%M', read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'sender_id','sender_name', 'content', 'timestamp', 'is_read', 'is_mine')


    def get_sender_name(self, obj):
        if hasattr(obj.sender, 'dietician'):
            return f"{obj.sender.dietician.get_title_display()} {obj.sender.full_name}"
        return f"{obj.sender.full_name}"


    def get_is_mine(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.sender == request.user
        return False



