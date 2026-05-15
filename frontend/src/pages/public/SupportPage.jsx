import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const FAQ = [
  {
    q: 'Şifremi unuttum, ne yapmalıyım?',
    a: 'Giriş sayfasındaki "Şifremi unuttum" bağlantısına tıklayarak kayıtlı e-posta adresine sıfırlama bağlantısı gönderebilirsin.',
  },
  {
    q: 'Planımı nasıl değiştirebilirim?',
    a: 'Hesabına giriş yaptıktan sonra "Plan Seç" ekranından AI veya diyetisyen destekli plana geçiş yapabilirsin.',
  },
  {
    q: 'AI tarafından oluşturulan diyet planları güvenilir mi?',
    a: 'Planlar, güncel beslenme bilimi ve girdiğin sağlık verileri baz alınarak oluşturulur. Tıbbi bir rahatsızlığın varsa mutlaka bir diyetisyen ya da doktorla görüşmeni öneririz.',
  },
  {
    q: 'Randevumu nasıl iptal edebilirim?',
    a: '"Randevular" sayfasından mevcut randevunu görüntüleyip iptal edebilirsin. İptal işleminin randevudan en az 24 saat önce yapılmasını öneririz.',
  },
  {
    q: 'Verilerimi nasıl silebilirim?',
    a: 'Hesap silme ve veri temizliği için lütfen destek ekibimizle iletişime geç. Talebini aldıktan sonra 7 iş günü içinde işleme alırız.',
  },
];

const SUBJECTS = [
  'Teknik Sorun',
  'Hesap ve Güvenlik',
  'Diyet Planı',
  'Ödeme ve Abonelik',
  'Diyetisyen Hakkında',
  'Diğer',
];

export default function SupportPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq]   = useState(null);
  const [form, setForm]         = useState({ name: '', email: '', subject: SUBJECTS[0], message: '' });
  const [status, setStatus]     = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errMsg, setErrMsg]     = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/support/contact/', form);
      setStatus('success');
    } catch (err) {
      const data = err.response?.data || {};
      setErrMsg(data.detail || data.non_field_errors?.[0] || 'Mesaj gönderilemedi, lütfen tekrar dene.');
      setStatus('error');
    }
  };

  return (
    <>
      <style>{SP_CSS}</style>
      <div className="sp-root">

        {/* ── Top bar ── */}
        <header className="sp-topbar">
          <Link to="/" className="sp-logo">
            <span style={{
              fontFamily: '"Instrument Serif", serif',
              fontWeight: 700,
              fontSize: '36px',
              lineHeight: 1,
              letterSpacing: '-0.02em',
              color: '#1A1A1A',
            }}>LIFEETICS</span>
          </Link>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link to={user.role === 'Dietician' ? '/dietician/dashboard' : '/client/dashboard'} className="sp-topbar-login">
                Panele Git
              </Link>
              <button onClick={handleLogout} className="sp-topbar-login" style={{ background: 'none', border: '1px solid var(--line)', cursor: 'pointer' }}>
                Çıkış Yap
              </button>
            </div>
          ) : (
            <Link to="/login" className="sp-topbar-login">Giriş Yap</Link>
          )}
        </header>

        {/* ── Hero ── */}
        <section className="sp-hero">
          <div className="sp-hero-inner">
            <div className="sp-hero-badge">Yardım & Destek</div>
            <h1 className="sp-hero-title">Nasıl yardımcı<br /><em>olabiliriz?</em></h1>
            <p className="sp-hero-sub">
              Aklındaki soruları SSS bölümünden yanıtlayabilir ya da<br />
              doğrudan bize ulaşabilirsin. En geç 1 iş günü içinde dönüş yaparız.
            </p>
          </div>
        </section>

        {/* ── Contact cards ── */}
        <section className="sp-cards">
          <div className="sp-card">
            <div className="sp-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="sp-card-label">E-posta</div>
            <div className="sp-card-value">
              <a href="mailto:support@lifeetics.com" style={{ color: 'inherit', textDecoration: 'none' }}>
                support@lifeetics.com
              </a>
            </div>
            <div className="sp-card-note">1 iş günü içinde yanıt</div>
          </div>

          <div className="sp-card">
            <div className="sp-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div className="sp-card-label">Çalışma saatleri</div>
            <div className="sp-card-value">Hafta içi 09:00–18:00</div>
            <div className="sp-card-note">Türkiye saati (UTC+3)</div>
          </div>

          <div className="sp-card">
            <div className="sp-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="sp-card-label">Canlı destek</div>
            <div className="sp-card-value">Yakında geliyor</div>
            <div className="sp-card-note">Gerçek zamanlı chat</div>
          </div>
        </section>

        {/* ── Main area: form + FAQ ── */}
        <div className="sp-main">

          {/* Contact form */}
          <section className="sp-form-section">
            <h2 className="sp-section-title">Mesaj gönder</h2>

            {status === 'success' ? (
              <div className="sp-success">
                <div className="sp-success-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 className="sp-success-title">Mesajın alındı!</h3>
                <p className="sp-success-sub">
                  En geç 1 iş günü içinde <strong>{form.email}</strong> adresine dönüş yapacağız.
                </p>
                <button
                  className="sp-btn"
                  onClick={() => { setStatus('idle'); setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' }); }}
                >
                  Yeni mesaj gönder
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="sp-form">
                {status === 'error' && (
                  <div className="sp-err">{errMsg}</div>
                )}

                <div className="sp-row">
                  <label className="sp-field">
                    <span className="sp-label">Ad Soyad</span>
                    <input
                      className="sp-input"
                      type="text"
                      required
                      placeholder="Adın Soyadın"
                      value={form.name}
                      onChange={set('name')}
                    />
                  </label>
                  <label className="sp-field">
                    <span className="sp-label">E-posta</span>
                    <input
                      className="sp-input"
                      type="email"
                      required
                      placeholder="ornek@email.com"
                      value={form.email}
                      onChange={set('email')}
                    />
                  </label>
                </div>

                <label className="sp-field">
                  <span className="sp-label">Konu</span>
                  <select className="sp-input sp-select" value={form.subject} onChange={set('subject')}>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>

                <label className="sp-field">
                  <span className="sp-label">Mesajın</span>
                  <textarea
                    className="sp-input sp-textarea"
                    required
                    rows={5}
                    placeholder="Sorununu veya isteğini buraya yaz…"
                    value={form.message}
                    onChange={set('message')}
                  />
                </label>

                <button type="submit" className="sp-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? <span className="sp-spinner" /> : 'Mesajı gönder'}
                </button>
              </form>
            )}
          </section>

          {/* FAQ */}
          <section className="sp-faq-section">
            <h2 className="sp-section-title">Sık sorulan sorular</h2>
            <div className="sp-faq-list">
              {FAQ.map((item, i) => (
                <div
                  key={i}
                  className={`sp-faq-item${openFaq === i ? ' open' : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <div className="sp-faq-q">
                    <span>{item.q}</span>
                    <span className="sp-faq-arrow">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </span>
                  </div>
                  {openFaq === i && (
                    <div className="sp-faq-a">{item.a}</div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Footer strip ── */}
        <footer className="sp-foot">
          <span>© 2026 Lifeetics</span>
          <span className="sp-foot-dot" />
          <Link to="/">Ana sayfa</Link>
          <span className="sp-foot-dot" />
          <Link to="/login">Giriş yap</Link>
        </footer>

      </div>
    </>
  );
}

const SP_CSS = `
  .sp-root {
    min-height: 100vh; background: var(--bg);
    display: flex; flex-direction: column;
  }

  /* top bar */
  .sp-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 40px; border-bottom: 1px solid var(--line);
    background: #fff; position: sticky; top: 0; z-index: 10;
  }
  .sp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
  .sp-logo-mark {
    width: 32px; height: 32px; border-radius: 8px;
    background: #F0FDF4; border: 1px solid #BBF7D0;
    display: flex; align-items: center; justify-content: center;
  }
  .sp-logo-text {
    font-family: var(--sans); font-weight: 700; font-size: 18px; color: var(--ink);
  }
  .sp-logo-text em { font-family: var(--serif); font-style: italic; color: var(--accent); }
  .sp-topbar-login {
    font-size: 13px; font-weight: 600; color: var(--ink-soft);
    text-decoration: none; padding: 8px 18px;
    border: 1px solid var(--line); border-radius: 999px;
    transition: all .2s;
  }
  .sp-topbar-login:hover { border-color: var(--accent); color: var(--accent-deep); }

  /* hero */
  .sp-hero {
    background: var(--bg-warm);
    border-bottom: 1px solid var(--line);
    padding: 72px 40px 64px;
    text-align: center;
  }
  .sp-hero-inner { max-width: 560px; margin: 0 auto; }
  .sp-hero-badge {
    display: inline-block; padding: 5px 14px; border-radius: 999px;
    background: var(--accent-soft); color: var(--accent-deep);
    font-size: 12px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase; margin-bottom: 20px;
    font-family: var(--mono);
  }
  .sp-hero-title {
    font-family: var(--serif); font-size: clamp(36px, 6vw, 52px);
    font-weight: 400; letter-spacing: -0.02em; color: var(--ink);
    line-height: 1.08; margin: 0 0 18px;
  }
  .sp-hero-title em { color: var(--accent-deep); font-style: italic; }
  .sp-hero-sub {
    font-size: 15px; color: var(--ink-mute); line-height: 1.7;
    margin: 0;
  }

  /* cards */
  .sp-cards {
    display: grid; grid-template-columns: repeat(3, 1fr);
    gap: 0; border-bottom: 1px solid var(--line);
  }
  .sp-card {
    padding: 28px 32px; border-right: 1px solid var(--line);
    display: flex; flex-direction: column; gap: 6px;
  }
  .sp-card:last-child { border-right: none; }
  .sp-card-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: var(--accent-tint); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 8px;
  }
  .sp-card-label {
    font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--ink-mute);
    font-family: var(--mono);
  }
  .sp-card-value { font-size: 15px; font-weight: 600; color: var(--ink); }
  .sp-card-note { font-size: 12px; color: var(--ink-mute); }

  /* main */
  .sp-main {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 0; flex: 1;
    border-bottom: 1px solid var(--line);
  }

  /* form section */
  .sp-form-section {
    padding: 48px 40px; border-right: 1px solid var(--line);
  }
  .sp-section-title {
    font-family: var(--serif); font-size: 26px; font-weight: 400;
    color: var(--ink); margin: 0 0 28px; letter-spacing: -0.01em;
  }
  .sp-form { display: flex; flex-direction: column; gap: 18px; }
  .sp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .sp-field { display: flex; flex-direction: column; gap: 7px; }
  .sp-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
  .sp-input {
    padding: 12px 14px; border: 1px solid var(--line); border-radius: 10px;
    font-size: 14px; font-family: var(--sans); color: var(--ink);
    outline: none; transition: border-color .2s, box-shadow .2s; background: #fff;
    -webkit-appearance: none;
  }
  .sp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(101,163,13,.1); }
  .sp-select { cursor: pointer; }
  .sp-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
  .sp-btn {
    display: flex; align-items: center; justify-content: center;
    padding: 13px 24px; background: var(--ink); color: #FBFAF5;
    border: none; border-radius: 999px; font-size: 14px; font-weight: 600;
    cursor: pointer; font-family: var(--sans); transition: background .2s, transform .2s;
    width: 100%;
  }
  .sp-btn:hover:not(:disabled) { background: var(--accent-deep); transform: translateY(-1px); }
  .sp-btn:disabled { opacity: .7; cursor: not-allowed; }
  .sp-err {
    padding: 12px 14px; border-radius: 8px; font-size: 13px;
    background: #fadbd8; color: #c0392b; border: 1px solid #e8a9a4;
  }
  .sp-success {
    display: flex; flex-direction: column; align-items: flex-start; gap: 14px;
    padding: 32px; border: 1px solid #BBF7D0; border-radius: 16px;
    background: #F0FDF4;
  }
  .sp-success-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(101,163,13,.15); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .sp-success-title { font-size: 20px; font-weight: 700; color: var(--ink); margin: 0; }
  .sp-success-sub { font-size: 14px; color: var(--ink-mute); line-height: 1.6; margin: 0; }

  /* faq section */
  .sp-faq-section { padding: 48px 40px; }
  .sp-faq-list { display: flex; flex-direction: column; gap: 0; }
  .sp-faq-item {
    border-bottom: 1px solid var(--line-soft); cursor: pointer;
    padding: 18px 0; user-select: none;
  }
  .sp-faq-item:first-child { border-top: 1px solid var(--line-soft); }
  .sp-faq-q {
    display: flex; justify-content: space-between; align-items: center; gap: 16px;
    font-size: 14px; font-weight: 600; color: var(--ink); line-height: 1.5;
  }
  .sp-faq-arrow { flex-shrink: 0; color: var(--ink-mute); transition: transform .2s; }
  .sp-faq-item.open .sp-faq-arrow { transform: rotate(180deg); }
  .sp-faq-a {
    font-size: 14px; color: var(--ink-mute); line-height: 1.7;
    padding-top: 12px;
  }

  /* footer */
  .sp-foot {
    padding: 24px 40px; display: flex; align-items: center; gap: 14px;
    font-size: 12px; color: var(--ink-mute); font-family: var(--mono);
  }
  .sp-foot a { color: var(--ink-mute); text-decoration: none; transition: color .2s; }
  .sp-foot a:hover { color: var(--ink); }
  .sp-foot-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--line); }

  @keyframes spSpin { to { transform: rotate(360deg); } }
  .sp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: spSpin .8s linear infinite;
  }

  @media (max-width: 900px) {
    .sp-main { grid-template-columns: 1fr; }
    .sp-form-section { border-right: none; border-bottom: 1px solid var(--line); }
    .sp-cards { grid-template-columns: 1fr; }
    .sp-card { border-right: none; border-bottom: 1px solid var(--line); }
    .sp-card:last-child { border-bottom: none; }
  }
  @media (max-width: 600px) {
    .sp-hero { padding: 48px 24px 40px; }
    .sp-topbar { padding: 16px 20px; }
    .sp-form-section, .sp-faq-section { padding: 36px 20px; }
    .sp-row { grid-template-columns: 1fr; }
  }
`;
