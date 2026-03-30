import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

from django.core.asgi import get_asgi_application
django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from apps.chat.routing import websocket_urlpatterns
from apps.chat.middleware import JWTAuthMiddleware


# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": JWTAuthMiddleware(
        URLRouter(
            websocket_urlpatterns
        )
    )
    # Just HTTP for now. (We can add other protocols later.)
})