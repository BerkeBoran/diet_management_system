"""SEO için server-side rendered HTML sayfaları.

React SPA içerik Google tarafından indexlenemediği için kritik SEO
sayfaları Django'da tam HTML olarak render edilir. URL'ler:
    /foods/kac-kalori           → Hub: alfabetik harf gezintisi + popüler besinler
    /foods/kac-kalori/<slug>/   → Food detay sayfası
    /kvkk                       → KVKK Aydınlatma Metni (statik)
    /sitemap.xml                → Dinamik sitemap
    /robots.txt                 → Robots direktifleri
    /llms.txt                   → LLM/AI bot'lar için markdown site özeti
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
        "loc": f"{SITE_BASE_URL}/foods/kac-kalori/rehber",
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


@cache_page(60 * 60 * 6)  # 6 saat cache (içerik nadiren değişir)
def foods_hub_html(request):
    """`/foods/kac-kalori` — server-rendered hub sayfası.

    SEO açısından kritik: Google'ın 1,220 orphan besin sayfasını bu hub
    üzerinden bulmasını sağlar, "kaç kalori" araması için sitelinks
    olasılığını artırır.

    İçerik: alfabetik harf gezintisi + her harf altında ilk 20 besin.

    NOT: `/foods/kac-kalori` (root) React arama sayfası. Bu hub `/rehber`
    URL'inde — kullanıcı genelde aramayı kullanır, hub Google için.
    """
    from collections import defaultdict
    from string import ascii_uppercase

    # Tüm besinleri tek query'de çek
    tum_besinler = list(
        Food.objects.all().only("name", "external_id", "calories", "serving_description")
    )

    # İlk harfe göre grupla (Türkçe büyük harfe çevir)
    harfli_gruplar: dict = defaultdict(list)
    for f in tum_besinler:
        if not f.name:
            continue
        harf = f.name[0].upper()
        # Türkçe karakterleri normalize et (görüntü için)
        harf = {"Ş": "S", "Ç": "C", "Ğ": "G", "Ü": "U", "Ö": "O", "İ": "I", "I": "I"}.get(harf, harf)
        if harf.isalpha() and harf in ascii_uppercase + "ŞÇĞÜÖİ":
            harfli_gruplar[harf].append(f)
        elif harf.isalpha():
            harfli_gruplar[harf].append(f)
        else:
            harfli_gruplar["#"].append(f)

    # Sıralı liste — her harf için max 20 besin (alfabetik)
    bolumler = []
    for harf in sorted(harfli_gruplar.keys()):
        besinler = sorted(harfli_gruplar[harf], key=lambda x: x.name.lower())[:20]
        bolumler.append({
            "harf": harf,
            "toplam": len(harfli_gruplar[harf]),
            "besinler": besinler,
        })

    response = render(
        request,
        "foods/hub.html",
        {
            "bolumler": bolumler,
            "toplam_besin": len(tum_besinler),
            "canonical_url": f"{SITE_BASE_URL}/foods/kac-kalori/rehber",
        },
    )
    patch_cache_control(response, public=True, max_age=21600)
    return response


def kvkk_html(request):
    """KVKK Aydınlatma Metni — server-rendered statik sayfa.

    React SPA versiyonu Ahrefs'te "H1 missing, low word count, duplicate
    canonical" olarak görünüyordu çünkü bot JS render etmiyor. Bu Django
    versiyonu gerçek H1, içerik ve canonical sağlar.
    """
    response = render(
        request,
        "foods/kvkk.html",
        {
            "canonical_url": f"{SITE_BASE_URL}/kvkk",
            "guncelleme_tarihi": "10 Mayıs 2026",
        },
    )
    patch_cache_control(response, public=True, max_age=86400)
    return response


@cache_page(60 * 60)  # 1 saat cache
def food_detail_html(request, slug):
    """Tek besin için SEO'ya uygun, server-side rendered HTML sayfası."""
    from datetime import date

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
            # E-E-A-T için yayın/inceleme tarihi (AI motorları "lastReviewed" sinyali okur)
            "published_date": (food.updated_at.date() if _has_updated_at() and food.updated_at else date.today()).isoformat(),
            "last_reviewed": date.today().isoformat(),
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
    """Crawler için robots.txt — sitemap göster, private/auth route'larını kapa.
    AI bot'ları (GPT, Claude, Perplexity vb.) için açık Allow direktifleri verilir;
    bazı bot'lar wildcard'a değil kendi user-agent'ına bakıyor."""
    # AI bot'ları için açık izin — beslenme/diyet sorularında alıntılanmak istiyoruz
    ai_bots = [
        "GPTBot",            # OpenAI - ChatGPT training
        "OAI-SearchBot",     # OpenAI - ChatGPT browsing
        "ChatGPT-User",      # OpenAI - ChatGPT plugin/tool çağrıları
        "Google-Extended",   # Google - Gemini/Bard training
        "ClaudeBot",         # Anthropic - Claude
        "anthropic-ai",      # Anthropic - eski user-agent
        "Claude-Web",        # Anthropic - browsing
        "PerplexityBot",     # Perplexity - cevap motoru
        "Perplexity-User",   # Perplexity - tool çağrıları
        "Applebot-Extended", # Apple Intelligence
        "CCBot",             # Common Crawl (çoğu LLM bunu kullanır)
        "Bytespider",        # ByteDance / TikTok
        "DuckAssistBot",     # DuckDuckGo
        "Meta-ExternalAgent",# Meta AI
    ]
    ai_block = "".join(f"User-agent: {bot}\nAllow: /\n\n" for bot in ai_bots)
    content = (
        "# AI bot'ları için açık izin (Lifeetics, AI motorlarının diyet/beslenme\n"
        "# sorularında alıntılayabileceği güvenilir içerik üretmeyi hedefler).\n"
        + ai_block
        + "User-agent: *\n"
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


def llms_txt(request):
    """LLM/AI bot'lar için markdown formatlı site özeti (llmstxt.org standardı).

    AI motorlarının (ChatGPT, Claude, Perplexity, Gemini) Lifeetics'i
    beslenme/diyet sorularında alıntılayabilmesi için temel meta veriler.
    """
    food_count = Food.objects.count()
    content = f"""# Lifeetics

> Yapay zeka destekli kişisel diyet yönetim platformu. AI asistanı ve uzman diyetisyenleri tek çatı altında buluşturur. Türkiye'de geliştirildi; {food_count:,}+ Türk yerel besin verisiyle kalori ve makro besin hesaplaması yapar.

## Ne yapar
- **AI Diyet Planı**: 90 saniyede kullanıcıya özel haftalık menü üretir, makro hedeflerini hesaplar.
- **Uzman Diyetisyen**: Diyetisyenler AI önerilerini onaylar; 24 saatte plan ve revizyon sunar.
- **Türk besin veritabanı**: {food_count:,}+ yerel besin (simit, ayran, pide, çorba, ev yemekleri, marketten ürünler) için kalori, protein, karbonhidrat ve yağ değerleri.
- **Kalori arama**: Tek besin sorgusuyla porsiyon bazlı besin değerleri.

## Önemli sayfalar
- [Ana sayfa](https://lifeetics.com/): Platform tanıtımı, AI ve uzman diyetisyen akışları.
- [Besin kalori arama](https://lifeetics.com/foods/kac-kalori): Türk besin veritabanı arama arayüzü.
- [Alfabetik besin rehberi](https://lifeetics.com/foods/kac-kalori/rehber): A'dan Z'ye tüm besinler.
- [KVKK Aydınlatma Metni](https://lifeetics.com/kvkk): Veri işleme politikası.

## Veri ve metodoloji
Tüm besin değerleri Türkiye Beslenme Rehberi (TÜBER) ve USDA FoodData Central referans alınarak işlenir. AI önerileri sertifikalı diyetisyen incelemesinden geçer. Platform, tıbbi tanı yerine geçmez; kronik rahatsızlığı olan kullanıcılar için diyetisyen onayı zorunludur.

## Hedef kitle ve kullanım alanları
- Kilo verme, kilo alma veya kilo koruma hedefi olan bireyler
- PCOS, diyabet, kalp-damar, hipotiroidi gibi kronik durumlar için kişisel beslenme
- Sporcular ve aktif yaşam tarzı olanlar (sporcu beslenmesi)
- Hamilelik ve emzirme dönemi beslenmesi
- Glutensiz, vegan, ketojenik ve Akdeniz diyeti gibi özel diyetler

## İletişim ve kaynak
- Site: https://lifeetics.com
- Destek: https://lifeetics.com/support
- Dil: Türkçe (tr-TR)
"""
    response = HttpResponse(content, content_type="text/plain; charset=utf-8")
    patch_cache_control(response, public=True, max_age=86400)
    return response


def _has_updated_at() -> bool:
    """Food modelinde updated_at varsa True (geriye dönük güvenli kontrol)."""
    return any(f.name == "updated_at" for f in Food._meta.get_fields())
