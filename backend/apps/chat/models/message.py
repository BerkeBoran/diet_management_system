from django.conf import settings
from django.db import models

from apps.chat.models.room import ChatRoom


class Message(models.Model):

    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='sent_messages', null=True, blank=True)

    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        sender_name = self.sender.full_name if self.sender else "Silinmiş Kullanıcı"
        if hasattr(self.sender,'role') and self.sender.role == 'Dietician':
            if hasattr(self.sender,'dieticianprofile') and self.sender.dieticianprofile.title:
                title = self.sender.dieticianprofile.get_title_display()
                return f"{title}.{sender_name}: {self.content[:20]}"
        return f"{sender_name}: {self.content[:20]}"