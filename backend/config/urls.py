from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.generic import TemplateView

from apps.users.views.register import CustomVerifyEmailView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('apps.users.urls')),
    path('api/diets/', include('apps.diets.urls')),
    path('api/foods/', include('apps.foods.urls')),
    path('api/chat/', include('apps.chat.urls')),
    path('api/ai-dietician/', include('apps.ai_dietician.urls')),
    path('api/appointments/', include('apps.appointments.urls')),
    path('api/auth/registration/verify-email/', CustomVerifyEmailView.as_view(), name='rest_verify_email'),
    path("api/auth/", include("dj_rest_auth.urls")),
    path("api/auth/", include("dj_rest_auth.registration.urls")),
    path('api/subscription/', include('apps.subscription.urls')),
    path('api/payment/', include('apps.payment.urls')),
    path('signup-dummy/', TemplateView.as_view(template_name="dummy.html"), name='account_signup'),
    path('login-dummy/', TemplateView.as_view(template_name="dummy.html"), name='account_login'),
    path('password-reset/', TemplateView.as_view(template_name="dummy.html"), name='account_reset_password'),


]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
