import { useRef, useState, useEffect } from 'react';
import Icons from './LandingIcons';
import api from '../../services/api';

const TITLE_TAG = {
  EXPERT_DIETICIAN: 'Uzman Diyetisyen',
  DIETICIAN:        'Diyetisyen',
  INTERN_DIETICIAN: 'Stajyer Diyetisyen',
};

const AVATAR_COLORS = [
  '#C97B5C', '#8FA876', '#D4A574',
  '#7A8B6F', '#B8927D', '#6B8A9F', '#A87B8F',
];

function photoUrl(raw) {
  if (!raw) return null;
  try { return new URL(raw).pathname; } catch { return raw || null; }
}

const FALLBACK = [
  { id: 'f1', name: 'Dyt. Elif Demirkan', spec: 'Klinik Beslenme · PCOS', title: 'EXPERT_DIETICIAN', rating: null, photo: null, color: '#C97B5C' },
  { id: 'f2', name: 'Dyt. Mert Kayaalp',  spec: 'Sporcu Beslenmesi',      title: 'DIETICIAN',        rating: null, photo: null, color: '#8FA876' },
  { id: 'f3', name: 'Dyt. Selin Aksoy',   spec: 'Çocuk & Aile',           title: 'DIETICIAN',        rating: null, photo: null, color: '#D4A574' },
  { id: 'f4', name: 'Dyt. Cem Yılmaz',    spec: 'Diyabet & Kardiyo',      title: 'EXPERT_DIETICIAN', rating: null, photo: null, color: '#7A8B6F' },
  { id: 'f5', name: 'Dyt. Ayşe Tekin',    spec: 'Vegan & Vejetaryen',     title: 'DIETICIAN',        rating: null, photo: null, color: '#B8927D' },
];

function mapDietician(d, i) {
  return {
    id:     d.id,
    name:   `${TITLE_TAG[d.title] ? 'Dyt.' : ''} ${d.first_name} ${d.last_name}`.trim(),
    spec:   TITLE_TAG[d.title] || 'Diyetisyen',
    title:  d.title,
    rating: d.average_rating ?? null,
    count:  d.review_count  ?? 0,
    photo:  photoUrl(d.profile_photo),
    color:  AVATAR_COLORS[i % AVATAR_COLORS.length],
  };
}

export default function DietitianSection() {
  const ref  = useRef(null);
  const [list, setList] = useState(FALLBACK);

  useEffect(() => {
    api.get('/users/dieticians/')
      .then(r => {
        const data = r.data?.results ?? r.data;
        if (Array.isArray(data) && data.length > 0) {
          setList(data.map(mapDietician));
        }
      })
      .catch(() => {});
  }, []);

  const scroll = (dir) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  return (
    <section id="diyetisyen" className="section" aria-label="Diyetisyen kadrosu">
      <div className="container">
        <div className="diet-head">
          <div className="section-head reveal" style={{ marginBottom: 0 }}>
            <span className="eyebrow"><span className="eyebrow-dot" />Diyetisyen kadromuz</span>
            <h2 className="display serif">
              Sertifikalı uzmanlar, <em>insan</em> dokunuşu.
            </h2>
            <p className="lede">
              Kadromuzdaki her diyetisyen üniversite mezunu, aktif klinik çalışan ve Lifeetics onaylıdır.
            </p>
          </div>
          <div className="diet-arrows" aria-label="Kaydırma kontrolleri">
            <button onClick={() => scroll(-1)} aria-label="Önceki diyetisyen">
              <Icons.ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
            <button onClick={() => scroll(1)} aria-label="Sonraki diyetisyen">
              <Icons.ArrowRight size={18} />
            </button>
          </div>
        </div>
        <div className="diet-rail no-scrollbar" ref={ref} role="list">
          {list.map((d, i) => (
            <article key={d.id ?? i} className="diet-card" role="listitem">
              <div
                className="diet-pic"
                style={
                  d.photo
                    ? { backgroundImage: `url(${d.photo})`, backgroundSize: 'cover', backgroundPosition: 'center top' }
                    : { background: `linear-gradient(135deg, ${d.color} 0%, ${d.color}88 100%)` }
                }
              >
                {!d.photo && (
                  <span className="photo-label">Portre · {d.name.split(' ').slice(-1)[0]}</span>
                )}
              </div>
              <div className="diet-body">
                <div className="diet-meta">
                  <div className="diet-spec-tag">{TITLE_TAG[d.title] || d.spec}</div>
                  {d.rating !== null && (
                    <div className="diet-years">★ {Number(d.rating).toFixed(1)}</div>
                  )}
                </div>
                <h3 className="diet-name serif">{d.name}</h3>
                <div className="diet-spec">{d.spec}</div>
                {d.count > 0 && (
                  <div className="diet-tags">
                    <span className="diet-tag">{d.count} değerlendirme</span>
                  </div>
                )}
                <button className="diet-cta">
                  Randevu al <Icons.ArrowUpRight size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>


      <style>{`
        .diet-head {
          display: flex; justify-content: space-between; align-items: end;
          margin-bottom: 56px; gap: 32px;
        }
        .diet-arrows { display: flex; gap: 8px; flex-shrink: 0; }
        .diet-arrows button {
          width: 44px; height: 44px; border-radius: 50%;
          background: #fff; border: 1px solid #E8E4D5;
          color: #1A2516; display: flex; align-items: center; justify-content: center;
          transition: all .2s; cursor: pointer;
        }
        .diet-arrows button:hover { background: #1A2516; color: #fff; border-color: #1A2516; }

        .diet-rail {
          display: flex; gap: 24px; overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 16px;
        }
        .diet-card {
          flex: 0 0 320px; background: #fff;
          border: 1px solid #E8E4D5; border-radius: 24px; overflow: hidden;
          scroll-snap-align: start;
          transition: transform .4s cubic-bezier(0.22,1,0.36,1), box-shadow .4s, border-color .4s;
        }
        .diet-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px -20px rgba(26,37,22,0.18), 0 8px 24px rgba(26,37,22,0.08);
          border-color: #65A30D;
        }
        .diet-pic {
          aspect-ratio: 4/3;
          display: flex; align-items: flex-end; justify-content: flex-start;
          padding: 14px; position: relative;
        }
        .diet-pic::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.3), transparent 60%);
          pointer-events: none;
        }
        .diet-pic .photo-label { position: relative; z-index: 1; font-size: 10px; }

        .diet-body { padding: 22px 22px 26px; }
        .diet-meta { display: flex; justify-content: space-between; align-items: center; }
        .diet-spec-tag {
          font-family: "JetBrains Mono", monospace; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.1em; color: #4D7C0F;
        }
        .diet-years { font-family: "JetBrains Mono", monospace; font-size: 11px; color: #6B7363; }
        .diet-name {
          font-family: "Instrument Serif", serif; font-size: 22px; font-weight: 400;
          color: #1A2516; margin-top: 10px; letter-spacing: -0.01em;
        }
        .diet-spec { font-size: 13px; color: #3F4A38; margin-top: 2px; }
        .diet-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
        .diet-tag {
          font-size: 11px; padding: 4px 10px; border-radius: 999px;
          background: #FBFAF5; color: #3F4A38; border: 1px solid #F0EDE0;
        }
        .diet-cta {
          margin-top: 18px;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: 999px;
          background: #1A2516; color: #fff;
          font-size: 13px; font-weight: 600;
          transition: all .2s; border: none; cursor: pointer; font-family: inherit;
        }
        .diet-cta:hover { background: #4D7C0F; transform: translateX(2px); }

        @media (max-width: 720px) {
          .diet-head { flex-direction: column; align-items: flex-start; }
          .diet-card { flex: 0 0 280px; }
        }
      `}</style>
    </section>
  );
}
