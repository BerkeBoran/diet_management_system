import { Link } from 'react-router-dom';
import '../../styles/landing.css';
import LandingNavbar from '../../components/landing/LandingNavbar';
import LandingFooter from '../../components/landing/LandingFooter';
import Icons from '../../components/landing/LandingIcons';

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

const EXAMPLES = [
  { food: 'Haşlanmış yumurta (1 adet, ~50 g)', kcal: '~78', note: 'Pişirme yöntemine göre değişir' },
  { food: 'Tam buğday ekmeği (1 dilim, ~30 g)', kcal: '~75', note: 'Markaya göre farklılık gösterebilir' },
  { food: 'Çiğ badem (1 avuç, ~28 g)', kcal: '~160', note: 'Yağ içeriği yüksektir' },
  { food: 'Yoğurt (1 kase, ~200 g)', kcal: '~120–180', note: 'yağlı / yağsız tipine bağlı' },
];

export default function FoodsCalorieGuidePage() {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <main style={{ paddingTop: 96 }}>
        <section className="section-tight" style={{ paddingBottom: 48 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 40 }}>
              <span className="eyebrow">
                <span className="eyebrow-dot" aria-hidden />
                Besin rehberi
              </span>
              <h1 className="display serif">
                Kaç <em>kalori?</em>
              </h1>
              <p className="lede">
                Günlük enerji ihtiyacını ve öğünlerini planlarken kalori ve porsiyonları doğru okumak, hedefe
                ulaşmanın en pratik yollarından biridir. Bu sayfa genel bilgilendirme içindir; kişisel tanı ve
                tedavi için mutlaka bir uzmanla görüş.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
                <span className="lp-tag">
                  <Icons.Sparkle size={14} aria-hidden />
                  Besin veritabanı odaklı
                </span>
                <span className="lp-tag">Porsiyon bilinci</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section-tight" style={{ background: 'var(--bg-warm)', paddingTop: 56, paddingBottom: 72 }}>
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
                  <h2 className="serif" style={{ fontSize: '1.35rem', marginBottom: 14, color: '#1A2516' }}>
                    {c.title}
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.65, color: '#3F4A38' }}>{c.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight" style={{ paddingTop: 72, paddingBottom: 72 }}>
          <div className="container">
            <div className="section-head" style={{ marginBottom: 36 }}>
              <h2 className="display serif" style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
                Yaklaşık <em>referanslar</em>
              </h2>
              <p className="lede">
                Aşağıdaki değerler yalnızca fikir vermek içindir; gerçek ürün etiketleri ve tartı en doğru kaynaktır.
              </p>
            </div>
            <div
              style={{
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid var(--line)',
                background: '#fff',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr 0.5fr 1fr',
                  gap: 0,
                  padding: '14px 20px',
                  background: '#F7FBE8',
                  fontFamily: 'var(--mono)',
                  fontSize: 11,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#4D7C0F',
                  fontWeight: 600,
                }}
              >
                <span>Besin</span>
                <span style={{ textAlign: 'right' }}>kcal</span>
                <span>Not</span>
              </div>
              {EXAMPLES.map((row, i) => (
                <div
                  key={row.food}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.4fr 0.5fr 1fr',
                    gap: 12,
                    padding: '16px 20px',
                    borderTop: '1px solid var(--line-soft)',
                    fontSize: 14,
                    color: '#1A2516',
                    alignItems: 'center',
                    background: i % 2 === 0 ? '#fff' : '#FBFAF5',
                  }}
                >
                  <span style={{ fontWeight: 500 }}>{row.food}</span>
                  <span style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: '#4D7C0F', fontWeight: 600 }}>
                    {row.kcal}
                  </span>
                  <span style={{ color: '#6B7363', fontSize: 13 }}>{row.note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-tight" style={{ background: '#1A2516', color: '#FBFAF5', paddingTop: 64, paddingBottom: 80 }}>
          <div className="container" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 720 }}>
            <h2 className="serif" style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', lineHeight: 1.15 }}>
              Planına <em style={{ color: '#BEF264' }}>pratik</em> başla
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.65, opacity: 0.9, maxWidth: 560 }}>
              Lifeetics ile öğünlerini kaydedebilir, AI destekli analiz ve diyetisyen görüşünü bir arada kullanabilirsin.
              Besin tarafında tutarlı porsiyon ve makro takibi, kalori hedefini görünür kılar.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link to="/register/client" className="btn btn-accent">
                Ücretsiz dene
                <Icons.ArrowRight size={16} />
              </Link>
              <Link
                to="/"
                className="btn btn-ghost"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
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
