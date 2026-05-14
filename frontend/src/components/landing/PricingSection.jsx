import { Link } from 'react-router-dom';
import Icons from './LandingIcons';

export default function PricingSection() {
  return (
    <section id="fiyat" className="section lp-pricing" aria-label="Fiyatlandırma planları">
      <div className="container">
        <div className="pricing-head reveal">
          <span className="eyebrow"><span className="eyebrow-dot" />Fiyatlandırma</span>
          <h2 className="display serif pricing-display">
            Şeffaf fiyat, <em>iptal kolaylığı.</em>
          </h2>
          <p className="lede pricing-lede">
            14 gün ücretsiz dene. Beğenmezsen tek tıkla iptal et.
          </p>
        </div>

        <div className="pricing-cards">
          {/* AI Plan */}
          <article className="ppplan ppplan-ai reveal reveal-delay-1">
            <div className="ppplan-ribbon">AI Diyet</div>
            <div className="ppplan-head">
              <div className="ppplan-icon"><Icons.Sparkle size={22} /></div>
              <div>
                <div className="ppplan-name serif">AI Plan</div>
                <div className="ppplan-sub">Anında, sınırsız, esnek</div>
              </div>
            </div>
            <div className="ppplan-price">
              <span className="ppprice-num serif" style={{ fontSize: 44 }}>Ücretsiz</span>
            </div>
            <div className="ppplan-price-sub">
              Geliştirme aşamasında belli bir süre tamamen ücretsiz.
            </div>
            <Link to="/register/client" className="btn btn-accent ppplan-cta">
              <Icons.Sparkle size={16} /> AI ile başla <Icons.ArrowRight size={14} />
            </Link>
            <ul className="ppplan-feats">
              {[
                'Kişiye özel plan oluşturma',
                'Günlük öğün ve makro takibi',
                'Alışveriş listesi & tarif önerileri',
                'Mobil uygulama erişimi',
                '7/24 anlık AI asistan',
              ].map(f => (
                <li key={f}><Icons.Check size={14} /> {f}</li>
              ))}
            </ul>
          </article>

          {/* Uzman Plan */}
          <article className="ppplan ppplan-uz reveal reveal-delay-2">
            <div className="ppplan-ribbon ppplan-ribbon-uz">Diyetisyen Diyet</div>
            <div className="ppplan-head">
              <div className="ppplan-icon ppplan-icon-uz"><Icons.Stethoscope size={22} /></div>
              <div>
                <div className="ppplan-name serif">Uzman Plan</div>
                <div className="ppplan-sub">Klinik takip, kişiye özel</div>
              </div>
            </div>
            <div className="ppplan-price">
              <span className="ppprice-num serif" style={{ fontSize: 44 }}>Diyetisyenine göre</span>
            </div>
            <div className="ppplan-price-sub">
              Her diyetisyen kendi seans ücretini belirler.{' '}
              <a href="#diyetisyen">Kadromuzu incele →</a>
            </div>
            <Link to="/register/dietician" className="btn btn-primary ppplan-cta">
              <Icons.Stethoscope size={16} /> Diyetisyen seç <Icons.ArrowRight size={14} />
            </Link>
            <ul className="ppplan-feats">
              {[
                '1:1 online görüşmeler',
                'Diyetisyen onaylı kişisel plan',
                'Uygulama üzerinden anlık destek',
                'Düzenli plan revizyonu',
              ].map(f => (
                <li key={f}><Icons.Check size={14} /> {f}</li>
              ))}
            </ul>
          </article>
        </div>
      </div>

      <style>{`
        .pricing-head {
          display: flex; flex-direction: column; align-items: center; gap: 18px;
          margin-bottom: 56px; text-align: center; max-width: 720px; margin-left: auto; margin-right: auto;
        }
        .pricing-display {
          font-family: "Instrument Serif", serif;
          font-size: clamp(40px, 5vw, 64px); line-height: 1.08; letter-spacing: -0.02em; color: #1A2516;
        }
        .pricing-display em { font-style: italic; color: #4D7C0F; }
        .pricing-lede { font-size: 17px; color: #3F4A38; max-width: 480px; }

        .pricing-cards {
          display: grid; grid-template-columns: repeat(2,1fr); gap: 20px;
        }
        .ppplan {
          background: #fff; border: 1px solid #E8E4D5; border-radius: 24px;
          padding: 36px 32px 32px;
          display: flex; flex-direction: column; gap: 18px; position: relative;
          transition: transform .4s cubic-bezier(0.22,1,0.36,1), box-shadow .4s, border-color .3s;
        }
        .ppplan:hover { transform: translateY(-4px); box-shadow: 0 4px 16px rgba(26,37,22,0.06); border-color: #3F4A38; }
        .ppplan-ribbon {
          position: absolute; top: -1px; right: 28px;
          background: #65A30D; color: #fff;
          padding: 6px 14px; font-size: 11px; font-weight: 600;
          font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.1em;
          border-radius: 0 0 8px 8px;
        }
        .ppplan-ribbon-uz { background: #C97B5C; }
        .ppplan-head { display: flex; align-items: center; gap: 14px; }
        .ppplan-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: #65A30D; color: #fff;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ppplan-icon-uz { background: #C97B5C; }
        .ppplan-name { font-family: "Instrument Serif", serif; font-size: 26px; letter-spacing: -0.01em; line-height: 1.1; }
        .ppplan-sub { font-size: 13px; color: #6B7363; margin-top: 2px; }

        .ppplan-price { display: flex; align-items: baseline; gap: 4px; }
        .ppprice-currency { font-size: 18px; opacity: 0.7; }
        .ppprice-num {
          font-family: "Instrument Serif", serif;
          font-size: 64px; line-height: 1; letter-spacing: -0.03em; color: #1A2516;
        }
        .ppprice-period { font-size: 13px; opacity: 0.6; margin-left: 4px; }
        .ppplan-price-sub { font-size: 13px; color: #6B7363; margin-top: -8px; }
        .ppplan-price-sub a { color: #4D7C0F; border-bottom: 1px solid currentColor; }

        .ppplan-cta { width: 100%; justify-content: center; padding: 14px 22px; text-decoration: none; }

        .ppplan-feats {
          list-style: none; display: flex; flex-direction: column; gap: 10px;
          margin-top: 8px; padding-top: 22px; border-top: 1px solid #F0EDE0;
        }
        .ppplan-feats li {
          display: flex; align-items: center; gap: 10px;
          font-size: 14px; color: #3F4A38;
        }
        .ppplan-feats svg { color: #65A30D; flex-shrink: 0; }
        .ppplan-uz .ppplan-feats svg { color: #C97B5C; }

        @media (max-width: 760px) { .pricing-cards { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
