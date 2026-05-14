import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid   = searchParams.get('uid')   || '';
  const token = searchParams.get('token') || '';

  const [pass1,   setPass1]   = useState('');
  const [pass2,   setPass2]   = useState('');
  const [status,  setStatus]  = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (pass1 !== pass2) {
      setMessage('Şifreler eşleşmiyor.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    try {
      await authService.resetPassword(uid, token, pass1, pass2);
      setStatus('success');
    } catch (err) {
      const data = err.response?.data || {};
      const detail =
        data.new_password2?.[0] ||
        data.new_password1?.[0] ||
        data.token?.[0] ||
        data.uid?.[0] ||
        data.detail ||
        'Bir hata oluştu.';
      setMessage(detail);
      setStatus('error');
    }
  };

  const invalidLink = !uid || !token;

  return (
    <>
      <style>{RP_CSS}</style>
      <div className="rp-shell">
        <div className="rp-card">

          <Link to="/login" className="rp-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Girişe dön
          </Link>

          {status === 'success' ? (
            <div className="rp-success">
              <div className="rp-success-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h2 className="rp-title">Şifre güncellendi</h2>
              <p className="rp-sub">Yeni şifrenle giriş yapabilirsin.</p>
              <Link to="/login" className="rp-btn">Girişe dön</Link>
            </div>
          ) : invalidLink ? (
            <div className="rp-success">
              <div className="rp-error-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <h2 className="rp-title">Geçersiz bağlantı</h2>
              <p className="rp-sub">Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir sıfırlama isteği gönder.</p>
              <Link to="/forgot-password" className="rp-btn">Tekrar dene</Link>
            </div>
          ) : (
            <>
              <div className="rp-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <h2 className="rp-title">Yeni şifre belirle</h2>
              <p className="rp-sub">Hesabın için güçlü bir şifre seç.</p>

              {status === 'error' && (
                <div className="rp-error">{message}</div>
              )}

              <form onSubmit={onSubmit} className="rp-form">
                <label className="rp-field">
                  <span className="rp-label">Yeni şifre</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={pass1}
                    onChange={e => setPass1(e.target.value)}
                    className="rp-input"
                    minLength={8}
                  />
                </label>

                <label className="rp-field">
                  <span className="rp-label">Yeni şifre tekrar</span>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={pass2}
                    onChange={e => setPass2(e.target.value)}
                    className="rp-input"
                    minLength={8}
                  />
                </label>

                <button type="submit" className="rp-btn" disabled={status === 'loading'}>
                  {status === 'loading' ? (
                    <span className="rp-spinner" />
                  ) : (
                    <>Şifremi güncelle</>
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

const RP_CSS = `
  .rp-shell {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); padding: 24px;
  }
  .rp-card {
    background: #fff; border: 1px solid var(--line); border-radius: 20px;
    padding: 40px 44px; width: 100%; max-width: 420px;
    display: flex; flex-direction: column; gap: 20px;
  }
  .rp-back {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; color: var(--ink-mute); text-decoration: none;
    transition: color .2s; align-self: flex-start;
  }
  .rp-back:hover { color: var(--ink); }
  .rp-icon {
    width: 48px; height: 48px; border-radius: 14px;
    background: var(--accent-tint); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
  }
  .rp-title {
    font-family: var(--serif); font-size: 28px; font-weight: 400;
    letter-spacing: -0.02em; color: var(--ink); margin: 0;
  }
  .rp-sub { font-size: 14px; color: var(--ink-mute); line-height: 1.6; margin: 0; }
  .rp-form { display: flex; flex-direction: column; gap: 16px; }
  .rp-field { display: flex; flex-direction: column; gap: 7px; }
  .rp-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); }
  .rp-input {
    padding: 13px 16px; border: 1px solid var(--line); border-radius: 12px;
    font-size: 15px; font-family: var(--sans); color: var(--ink);
    outline: none; transition: border-color .2s, box-shadow .2s;
    background: #fff;
  }
  .rp-input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(101,163,13,.12); }
  .rp-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    padding: 14px 20px; background: var(--ink); color: #FBFAF5;
    border: none; border-radius: 999px; font-size: 14px; font-weight: 600;
    cursor: pointer; text-decoration: none;
    font-family: var(--sans); transition: background .2s, transform .2s;
    width: 100%;
  }
  .rp-btn:hover:not(:disabled) { background: var(--accent-deep); transform: translateY(-1px); }
  .rp-btn:disabled { opacity: .7; cursor: not-allowed; }
  .rp-error {
    padding: 12px 16px; border-radius: 8px; font-size: 13px;
    background: #fadbd8; color: #c0392b; border: 1px solid #e8a9a4;
  }
  .rp-success { display: flex; flex-direction: column; gap: 16px; }
  .rp-success-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: rgba(101,163,13,.1); color: var(--accent-deep);
    display: flex; align-items: center; justify-content: center;
  }
  .rp-error-icon {
    width: 52px; height: 52px; border-radius: 14px;
    background: #fadbd8; color: #c0392b;
    display: flex; align-items: center; justify-content: center;
  }
  @keyframes rpSpin { to { transform: rotate(360deg); } }
  .rp-spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
    animation: rpSpin .8s linear infinite;
  }
  @media (max-width: 480px) { .rp-card { padding: 28px 24px; } }
`;
