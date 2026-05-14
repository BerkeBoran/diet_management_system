import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const useCount = (target, duration = 1800, start) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!start || target === null) return;
    let raf, t0;
    const step = (t) => {
      if (!t0) t0 = t;
      const p = Math.min((t - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(Math.floor(eased * target));
      if (p < 1) raf = requestAnimationFrame(step);
      else setV(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return v;
};

const fmt = (n) => n.toLocaleString('tr-TR');

function StatItem({ value, suffix, label, sub, start }) {
  const v = useCount(value, 1800, start);
  return (
    <div className="lp-stat-item">
      <div className="lp-stat-value serif">
        {value === null ? '—' : fmt(v)}<span className="lp-stat-suffix">{suffix}</span>
      </div>
      <div className="lp-stat-label">{label}</div>
      <div className="lp-stat-sub">{sub}</div>
    </div>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const [start, setStart] = useState(false);
  const [dieticianCount, setDieticianCount] = useState(null);

  useEffect(() => {
    api.get('/users/stats/')
      .then(res => setDieticianCount(res.data.dietician_count))
      .catch(() => setDieticianCount(0));
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStart(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="section-tight lp-stats" ref={ref} aria-label="Platform istatistikleri">
      <div className="container">
        <div className="lp-stats-grid">
          <StatItem start={start} value={1000}          suffix="+" label="Aktif kullanıcı"       sub="Türkiye genelinde" />
          <StatItem start={start} value={4}             suffix=" ton" label="Kilo verildi"        sub="Son 3 ayda" />
          <StatItem start={start} value={dieticianCount} suffix=""   label="Sertifikalı diyetisyen" sub="Tam zamanlı kadro" />
          <StatItem start={start} value={96}            suffix="%"  label="Memnuniyet"            sub="3. ay sonunda" />
        </div>
      </div>

      <style>{`
        .lp-stats { background: #1A2516; color: #fff; }
        .lp-stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1px; background: rgba(255,255,255,0.08);
          border-radius: 24px; overflow: hidden;
        }
        .lp-stat-item {
          background: #1A2516; padding: 40px 28px;
          display: flex; flex-direction: column; gap: 6px;
          transition: background .3s;
        }
        .lp-stat-item:hover { background: #232f1e; }
        .lp-stat-value {
          font-family: "Instrument Serif", serif;
          font-size: clamp(40px, 5vw, 64px);
          line-height: 1; font-weight: 400; letter-spacing: -0.03em; color: #fff;
        }
        .lp-stat-suffix { color: #65A30D; }
        .lp-stat-label {
          font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.92); margin-top: 14px;
        }
        .lp-stat-sub { font-size: 12px; color: rgba(255,255,255,0.5); font-family: "JetBrains Mono", monospace; }

        @media (max-width: 860px) { .lp-stats-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 460px) { .lp-stats-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
}
