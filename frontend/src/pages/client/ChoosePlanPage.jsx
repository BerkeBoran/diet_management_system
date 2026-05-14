import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import dietService from '../../services/dietService';
import Icons from '../../components/landing/LandingIcons';

const PLANS = [
  {
    id: 'ai',
    icon: 'Sparkle',
    tag: 'Hızlı & Akıllı',
    title: 'AI Diyetisyen',
    subtitle: 'Yapay zeka destekli, saniyeler içinde kişisel beslenme planı',
    bullets: [
      'Anında kişiselleştirilmiş diyet planı',
      '7/24 erişim, istediğin zaman güncelle',
      'Öğün takibi ve besin analizi',
    ],
    cta: 'AI ile Başla',
    accent: true,
  },
  {
    id: 'dietician',
    icon: 'Stethoscope',
    tag: 'Uzman Rehberlik',
    title: 'Gerçek Diyetisyen',
    subtitle: 'Alanında uzman bir diyetisyenle bire bir çalış',
    bullets: [
      'Uzmanla birebir görüşme ve takip',
      'Sağlık verilerine göre özel menü',
      'Randevu ve mesajlaşma desteği',
    ],
    cta: 'Diyetisyen Bul',
    accent: false,
  },
];

export default function ChoosePlanPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.fullName?.split(' ')[0] || '';
  const [loadingMode, setLoadingMode] = useState(null);

  const selectMode = async (mode) => {
    if (loadingMode) return;
    setLoadingMode(mode);
    try {
      if (mode === 'ai') {
        const status = await subscriptionService.getStatus();
        localStorage.setItem('clientMode', 'ai');
        navigate(status.redirect_to === 'ai' ? '/client/ai-dashboard' : '/client/subscribe-ai');
      } else if (mode === 'dietician') {
        const [status, assignRes] = await Promise.all([
          subscriptionService.getStatus(),
          dietService.getAssignments().catch(() => ({ data: [] })),
        ]);
        localStorage.setItem('clientMode', 'dietician');
        if (status.redirect_to === 'dietician') {
          navigate('/client/dietician-dashboard');
        } else {
          const pending = (assignRes.data || []).find(a => a.status === 'Pending');
          navigate(pending ? '/client/dietician-dashboard' : '/client/dietitians');
        }
      } else {
        localStorage.setItem('clientMode', 'free');
        navigate('/client/diet-plans');
      }
    } catch {
      localStorage.setItem('clientMode', mode);
      if (mode === 'ai') navigate('/client/subscribe-ai');
      else if (mode === 'dietician') navigate('/client/dietitians');
      else navigate('/client/diet-plans');
    } finally {
      setLoadingMode(null);
    }
  };

  return (
    <>
      <style>{`
        .cp-shell {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          padding: 0 24px 48px;
        }
        .cp-topbar {
          display: flex;
          align-items: center;
          padding: 24px 0;
          max-width: 920px;
          width: 100%;
          margin: 0 auto;
        }
        .cp-logo {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: var(--sans);
          font-weight: 700;
          font-size: 18px;
          letter-spacing: -0.02em;
          color: var(--ink);
          text-decoration: none;
        }
        .cp-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          max-width: 920px;
          width: 100%;
          margin: 0 auto;
          gap: 36px;
          padding-top: 8px;
        }
        .cp-head {
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .cp-eyebrow {
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
        .cp-eyebrow-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--accent);
        }
        .cp-title {
          font-family: var(--serif);
          font-size: clamp(30px, 4vw, 50px);
          font-weight: 400;
          line-height: 1.08;
          letter-spacing: -0.02em;
          color: var(--ink);
        }
        .cp-sub {
          font-size: 15px;
          color: var(--ink-mute);
          max-width: 420px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .cp-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          width: 100%;
        }
        .cp-card {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 30px;
          border-radius: 20px;
          border: 1.5px solid var(--line);
          background: var(--bg);
          cursor: pointer;
          transition: border-color .25s, box-shadow .25s, transform .2s;
          text-align: left;
        }
        .cp-card:hover {
          border-color: var(--accent);
          box-shadow: 0 16px 48px -16px rgba(101,163,13,0.18);
          transform: translateY(-3px);
        }
        .cp-card.accent-card {
          background: var(--accent-tint);
          border-color: rgba(101,163,13,0.4);
        }
        .cp-card.accent-card:hover {
          border-color: var(--accent);
          box-shadow: 0 16px 48px -16px rgba(101,163,13,0.3);
        }
        .cp-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }
        .cp-card-icon {
          width: 48px; height: 48px;
          border-radius: 14px;
          background: var(--accent-soft);
          color: var(--accent-deep);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cp-card.accent-card .cp-card-icon {
          background: rgba(101,163,13,0.15);
        }
        .cp-card-tag {
          font-family: var(--mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent-deep);
          background: var(--accent-soft);
          padding: 4px 10px;
          border-radius: 999px;
        }
        .cp-card.accent-card .cp-card-tag {
          background: rgba(101,163,13,0.15);
        }
        .cp-card-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }
        .cp-card-title {
          font-family: var(--serif);
          font-size: 26px;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--ink);
          line-height: 1.15;
        }
        .cp-card-subtitle {
          font-size: 14px;
          color: var(--ink-mute);
          line-height: 1.55;
        }
        .cp-card-bullets {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 4px;
        }
        .cp-card-bullets li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: var(--ink-soft);
        }
        .cp-check {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--accent);
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .cp-card-cta {
          margin-top: 8px;
          padding: 14px 20px;
          border-radius: 999px;
          border: none;
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background .2s, box-shadow .2s, transform .15s;
          width: 100%;
        }
        .cp-card.accent-card .cp-card-cta {
          background: var(--ink);
          color: #FBFAF5;
        }
        .cp-card.accent-card .cp-card-cta:hover {
          background: var(--accent-deep);
          box-shadow: 0 8px 24px -8px rgba(77,124,15,0.5);
        }
        .cp-card:not(.accent-card) .cp-card-cta {
          background: var(--bg-warm);
          color: var(--ink);
          border: 1.5px solid var(--line);
        }
        .cp-card:not(.accent-card) .cp-card-cta:hover {
          background: var(--ink);
          color: #FBFAF5;
          border-color: var(--ink);
        }
        .cp-divider {
          display: flex;
          align-items: center;
          gap: 16px;
          width: 100%;
          color: var(--ink-mute);
          font-family: var(--mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
        }
        .cp-divider::before, .cp-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--line);
        }
        .cp-free-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 28px;
          border-radius: 999px;
          border: 1.5px solid var(--line);
          background: var(--bg);
          font-family: var(--sans);
          font-size: 14px;
          font-weight: 500;
          color: var(--ink-soft);
          cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
          text-decoration: none;
        }
        .cp-free-btn:hover {
          border-color: var(--ink-soft);
          color: var(--ink);
          background: var(--bg-warm);
        }
        .cp-free-note {
          font-size: 12px;
          color: var(--ink-mute);
          margin-top: 8px;
          text-align: center;
        }
        @media (max-width: 680px) {
          .cp-cards { grid-template-columns: 1fr; }
          .cp-title { font-size: 28px; }
        }
      `}</style>

      <div className="cp-shell">
        <div className="cp-topbar">
          <Link to="/" className="cp-logo">
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

        <main className="cp-main">
          <div className="cp-head">
            <span className="cp-eyebrow">
              <span className="cp-eyebrow-dot" />
              {firstName ? `Hoş geldin, ${firstName}!` : 'Hoş geldin!'}
            </span>
            <h1 className="cp-title">
              Nasıl devam etmek<br />istersin?
            </h1>
            <p className="cp-sub">
              Sana en uygun deneyimi seçelim. İstediğin zaman değiştirebilirsin.
            </p>
          </div>

          <div className="cp-cards">
            {PLANS.map((plan) => {
              const Ic = Icons[plan.icon];
              const mode = plan.id === 'ai' ? 'ai' : 'dietician';
              const isLoading = loadingMode === mode;
              return (
                <div
                  key={plan.id}
                  className={`cp-card${plan.accent ? ' accent-card' : ''}`}
                  onClick={() => selectMode(mode)}
                  style={{ pointerEvents: loadingMode ? 'none' : 'auto', opacity: loadingMode && !isLoading ? 0.5 : 1 }}
                >
                  <div className="cp-card-top">
                    <div className="cp-card-icon"><Ic size={22} /></div>
                    <span className="cp-card-tag">{plan.tag}</span>
                  </div>
                  <div className="cp-card-body">
                    <div className="cp-card-title">{plan.title}</div>
                    <div className="cp-card-subtitle">{plan.subtitle}</div>
                    <ul className="cp-card-bullets">
                      {plan.bullets.map((b) => (
                        <li key={b}>
                          <span className="cp-check"><Icons.Check size={10} /></span>
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    className="cp-card-cta"
                    onClick={(e) => { e.stopPropagation(); selectMode(mode); }}
                    disabled={!!loadingMode}
                  >
                    {isLoading ? <span className="spinner-sm" /> : (
                      <>{plan.cta}<Icons.ArrowRight size={14} /></>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cp-divider"><span>veya</span></div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <button className="cp-free-btn" onClick={() => selectMode('free')} disabled={!!loadingMode}>
              Diyet hizmeti almadan devam et
              <Icons.ArrowRight size={14} />
            </button>
            <p className="cp-free-note">
              Profilini, eski mesajlarını ve diyetlerini görmeye devam edebilirsin.
            </p>
          </div>
        </main>
      </div>
    </>
  );
}
