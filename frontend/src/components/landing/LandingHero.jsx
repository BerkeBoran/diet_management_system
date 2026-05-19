import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icons from './LandingIcons';
import api from '../../services/api';

function getSharedCount(min = 10, max = 50) {
  // Tam sayı bucket → aynı 10s penceresinde herkes aynı değeri hesaplar
  const bucket = Math.floor(Date.now() / 10000);
  const mid = Math.round((min + max) / 2);
  const amp = Math.floor((max - min) / 4);
  // İrrasyonel frekanslı dalgalar → ardışık bucket'lar arasında küçük (~1-2 birim) değişim
  const wave = Math.sin(bucket * 0.113) * 0.6 + Math.sin(bucket * 0.307) * 0.4;
  return Math.round(Math.min(max, Math.max(min, mid + amp * wave)));
}

function useSimulatedOnline(min = 10, max = 50) {
  const [count, setCount] = useState(() => getSharedCount(min, max));
  useEffect(() => {
    const id = setInterval(() => setCount(getSharedCount(min, max)), 10000);
    return () => clearInterval(id);
  }, [min, max]);
  return count;
}

const INTENTS = [
  { q: '5 kilo vermem lazım',  t: ['Kalori dengesi', 'Protein hedefi', 'Akdeniz mutfağı'] },
  { q: 'Glutensiz tarifler',   t: ['Karabuğday', 'Pirinç unu', 'Kinoa salatası'] },
  { q: 'Ramazan menüsü',       t: ['Sahur planı', 'İftar dengeleme', 'Hidrasyon'] },
];

const TITLE_PREFIX = {
  EXPERT_DIETICIAN: 'Uzm. Dyt.',
  DIETICIAN:        'Dyt.',
  INTERN_DIETICIAN: 'Stj. Dyt.',
};
const TITLE_SUB = {
  EXPERT_DIETICIAN: 'Uzman Diyetisyen',
  DIETICIAN:        'Diyetisyen',
  INTERN_DIETICIAN: 'Stajyer Diyetisyen',
};
const AVATAR_COLORS = ['#C97B5C', '#8FA876', '#D4A574', '#7A8B6F', '#B8927D'];

const FALLBACK_UZMAN = [
  { id: 'f1', prefix: 'Dyt.', firstName: 'Elif',  lastName: 'Demirkan', sub: 'Klinik Beslenme', photo: null, color: '#C97B5C' },
  { id: 'f2', prefix: 'Dyt.', firstName: 'Mert',  lastName: 'Kayaalp',  sub: 'Sporcu Beslenmesi', photo: null, color: '#8FA876' },
  { id: 'f3', prefix: 'Dyt.', firstName: 'Selin', lastName: 'Aksoy',    sub: 'Çocuk & Aile', photo: null, color: '#D4A574' },
];

function photoUrl(raw) {
  if (!raw) return null;
  try { return new URL(raw).pathname; } catch { return raw || null; }
}

export default function LandingHero() {
  const onlineCount = useSimulatedOnline(10, 50);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState('');

  const [uzmanList, setUzmanList]   = useState(FALLBACK_UZMAN);
  const [uzmanIdx, setUzmanIdx]     = useState(0);
  const [uzmanVisible, setUzmanVisible] = useState(true);
  const uzmanTimer = useRef(null);

  useEffect(() => {
    api.get('/users/dieticians/')
      .then(r => {
        const data = r.data?.results ?? r.data;
        if (Array.isArray(data) && data.length > 0) {
          setUzmanList(data.map((d, i) => ({
            id:        d.id,
            prefix:    TITLE_PREFIX[d.title] || 'Dyt.',
            firstName: d.first_name,
            lastName:  d.last_name,
            sub:       TITLE_SUB[d.title] || 'Diyetisyen',
            photo:     photoUrl(d.profile_photo),
            color:     AVATAR_COLORS[i % AVATAR_COLORS.length],
          })));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    uzmanTimer.current = setInterval(() => {
      setUzmanVisible(false);
      setTimeout(() => {
        setUzmanIdx(i => (i + 1) % uzmanList.length);
        setUzmanVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(uzmanTimer.current);
  }, [uzmanList]);

  useEffect(() => {
    let mounted = true;
    let ix = 0;
    const cur = INTENTS[idx].q;
    const tick = () => {
      if (!mounted) return;
      ix++;
      setTyped(cur.slice(0, ix));
      if (ix < cur.length) {
        setTimeout(tick, 55 + Math.random() * 40);
      } else {
        setTimeout(() => { if (mounted) setIdx(i => (i + 1) % INTENTS.length); }, 2400);
      }
    };
    setTyped('');
    setTimeout(tick, 350);
    return () => { mounted = false; };
  }, [idx]);

  return (
    <section id="hero" className="lp-hero" aria-label="Kahraman bölümü">
      {/* Full-bleed photo */}
      <div className="lp-hero-bg" aria-hidden="true">
        <div className="lp-hero-photo">
          <span className="photo-label">Fotoğraf · Akdeniz tabağı, taze sebzeler</span>
        </div>
        <div className="lp-hero-vignette" />
        <div className="lp-hero-grain" />
      </div>

      <div className="container lp-hero-inner">
        <div className="lp-hero-eyebrow reveal in">
          <span className="eyebrow live">
            <span className="eyebrow-dot" />
            Şu an {onlineCount.toLocaleString('tr-TR')} kişi plan oluşturuyor
          </span>
        </div>

        <h1 className="lp-hero-title reveal in reveal-delay-1">
          Bilim destekli<br />
          <em className="serif" style={{ fontStyle: 'italic' }}>kişisel beslenme,</em><br />
          bir tık uzakta.
        </h1>

        <p className="lp-hero-lede reveal in reveal-delay-2">
          Lifeetics; AI asistanı ve uzman diyetisyenleri tek çatı altında buluşturur.
          90 saniyede sana özel plan, 24 saatte uzman onayı.
        </p>

        <div className="lp-hero-ctas reveal in reveal-delay-3">
          <Link to="/register/client" className="btn btn-accent lp-hero-cta-primary">
            <Icons.Sparkle size={16} />
            AI ile başla
            <span className="btn-arrow"><Icons.ArrowRight size={12} /></span>
          </Link>
          <Link to="/register/dietician" className="btn btn-ghost">
            <Icons.Stethoscope size={16} />
            Diyetisyenle görüş
          </Link>
        </div>

        <div className="lp-hero-trust reveal in reveal-delay-4">
          <div className="lp-hero-avatars" aria-hidden="true">
            {['#D4A574', '#C97B5C', '#8FA876', '#B8927D'].map((c, n) => (
              <span key={n} className="lp-hero-avatar" style={{ background: c }} />
            ))}
          </div>
          <div className="lp-hero-trust-text">
            <div className="lp-hero-trust-main">1.000+ kişi şu an Lifeetics kullanıyor</div>
          </div>
        </div>
      </div>

      {/* Floating AI card */}
      <div className="lp-hero-card lp-hero-card-ai reveal in reveal-delay-2" aria-label="AI asistan önizlemesi">
        <div className="lp-hero-card-head">
          <span className="lp-hero-card-tag">
            <Icons.Sparkle size={12} /> AI Asistan
          </span>
          <span className="lp-hero-card-status">
            <span className="lp-dot-pulse" /> düşünüyor
          </span>
        </div>
        <div className="lp-hero-card-q">
          "{typed}<span className="lp-caret">|</span>"
        </div>
        <div className="lp-hero-card-thoughts">
          {INTENTS[idx].t.map((t, ix) => (
            <div key={t} className="lp-thought" style={{ animationDelay: `${ix * 0.18}s` }}>
              <span className="lp-thought-bar" style={{ animationDelay: `${ix * 0.18}s` }} />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating dietician card — rotates every 5s */}
      <div className="lp-hero-card lp-hero-card-uzman reveal in reveal-delay-3" aria-label="Uzman diyetisyen önizlemesi">
        {(() => {
          const u = uzmanList[uzmanIdx] || uzmanList[0];
          return (
            <>
              <div
                className="lp-hero-uzman-pic"
                aria-hidden="true"
                style={{
                  opacity: uzmanVisible ? 1 : 0,
                  transition: 'opacity 0.4s ease',
                  ...(u.photo
                    ? { backgroundImage: `url(${u.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
                    : { background: `linear-gradient(135deg, ${u.color} 0%, ${u.color}aa 100%)` }
                  )
                }}
              />
              <div className="lp-hero-uzman-meta" style={{ opacity: uzmanVisible ? 1 : 0, transition: 'opacity 0.4s ease' }}>
                <div className="lp-hero-uzman-name">{u.prefix} {u.firstName} {u.lastName}</div>
                <div className="lp-hero-uzman-sub">{u.sub}</div>
                <div className="lp-hero-uzman-avail">
                  <span className="lp-dot-live" />Bugün uygun
                </div>
              </div>
            </>
          );
        })()}
        <button className="lp-hero-uzman-btn">Randevu</button>
      </div>

      <a href="#nasil" className="lp-hero-scroll" aria-label="Aşağı kaydır">
        <span>Aşağı kaydır</span>
        <span className="lp-hero-scroll-line" />
      </a>

      <style>{`
        .lp-hero {
          position: relative; min-height: 100vh;
          padding: 140px 0 80px;
          display: flex; align-items: center; overflow: hidden;
        }
        .lp-hero-bg { position: absolute; inset: 0; z-index: 0; }
        .lp-hero-photo {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse at 65% 40%, #E8DFC8 0%, #D4C5A0 30%, #B8A175 70%, #8B7755 100%),
            linear-gradient(180deg, #F5F1E8, #B8A175);
          display: flex; align-items: flex-end; justify-content: flex-end;
          padding: 32px; background-size: cover; background-position: center;
        }
        .lp-hero-photo::before {
          content: ""; position: absolute; inset: 0;
          background:
            radial-gradient(circle at 25% 30%, rgba(101,163,13,0.22) 0%, transparent 35%),
            radial-gradient(circle at 80% 60%, rgba(201,123,92,0.2) 0%, transparent 40%),
            radial-gradient(circle at 60% 80%, rgba(143,168,118,0.25) 0%, transparent 45%);
        }
        .lp-hero-photo::after {
          content: ""; position: absolute; inset: 0;
          background-image:
            radial-gradient(circle at 20% 30%, rgba(212,165,116,0.6) 0 8%, transparent 9%),
            radial-gradient(circle at 70% 25%, rgba(101,163,13,0.5) 0 6%, transparent 7%),
            radial-gradient(circle at 35% 65%, rgba(201,123,92,0.5) 0 7%, transparent 8%),
            radial-gradient(circle at 80% 70%, rgba(143,168,118,0.6) 0 9%, transparent 10%),
            radial-gradient(circle at 50% 45%, rgba(184,161,117,0.4) 0 12%, transparent 13%);
          mix-blend-mode: multiply; opacity: 0.7;
        }
        .lp-hero-photo .photo-label {
          position: relative; z-index: 2;
          background: rgba(255,255,255,0.85); color: #6B7363;
        }
        .lp-hero-vignette {
          position: absolute; inset: 0;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.85) 35%, rgba(255,255,255,0.4) 60%, transparent 90%),
            linear-gradient(180deg, transparent 50%, rgba(255,255,255,0.5) 100%);
        }
        .lp-hero-grain {
          position: absolute; inset: 0; opacity: 0.5; pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0 0.2 0 0 0 0.4 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/></svg>");
        }

        .lp-hero-inner {
          position: relative; z-index: 2;
          display: flex; flex-direction: column; gap: 22px; width: 100%;
        }
        .lp-hero-eyebrow { margin-bottom: 4px; }
        .lp-hero-title {
          font-family: "Instrument Serif", serif; font-weight: 400;
          font-size: clamp(44px, 6.4vw, 88px);
          line-height: 1.08; letter-spacing: -0.025em;
          color: #1A2516; max-width: 16ch; margin-bottom: 24px;
        }
        .lp-hero-title em { color: #4D7C0F; }
        .lp-hero-lede {
          font-size: clamp(16px, 1.3vw, 19px); color: #3F4A38;
          max-width: 460px; line-height: 1.55; margin-top: 8px;
        }
        .lp-hero-ctas { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .lp-hero-cta-primary { padding: 16px 24px; font-size: 16px; }

        .lp-hero-trust { display: flex; align-items: center; gap: 14px; margin-top: 24px; }
        .lp-hero-avatars { display: flex; }
        .lp-hero-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          border: 2px solid #fff; margin-left: -8px;
          box-shadow: 0 1px 2px rgba(26,37,22,0.04);
        }
        .lp-hero-avatar:first-child { margin-left: 0; }
        .lp-hero-trust-main { font-size: 13px; font-weight: 600; color: #1A2516; }
        .lp-hero-trust-sub  { font-size: 12px; color: #6B7363; margin-top: 2px; }

        /* Floating cards */
        .lp-hero-card {
          position: absolute; z-index: 3;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(16px) saturate(140%);
          border: 1px solid rgba(232,228,213,0.7);
          border-radius: 16px;
          box-shadow: 0 24px 60px -20px rgba(26,37,22,0.18), 0 8px 24px rgba(26,37,22,0.08);
          transition: transform .5s cubic-bezier(0.22,1,0.36,1), box-shadow .5s;
        }
        .lp-hero-card:hover {
          transform: translateY(-4px) scale(1.015);
          box-shadow: 0 40px 80px -30px rgba(26,37,22,0.25);
        }

        .lp-hero-card-ai {
          right: 6%; top: 22%; width: 320px; padding: 18px;
          animation: lp-float1 9s ease-in-out infinite;
        }
        .lp-hero-card-head {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
        }
        .lp-hero-card-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: #F7FBE8; color: #4D7C0F;
          padding: 4px 10px; border-radius: 999px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.01em;
        }
        .lp-hero-card-status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; color: #6B7363; font-family: "JetBrains Mono", monospace;
        }
        .lp-dot-pulse {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #65A30D; animation: lp-pulse 1.4s ease-out infinite;
        }
        .lp-hero-card-q {
          font-family: "Instrument Serif", serif; font-style: italic;
          font-size: 19px; color: #1A2516; line-height: 1.3;
          min-height: 50px; letter-spacing: -0.01em;
        }
        .lp-caret {
          display: inline-block; animation: lp-blink 1s step-end infinite;
          color: #65A30D; font-style: normal;
        }

        .lp-hero-card-thoughts {
          display: flex; flex-direction: column; gap: 8px;
          margin-top: 14px; padding-top: 14px; border-top: 1px solid #F0EDE0;
        }
        .lp-thought {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; color: #3F4A38;
          opacity: 0; animation: lp-thought-in .5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .lp-thought-bar {
          width: 24px; height: 3px; border-radius: 2px; flex-shrink: 0;
          background: linear-gradient(90deg, #65A30D, transparent);
          background-size: 200% 100%;
          animation: lp-shimmer 1.6s ease-in-out infinite;
        }

        .lp-hero-card-uzman {
          right: 12%; bottom: 18%; width: 270px; padding: 14px;
          display: flex; align-items: center; gap: 12px;
          animation: lp-float2 11s ease-in-out infinite;
        }
        .lp-hero-uzman-pic {
          width: 52px; height: 52px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #C97B5C 0%, #8B5A3F 100%); position: relative;
          background-size: cover; background-position: center top;
        }
        .lp-hero-uzman-pic::after {
          content: ""; position: absolute; inset: 0; border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.2), transparent 50%);
        }
        .lp-hero-uzman-meta { flex: 1; min-width: 0; }
        .lp-hero-uzman-name { font-weight: 600; font-size: 14px; color: #1A2516; }
        .lp-hero-uzman-sub  { font-size: 11px; color: #6B7363; margin-top: 1px; }
        .lp-hero-uzman-avail {
          display: inline-flex; align-items: center; gap: 6px;
          margin-top: 6px; font-size: 11px; color: #4D7C0F; font-weight: 600;
        }
        .lp-dot-live {
          display: inline-block; width: 6px; height: 6px; border-radius: 50%;
          background: #65A30D; animation: lp-pulse 1.6s ease-out infinite;
        }
        .lp-hero-uzman-btn {
          background: #1A2516; color: #fff;
          padding: 8px 14px; border-radius: 999px;
          font-size: 12px; font-weight: 600;
          transition: background .2s, transform .2s;
          border: none; cursor: pointer;
        }
        .lp-hero-uzman-btn:hover { background: #4D7C0F; transform: scale(1.04); }

        .lp-hero-scroll {
          position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
          z-index: 3; display: flex; flex-direction: column; align-items: center; gap: 12px;
          font-family: "JetBrains Mono", monospace; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.2em; color: #6B7363;
          text-decoration: none;
        }
        .lp-hero-scroll-line {
          width: 1px; height: 40px; background: #6B7363;
          position: relative; overflow: hidden;
        }
        .lp-hero-scroll-line::after {
          content: ""; position: absolute; inset: 0; background: #65A30D;
          animation: lp-scroll-pulse 2s ease-in-out infinite;
        }

        @media (max-width: 1100px) {
          .lp-hero-card-ai { right: 4%; top: 18%; width: 280px; }
          .lp-hero-card-uzman { right: 6%; bottom: 12%; }
        }
        @media (max-width: 860px) {
          .lp-hero { padding-top: 120px; min-height: auto; }
          .lp-hero-card-ai, .lp-hero-card-uzman { display: none; }
          .lp-hero-vignette {
            background: linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.95) 100%);
          }
        }
      `}</style>
    </section>
  );
}
