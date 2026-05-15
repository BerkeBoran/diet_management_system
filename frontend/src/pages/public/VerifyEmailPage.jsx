import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function VerifyEmailPage() {
  const params = useParams();
  const rawKey = params['*'] || '';
  const key = decodeURIComponent(rawKey.replace(/\/$/, ''));
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (!key) {
      setStatus('error');
      return;
    }
    api.post('/auth/registration/verify-email/', { key })
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [key]);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--forest)',
    }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: '48px 40px',
        textAlign: 'center', maxWidth: 420, width: '90%',
      }}>
        {status === 'loading' && <p>E-posta doğrulanıyor...</p>}

        {status === 'success' && (
          <>
            <h2 style={{ color: 'var(--forest)', marginBottom: 12 }}>E-posta Doğrulandı!</h2>
            <p style={{ color: '#555', marginBottom: 24 }}>
              Hesabınız aktif edildi. Artık giriş yapabilirsiniz.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--forest)', color: 'white', border: 'none',
                borderRadius: 8, padding: '12px 32px', cursor: 'pointer', fontSize: 15,
              }}
            >
              Giriş Yap
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 style={{ color: '#c0392b', marginBottom: 12 }}>Doğrulama Başarısız</h2>
            <p style={{ color: '#555', marginBottom: 24 }}>
              Link geçersiz veya süresi dolmuş olabilir.
            </p>
            <button
              onClick={() => navigate('/register')}
              style={{
                background: 'var(--forest)', color: 'white', border: 'none',
                borderRadius: 8, padding: '12px 32px', cursor: 'pointer', fontSize: 15,
              }}
            >
              Tekrar Kayıt Ol
            </button>
          </>
        )}
      </div>
    </div>
  );
}
