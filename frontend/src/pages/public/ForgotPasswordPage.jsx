import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle'); // 'idle' | 'loading' | 'sent' | 'error'
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/auth/password/reset/', { email });
      setStatus('sent');
    } catch (err) {
      const detail = err.response?.data?.email?.[0] || err.response?.data?.detail || 'Bir hata oluştu.';
      setMessage(detail);
      setStatus('error');
    }
  };

  return (
    <>
      <style>{FP_CSS}</style>
      <div className="fp-shell">
        <div className="fp-card">

          <Link to="/login" className="fp-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Girişe dön
          </Link>

          {status === 'sent' ? (
            <div className="fp-success">
              <div className="fp-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="fp-title">Email gönderildi</h2>
              <p className="fp-sub">
                <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
                Gelmezse spam klasörünü kontrol et.
              </p>
              <Link to="/login" className="fp-btn">Girişe dön</Link>
            </div>
          ) : (
            <>
              <div className="fp-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="fp-title">Şifreni mi unuttun?</h2>
              <p className="fp-sub">E-posta adresini gir, sıfırlama bağlantısını gönderelim.</p>

              {status === 'error' && (
                <div className="fp-error">{message}</div>
              )}

              <form onSubmit={onSubmit} className="fp-form">
                <label className="fp-field">
                  <span className="fp-label">E-posta adresi</span>
                  <input
                    type="email"
                    required
                    placeholder="ornek@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="fp-input"
                  />
                </label>

                <button type="submit" className="fp-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <span className="fp-spinner" />
                  ) : (
                    <>Sıfırlama bağlantısı gönder</>
                  )}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </>
  );
}

const FP_CSS = `
  .fp-shell {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); padding: 24px;
  }
  .fp-card {
    background: #fff; border: 1px solid var(--line); border-radius: 20px;
    padding: 40px 44px; width: 100%; max-width: 420px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .fp-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; color: var(--ink-mute); text-decoration: none;
    transition: color .2s; align-self: flex-start;
  }
  .fp-back:hover { color: var(--ink); }
  .fp-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--accent-tint); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
  }
  .fp-title {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    letter-spacing: -0.02em; color: var(--ink); margin: 0;
  }
  .fp-sub { font-size: 14px; color: var(--ink-mute); line-height: 1.6; margin: 0; }
  .fp-form { display: flex; flex-direction: column; gap: 16px; }
  .fp-field { display: flex; flex-direction: column; gap: 7px; }
  .fp-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
  .fp-input {
    padding: 13px 16px; border: 1px solid var(--line); border-radius: 12px;
    font-size: 15px; font-family: var(--sans); color: var(--ink);
    outline: none; transition: border-color .2s, box-shadow .2s;
    background: #fff;
  }
  .fp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(101,163,13,.12); }
  .fp-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 20px; background: var(--ink); color: #FBFAF5;
    border: none; border-radius: 999px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none;
    font-family: var(--sans); transition: background .2s, transform .2s;
    width: 100%;
  }
  .fp-btn:hover:not(:disabled) { background: var(--accent-deep); transform: translateY(-1px); }
  .fp-btn:disabled { opacity: .7; cursor: not-allowed; }
  .fp-error {
    padding: 12px 16px; border-radius: 8px; font-size: 13px;
    background: #fadbd8; color: #c0392b; border: 1px solid #e8a9a4;
  }
  .fp-success { display: flex; flex-direction: column; gap: 16px; }
  .fp-success-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(101,163,13,.1); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
  }
  @keyframes fpSpin { to { transform: rotate(360deg); } }
  .fp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: fpSpin .8s linear infinite;
  }
  @media (max-width: 480px) { .fp-card { padding: 28px 24px; } }
`;
