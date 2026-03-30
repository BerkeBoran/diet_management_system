from django.conf import settings
from django.db import models


class ChatRoom(models.Model):

    dietician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='dietician_chat_rooms', null=True, blank=True)
    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='clients_chat_rooms', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('client', 'dietician')


    def __str__(self):
        dietcian_name = self.dietician.full_name if self.dietician else 'Silinmiş Diyetisyen'
        client_name = self.client.full_name if self.client else 'Silinmiş Danışan'
        return f"Diyetisyen:{dietcian_name} | Danışan:{client_name}"