from urllib.parse import parse_qs
from jwt import decode as jwt_decode
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode()
        query_params = parse_qs(query_string)

        token = query_params.get('token', [None])[0]

        if token:
            try:
                decoded_token = jwt_decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                user = await database_sync_to_async(User.objects.get)(id=decoded_token['user_id'])
                scope['user'] = user

            except Exception as e:
                scope['user'] = AnonymousUser()

        else:
            scope['user'] = AnonymousUser()

        return await super().__call__(scope, receive, send)