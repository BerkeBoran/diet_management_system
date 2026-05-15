import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import subscriptionService from '../../services/subscriptionService';
import Icons from '../../components/landing/LandingIcons';

const Eye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.4 5.6A10 10 0 0 1 22 12s-1.3 3-4.2 5M6.1 6.1C3.6 7.7 2 12 2 12s3 7 10 7c1.6 0 3-.3 4.3-.9"/>
  </svg>
);
const Quote = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 0 1-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
  </svg>
);

const BENEFITS = {
  danisan: [
    'Kişisel diyet planına hemen ulaş',
    'AI asistan ve uzmanlarla mesajlaş',
    'Randevularını ve takiplerini gör',
  ],
  diyetisyen: [
    'Hasta listenize ve seans takvimine erişin',
    'Hazırladığınız planları yönetin',
    'Klinik notlar ve raporları indirin',
  ],
};

export default function LoginPage() {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('danisan');
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigateAfterClientLogin = async () => {
    try {
      const status = await subscriptionService.getStatus();
      if (status.redirect_to === 'ai') {
        localStorage.setItem('clientMode', 'ai');
        navigate('/client/ai-dashboard');
      } else if (status.redirect_to === 'dietician') {
        localStorage.setItem('clientMode', 'dietician');
        navigate('/client/dietician-dashboard');
      } else {
        navigate('/client/choose-plan');
      }
    } catch {
      navigate('/client/choose-plan');
    }
  };

  const goToGoogleRegister = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const info = await res.json();
      navigate('/register', {
        state: {
          googleFlow: true,
          accessToken,
          firstName: info.given_name || '',
          lastName: info.family_name || '',
          email: info.email || '',
        },
      });
    } catch {
      setError('Google bilgileri alınamadı.');
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const data = await authService.googleLogin(tokenResponse.access_token);
        if (data.is_profile_complete !== false) {
          loginWithToken(data);
          await navigateAfterClientLogin();
        } else {
          await goToGoogleRegister(tokenResponse.access_token);
        }
      } catch {
        await goToGoogleRegister(tokenResponse.access_token);
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError('Google girişi başarısız.'),
    scope: 'email profile',
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const apiRole = role === 'diyetisyen' ? 'Dietician' : 'Client';
      const user = await login(email, pass, apiRole);
      if (user.role === 'Dietician') navigate('/dietician/dashboard');
      else await navigateAfterClientLogin();
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'object') setError(Object.values(detail).join(' '));
      else setError(detail || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .login-shell {
          --r-sm: 8px; --r-md: 12px; --r-lg: 20px; --r-pill: 999px;
          --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          background: var(--bg);
        }
        .login-serif { font-family: "Instrument Serif", Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
        .login-mono  { font-family: "JetBrains Mono", "SF Mono", Menlo, monospace; }

        .login-left {
          position: relative; overflow: hidden;
          background: var(--bg-cream);
          display: flex; align-items: stretch;
        }
        .login-photo {
          position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 30%, #E8DFC8 0%, #D4C5A0 35%, #B8A175 75%, #8B7755 100%);
          display: flex; align-items: flex-end; justify-content: flex-start;
          padding: 24px;
        }
        .login-photo::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(circle at 30% 35%, rgba(101,163,13,0.22) 0%, transparent 38%),
            radial-gradient(circle at 75% 60%, rgba(201,123,92,0.22) 0%, transparent 42%),
            radial-gradient(circle at 55% 85%, rgba(143,168,118,0.28) 0%, transparent 48%);
        }
        .login-photo::after {
          content: ""; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 22% 28%, rgba(212,165,116,0.55) 0 7%, transparent 8%),
            radial-gradient(circle at 70% 22%, rgba(101,163,13,0.5) 0 6%, transparent 7%),
            radial-gradient(circle at 38% 62%, rgba(201,123,92,0.5) 0 7%, transparent 8%),
            radial-gradient(circle at 80% 72%, rgba(143,168,118,0.55) 0 8%, transparent 9%);
          mix-blend-mode: multiply; opacity: 0.7;
        }
        .login-photo-label {
          position: relative; z-index: 1;
          font-family: "JetBrains Mono", monospace; font-size: 11px;
          color: rgba(26,37,22,0.55); text-transform: uppercase; letter-spacing: 0.16em;
          background: rgba(255,255,255,0.7); padding: 6px 12px; border-radius: 999px;
          backdrop-filter: blur(4px);
        }
        .login-vignette {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 30%, rgba(255,255,255,0.55) 100%),
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 100%);
        }
        .login-left-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          padding: 40px 56px; width: 100%;
          justify-content: space-between;
        }
        .login-logo {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: "Plus Jakarta Sans", sans-serif; font-weight: 700; font-size: 20px;
          letter-spacing: -0.02em; color: var(--ink); text-decoration: none;
          align-self: flex-start;
        }
        .login-logo-mark { display: flex; }
        .login-logo-text { display: flex; align-items: baseline; gap: 1px; }
        .login-left-content { display: flex; flex-direction: column; gap: 18px; max-width: 440px; margin: auto 0; }
        .login-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: "JetBrains Mono", monospace; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent-deep);
        }
        .login-eyebrow-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent);
        }
        .login-title {
          font-size: clamp(40px, 4vw, 60px);
          line-height: 1.06; letter-spacing: -0.02em;
          color: var(--ink); font-weight: 400; margin-top: 4px;
        }
        .login-title em { color: var(--accent-deep); }
        .login-sub { font-size: 15px; color: var(--ink-soft); line-height: 1.55; max-width: 380px; }
        .login-benefits { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 8px; }
        .login-benefits li {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: var(--ink-soft);
          opacity: 0; animation: lbIn .5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes lbIn { from { opacity: 0; transform: translateX(-6px); } to { opacity: 1; transform: none; } }
        .login-bcheck {
          width: 20px; height: 20px; border-radius: 50%;
          background: var(--accent); color: #fff;
          display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .login-quote {
          background: rgba(255,255,255,0.65); backdrop-filter: blur(12px);
          border: 1px solid rgba(232,228,213,0.7); border-radius: var(--r-md);
          padding: 18px 20px; display: flex; flex-direction: column; gap: 10px; max-width: 440px;
        }
        .login-quote-icon { color: var(--accent); opacity: 0.6; }
        .login-quote p { font-size: 16px; line-height: 1.45; color: var(--ink); letter-spacing: -0.005em; }
        .login-quote-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--ink-mute); }
        .login-quote-pic { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #D4A574, #B8927D); }
        .login-quote-meta strong { color: var(--ink); font-weight: 600; }

        .login-right {
          display: flex; flex-direction: column; padding: 24px 56px 32px;
          background: var(--bg); position: relative;
        }
        .login-right-top {
          display: flex; justify-content: space-between; align-items: center; font-size: 13px;
        }
        .login-back {
          display: inline-flex; align-items: center; gap: 6px;
          color: var(--ink-soft); padding: 8px 12px; border-radius: 999px;
          transition: background .2s, color .2s; text-decoration: none;
        }
        .login-back:hover { background: var(--bg-warm); color: var(--ink); }
        .login-right-help { color: var(--ink-mute); }
        .login-right-help a { color: var(--accent-deep); border-bottom: 1px solid currentColor; text-decoration: none; }
        .login-form-wrap {
          flex: 1; display: flex; flex-direction: column; gap: 22px;
          max-width: 420px; margin: auto 0; width: 100%;
          align-self: center; padding: 32px 0;
        }
        .login-form-head { display: flex; flex-direction: column; gap: 8px; }
        .login-form-title { font-size: 40px; letter-spacing: -0.02em; line-height: 1.05; }
        .login-form-sub { font-size: 14px; color: var(--ink-mute); }

        .login-role-tabs {
          position: relative; display: flex;
          background: var(--bg-warm); border: 1px solid var(--line);
          border-radius: 999px; padding: 4px;
        }
        .login-role-tabs button {
          flex: 1; padding: 12px 16px; border-radius: 999px; border: none; background: none;
          font-size: 14px; font-weight: 600; color: var(--ink-soft);
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: color .3s; position: relative; z-index: 2; cursor: pointer;
          font-family: "Plus Jakarta Sans", sans-serif;
        }
        .login-role-tabs button.active { color: #FBFAF5; }
        .login-role-indicator {
          position: absolute; top: 4px; bottom: 4px; left: 4px;
          width: calc(50% - 4px); background: var(--ink); border-radius: 999px;
          transition: transform .4s cubic-bezier(0.34,1.56,0.64,1); z-index: 1;
        }

        .login-social { display: flex; gap: 10px; }
        .login-social-btn {
          flex: 1; padding: 12px 14px; background: #fff; border: 1px solid var(--line);
          border-radius: 12px; font-size: 13px; font-weight: 600; color: var(--ink);
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          transition: all .2s; cursor: pointer; font-family: "Plus Jakarta Sans", sans-serif;
        }
        .login-social-btn:hover { border-color: var(--ink); background: var(--bg-warm); transform: translateY(-1px); }

        .login-divider {
          position: relative; text-align: center;
          font-size: 11px; color: var(--ink-mute);
          font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .login-divider::before, .login-divider::after {
          content: ""; position: absolute; top: 50%;
          width: calc(50% - 70px); height: 1px; background: var(--line);
        }
        .login-divider::before { left: 0; }
        .login-divider::after { right: 0; }
        .login-divider span { background: var(--bg); padding: 0 10px; }

        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-field { display: flex; flex-direction: column; gap: 7px; }
        .login-field-label-row { display: flex; justify-content: space-between; align-items: baseline; }
        .login-field-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.01em; }
        .login-field-helper { font-size: 12px; color: var(--accent-deep); border-bottom: 1px solid transparent; transition: border-color .2s; text-decoration: none; }
        .login-field-helper:hover { border-color: currentColor; }
        .login-input-wrap {
          position: relative; background: #fff; border: 1px solid var(--line);
          border-radius: 12px; transition: border-color .2s, box-shadow .2s, background .2s;
        }
        .login-input-wrap:focus-within {
          border-color: var(--accent); box-shadow: 0 0 0 4px rgba(101,163,13,0.12); background: #fff;
        }
        .login-input-wrap input {
          width: 100%; padding: 14px 16px; background: transparent; border: 0; outline: 0;
          font-family: "Plus Jakarta Sans", sans-serif; font-size: 15px; color: var(--ink);
        }
        .login-input-wrap input::placeholder { color: var(--ink-mute); }
        .login-input-icon-btn {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          width: 36px; height: 36px; border-radius: 8px; border: none; background: none;
          display: flex; align-items: center; justify-content: center;
          color: var(--ink-mute); cursor: pointer; transition: background .2s, color .2s;
        }
        .login-input-icon-btn:hover { background: var(--bg-warm); color: var(--ink); }

        .login-row-between { display: flex; justify-content: space-between; align-items: center; }
        .login-checkbox { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--ink-soft); }
        .login-checkbox input { display: none; }
        .login-check-box {
          width: 18px; height: 18px; border-radius: 5px; border: 1.5px solid var(--line);
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; color: #fff; transition: all .2s; flex-shrink: 0;
        }
        .login-checkbox input:checked + .login-check-box { background: var(--accent); border-color: var(--accent); }
        .login-row-meta { font-size: 11px; color: var(--ink-mute); letter-spacing: 0.08em; font-family: "JetBrains Mono", monospace; }

        .login-btn-submit {
          margin-top: 6px; padding: 16px 22px;
          background: var(--ink); color: #FBFAF5; border: none; border-radius: 999px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          transition: background .25s, transform .25s, box-shadow .25s;
          font-family: "Plus Jakarta Sans", sans-serif; width: 100%;
        }
        .login-btn-submit:hover:not(:disabled) {
          background: var(--accent-deep); transform: translateY(-1px);
          box-shadow: 0 12px 28px -10px rgba(77,124,15,0.55);
        }
        .login-btn-submit.loading { background: var(--accent-deep); }
        .login-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .login-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: loginSpin .8s linear infinite; flex-shrink: 0;
        }
        @keyframes loginSpin { to { transform: rotate(360deg); } }

        .login-signup-row { text-align: center; font-size: 14px; color: var(--ink-soft); margin-top: 6px; }
        .login-signup-row a { color: var(--accent-deep); font-weight: 600; border-bottom: 1px solid currentColor; text-decoration: none; }

        .login-foot {
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: var(--ink-mute);
          font-family: "JetBrains Mono", monospace;
          padding-top: 16px; border-top: 1px solid var(--line-soft);
        }
        .login-foot-links { display: flex; gap: 16px; }
        .login-foot-links a { color: inherit; text-decoration: none; transition: color .2s; }
        .login-foot-links a:hover { color: var(--ink); }

        .login-error {
          padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
          background: #fadbd8; color: #c0392b; border: 1px solid #e8a9a4;
        }

        @media (max-width: 980px) {
          .login-shell { grid-template-columns: 1fr; }
          .login-left { display: none; }
          .login-right { padding: 24px 28px 32px; min-height: 100vh; }
        }
      `}</style>

      <div className="login-shell">
        {/* LEFT — brand panel */}
        <aside className="login-left">
          <div className="login-photo" aria-hidden="true">
            <span className="login-photo-label">Fotoğraf · Akdeniz tabağı, taze otlar</span>
          </div>
          <div className="login-vignette" />

          <div className="login-left-inner">
            <Link to="/" className="login-logo">
              <span style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 700,
                fontSize: '38px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
              }}>LIFEETICS</span>
            </Link>

            <div className="login-left-content">
              <span className="login-eyebrow">
                <span className="login-eyebrow-dot" />
                Tekrar hoş geldin
              </span>
              <h1 className="login-title login-serif">
                Sağlıklı yaşamına<br />
                <em style={{ fontStyle: 'italic' }}>kaldığın yerden</em><br />
                devam et.
              </h1>
              <p className="login-sub">
                1.000+ kişi Lifeetics ile bilim destekli beslenme yolculuğuna devam ediyor.
              </p>
              <ul className="login-benefits">
                {BENEFITS[role].map((b, i) => (
                  <li key={b} style={{ animationDelay: `${i * 0.08}s` }}>
                    <span className="login-bcheck"><Icons.Check size={12} /></span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </aside>

        {/* RIGHT — form */}
        <main className="login-right">
          <div className="login-right-top">
            <Link to="/" className="login-back">
              <Icons.ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
              Ana sayfa
            </Link>
            <div className="login-right-help">
              Yardım mı lazım? <a href="mailto:support@lifeetics.com">Destek ekibi</a>
            </div>
          </div>

          <div className="login-form-wrap">
            <div className="login-form-head">
              <h2 className="login-form-title login-serif">Giriş yap</h2>
              <p className="login-form-sub">Hesabına erişmek için bilgilerini gir.</p>
            </div>

            {/* Role tabs */}
            <div className="login-role-tabs" role="tablist">
              <button
                role="tab"
                className={role === 'danisan' ? 'active' : ''}
                onClick={() => setRole('danisan')}
              >
                <Icons.Heart size={14} /> Danışan
              </button>
              <button
                role="tab"
                className={role === 'diyetisyen' ? 'active' : ''}
                onClick={() => setRole('diyetisyen')}
              >
                <Icons.Stethoscope size={14} /> Diyetisyen
              </button>
              <div
                className="login-role-indicator"
                style={{ transform: role === 'diyetisyen' ? 'translateX(100%)' : 'translateX(0)' }}
              />
            </div>

            {/* Social */}
            {role === 'danisan' && (
              <>
                <div className="login-social">
                  <button type="button" className="login-social-btn" onClick={() => handleGoogleLogin()} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 18 18">
                      <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/>
                      <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18z"/>
                      <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4l3-2.3z"/>
                      <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.5 0 2.4 2.1.9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6z"/>
                    </svg>
                    Google ile devam et
                  </button>
                  <button type="button" className="login-social-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.6 12.5c0-2.7 2.2-4 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.8.1-3.6 1-4.5 2.7-1.9 3.4-.5 8.3 1.4 11 .9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.6.9c1.5 0 2.4-1.3 3.3-2.7 1.1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-2.9-4.5zM15 4.5c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.2 1.2.1 2.3-.6 3-1.4z"/>
                    </svg>
                    Apple ile devam et
                  </button>
                </div>

                <div className="login-divider">
                  <span>veya e-posta ile</span>
                </div>
              </>
            )}

            {error && <div className="login-error">{error}</div>}

            <form className="login-form" onSubmit={onSubmit}>
              <label className="login-field">
                <span className="login-field-label">E-posta</span>
                <div className="login-input-wrap">
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </label>

              <label className="login-field">
                <div className="login-field-label-row">
                  <span className="login-field-label">Şifre</span>
                  <Link to="/forgot-password" className="login-field-helper">Şifremi unuttum</Link>
                </div>
                <div className="login-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={pass}
                    onChange={e => setPass(e.target.value)}
                  />
                  <button
                    type="button"
                    className="login-input-icon-btn"
                    aria-label={showPass ? 'Şifreyi gizle' : 'Şifreyi göster'}
                    onClick={() => setShowPass(s => !s)}
                  >
                    {showPass ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </label>

              <div className="login-row-between">
                <label className="login-checkbox">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span className="login-check-box">
                    {remember && <Icons.Check size={11} />}
                  </span>
                  <span>Beni hatırla</span>
                </label>
                <span className="login-row-meta">SSL · KVKK</span>
              </div>

              <button
                type="submit"
                className={`login-btn-submit${loading ? ' loading' : ''}`}
                disabled={loading}
              >
                {loading
                  ? <span className="login-spinner" />
                  : <><span>Giriş yap</span><Icons.ArrowRight size={16} /></>
                }
              </button>

              <div className="login-signup-row">
                Hesabın yok mu? <Link to="/register">Hemen oluştur</Link>
              </div>
            </form>
          </div>

          <footer className="login-foot">
            <span>© 2026 Lifeetics</span>
            <div className="login-foot-links">
              <a href="#">Gizlilik</a>
              <a href="#">Şartlar</a>
              <a href="#">KVKK</a>
            </div>
          </footer>
        </main>
      </div>
    </>
  );
}
