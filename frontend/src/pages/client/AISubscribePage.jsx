import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import Icons from '../../components/landing/LandingIcons';

const PLANS = [
  {
    id: '1M',
    label: '1 Ay',
    price: 149,
    perMonth: 149,
    savings: null,
    popular: false,
  },
  {
    id: '6M',
    label: '6 Ay',
    price: 749,
    perMonth: 125,
    savings: '%16 tasarruf',
    popular: true,
  },
  {
    id: '12M',
    label: '12 Ay',
    price: 1299,
    perMonth: 108,
    savings: '%27 tasarruf',
    popular: false,
  },
];

const FEATURES = [
  'Sınırsız AI diyet planı oluşturma',
  '7/24 erişim, istediğin zaman güncelle',
  'Öğün fotoğrafı ile kalori analizi',
  'Kişisel sağlık verilerine göre özelleştirme',
  'Haftalık & günlük menü planlaması',
];

export default function AISubscribePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutRef = useRef(null);

  const [selected, setSelected] = useState('6M');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkoutContent, setCheckoutContent] = useState(null);

  const selectedPlan = PLANS.find(p => p.id === selected);

  // Iyzico callback'ten dönen hata mesajını göster
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') === 'failed') {
      setError('Ödeme başarısız oldu. Lütfen tekrar deneyin.');
    }
  }, [location.search]);

  // Checkout form HTML'i DOM'a enjekte et ve script'leri çalıştır
  useEffect(() => {
    if (!checkoutContent || !checkoutRef.current) return;
    const container = checkoutRef.current;
    container.innerHTML = checkoutContent;
    Array.from(container.querySelectorAll('script')).forEach((old) => {
      const s = document.createElement('script');
      Array.from(old.attributes).forEach((a) => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.parentNode.replaceChild(s, old);
    });
  }, [checkoutContent]);

  const handleSubscribe = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await paymentService.initiatePayment(selected);
      setCheckoutContent(data.checkoutFormContent);
    } catch (err) {
      const d = err.response?.data;
      setError(
        typeof d === 'string'
          ? d
          : d?.detail || 'Ödeme başlatılamadı. Lütfen tekrar deneyin.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .sub-shell {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding: 0 24px 48px;
        }
        .sub-topbar {
          display: flex;
          align-items: center;
          padding: 24px 0;
          max-width: 960px;
          width: 100%;
          margin: 0 auto;
          gap: 16px;
        }
        .sub-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: var(--ink-mute);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 8px;
          transition: background .2s, color .2s;
        }
        .sub-back:hover { background: var(--bg-warm); color: var(--ink); }
        .sub-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--sans);
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: var(--ink);
          text-decoration: none;
          margin-right: auto;
        }
        .sub-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          max-width: 960px;
          width: 100%;
          margin: 0 auto;
          gap: 32px;
          padding-top: 8px;
        }
        .sub-head {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .sub-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--accent-deep);
          justify-content: center;
        }
        .sub-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .sub-title {
          font-family: var(--serif);
          font-size: clamp(28px, 4vw, 44px);
          font-weight: 400;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .sub-subtitle {
          font-size: 15px;
          color: var(--ink-mute);
          max-width: 400px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .sub-body {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 24px;
          width: 100%;
        }
        .sub-plans {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .sub-plan {
          position: relative;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 20px 22px;
          border-radius: 16px;
          border: 2px solid var(--line);
          background: var(--bg);
          cursor: pointer;
          transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .sub-plan:hover { border-color: var(--accent); }
        .sub-plan.selected {
          border-color: var(--accent);
          background: var(--accent-tint);
          box-shadow: 0 8px 32px -12px rgba(101,163,13,0.2);
        }
        .sub-plan-radio {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid var(--line);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: border-color .2s;
        }
        .sub-plan.selected .sub-plan-radio {
          border-color: var(--accent);
        }
        .sub-plan-radio-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0;
          transition: opacity .2s;
        }
        .sub-plan.selected .sub-plan-radio-dot { opacity: 1; }
        .sub-plan-label {
          font-family: var(--sans);
          font-size: 16px;
          font-weight: 700;
          color: var(--ink);
          flex: 1;
        }
        .sub-plan-per {
          font-size: 12px;
          color: var(--ink-mute);
          margin-top: 2px;
          font-weight: 400;
        }
        .sub-plan-right {
          text-align: right;
        }
        .sub-plan-price {
          font-family: var(--mono);
          font-size: 20px;
          font-weight: 700;
          color: var(--ink);
        }
        .sub-plan-price span {
          font-size: 13px;
          font-weight: 400;
          color: var(--ink-mute);
        }
        .sub-plan-savings {
          font-size: 11px;
          font-weight: 600;
          color: var(--accent-deep);
          background: var(--accent-soft);
          padding: 2px 8px;
          border-radius: 999px;
          margin-top: 4px;
          display: inline-block;
        }
        .sub-plan-badge {
          position: absolute;
          top: -10px;
          left: 22px;
          font-family: var(--mono);
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #fff;
          background: var(--accent);
          padding: 3px 10px;
          border-radius: 999px;
        }
        .sub-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .sub-summary-card {
          background: var(--bg-warm, #F9F6EF);
          border: 1.5px solid var(--line);
          border-radius: 20px;
          padding: 24px;
        }
        .sub-summary-title {
          font-family: var(--serif);
          font-size: 18px;
          font-weight: 400;
          color: var(--ink);
          margin: 0 0 16px;
        }
        .sub-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .sub-features li {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13.5px;
          color: var(--ink-soft);
          line-height: 1.4;
        }
        .sub-check {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .sub-divider {
          height: 1px;
          background: var(--line);
          margin: 16px 0;
        }
        .sub-total-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }
        .sub-total-label {
          font-size: 13px;
          color: var(--ink-mute);
        }
        .sub-total-price {
          font-family: var(--mono);
          font-size: 22px;
          font-weight: 700;
          color: var(--ink);
        }
        .sub-total-note {
          font-size: 11px;
          color: var(--ink-mute);
          text-align: right;
        }
        .sub-cta {
          width: 100%;
          padding: 16px;
          border-radius: 999px;
          border: none;
          background: var(--ink);
          color: #FBFAF5;
          font-family: var(--sans);
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .2s, transform .15s;
          margin-top: 16px;
        }
        .sub-cta:hover:not(:disabled) { background: var(--accent-deep); transform: translateY(-1px); }
        .sub-cta:disabled { opacity: 0.6; cursor: not-allowed; }
        .sub-payment-note {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11.5px;
          color: var(--ink-mute);
          justify-content: center;
          margin-top: 10px;
        }
        .sub-error {
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 13px;
          color: #DC2626;
        }
        @media (max-width: 768px) {
          .sub-body { grid-template-columns: 1fr; }
          .sub-sidebar { order: -1; }
        }
      `}</style>

      <div className="sub-shell">
        <div className="sub-topbar">
          <Link to="/client/choose-plan" className="sub-back">
            <Icons.ArrowRight size={13} style={{ transform: 'rotate(180deg)' }} />
            Geri
          </Link>
          <Link to="/" className="sub-logo">
            <span style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 700,
                fontSize: '38px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
              }}>LIFEETICS</span>
          </Link>
        </div>

        <main className="sub-main">
          <div className="sub-head">
            <span className="sub-eyebrow">
              <span className="sub-eyebrow-dot" />
              AI DİYETİSYEN
            </span>
            <h1 className="sub-title">
              Abonelik Planı Seç
            </h1>
            <p className="sub-subtitle">
              Yapay zeka destekli beslenme asistanına erişmek için bir plan seç.
            </p>
          </div>

          <div className="sub-body">
            <div>
              <div className="sub-plans">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`sub-plan${selected === plan.id ? ' selected' : ''}`}
                    onClick={() => setSelected(plan.id)}
                  >
                    {plan.popular && (
                      <div className="sub-plan-badge">En Popüler</div>
                    )}
                    <div className="sub-plan-radio">
                      <div className="sub-plan-radio-dot" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="sub-plan-label">{plan.label}</div>
                      <div className="sub-plan-per">
                        Aylık {plan.perMonth} ₺
                      </div>
                    </div>
                    <div className="sub-plan-right">
                      <div className="sub-plan-price">
                        {plan.price} <span>₺</span>
                      </div>
                      {plan.savings && (
                        <div className="sub-plan-savings">{plan.savings}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sub-sidebar">
              <div className="sub-summary-card">
                <p className="sub-summary-title">Neler dahil?</p>
                <ul className="sub-features">
                  {FEATURES.map((f) => (
                    <li key={f}>
                      <span className="sub-check"><Icons.Check size={10} /></span>
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="sub-divider" />

                <div className="sub-total-row">
                  <span className="sub-total-label">
                    {selectedPlan?.label} abonelik
                  </span>
                </div>
                <div className="sub-total-row">
                  <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>Toplam</span>
                  <span className="sub-total-price">{selectedPlan?.price} ₺</span>
                </div>
                <div className="sub-total-note">KDV dahil, tek seferlik ödeme</div>

                {error && <div className="sub-error" style={{ marginTop: 14 }}>{error}</div>}

                <button
                  className="sub-cta"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="spinner-sm" />
                  ) : (
                    <>
                      <Icons.Sparkle size={15} />
                      Abone Ol — {selectedPlan?.price} ₺
                    </>
                  )}
                </button>

                <div className="sub-payment-note">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Güvenli ödeme · Iyzico ile korumalı
                </div>
              </div>

              <div style={{
                background: 'var(--bg-warm, #F9F6EF)',
                border: '1px solid var(--line)',
                borderRadius: 14,
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <div style={{ fontSize: 12.5, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
                  İstediğin zaman iptal edebilirsin. Abonelik süren dolduğunda otomatik yenileme yapılmaz.
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Iyzico checkout form buraya enjekte edilir, Iyzico kendi overlay'ini açar */}
      <div ref={checkoutRef} />
    </>
  );
}
