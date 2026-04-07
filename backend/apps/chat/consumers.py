import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.db.models import Q

from apps.chat import models
from apps.chat.models.room import ChatRoom
from apps.chat.models.message import Message

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        print("USER:", self.scope["user"])
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if not self.user.is_authenticated:
            await self.close()
            return

        is_member = await self.check_room_membership()
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        content = data.get('message', '').strip()
        action = data.get('action')



        if action in ['peer-msg']:
            await  self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'send_signal',
                    'payload': data['payload'],
                }
            )
        if content:
            saved_message = await self.save_message(content)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': saved_message.content,
                    'sender_id': self.user.id,
                    'sender_name': self.user.full_name,
                    'message_id': saved_message.id,
                    'timestamp': str(saved_message.timestamp),
                    'is_read': saved_message.is_read,
                }
            )


    async def send_signal(self, event):
        await  self.send(text_data=json.dumps({
            'action': 'peer-msg',
            'payload': event['payload'],
        }))


    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_name': event['sender_name'],
            'message_id': event['message_id'],
            'timestamp': event['timestamp'],
            'is_read': event['is_read'],
        }))


    @database_sync_to_async
    def check_room_membership(self):
        return ChatRoom.objects.filter(
            id=self.room_id
        ).filter(
            Q(dietician=self.user) | Q(client=self.user)
        ).exists()


    @database_sync_to_async
    def save_message(self, content):
        room = ChatRoom.objects.get(id=self.room_id)
        return Message.objects.create(room=room, sender=self.user, content=content)
