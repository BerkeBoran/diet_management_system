from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.views.generic import TemplateView

from apps.users.views.register import CustomVerifyEmailView
from apps.foods.views.seo import (
    food_detail_html, foods_hub_html, kvkk_html, sitemap_xml, robots_txt,
)

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

    # SEO — server-rendered HTML
    # Hub sayfası — alfabetik besin rehberi (orphan fix + sitelinks adayı)
    # NOT: /foods/kac-kalori (root) React arama sayfası, /rehber Django SSR hub.
    path('foods/kac-kalori/rehber', foods_hub_html, name='foods-hub-html'),
    path('foods/kac-kalori/rehber/', foods_hub_html),
    # Tek besin detayı
    path('foods/kac-kalori/<slug:slug>/', food_detail_html, name='food-detail-html'),
    path('foods/kac-kalori/<slug:slug>', food_detail_html),  # trailing slash'sız
    # KVKK Aydınlatma Metni — SSR (H1 + içerik bot'a görünür)
    path('kvkk', kvkk_html, name='kvkk-html'),
    path('kvkk/', kvkk_html),
    # Sitemap + robots
    path('sitemap.xml', sitemap_xml, name='sitemap-xml'),
    path('robots.txt', robots_txt, name='robots-txt'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
