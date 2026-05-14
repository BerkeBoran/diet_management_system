import Icons from './LandingIcons';

export default function AppCTASection() {
  return (
    <section className="section lp-app-cta-wrap" aria-label="Mobil uygulama">
      <div className="container">
        <div className="app-wrap reveal">
          <div className="app-bg-blob app-blob-1" aria-hidden="true" />
          <div className="app-bg-blob app-blob-2" aria-hidden="true" />

          {/* Coming Soon ribbon */}
          <div className="app-coming-banner" aria-label="Yakında geliyor">
            <span className="app-coming-dot" />
            <span>Yakında Geliyor</span>
          </div>

          <div className="app-content">
            <span className="eyebrow" style={{ opacity: 0.65 }}>
              <span className="eyebrow-dot" />Mobil Uygulama · Geliştirme Aşamasında
            </span>
            <h2 className="display serif">
              Cebinde bir <em>diyetisyen,</em><br />uyandığında bir <em>plan.</em>
            </h2>
            <p className="lede">
              Yemek fotoğrafından kalori sayımı, sesli kayıt, akıllı saat senkronu ve uzmanınla anlık mesajlaşma — hepsi tek uygulamada.
            </p>
            <div className="app-stores">
              <div className="app-store app-store-soon" aria-label="App Store — yakında">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="app-store-sm">Yakında</div>
                  <div className="app-store-lg">App Store</div>
                </div>
                <span className="app-store-lock">🔒</span>
              </div>
              <div className="app-store app-store-soon" aria-label="Google Play — yakında">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.18 23.76a2 2 0 0 1-.91-.9L13 12 2.27 1.14a2 2 0 0 1 .91-.9L14.73 12 3.18 23.76zm2.64 1.1L18 17.5l-2.44-2.44L5.82 24.86zm13.36-7.36L16.74 15 19 12l-2.26-3 2.44-2.44L22 12l-2.82 5.5zM5.82-.86L15.56 6.94 18 4.5 6.82-1.14 5.82-.86z"/>
                </svg>
                <div>
                  <div className="app-store-sm">Yakında</div>
                  <div className="app-store-lg">Google Play</div>
                </div>
                <span className="app-store-lock">🔒</span>
              </div>
            </div>
            <div className="app-rating" style={{ opacity: 0.6 }}>
              <Icons.Bolt size={14} />
              <span>1.000+ web kullanıcısı · mobil uygulama geliştiriliyor</span>
            </div>
          </div>

          <div className="app-phone-wrap" aria-label="Uygulama ekran önizlemesi">
            <div className="app-phone">
              <div className="app-phone-inner">
                <div className="app-phone-head">
                  <div className="phone-time">9:41</div>
                  <div className="phone-status-dot" aria-hidden="true" />
                </div>
                <div className="phone-greet">
                  Günaydın <span className="serif" style={{ fontStyle: 'italic' }}>Zeynep</span>
                </div>
                <div className="phone-sub">Bugünkü hedef: 1.620 kcal</div>

                <div className="phone-ring-wrap" aria-label="Kalori takip halkası">
                  <svg viewBox="0 0 120 120" className="phone-ring" aria-hidden="true">
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#F0EDE0" strokeWidth="8"/>
                    <circle cx="60" cy="60" r="52" fill="none" stroke="#65A30D" strokeWidth="8"
                      strokeLinecap="round" strokeDasharray="326" strokeDashoffset="120"
                      transform="rotate(-90 60 60)"/>
                  </svg>
                  <div className="phone-ring-text">
                    <div className="phone-ring-num serif">1.198</div>
                    <div className="phone-ring-label">/ 1.620 kcal</div>
                  </div>
                </div>

                <div className="phone-meals">
                  {[
                    { icon: '☀', label: 'Kahvaltı', cal: '412', bg: '#FBF6EC', now: false },
                    { icon: '◐', label: 'Öğle',     cal: '486', bg: '#ECFCCB', now: false },
                    { icon: '+', label: 'Akşam ekle', cal: '—', bg: '#65A30D', now: true  },
                  ].map(m => (
                    <div key={m.label} className={`phone-meal${m.now ? ' phone-meal-now' : ''}`}>
                      <div className="meal-icon" style={{
                        background: m.bg, color: m.now ? '#fff' : undefined,
                      }}>{m.icon}</div>
                      <div className="meal-name">{m.label}</div>
                      <div className="meal-cal">{m.cal}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="app-phone-notch" aria-hidden="true" />
            </div>
            {/* Coming soon overlay on phone */}
            <div className="app-phone-overlay" aria-hidden="true">
              <div className="app-phone-overlay-pill">Yakında</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .lp-app-cta-wrap { padding-top: 0; }
        .app-wrap {
          background: #F5F1E8; border-radius: 32px;
          padding: 80px 64px;
          display: grid; grid-template-columns: 1fr 380px; gap: 56px; align-items: center;
          position: relative; overflow: hidden;
        }
        .app-bg-blob {
          position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.4; pointer-events: none;
        }
        .app-blob-1 { background: #65A30D; width: 360px; height: 360px; top: -100px; right: 30%; }
        .app-blob-2 { background: #C97B5C; width: 280px; height: 280px; bottom: -80px; left: 20%; opacity: 0.25; }

        /* Coming Soon banner */
        .app-coming-banner {
          position: absolute; top: 28px; right: 28px;
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(26,37,22,0.82); backdrop-filter: blur(8px);
          color: #FBFAF5; padding: 7px 16px; border-radius: 999px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.08em;
          font-family: "JetBrains Mono", monospace; text-transform: uppercase;
          z-index: 10; border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
        }
        .app-coming-dot {
          width: 7px; height: 7px; border-radius: 50%; background: #FBBF24;
          animation: app-blink 1.6s ease-in-out infinite;
        }
        @keyframes app-blink {
          0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
        }

        .app-content {
          position: relative; z-index: 1;
          display: flex; flex-direction: column; gap: 18px; max-width: 560px;
        }
        .app-content .display { font-family: "Instrument Serif", serif; font-size: clamp(36px, 4.5vw, 56px); line-height: 1.02; }

        /* Store buttons — visible but non-interactive */
        .app-stores { display: flex; gap: 12px; margin-top: 12px; flex-wrap: wrap; }
        .app-store {
          display: inline-flex; align-items: center; gap: 12px;
          background: #1A2516; color: #fff; padding: 12px 20px; border-radius: 14px;
          text-decoration: none; position: relative;
        }
        .app-store-soon {
          opacity: 0.55;
          cursor: not-allowed;
          pointer-events: none;
          filter: grayscale(0.3);
        }
        .app-store-sm { font-size: 10px; opacity: 0.75; text-transform: uppercase; letter-spacing: 0.1em; color: #FBBF24; }
        .app-store-lg { font-size: 16px; font-weight: 600; line-height: 1.1; }
        .app-store-lock { font-size: 12px; position: absolute; top: -6px; right: -6px; }

        .app-rating { display: flex; align-items: center; gap: 10px; font-size: 13px; color: #3F4A38; margin-top: 4px; }

        /* Phone */
        .app-phone-wrap { position: relative; display: flex; justify-content: center; z-index: 1; }
        .app-phone {
          width: 280px; aspect-ratio: 9/19; background: #fff; border-radius: 36px;
          box-shadow: 0 40px 80px -20px rgba(26,37,22,0.3), 0 8px 24px rgba(26,37,22,0.1);
          padding: 14px; position: relative;
          transform: rotate(-2deg);
          filter: brightness(0.82) saturate(0.8);
        }
        .app-phone-inner {
          background: #FBFAF5; border-radius: 24px;
          height: 100%; padding: 36px 18px 18px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .app-phone-notch {
          position: absolute; top: 22px; left: 50%; transform: translateX(-50%);
          width: 80px; height: 22px; background: #1A2516; border-radius: 12px;
        }
        .app-phone-head { display: flex; justify-content: space-between; font-size: 11px; font-weight: 600; }
        .phone-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #65A30D; }
        .phone-greet { font-family: "Instrument Serif", serif; font-size: 22px; line-height: 1.1; }
        .phone-sub { font-size: 11px; color: #6B7363; margin-top: -8px; }
        .phone-ring-wrap { position: relative; width: 140px; height: 140px; margin: 6px auto; }
        .phone-ring { width: 100%; height: 100%; }
        .phone-ring-text {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .phone-ring-num { font-family: "Instrument Serif", serif; font-size: 26px; line-height: 1; color: #1A2516; letter-spacing: -0.02em; }
        .phone-ring-label { font-size: 10px; color: #6B7363; margin-top: 3px; font-family: "JetBrains Mono", monospace; }
        .phone-meals { display: flex; flex-direction: column; gap: 6px; margin-top: 4px; }
        .phone-meal {
          display: flex; align-items: center; gap: 10px;
          background: #fff; border-radius: 12px; padding: 8px 10px;
          border: 1px solid #F0EDE0;
        }
        .meal-icon {
          width: 28px; height: 28px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center; font-size: 13px; flex-shrink: 0;
        }
        .meal-name { flex: 1; font-size: 12px; font-weight: 500; }
        .meal-cal { font-family: "JetBrains Mono", monospace; font-size: 11px; color: #6B7363; }
        .phone-meal-now { border-color: #65A30D; background: #F7FBE8; }

        /* Phone coming soon overlay */
        .app-phone-overlay {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          pointer-events: none;
        }
        .app-phone-overlay-pill {
          background: rgba(26,37,22,0.75); backdrop-filter: blur(6px);
          color: #FBFAF5; padding: 10px 22px; border-radius: 999px;
          font-size: 13px; font-weight: 700; letter-spacing: 0.12em;
          text-transform: uppercase; font-family: "JetBrains Mono", monospace;
          border: 1px solid rgba(255,255,255,0.15);
        }

        @media (max-width: 860px) {
          .app-wrap { grid-template-columns: 1fr; padding: 48px 28px; }
          .app-phone-wrap { order: -1; }
          .app-coming-banner { top: 16px; right: 16px; font-size: 10px; }
        }
      `}</style>
    </section>
  );
}
