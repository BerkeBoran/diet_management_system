import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import '../../styles/landing.css';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';
import Icons from '../../components/landing/LandingIcons';
import foodService from '../../services/foodService';

// --- Yardımcılar -----------------------------------------------------------
const fmt = (val, suffix = '') => {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return '—';
  const n = Number(val);
  if (n === 0) return `0${suffix}`;
  const rounded = n >= 100 ? Math.round(n) : Number(n.toFixed(n < 10 ? 2 : 1));
  return `${rounded}${suffix}`;
};

// URL slug normalize: "Lahmacun Çorbası" → "lahmacun-corbasi" gibi (URL için)
const queryToUrlSegment = (q) => encodeURIComponent(q.trim().toLowerCase());

const POPULAR_TERMS = [
  'lahmacun', 'pizza', 'döner', 'hamburger', 'elma', 'muz',
  'tavuk göğüs', 'pilav', 'mercimek çorbası', 'baklava', 'simit', 'yoğurt',
];

const CARDS = [
  {
    title: 'Kilokalori (kcal) nedir?',
    body:
      'Kalori, besinlerin enerji taşıma biçimidir. Günlük konuşmada “kalori” derken çoğu zaman kilokalori (kcal) kastedilir. Diyet planında gördüğün rakamlar; protein, yağ ve karbonhidratın enerji katkısının toplamıyla ilişkilidir.',
  },
  {
    title: 'Porsiyon neden kritik?',
    body:
      'Aynı yemeğin “bir kase” ile “bir kaşık” arasında kalori farkı çok büyür. Lifeetics besin tarafında değerleri tek tip 100 gram yerine, kaynakta tanımlı doğal porsiyon (ör. 1 dilim, 1 porsiyon) üzerinden sunmayı hedefler; böylece günlük kayıt daha gerçekçi olur.',
  },
  {
    title: 'Hedef kalori nasıl seçilir?',
    body:
      'Yaş, kilo, boy, aktivite ve sağlık duranına göre günlük enerji ihtiyacı değişir. Uygulamada hedefini belirlerken sabırlı ol; aşırı kısıtlayıcı rakamlar sürdürülebilir olmayabilir. Kalıcı değişim, makul açık ve dengeli makrolarla gelir.',
  },
];

export default function FoodsCalorieGuidePage() {
  const navigate = useNavigate();
  const { query: urlQuery } = useParams();
  const initialQuery = urlQuery ? decodeURIComponent(urlQuery) : '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);
  const urlSyncRef = useRef(null);
  const reqIdRef = useRef(0);
  const searchInputRef = useRef(null);

  // URL'den gelen query değişirse state'i senkronla
  useEffect(() => {
    if (urlQuery !== undefined) {
      const decoded = decodeURIComponent(urlQuery);
      if (decoded !== query) setQuery(decoded);
    }
    // urlQuery undefined olursa (sadece /foods/kac-kalori) input'u boşalt
    if (urlQuery === undefined && query) {
      // Kullanıcı manuel boşaltmış olabilir, dokunma
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // Arama (debounced 300ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const term = query.trim();
    if (term.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const myReqId = ++reqIdRef.current;
      try {
        const { data } = await foodService.searchFoods(term);
        if (myReqId !== reqIdRef.current) return;
        setResults(Array.isArray(data) ? data : data?.results || []);
        setError(null);
      } catch (err) {
        if (myReqId !== reqIdRef.current) return;
        console.error('Arama hatası:', err);
        setError('Arama sırasında bir sorun oluştu. Lütfen tekrar dene.');
        setResults([]);
      } finally {
        if (myReqId === reqIdRef.current) setLoading(false);
      }
    }, 300);
    return () => debounceRef.current && clearTimeout(debounceRef.current);
  }, [query]);

  // URL'i senkronize et (debounced 600ms — yazarken her harfte history kirlenmesin)
  useEffect(() => {
    if (urlSyncRef.current) clearTimeout(urlSyncRef.current);
    const term = query.trim();
    urlSyncRef.current = setTimeout(() => {
      const targetPath = term.length >= 2
        ? `/foods/kac-kalori/arama/${queryToUrlSegment(term)}`
        : '/foods/kac-kalori';
      if (window.location.pathname !== targetPath) {
        navigate(targetPath, { replace: true });
      }
    }, 600);
    return () => urlSyncRef.current && clearTimeout(urlSyncRef.current);
  }, [query, navigate]);

  const handlePopularClick = (term) => {
    setQuery(term);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const showEmpty =
    query.trim().length >= 2 && !loading && !error && results.length === 0;
  const hasSearched = query.trim().length >= 2;

  // Dinamik SEO başlık + açıklama: arama yapılınca query'ye göre değişir
  const term = query.trim();
  const seoTitle = term
    ? `${term} kaç kalori? — Besin değerleri | Lifeetics`
    : 'Kaç kalori? — Türk mutfağı besin değerleri arama | Lifeetics';
  const seoDescription = term
    ? `"${term}" için kalori, protein, karbonhidrat ve yağ değerleri. Türk mutfağı ve binlerce besinde arama yap, Lifeetics besin rehberi.`
    : 'Lahmacundan baklavaya, ev yapımından restoran zincirlerine kadar binlerce besinde kalori ve makro değerlerini ara. Lifeetics besin rehberi.';
  const seoCanonical = term
    ? `https://lifeetics.com/foods/kac-kalori/arama/${encodeURIComponent(term.toLowerCase())}`
    : 'https://lifeetics.com/foods/kac-kalori';

  return (
    <div className="landing-page">
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={seoCanonical} />
        <meta property="og:title" content={seoTitle} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={seoCanonical} />
        {/* Arama sonuç sayfaları index'lenmesin (thin content) */}
        {term && <meta name="robots" content="noindex, follow" />}
      </Helmet>
      <LandingNavbar />
      <main style={{ paddingTop: 96 }}>
        {/* HERO + ARAMA */}
        <section className="section-tight" style={{ paddingBottom: 32 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 32 }}>
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden />
                Besin rehberi
              </span>
              <h1 className="display serif">
                Kaç <em>kalori?</em>
              </h1>
              <p className="lede">
                Türkiye'de tüketilen yemekler, atıştırmalıklar, meyve ve sebzeler için kalori ve
                makro değerlerini ara. Lahmacundan baklavaya, ev yapımından restoran zincirlerine
                kadar binlerce besinde arama yap.
              </p>
            </div>

            <SearchBox
              query={query}
              setQuery={setQuery}
              loading={loading}
              inputRef={searchInputRef}
              resultCount={results.length}
              hasSearched={hasSearched}
            />

            {!hasSearched && (
              <div style={{ marginTop: 28 }}>
                <p
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 11,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#6B7363',
                    marginBottom: 12,
                  }}
                >
                  Popüler aramalar
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {POPULAR_TERMS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handlePopularClick(t)}
                      className="lp-tag"
                      style={{ cursor: 'pointer', border: '1px solid var(--line)' }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  marginTop: 28,
                  padding: '14px 18px',
                  background: '#FFF4E5',
                  border: '1px solid #F7C97B',
                  borderRadius: 12,
                  color: '#7A4A00',
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            {showEmpty && (
              <div
                style={{
                  marginTop: 28,
                  padding: '32px 20px',
                  background: '#FBFAF5',
                  border: '1px dashed var(--line)',
                  borderRadius: 16,
                  textAlign: 'center',
                  color: '#6B7363',
                }}
              >
                <p style={{ fontSize: 15, marginBottom: 4 }}>
                  <strong style={{ color: '#1A2516' }}>"{query.trim()}"</strong> için sonuç bulunamadı.
                </p>
                <p style={{ fontSize: 13 }}>Farklı bir kelime dene veya yazımı kontrol et.</p>
              </div>
            )}

            {!error && results.length > 0 && <ResultsGrid results={results} />}
          </div>
        </section>

        {!hasSearched && (
          <section
            className="section-tight"
            style={{ background: 'var(--bg-warm)', paddingTop: 56, paddingBottom: 72 }}
          >
            <div className="container">
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 24,
                }}
              >
                {CARDS.map((c) => (
                  <article
                    key={c.title}
                    style={{
                      background: '#fff',
                      borderRadius: 20,
                      padding: 28,
                      border: '1px solid var(--line)',
                      boxShadow: '0 8px 28px rgba(26,37,22,0.06)',
                    }}
                  >
                    <h2
                      className="serif"
                      style={{ fontSize: '1.35rem', marginBottom: 14, color: '#1A2516' }}
                    >
                      {c.title}
                    </h2>
                    <p style={{ fontSize: 15, lineHeight: 1.65, color: '#3F4A38' }}>{c.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        <section
          className="section-tight"
          style={{ background: '#1A2516', color: '#FBFAF5', paddingTop: 64, paddingBottom: 80 }}
        >
          <div
            className="container"
            style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}
          >
            <h2 className="serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.15 }}>
              Planına <em style={{ color: '#BEF264' }}>pratik</em> başla
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, opacity: 0.9, maxWidth: 560 }}>
              Lifeetics ile öğünlerini kaydedebilir, AI destekli analiz ve diyetisyen görüşünü bir
              arada kullanabilirsin. Besin tarafında tutarlı porsiyon ve makro takibi, kalori
              hedefini görünür kılar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/register/client" className="btn btn-accent">
                Ücretsiz dene
                <Icons.ArrowRight size={16} />
              </Link>
              <Link
                to="/"
                className="btn btn-ghost"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.2)',
                }}
              >
                Ana sayfaya dön
              </Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}

// --- Alt bileşenler --------------------------------------------------------

function SearchBox({ query, setQuery, loading, inputRef, resultCount, hasSearched }) {
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: '#fff',
          border: '1px solid var(--line)',
          borderRadius: 16,
          padding: '6px 6px 6px 20px',
          boxShadow: '0 6px 20px rgba(26,37,22,0.06)',
        }}
      >
        <span style={{ fontSize: 18 }} aria-hidden>
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Lahmacun, elma, tavuk göğüs..."
          autoComplete="off"
          spellCheck={false}
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            fontSize: 16,
            color: '#1A2516',
            padding: '14px 0',
            fontFamily: 'inherit',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Temizle"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6B7363',
              cursor: 'pointer',
              padding: 8,
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
        <div
          aria-hidden
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#1A2516',
            color: '#BEF264',
            display: 'grid',
            placeItems: 'center',
            fontSize: 14,
            fontWeight: 600,
            fontFamily: 'var(--mono)',
          }}
        >
          {loading ? '...' : 'Ara'}
        </div>
      </div>
      {hasSearched && !loading && (
        <p
          style={{
            marginTop: 12,
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#4D7C0F',
          }}
        >
          {resultCount} sonuç bulundu
        </p>
      )}
    </div>
  );
}

function ResultsGrid({ results }) {
  return (
    <div
      style={{
        marginTop: 28,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {results.map((food) => (
        <FoodCard key={food.id} food={food} />
      ))}
    </div>
  );
}

function FoodCard({ food }) {
  // Slug yoksa fallback: id ile detay sayfası (Django bunu da yakalayamaz ama olmamalı)
  const slug = food.external_id || `${food.id}`;
  const href = `/foods/kac-kalori/${slug}`;
  return (
    <a
      href={href}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 20,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 12px 32px rgba(26,37,22,0.10)';
        e.currentTarget.style.borderColor = '#BEF264';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'var(--line)';
      }}
    >
      <div>
        <h3
          className="serif"
          style={{
            fontSize: '1.05rem',
            lineHeight: 1.3,
            color: '#1A2516',
            marginBottom: 6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {food.name}
        </h3>
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#6B7363',
          }}
        >
          {food.serving_description || '1 porsiyon'}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          paddingTop: 8,
          borderTop: '1px solid var(--line-soft)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 28,
            fontWeight: 600,
            color: '#4D7C0F',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {fmt(food.calories)}
        </span>
        <span style={{ fontSize: 13, color: '#6B7363' }}>kcal</span>
      </div>

      <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#3F4A38' }}>
        <MacroBadge label="P" value={fmt(food.protein, 'g')} />
        <MacroBadge label="K" value={fmt(food.carbs, 'g')} />
        <MacroBadge label="Y" value={fmt(food.fat, 'g')} />
      </div>
    </a>
  );
}

function MacroBadge({ label, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.1em',
          color: '#6B7363',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          color: '#1A2516',
          fontWeight: 500,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}
