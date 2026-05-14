import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icons from './LandingIcons';
import { useAuth } from '../../contexts/AuthContext';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dashboardPath = user?.role === 'Dietician' ? '/dietician/dashboard' : '/client/dashboard';

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: 'Kaç kalori?', to: '/foods/kac-kalori' },
    { label: 'Nasıl çalışır', href: '#nasil' },
    { label: 'Diyetisyenler', href: '#diyetisyen' },
    { label: 'Fiyatlandırma', href: '#fiyat' },
    { label: 'Destek', href: '#destek' },
  ];

  return (
    <header className={`lp-nav ${scrolled ? 'lp-nav-scrolled' : ''}`} role="banner">
      <div className="lp-nav-inner">
        <Link to="/" className="lp-nav-logo" aria-label="Lifeetics Ana Sayfa">
          <span style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 700,
            fontSize: '40px',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
          }}>LIFEETICS</span>
        </Link>

        <nav className="lp-nav-links" aria-label="Birincil navigasyon">
          {links.map((l) =>
            l.to ? (
              <Link key={l.to} to={l.to} className="lp-nav-link lp-nav-link-feature">
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} className="lp-nav-link">
                {l.label}
              </a>
            )
          )}
        </nav>

        <div className="lp-nav-cta">
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-primary lp-nav-btn">
                Panele Git
                <Icons.ArrowRight size={16} />
              </Link>
              <button onClick={handleLogout} className="lp-nav-link lp-nav-link-quiet" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="lp-nav-link lp-nav-link-quiet">Giriş yap</Link>
              <Link to="/register" className="btn btn-primary lp-nav-btn">
                Ücretsiz dene
                <Icons.ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>

        <button
          className="lp-nav-burger"
          aria-label={open ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span className={open ? 'open' : ''} />
          <span className={open ? 'open' : ''} />
        </button>
      </div>

      {open && (
        <div className="lp-nav-mobile" role="navigation" aria-label="Mobil navigasyon">
          {links.map((l) =>
            l.to ? (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ) : (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            )
          )}
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
                Panele Git
              </Link>
              <button onClick={() => { setOpen(false); handleLogout(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', borderRadius: 12, fontWeight: 500, textAlign: 'left', color: '#1A2516', fontSize: 14 }}>
                Çıkış Yap
              </button>
            </>
          ) : (
            <Link to="/register" className="btn btn-primary" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
              Ücretsiz dene
            </Link>
          )}
        </div>
      )}

      <style>{`
        .lp-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          padding: 16px 0;
          transition: background .35s cubic-bezier(0.22,1,0.36,1), backdrop-filter .35s, padding .35s, box-shadow .35s;
        }
        .lp-nav-scrolled {
          background: rgba(255,255,255,0.78);
          backdrop-filter: blur(20px) saturate(140%);
          -webkit-backdrop-filter: blur(20px) saturate(140%);
          border-bottom: 1px solid rgba(232,228,213,0.6);
          padding: 10px 0;
        }
        .lp-nav-inner {
          max-width: 1280px; margin: 0 auto; padding: 0 32px;
          display: flex; align-items: center; gap: 32px;
        }
        .lp-nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: "Plus Jakarta Sans", sans-serif; font-weight: 700; font-size: 19px;
          letter-spacing: -0.02em; color: #1A2516; text-decoration: none;
        }
        .lp-nav-logo-mark { display: inline-flex; }
        .lp-nav-links {
          display: flex; gap: 4px; align-items: center;
          margin-left: 16px;
        }
        .lp-nav-link {
          padding: 8px 14px; border-radius: 999px;
          font-size: 14px; font-weight: 500; color: #3F4A38;
          transition: background .2s, color .2s; text-decoration: none;
        }
        .lp-nav-link:hover { background: #FBFAF5; color: #1A2516; }
        .lp-nav-link-feature {
          color: #4D7C0F !important;
          font-weight: 600;
          background: rgba(236, 252, 203, 0.55);
        }
        .lp-nav-link-feature:hover {
          background: #ECFCCB !important;
          color: #365314 !important;
        }
        .lp-nav-link-quiet { color: #3F4A38; }
        .lp-nav-cta { margin-left: auto; display: flex; align-items: center; gap: 6px; }
        .lp-nav-btn { padding: 10px 18px; font-size: 14px; }
        .lp-nav-burger {
          display: none; flex-direction: column; gap: 5px;
          width: 36px; height: 36px; align-items: center; justify-content: center;
          background: none; border: none; cursor: pointer; padding: 0;
        }
        .lp-nav-burger span {
          display: block; width: 20px; height: 1.5px; background: #1A2516;
          transition: transform .3s, opacity .3s;
        }
        .lp-nav-burger span.open:first-child { transform: translateY(3px) rotate(45deg); }
        .lp-nav-burger span.open:last-child  { transform: translateY(-3px) rotate(-45deg); }
        .lp-nav-mobile {
          display: flex; flex-direction: column; gap: 4px;
          padding: 16px 32px 24px;
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid #E8E4D5;
        }
        .lp-nav-mobile a { padding: 14px 16px; border-radius: 12px; font-weight: 500; text-decoration: none; color: #1A2516; }
        .lp-nav-mobile a:hover { background: #FBFAF5; }

        @media (max-width: 980px) {
          .lp-nav-links { display: none; }
          .lp-nav-cta .lp-nav-link-quiet { display: none; }
          .lp-nav-burger { display: flex; }
        }
        @media (max-width: 520px) {
          .lp-nav-btn span { display: none; }
        }
      `}</style>
    </header>
  );
}
