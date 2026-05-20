import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
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

// Popüler aramalar — boş durumda kullanıcıya öneri
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

// --- Sayfa ------------------------------------------------------------------
export default function FoodsCalorieGuidePage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const debounceRef = useRef(null);
  const reqIdRef = useRef(0);
  const searchInputRef = useRef(null);

  // Debounced arama (300ms)
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
    setTouched(true);
    debounceRef.current = setTimeout(async () => {
      const myReqId = ++reqIdRef.current;
      try {
        const { data } = await foodService.searchFoods(term);
        if (myReqId !== reqIdRef.current) return; // stale response — ignore
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

  const handleSelect = useCallback(async (food) => {
    setSelectedFood({ ...food, _detailLoaded: false });
    setDetailLoading(true);
    try {
      const { data } = await foodService.getFoodDetail(food.id);
      setSelectedFood({ ...data, _detailLoaded: true });
    } catch (err) {
      console.error('Detay yükleme hatası:', err);
      // Detay çekilemese bile list verisiyle göster
      setSelectedFood({ ...food, _detailLoaded: true });
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeModal = useCallback(() => setSelectedFood(null), []);

  // ESC tuşu modal'ı kapatır
  useEffect(() => {
    if (!selectedFood) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedFood, closeModal]);

  const handlePopularClick = (term) => {
    setQuery(term);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const showEmpty =
    touched && !loading && !error && results.length === 0 && query.trim().length >= 2;

  return (
    <div className="landing-page">
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

            {/* Arama kutusu */}
            <SearchBox
              query={query}
              setQuery={setQuery}
              loading={loading}
              inputRef={searchInputRef}
              resultCount={results.length}
              hasSearched={touched && query.trim().length >= 2}
            />

            {/* Popüler aramalar — sadece arama henüz yapılmamışsa göster */}
            {!touched && (
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
                  <strong style={{ color: '#1A2516' }}>"{query.trim()}"</strong> için sonuç
                  bulunamadı.
                </p>
                <p style={{ fontSize: 13 }}>Farklı bir kelime dene veya yazımı kontrol et.</p>
              </div>
            )}

            {/* Sonuçlar */}
            {!error && results.length > 0 && (
              <ResultsGrid results={results} onSelect={handleSelect} />
            )}
          </div>
        </section>

        {/* Yardımcı kartlar — sadece arama yapılmadığında göster */}
        {!touched && (
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

        {/* CTA */}
        <section
          className="section-tight"
          style={{ background: '#1A2516', color: '#FBFAF5', paddingTop: 64, paddingBottom: 80 }}
        >
          <div
            className="container"
            style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}
          >
            <h2
              className="serif"
              style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.15 }}
            >
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

      {/* Detay modal */}
      {selectedFood && (
        <FoodDetailModal food={selectedFood} loading={detailLoading} onClose={closeModal} />
      )}
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

function ResultsGrid({ results, onSelect }) {
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
        <FoodCard key={food.id} food={food} onClick={() => onSelect(food)} />
      ))}
    </div>
  );
}

function FoodCard({ food, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: '#fff',
        border: '1px solid var(--line)',
        borderRadius: 16,
        padding: 20,
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
        fontFamily: 'inherit',
        color: 'inherit',
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
    </button>
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

function FoodDetailModal({ food, loading, onClose }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(26, 37, 22, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        animation: 'modal-fade 0.18s ease-out',
      }}
    >
      <style>{`
        @keyframes modal-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modal-pop { from { opacity: 0; transform: translateY(8px) scale(0.98) } to { opacity: 1; transform: none } }
      `}</style>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 24,
          maxWidth: 540,
          width: '100%',
          maxHeight: '88vh',
          overflow: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          animation: 'modal-pop 0.22s ease-out',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--line)',
            background: '#fff',
            color: '#1A2516',
            fontSize: 20,
            lineHeight: 1,
            cursor: 'pointer',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          ×
        </button>

        <div style={{ padding: '36px 32px 32px' }}>
          <span
            style={{
              fontFamily: 'var(--mono)',
              fontSize: 11,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: '#4D7C0F',
              fontWeight: 600,
            }}
          >
            {food.serving_description || '1 porsiyon'}
          </span>
          <h2
            className="serif"
            style={{
              fontSize: 'clamp(24px, 3vw, 32px)',
              lineHeight: 1.2,
              color: '#1A2516',
              marginTop: 8,
            }}
          >
            {food.name}
          </h2>

          {/* Kalori büyük göstergesi */}
          <div
            style={{
              marginTop: 28,
              padding: 24,
              borderRadius: 18,
              background: '#F7FBE8',
              border: '1px solid #DDEBA5',
              display: 'flex',
              alignItems: 'baseline',
              gap: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 56,
                fontWeight: 700,
                color: '#1A2516',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {fmt(food.calories)}
            </span>
            <span style={{ fontSize: 18, color: '#4D7C0F', fontWeight: 600 }}>kcal</span>
          </div>

          {/* Makro grid */}
          <div
            style={{
              marginTop: 20,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            <MacroBlock label="Protein" value={fmt(food.protein, ' g')} />
            <MacroBlock label="Karbonhidrat" value={fmt(food.carbs, ' g')} />
            <MacroBlock label="Yağ" value={fmt(food.fat, ' g')} />
          </div>

          {/* Detay (retrieve) — opsiyonel ek alanlar */}
          {food._detailLoaded && <DetailExtras food={food} />}
          {loading && (
            <p
              style={{
                marginTop: 16,
                fontSize: 13,
                color: '#6B7363',
                fontFamily: 'var(--mono)',
                letterSpacing: '0.08em',
              }}
            >
              Detaylar yükleniyor...
            </p>
          )}

          <p
            style={{
              marginTop: 28,
              padding: '14px 16px',
              borderRadius: 12,
              background: '#FBFAF5',
              border: '1px solid var(--line-soft)',
              fontSize: 13,
              lineHeight: 1.55,
              color: '#6B7363',
            }}
          >
            Değerler kaynaklarımıza dayalı ortalama tahminlerdir. Marka, pişirme yöntemi ve porsiyon
            boyutuna göre farklılık gösterebilir. Tıbbi kararlarda mutlaka uzmana danış.
          </p>
        </div>
      </div>
    </div>
  );
}

function MacroBlock({ label, value }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 14,
        background: '#fff',
        border: '1px solid var(--line)',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          display: 'block',
          fontFamily: 'var(--mono)',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: '#6B7363',
          textTransform: 'uppercase',
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'var(--mono)',
          fontSize: 18,
          fontWeight: 600,
          color: '#1A2516',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </span>
    </div>
  );
}

function DetailExtras({ food }) {
  // FoodDetailSerializer ek alanları: saturated_fat, sugar, sodium
  const rows = [
    { label: 'Doymuş yağ', value: food.saturated_fat, unit: 'g' },
    { label: 'Şeker', value: food.sugar, unit: 'g' },
    { label: 'Sodyum', value: food.sodium, unit: 'mg' },
  ].filter((r) => r.value !== null && r.value !== undefined && Number(r.value) > 0);

  if (rows.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 22,
        background: '#FBFAF5',
        border: '1px solid var(--line-soft)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '10px 16px',
          background: '#F7FBE8',
          fontFamily: 'var(--mono)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#4D7C0F',
          fontWeight: 600,
        }}
      >
        Ek değerler
      </div>
      {rows.map((r, i) => (
        <div
          key={r.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderTop: i === 0 ? 'none' : '1px solid var(--line-soft)',
            fontSize: 14,
          }}
        >
          <span style={{ color: '#3F4A38' }}>{r.label}</span>
          <span
            style={{ color: '#1A2516', fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
          >
            {fmt(r.value, ` ${r.unit}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
