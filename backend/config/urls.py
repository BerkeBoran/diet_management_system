from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/diets/', include('apps.diets.urls')),
    path('api/foods/', include('apps.foods.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/ai-dietician/', include('apps.ai_dietician.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/", include("dj_rest_auth.registration.urls")),

]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
