import { Link } from 'react-router-dom';
import Icons from './LandingIcons';

export default function SupportSection() {
  return (
    <section id="destek" className="section" aria-label="Destek">
      <div className="container">
        <div className="section-head reveal" style={{ textAlign: 'center' }}>
          <span className="eyebrow"><span className="eyebrow-dot" />Destek</span>
          <h2 className="display serif">
            Her zaman <em>yanındayız.</em>
          </h2>
          <p className="lede" style={{ maxWidth: 520, margin: '0 auto' }}>
            Bir sorunla karşılaştığında veya aklına bir soru takıldığında ekibimiz sana ulaşmak için burada.
          </p>
        </div>

        <div className="support-cards reveal">
          <div className="support-card support-card-disabled">
            <div className="support-card-soon-badge">Çok Yakında</div>
            <div className="support-card-icon">💬</div>
            <h3 className="support-card-title serif">Canlı Destek</h3>
            <p className="support-card-desc">Hafta içi 09:00 – 18:00 arası anlık mesajlaşma.</p>
            <span className="support-card-action support-card-action-muted">
              Çok yakında
            </span>
          </div>

          <a href="/support" className="support-card">
            <div className="support-card-icon">📋</div>
            <h3 className="support-card-title serif">Destek Formu</h3>
            <p className="support-card-desc">Teknik sorun, hesap veya ödeme talepleriniz için.</p>
            <span className="support-card-action">
              Form doldur <Icons.ArrowUpRight size={13} />
            </span>
          </a>
        </div>

        <div className="support-bottom reveal">
          <p style={{ fontSize: 14, color: 'var(--ink-mute)' }}>
            Sıkça sorulan sorulara göz atmak ister misin?
          </p>
          <Link to="/support" className="support-link">
            Tüm destek sayfasına git <Icons.ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <style>{`
        .support-cards {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 56px;
          max-width: 840px;
          margin-left: auto;
          margin-right: auto;
        }
        .support-card {
          background: #fff;
          border: 1px solid var(--line, #E8E4D5);
          border-radius: 20px;
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-decoration: none;
          transition: transform .35s cubic-bezier(0.22,1,0.36,1), box-shadow .35s, border-color .35s;
          position: relative;
        }
        .support-card:not(.support-card-disabled):hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 48px -16px rgba(26,37,22,.14), 0 6px 18px rgba(26,37,22,.06);
          border-color: #65A30D;
        }
        .support-card-disabled {
          cursor: default;
          opacity: 0.72;
          background: #FAFAF7;
        }
        .support-card-soon-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #F0FDF4;
          color: #15803D;
          border: 1px solid #BBF7D0;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          letter-spacing: 0.02em;
        }
        .support-card-icon { font-size: 32px; line-height: 1; }
        .support-card-title {
          font-family: "Instrument Serif", serif;
          font-size: 22px;
          font-weight: 400;
          color: var(--ink, #1A2516);
          letter-spacing: -0.01em;
        }
        .support-card-desc {
          font-size: 13.5px;
          color: var(--ink-mute, #5C6652);
          line-height: 1.6;
          flex: 1;
        }
        .support-card-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          font-weight: 600;
          color: #4D7C0F;
          margin-top: 6px;
        }
        .support-card-action-muted {
          color: #9CAD8F;
        }
        .support-bottom {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 40px;
          flex-wrap: wrap;
        }
        .support-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--ink, #1A2516);
          text-decoration: none;
          padding: 9px 18px;
          border-radius: 999px;
          border: 1px solid var(--line, #E8E4D5);
          background: #fff;
          transition: all .2s;
        }
        .support-link:hover { border-color: var(--ink); background: var(--ink); color: #fff; }
        @media (max-width: 768px) {
          .support-cards { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
