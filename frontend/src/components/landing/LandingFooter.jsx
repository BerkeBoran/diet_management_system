import { Link } from 'react-router-dom';
import Icons from './LandingIcons';

const COLS = [
  { title: 'Ürün',      links: ['AI Asistan', 'Diyetisyenler', 'Mobil uygulama', 'Fiyatlandırma', 'Kurumsal'] },
  { title: 'Çözümler',  links: ['Kilo yönetimi', 'PCOS & Hormon', 'Diyabet & Kalp', 'Sporcu beslenmesi', 'Aile & çocuk'] },
  { title: 'Şirket',    links: ['Hakkımızda', 'Kariyer', 'Basın', 'Blog', { label: 'İletişim', to: '/support' }] },
  { title: 'Kaynaklar', links: [{ label: 'Yardım merkezi', to: '/support' }, 'Bilim kurulu', 'Tarif arşivi', 'Kullanım koşulları', { label: 'KVKK', to: '/kvkk' }] },
];

export default function LandingFooter() {
  return (
    <footer className="lp-footer" aria-label="Site alt bilgisi">
      <div className="container">

        {/* CTA strip */}
        <div className="lp-foot-cta">
          <div>
            <h3 className="serif lp-foot-cta-title">
              Bugün başla.<br /><em>Yarın değişimi gör.</em>
            </h3>
            <p className="lp-foot-cta-sub">14 gün ücretsiz dene. Kart bilgisi gerekmez.</p>
          </div>
          <div className="lp-foot-cta-btns">
            <Link to="/register/client" className="btn btn-accent">
              <Icons.Sparkle size={16} /> AI ile başla
              <span className="btn-arrow"><Icons.ArrowRight size={12} /></span>
            </Link>
            <Link to="/register/dietician" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>
              <Icons.Stethoscope size={16} /> Diyetisyenle görüş
            </Link>
          </div>
        </div>

        {/* Grid */}
        <div className="lp-foot-grid">
          <div className="lp-foot-brand">
            <Link to="/" aria-label="Lifeetics Ana Sayfa" style={{ textDecoration: 'none' }}>
              <span style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 700,
                fontSize: 38,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
              }}>LIFEETICS</span>
            </Link>
            <p className="lp-foot-tag">
              Bilim destekli kişisel beslenme. AI ile hız, uzman diyetisyenle güvence.
            </p>
            <div className="lp-foot-social">
              <a href="#" aria-label="Instagram"><Icons.Instagram size={16} /></a>
              <a href="#" aria-label="Twitter"><Icons.Twitter size={16} /></a>
              <a href="#" aria-label="LinkedIn"><Icons.Linkedin size={16} /></a>
              <a href="#" aria-label="YouTube"><Icons.Youtube size={16} /></a>
            </div>
          </div>

          {COLS.map(c => (
            <div key={c.title} className="lp-foot-col">
              <div className="lp-foot-col-title">{c.title}</div>
              <ul>
                {c.links.map(l => {
                  const label = typeof l === 'string' ? l : l.label;
                  const to    = typeof l === 'object' ? l.to : null;
                  return (
                    <li key={label}>
                      {to ? <Link to={to}>{label}</Link> : <a href="#">{label}</a>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="lp-foot-bot">
          <div>© 2026 Lifeetics · Beslenme Teknolojileri A.Ş.</div>
          <div className="lp-foot-meta">
            <span>İstanbul · Made with care</span>
            <span className="lp-foot-dot" />
            <span><Icons.Shield size={12} /> KVKK &amp; ISO 27001</span>
          </div>
        </div>
      </div>

      <style>{`
        .lp-footer {
          background: #1A2516; color: rgba(255,255,255,0.85);
          padding: 80px 0 40px; margin-top: 0;
        }
        .lp-foot-cta {
          display: flex; justify-content: space-between; align-items: center; gap: 32px;
          padding-bottom: 56px; margin-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.1); flex-wrap: wrap;
        }
        .lp-foot-cta-title {
          font-family: "Instrument Serif", serif;
          font-size: clamp(36px, 4.5vw, 56px); line-height: 1.02; color: #fff; letter-spacing: -0.02em;
        }
        .lp-foot-cta-title em { color: #65A30D; }
        .lp-foot-cta-sub { color: rgba(255,255,255,0.78); margin-top: 12px; font-size: 15px; }
        .lp-foot-cta-btns { display: flex; gap: 12px; flex-wrap: wrap; }

        .lp-foot-grid {
          display: grid; grid-template-columns: 1.4fr repeat(4,1fr);
          gap: 48px; padding-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .lp-foot-brand { display: flex; flex-direction: column; gap: 18px; }
        .lp-foot-tag { font-size: 14px; color: rgba(255,255,255,0.78); max-width: 280px; line-height: 1.6; }
        .lp-foot-social { display: flex; gap: 8px; }
        .lp-foot-social a {
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); transition: all .25s; text-decoration: none;
        }
        .lp-foot-social a:hover { background: #65A30D; color: #fff; transform: translateY(-2px); }

        .lp-foot-col-title {
          font-family: "JetBrains Mono", monospace; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: rgba(255,255,255,0.72); margin-bottom: 18px;
        }
        .lp-foot-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .lp-foot-col a { font-size: 14px; color: rgba(255,255,255,0.78); transition: color .2s; text-decoration: none; }
        .lp-foot-col a:hover { color: #ECFCCB; }

        .lp-foot-bot {
          padding-top: 32px;
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px; color: rgba(255,255,255,0.45);
          font-family: "JetBrains Mono", monospace;
          flex-wrap: wrap; gap: 12px;
        }
        .lp-foot-meta { display: flex; align-items: center; gap: 12px; }
        .lp-foot-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .lp-foot-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.3); }

        @media (max-width: 980px) {
          .lp-foot-grid { grid-template-columns: repeat(2,1fr); }
          .lp-foot-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 560px) {
          .lp-foot-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </footer>
  );
}
