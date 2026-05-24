"""SEO için server-side rendered HTML sayfaları.

React SPA içerik Google tarafından indexlenemediği için besin detay
sayfaları Django'da tam HTML olarak render edilir. URL'ler:
    /foods/kac-kalori/<slug>/   → Food detay sayfası
    /sitemap.xml                 → Dinamik sitemap (4418 besin URL'i)
    /robots.txt                  → Robots direktifleri
"""

from __future__ import annotations

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


def _related_besinler(food: Food, hedef_sayi: int = 8) -> list:
    """Bir besin için "İlgili besinler" listesi üretir.

    3 katmanlı strateji ile her sayfa için GARANTI `hedef_sayi` kadar
    sonuç döner (sitenin internal link grafiği her zaman doldurulur,
    orphan page yok). Sıra: en alakalıdan en az alakalıya.

    1. Aynı ilk kelimeyle başlayanlar (en alakalı; ör. "Lahmacun" → "Ev Yapımı Lahmacun")
    2. Aynı ilk harfle başlayan diğer besinler (alfabetik yakınlık)
    3. Rastgele yedek (son çare; "tek başına bir besin" diye bir şey kalmasın)
    """
    related: list = []
    eklenmis_idler: set = {food.id}

    # 1. Aynı ilk kelime
    ilk_kelime = _ilk_kelime(food.name)
    if ilk_kelime and len(ilk_kelime) >= 3:
        adaylar = (
            Food.objects.filter(name__istartswith=ilk_kelime)
            .exclude(id__in=eklenmis_idler)
            .order_by("name")[:hedef_sayi]
        )
        for f in adaylar:
            related.append(f)
            eklenmis_idler.add(f.id)

    # 2. Aynı ilk harf (henüz dolmadıysa)
    if len(related) < hedef_sayi and food.name:
        ilk_harf = food.name[0]
        kalan = hedef_sayi - len(related)
        adaylar = (
            Food.objects.filter(name__istartswith=ilk_harf)
            .exclude(id__in=eklenmis_idler)
            .order_by("name")[:kalan]
        )
        for f in adaylar:
            related.append(f)
            eklenmis_idler.add(f.id)

    # 3. Garanti rastgele yedek (orphan engelleyici)
    if len(related) < hedef_sayi:
        kalan = hedef_sayi - len(related)
        adaylar = (
            Food.objects.exclude(id__in=eklenmis_idler)
            .order_by("?")[:kalan]
        )
        related.extend(list(adaylar))

    return related


@cache_page(60 * 60)  # 1 saat cache
def food_detail_html(request, slug):
    """Tek besin için SEO'ya uygun, server-side rendered HTML sayfası."""
    food = get_object_or_404(Food, external_id=slug)

    # İlgili besinler — 3 katmanlı strateji, her sayfa için garanti 8 link üretir
    # (orphan page sorununu engelliyor: hiçbir besin internal link'siz kalmasın).
    related = _related_besinler(food, hedef_sayi=8)

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
