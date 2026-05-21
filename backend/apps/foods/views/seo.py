"""SEO için server-side rendered HTML sayfaları.

React SPA içerik Google tarafından indexlenemediği için besin detay
sayfaları Django'da tam HTML olarak render edilir. URL'ler:
    /foods/kac-kalori/<slug>/   → Food detay sayfası
    /sitemap.xml                 → Dinamik sitemap (4418 besin URL'i)
    /robots.txt                  → Robots direktifleri
"""

from __future__ import annotations

from django.db.models import Q
from django.http import HttpResponse
from django.shortcuts import get_object_or_404, render
from django.utils.cache import patch_cache_control
from django.views.decorators.cache import cache_page

from apps.foods.models import Food


SITE_BASE_URL = "https://lifeetics.com"
STATIK_URLLER = [
    {"loc": f"{SITE_BASE_URL}/", "priority": "1.0", "changefreq": "weekly"},
    {
        "loc": f"{SITE_BASE_URL}/foods/kac-kalori",
        "priority": "0.9",
        "changefreq": "weekly",
    },
    {
        "loc": f"{SITE_BASE_URL}/register",
        "priority": "0.7",
        "changefreq": "monthly",
    },
    {
        "loc": f"{SITE_BASE_URL}/register/client",
        "priority": "0.7",
        "changefreq": "monthly",
    },
    {
        "loc": f"{SITE_BASE_URL}/register/dietician",
        "priority": "0.7",
        "changefreq": "monthly",
    },
    {
        "loc": f"{SITE_BASE_URL}/login",
        "priority": "0.5",
        "changefreq": "monthly",
    },
    {
        "loc": f"{SITE_BASE_URL}/support",
        "priority": "0.5",
        "changefreq": "monthly",
    },
    {
        "loc": f"{SITE_BASE_URL}/kvkk",
        "priority": "0.3",
        "changefreq": "yearly",
    },
]


def _ilk_kelime(metin: str) -> str:
    return (metin or "").strip().split()[0] if metin else ""


@cache_page(60 * 60)  # 1 saat cache
def food_detail_html(request, slug):
    """Tek besin için SEO'ya uygun, server-side rendered HTML sayfası."""
    food = get_object_or_404(Food, external_id=slug)

    # İlgili besinler — ilk kelimeyi paylaşanlar (örn. "Lahmacun" → "Ev Yapımı Lahmacun")
    ilk_kelime = _ilk_kelime(food.name)
    related = []
    if ilk_kelime and len(ilk_kelime) >= 3:
        related = list(
            Food.objects.filter(name__istartswith=ilk_kelime)
            .exclude(id=food.id)
            .order_by("name")[:8]
        )
    # Yedek: aynı kategoriden başkaları
    if len(related) < 4:
        ek = (
            Food.objects.filter(
                Q(name__icontains=ilk_kelime) if ilk_kelime else Q()
            )
            .exclude(id=food.id)
            .exclude(id__in=[r.id for r in related])
            .order_by("name")[: 8 - len(related)]
        )
        related.extend(list(ek))

    response = render(
        request,
        "foods/detail.html",
        {
            "food": food,
            "related": related,
            "canonical_url": f"{SITE_BASE_URL}/foods/kac-kalori/{food.external_id}",
        },
    )
    patch_cache_control(response, public=True, max_age=3600)
    return response


@cache_page(60 * 60 * 6)  # 6 saat cache
def sitemap_xml(request):
    """Tüm food URL'leri + statik sayfalar içeren dinamik sitemap."""
    foods = Food.objects.all().only("external_id", "updated_at" if _has_updated_at() else "id")
    response = render(
        request,
        "foods/sitemap.xml",
        {
            "static_urls": STATIK_URLLER,
            "foods": foods,
            "base_url": SITE_BASE_URL,
        },
        content_type="application/xml; charset=utf-8",
    )
    patch_cache_control(response, public=True, max_age=21600)
    return response


def robots_txt(request):
    """Crawler için robots.txt — sitemap göster, private/auth route'larını kapa."""
    content = (
        "User-agent: *\n"
        "Allow: /\n"
        "\n"
        "# Auth / private route'lar (index'lenmemeli)\n"
        "Disallow: /login\n"
        "Disallow: /register\n"
        "Disallow: /register/client\n"
        "Disallow: /register/dietician\n"
        "Disallow: /forgot-password\n"
        "Disallow: /reset-password\n"
        "Disallow: /verify-email\n"
        "Disallow: /client/\n"
        "Disallow: /dietician/\n"
        "\n"
        "# Backend / sistem\n"
        "Disallow: /admin/\n"
        "Disallow: /api/\n"
        "Disallow: /ws/\n"
        "\n"
        "# Arama sonuç sayfaları (thin content, yerine besin detayını indexlesin)\n"
        "Disallow: /foods/kac-kalori/arama/\n"
        "\n"
        f"Sitemap: {SITE_BASE_URL}/sitemap.xml\n"
    )
    response = HttpResponse(content, content_type="text/plain; charset=utf-8")
    patch_cache_control(response, public=True, max_age=86400)
    return response


def _has_updated_at() -> bool:
    """Food modelinde updated_at varsa True (geriye dönük güvenli kontrol)."""
    return any(f.name == "updated_at" for f in Food._meta.get_fields())
