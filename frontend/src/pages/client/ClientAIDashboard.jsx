import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import subscriptionService from '../../services/subscriptionService';
import dietService from '../../services/dietService';
import Icons from '../../components/landing/LandingIcons';

const CSS = `
.aid-hello { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.aid-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #65A30D; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.aid-eyebrow-dot { width: 5px; height: 5px; background: #65A30D; border-radius: 50%; display: inline-block; animation: aidPulse 1.5s infinite; }
@keyframes aidPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(1.4)} }
.aid-h1 { font-family: 'Instrument Serif', serif; font-size: 30px; color: #1A1A1A; line-height: 1.15; margin: 0 0 6px; }
.aid-sub { font-size: 14px; color: #6B7280; margin: 0; }
.aid-hello-actions { display: flex; gap: 10px; flex-shrink: 0; }

.aid-status-bar {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 20px; border-radius: 14px;
  background: #F0FDF4; border: 1px solid #BBF7D0;
  margin-bottom: 24px; flex-wrap: wrap;
}
.aid-status-bar.inactive { background: #FFF7ED; border-color: #FDE68A; }
.aid-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #16A34A; flex-shrink: 0; }
.aid-status-bar.inactive .aid-status-dot { background: #D97706; }
.aid-status-text { font-size: 13.5px; font-weight: 600; color: #14532D; flex: 1; }
.aid-status-bar.inactive .aid-status-text { color: #92400E; }
.aid-status-meta { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #6B7280; }

.aid-ctas { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
.aid-cta-card {
  padding: 28px; border-radius: 20px; cursor: pointer; border: none;
  display: flex; flex-direction: column; gap: 12px; text-align: left;
  transition: transform .2s, box-shadow .2s; text-decoration: none;
}
.aid-cta-card:hover { transform: translateY(-2px); box-shadow: 0 12px 32px -12px rgba(0,0,0,0.15); }
.aid-cta-card.primary { background: linear-gradient(135deg, #1A1A1A 0%, #2D4A1E 100%); }
.aid-cta-card.secondary { background: white; border: 1.5px solid #E5E0D5; }
.aid-cta-icon {
  width: 40px; height: 40px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.aid-cta-card.primary .aid-cta-icon { background: rgba(101,163,13,0.2); color: #65A30D; }
.aid-cta-card.secondary .aid-cta-icon { background: #F0FDF4; color: #65A30D; }
.aid-cta-title { font-family: 'Instrument Serif', serif; font-size: 20px; font-weight: 400; line-height: 1.2; }
.aid-cta-card.primary .aid-cta-title { color: #FBFAF5; }
.aid-cta-card.secondary .aid-cta-title { color: #1A1A1A; }
.aid-cta-desc { font-size: 13px; line-height: 1.55; }
.aid-cta-card.primary .aid-cta-desc { color: rgba(251,250,245,0.65); }
.aid-cta-card.secondary .aid-cta-desc { color: #6B7280; }
.aid-cta-arrow { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; margin-top: 4px; }
.aid-cta-card.primary .aid-cta-arrow { color: #65A30D; }
.aid-cta-card.secondary .aid-cta-arrow { color: #1A1A1A; }

.aid-section-title { font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 14px; }
.aid-plans { display: flex; flex-direction: column; gap: 10px; }
.aid-plan-row {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: 14px;
  background: white; border: 1px solid #E5E0D5;
}
.aid-plan-icon { width: 36px; height: 36px; border-radius: 10px; background: #F0FDF4; color: #65A30D; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.aid-plan-info { flex: 1; }
.aid-plan-name { font-size: 13.5px; font-weight: 600; color: #1A1A1A; }
.aid-plan-date { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9CA3AF; margin-top: 2px; }
.aid-plan-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.aid-plan-status.active { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
.aid-plan-status.old { background: #F9FAFB; color: #9CA3AF; border: 1px solid #E5E7EB; }
.aid-empty { text-align: center; padding: 32px; background: white; border: 1px solid #E5E0D5; border-radius: 16px; }
.aid-empty p { font-size: 13px; color: #9CA3AF; margin: 0 0 14px; }

.aid-switch { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6B7280; }
.aid-switch a { color: #65A30D; font-weight: 600; text-decoration: none; }
.aid-switch a:hover { text-decoration: underline; }

.aid-payment-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 20px; border-radius: 14px; margin-bottom: 20px; flex-wrap: wrap;
}
.aid-payment-banner.success { background: #F0FDF4; border: 1px solid #BBF7D0; }
.aid-payment-banner.failed  { background: #FEF2F2; border: 1px solid #FECACA; }
.aid-payment-banner-text { font-size: 13.5px; font-weight: 600; }
.aid-payment-banner.success .aid-payment-banner-text { color: #14532D; }
.aid-payment-banner.failed  .aid-payment-banner-text { color: #DC2626; }
.aid-payment-banner-close {
  background: none; border: none; cursor: pointer; padding: 4px;
  color: inherit; opacity: 0.5; font-size: 16px; line-height: 1;
}

@media(max-width:768px){ .aid-ctas{grid-template-columns:1fr;} .aid-hello{flex-direction:column;} }
`;

export default function ClientAIDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentBanner, setPaymentBanner] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const result = params.get('payment');
    if (result === 'success') {
      setPaymentBanner('success');
      window.history.replaceState({}, '', location.pathname);
    } else if (result === 'failed') {
      setPaymentBanner('failed');
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.search, location.pathname]);

  const firstName = user?.fullName?.split(' ')[0] || 'Danışan';

  useEffect(() => {
    Promise.all([
      subscriptionService.getStatus().catch(() => null),
      dietService.getPlans().catch(() => ({ data: [] })),
    ]).then(([status, plansRes]) => {
      setSubscription(status);
      setPlans(plansRes?.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const aiSub = subscription?.ai_subscription;
  const isActive = subscription?.redirect_to === 'ai';

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—';

  return (
    <>
      <style>{CSS}</style>

      {paymentBanner && (
        <div className={`aid-payment-banner ${paymentBanner}`}>
          <span className="aid-payment-banner-text">
            {paymentBanner === 'success'
              ? 'Ödeme başarıyla tamamlandı. Aboneliğin aktif!'
              : 'Ödeme başarısız oldu. Tekrar denemek için abone ol butonuna tıkla.'}
          </span>
          <button className="aid-payment-banner-close" onClick={() => setPaymentBanner(null)}>✕</button>
        </div>
      )}

      <div className="aid-hello">
        <div>
          <div className="aid-eyebrow">
            <span className="aid-eyebrow-dot" />
            AI DİYETİSYEN PANELİ
          </div>
          <h1 className="aid-h1">
            Hoş geldin,{' '}
            <em style={{ fontStyle: 'italic', color: '#3F6212' }}>{firstName}</em>.
          </h1>
          <p className="aid-sub">Yapay zeka destekli beslenme asistanın hazır.</p>
        </div>
      </div>

      {!loading && (
        <div className={`aid-status-bar${!isActive ? ' inactive' : ''}`}>
          <span className="aid-status-dot" />
          <span className="aid-status-text">
            {isActive ? 'AI Aboneliğin Aktif' : 'Aktif AI Aboneliğin Yok'}
          </span>
          {aiSub?.expires_at && (
            <span className="aid-status-meta">
              Bitiş: {formatDate(aiSub.expires_at)}
            </span>
          )}
          {!isActive && (
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/client/subscribe-ai')}>
              Abonelik Başlat
            </button>
          )}
        </div>
      )}

      <div className="aid-ctas">
        <Link to="/client/ai-diet" className="aid-cta-card primary">
          <div className="aid-cta-icon"><Icons.Sparkle size={20} /></div>
          <div className="aid-cta-title">Yeni Diyet Planı Oluştur</div>
          <div className="aid-cta-desc">
            Sağlık verilerine göre saniyeler içinde kişisel haftalık menü.
          </div>
          <div className="aid-cta-arrow">
            Hemen başla <Icons.ArrowRight size={14} />
          </div>
        </Link>

        <Link to="/client/ai-diet" className="aid-cta-card secondary">
          <div className="aid-cta-icon"><Icons.Check size={20} /></div>
          <div className="aid-cta-title">Öğün Kontrolü</div>
          <div className="aid-cta-desc">
            Yediğin öğünün besin değerini AI ile analiz et.
          </div>
          <div className="aid-cta-arrow">
            Kontrol et <Icons.ArrowRight size={14} />
          </div>
        </Link>
      </div>

      <section>
        <h4 className="aid-section-title">Diyet Planlarım</h4>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <div className="spinner" />
          </div>
        ) : plans.length > 0 ? (
          <div className="aid-plans">
            {plans.slice(0, 5).map((plan) => (
              <div key={plan.id} className="aid-plan-row">
                <div className="aid-plan-icon"><Icons.ClipboardList size={16} /></div>
                <div className="aid-plan-info">
                  <div className="aid-plan-name">Haftalık Diyet Planı</div>
                  <div className="aid-plan-date">
                    {formatDate(plan.start_date)} → {formatDate(plan.end_date)}
                  </div>
                </div>
                <span className={`aid-plan-status${plan.status === 'Active' ? ' active' : ' old'}`}>
                  {plan.status === 'Active' ? '● Aktif' : 'Geçmiş'}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="aid-empty">
            <p>Henüz oluşturulmuş bir diyet planın yok.</p>
            <Link to="/client/ai-diet" className="btn btn-primary btn-sm">
              <Icons.Sparkle size={13} /> İlk planını oluştur
            </Link>
          </div>
        )}
      </section>

      <div style={{ marginTop: 24 }}>
        <p className="aid-switch">
          Gerçek diyetisyenle çalışmak ister misin?{' '}
          <Link to="/client/dietician-dashboard">Diyetisyen Paneline Geç</Link>
        </p>
      </div>
    </>
  );
}
