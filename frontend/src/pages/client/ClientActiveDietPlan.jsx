import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Icons from '../../components/landing/LandingIcons';
import dietService from '../../services/dietService';
import aiService from '../../services/aiService';
import AiDietPDF from '../../components/pdf/AiDietPDF';
import DieticianDietPDF from '../../components/pdf/DieticianDietPDF';

const TR_TO_EN_DAY = {
  'Pazartesi': 'Monday', 'Salı': 'Tuesday', 'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday', 'Cuma': 'Friday', 'Cumartesi': 'Saturday', 'Pazar': 'Sunday',
};
const DAY_META = {
  Monday:    { label: 'Pazartesi', short: 'PZT' },
  Tuesday:   { label: 'Salı',      short: 'SAL' },
  Wednesday: { label: 'Çarşamba',  short: 'ÇAR' },
  Thursday:  { label: 'Perşembe',  short: 'PER' },
  Friday:    { label: 'Cuma',      short: 'CUM' },
  Saturday:  { label: 'Cumartesi', short: 'CMT' },
  Sunday:    { label: 'Pazar',     short: 'PAZ' },
};
const DAY_ORDER  = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const MEAL_TIMES = {
  'Kahvaltı': '08:00', 'Ara Öğün': '10:30',
  'Öğle': '13:00', 'Öğle Yemeği': '13:00',
  'İkindi': '16:30', 'Akşam': '19:30', 'Akşam Yemeği': '19:30',
};

function buildDays(dailyPlan, weekStartDate) {
  const byKey = {};
  (dailyPlan || []).forEach(d => { byKey[d.day] = d; });
  return DAY_ORDER.map((key, i) => {
    const bd   = byKey[key];
    const meta = DAY_META[key];
    let dateLabel = '';
    if (weekStartDate) {
      const d = new Date(weekStartDate);
      d.setDate(d.getDate() + i);
      const mo = d.toLocaleString('tr-TR', { month: 'short' });
      dateLabel = `${String(d.getDate()).padStart(2,'0')} ${mo.charAt(0).toUpperCase()+mo.slice(1)}`;
    }
    const meals = (bd?.meals || []).map(m => ({
      id: m.id, type: m.meal_type,
      time:  MEAL_TIMES[m.meal_type] || '',
      kcal:  m.calories || 0,
      items: (m.items || []).map(it => ({ name: it.food_name, amount: it.amount, unit: it.unit })),
    }));
    return { key, label: meta.label, short: meta.short, date: dateLabel, kcal: meals.reduce((s, m) => s + m.kcal, 0), meals, hasPlan: !!bd };
  });
}

function buildShopping(days) {
  const map = new Map();
  days.forEach(d => d.meals.forEach(m => m.items.forEach(it => {
    const cur = map.get(it.name) || { name: it.name, amount: 0, unit: it.unit };
    cur.amount += Number(it.amount) || 0;
    map.set(it.name, cur);
  })));
  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

function buildAIDays(meals) {
  const byDay = {};
  (meals || []).forEach(m => {
    const key = TR_TO_EN_DAY[m.day] || m.day;
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(m);
  });
  return DAY_ORDER.filter(d => byDay[d]).map(key => {
    const meta     = DAY_META[key];
    const dayMeals = (byDay[key] || []).map(m => ({
      type: m.meal_type,
      time: MEAL_TIMES[m.meal_type] || '',
      kcal: m.calories || 0,
      contents: m.contents || '',
    }));
    return {
      key,
      label: meta.label,
      short: meta.short,
      date: '',
      kcal: dayMeals.reduce((s, m) => s + m.kcal, 0),
      meals: dayMeals,
      hasPlan: true,
    };
  });
}

/* ── Ring ── */
function Ring({ value, target, size = 150, stroke = 12 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--accent)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c*(1-pct)}
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition:'stroke-dashoffset .9s cubic-bezier(0.22,1,0.36,1)' }}/>
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle"
        style={{ font:'600 22px "Instrument Serif",serif', fill:'var(--ink)', letterSpacing:'-0.02em' }}>
        {Math.round(pct*100)}%
      </text>
      <text x="50%" y="64%" textAnchor="middle" dominantBaseline="middle"
        style={{ font:'500 9px "JetBrains Mono",monospace', fill:'var(--ink-mute)', letterSpacing:'0.12em' }}>
        KCAL
      </text>
    </svg>
  );
}

/* ── ShopItem ── */
function ShopItem({ name, amount, unit }) {
  const [checked, setChecked] = useState(false);
  const display = amount >= 1000 && unit === 'g' ? `${(amount/1000).toFixed(1)} kg` : `${amount} ${unit}`;
  return (
    <label className="adp-shop-item" onClick={() => setChecked(c => !c)}>
      <span className={`adp-shop-check ${checked ? 'adp-checked' : ''}`}>{checked && <Icons.Check size={11}/>}</span>
      <span style={{ textDecoration: checked?'line-through':'none', color: checked?'var(--ink-mute)':'var(--ink)', fontSize:14, fontWeight:500 }}>{name}</span>
      <span style={{ fontSize:12, color:'var(--ink-mute)', fontFamily:'var(--mono)' }}>{display}</span>
    </label>
  );
}

/* ── AI Plan view (dietician-style layout) ── */
function AIPlanView({ plan }) {
  const [activeDayIdx,  setActiveDayIdx]  = useState(0);
  const [view,          setView]          = useState('week');
  const [expandContent, setExpandContent] = useState(false);

  const days    = buildAIDays(plan.meals || []);
  const today   = days[activeDayIdx] || days[0] || { label:'', short:'', kcal:0, meals:[], hasPlan:false };
  const avgKcal = days.length > 0 ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length) : 0;
  const target  = avgKcal || 2000;
  const fmtDate = plan.created_at ? new Date(plan.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) : '—';

  return (
    <div className="adp-body">
      {/* ── HERO ── */}
      <section className="adp-hero">
        <div>
          <span className="adp-eyebrow"><span className="adp-eyebrow-dot"/>AI Diyet Planı</span>
          <h1 className="adp-title" style={{ marginTop:8 }}>
            <em>{plan.summary || 'Diyet Planı'}</em>
            <span className="adp-title-sub">{avgKcal > 0 ? `${avgKcal.toLocaleString('tr-TR')} kcal/gün ort.` : ''} · {days.length} gün</span>
          </h1>
          <p className="adp-lede">Oluşturulma: {fmtDate}</p>
          <div style={{ marginTop:12 }}>
            <PDFDownloadLink document={<AiDietPDF plan={plan} planTitle={plan.summary || 'AI Diyet Planı'} />} fileName="ai-diyet-plani.pdf">
              {({ loading: pdfLoading }) => (
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:999, border:'1px solid var(--line)', background:'transparent', fontSize:13, fontWeight:500, color:'var(--ink-soft)', cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ink-soft)'; e.currentTarget.style.color='var(--ink)'; e.currentTarget.style.background='var(--bg-warm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.color='var(--ink-soft)'; e.currentTarget.style.background='transparent'; }}>
                  <Icons.ArrowRight size={14} style={{ transform:'rotate(90deg)' }} />
                  {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        <div className="adp-hero-card">
          <Ring value={today.kcal} target={target}/>
          <div className="adp-rings-meta">
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', marginBottom:4 }}>BUGÜN · {today.label.toUpperCase()}</div>
            <div className="adp-rings-num">{today.kcal > 0 ? today.kcal.toLocaleString('tr-TR') : '—'}<small> / {target.toLocaleString('tr-TR')}</small></div>
            <div style={{ fontSize:12, color:'var(--ink-mute)' }}>kalori</div>
            <div style={{ fontSize:12, color:'var(--ink-mute)', marginTop:4 }}>{today.meals.length} öğün</div>
          </div>
        </div>
      </section>

      {/* ── TOOLBAR ── */}
      <section className="adp-toolbar">
        <div style={{ fontSize:12, color:'var(--ink-mute)', fontFamily:'var(--mono)' }}>
          {days.length} günlük plan
        </div>
        <div className="adp-view-toggle">
          {[{id:'week',label:'Hafta',icon:'Calendar'},{id:'day',label:'Gün',icon:'Bolt'}].map(v => {
            const Ic = Icons[v.icon];
            return (
              <button key={v.id} className={`adp-view-btn ${view===v.id?'active':''}`} onClick={() => setView(v.id)}>
                <Ic size={14}/> {v.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── DAY STRIP ── */}
      <section className="adp-day-strip">
        {days.map((d, i) => {
          const pct = target > 0 ? Math.round((d.kcal / target) * 100) : 0;
          return (
            <button key={d.key} className={`adp-day-card ${i===activeDayIdx?'active':''}`}
              onClick={() => { setActiveDayIdx(i); if(view==='week') setView('day'); }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', fontFamily:'var(--mono)' }}>{d.short}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:18, lineHeight:1, color:'var(--ink)', letterSpacing:'-0.02em' }}>{i+1}</span>
              </div>
              <div style={{ height:36, background:'rgba(0,0,0,.04)', borderRadius:6, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
                <div style={{ width:'100%', background:'var(--accent)', borderRadius:4, height:Math.min(pct,100)+'%', minHeight:2, transition:'height .8s cubic-bezier(0.22,1,0.36,1)' }}/>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <strong style={{ fontSize:13, color:'var(--ink)', fontFamily:'var(--mono)', fontWeight:600 }}>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                <span style={{ fontSize:10, color:'var(--ink-mute)' }}>kcal</span>
              </div>
            </button>
          );
        })}
      </section>

      {/* ── WEEK VIEW ── */}
      {view==='week' && (
        <section style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {days.map((d, i) => (
            <article key={d.key} style={{ background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:24, paddingBottom:12, borderBottom:'1px solid var(--line-soft)' }}>
                <h3 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, lineHeight:1, letterSpacing:'-0.02em', color:'var(--ink)', margin:0 }}>{d.label}</h3>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--ink-mute)' }}>{d.kcal > 0 ? `${d.kcal.toLocaleString('tr-TR')} kcal` : '—'}</span>
                  <button style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-soft)', padding:'6px 10px', borderRadius:999, border:'1px solid var(--line)', background:'transparent', cursor:'pointer' }}
                    onClick={() => { setActiveDayIdx(i); setView('day'); }}>
                    Detay <Icons.ArrowRight size={14}/>
                  </button>
                </div>
              </header>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:10 }}>
                {d.meals.map((m, j) => (
                  <div key={j} style={{ background:'var(--bg-warm)', border:'1px solid var(--line-soft)', borderRadius:10, padding:12, display:'flex', flexDirection:'column', gap:6 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <span style={{ fontSize:10, color:'var(--accent-deep)', fontFamily:'var(--mono)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em' }}>{m.type}</span>
                      {m.kcal > 0 && <span style={{ fontSize:10, color:'var(--ink-mute)', fontFamily:'var(--mono)' }}>{m.kcal} kcal</span>}
                    </div>
                    <p style={{ fontSize:12, color:'var(--ink-soft)', lineHeight:1.5, margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{m.contents}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* ── DAY VIEW ── */}
      {view==='day' && (
        <section style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:'var(--serif)', fontWeight:400, fontSize:'clamp(32px,4vw,48px)', lineHeight:1.02, letterSpacing:'-0.025em', color:'var(--ink)', margin:0 }}>
              <em style={{ fontStyle:'italic', color:'var(--accent-deep)' }}>{today.label}</em>
            </h2>
            <div style={{ display:'flex', gap:4, background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:6 }}>
              <div style={{ padding:'12px 18px', display:'flex', flexDirection:'column', gap:2, borderRight:'1px solid var(--line-soft)', minWidth:100 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>KALORİ</span>
                <strong style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)', letterSpacing:'-0.02em' }}>{today.kcal > 0 ? today.kcal.toLocaleString('tr-TR') : '—'}</strong>
                <small style={{ fontSize:11, color:'var(--ink-mute)' }}>{target.toLocaleString('tr-TR')} hedef</small>
              </div>
              <div style={{ padding:'12px 18px', display:'flex', flexDirection:'column', gap:2, minWidth:80 }}>
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>ÖĞÜN</span>
                <strong style={{ fontFamily:'var(--serif)', fontSize:24, color:'var(--ink)', letterSpacing:'-0.02em' }}>{today.meals.length}</strong>
                <small style={{ fontSize:11, color:'var(--ink-mute)' }}>planlandı</small>
              </div>
            </div>
          </div>
          <div>
            {today.meals.map((m, i) => (
              <article key={i} style={{ display:'grid', gridTemplateColumns:'84px 1fr', gap:20, paddingBottom:20 }}>
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, paddingTop:22 }}>
                  <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--ink)', fontWeight:600 }}>{m.time}</div>
                  <div style={{ width:32, height:32, borderRadius:'50%', background:'#fff', border:'2px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--ink-mute)' }}>{i+1}</div>
                  {i < today.meals.length-1 && <div style={{ width:2, flex:1, background:'var(--line)', marginTop:4 }}/>}
                </div>
                <div style={{ background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16 }}>
                    <div>
                      <div style={{ fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.16em', fontFamily:'var(--mono)' }}>{m.type.toUpperCase()}</div>
                      <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, color:'var(--ink)', margin:'4px 0 0' }}>{m.type}</h3>
                    </div>
                    {m.kcal > 0 && (
                      <div style={{ fontFamily:'var(--serif)', fontSize:28, color:'var(--ink)', letterSpacing:'-0.02em', flexShrink:0 }}>
                        {m.kcal}<small style={{ fontSize:13, color:'var(--ink-mute)', fontFamily:'var(--mono)', fontWeight:400 }}> kcal</small>
                      </div>
                    )}
                  </div>
                  <div style={{ height:80, borderRadius:12, position:'relative', overflow:'hidden', display:'flex', alignItems:'flex-end', padding:14 }}>
                    <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at 40% 60%,#C4D9A0,#8FA876 70%)', opacity:.6 }}/>
                    <span style={{ position:'relative', zIndex:1, background:'rgba(255,255,255,.85)', backdropFilter:'blur(4px)', fontSize:11, padding:'4px 10px', borderRadius:999, color:'var(--ink)', fontFamily:'var(--mono)' }}>{m.type}</span>
                  </div>
                  <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.7, margin:0 }}>{m.contents}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Full content (collapsible) */}
      {plan.content && (
        <section className="adp-content-section" style={{ marginTop:24 }}>
          <button className="adp-content-toggle" onClick={() => setExpandContent(c => !c)}>
            <Icons.ClipboardList size={14} />
            Tam plan metni
            <Icons.ArrowRight size={14} style={{ transform: expandContent ? 'rotate(90deg)' : 'none', transition:'transform .2s' }} />
          </button>
          {expandContent && <pre className="adp-content-text">{plan.content}</pre>}
        </section>
      )}
    </div>
  );
}

/* ── Dietician Plan view ── */
function DietPlanView({ plan, planMeta }) {
  const [activeWeek,   setActiveWeek]   = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [view,         setView]         = useState('week');

  const week     = plan.weekly_plan?.[activeWeek];
  const days     = buildDays(week?.daily_plan, week?.start_date);
  const today    = days[activeDayIdx];
  const shopping = buildShopping(days);
  const target   = plan.daily_calories || 2000;
  const totalW   = plan.weekly_plan?.length || 1;

  return (
    <div className="adp-body">
      <section className="adp-hero">
        <div>
          <span className="adp-eyebrow"><span className="adp-eyebrow-dot"/>Aktif plan · Hafta {activeWeek+1}/{totalW}</span>
          <h1 className="adp-title">
            Diyet <em>planım</em>.
            <span className="adp-title-sub">{target.toLocaleString('tr-TR')} kcal/gün · {totalW*7} gün</span>
          </h1>
          {planMeta && (
            <p className="adp-lede">
              Tarih aralığı <span style={{ fontFamily:'var(--mono)', fontSize:13 }}>{planMeta.start_date} → {planMeta.end_date}</span>
            </p>
          )}
          <div style={{ marginTop:12 }}>
            <PDFDownloadLink document={<DieticianDietPDF plan={plan} planMeta={planMeta} />} fileName="diyet-plani.pdf">
              {({ loading: pdfLoading }) => (
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:999, border:'1px solid var(--line)', background:'transparent', fontSize:13, fontWeight:500, color:'var(--ink-soft)', cursor:'pointer', transition:'all .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--ink-soft)'; e.currentTarget.style.color='var(--ink)'; e.currentTarget.style.background='var(--bg-warm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--line)'; e.currentTarget.style.color='var(--ink-soft)'; e.currentTarget.style.background='transparent'; }}>
                  <Icons.ArrowRight size={14} style={{ transform:'rotate(90deg)' }} />
                  {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        <div className="adp-hero-card">
          <Ring value={today.kcal} target={target}/>
          <div className="adp-rings-meta">
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', marginBottom:4 }}>BUGÜN · {today.label.toUpperCase()}</div>
            <div className="adp-rings-num">{today.kcal.toLocaleString('tr-TR')}<small> / {target.toLocaleString('tr-TR')}</small></div>
            <div style={{ fontSize:12, color:'var(--ink-mute)' }}>kalori tüketimi</div>
            <div style={{ fontSize:12, color:'var(--ink-mute)', marginTop:4 }}>{today.meals.length} öğün planlandı</div>
          </div>
        </div>
      </section>

      <section className="adp-toolbar">
        <div className="adp-week-pills">
          {(plan.weekly_plan||[]).map((_,i) => (
            <button key={i} className={`adp-week-pill ${activeWeek===i?'active':''}`}
              onClick={() => { setActiveWeek(i); setActiveDayIdx(0); }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', opacity:.7 }}>HAFTA</span> {i+1}
            </button>
          ))}
        </div>
        <div className="adp-view-toggle">
          {[{id:'week',label:'Hafta',icon:'Calendar'},{id:'day',label:'Gün',icon:'Bolt'},{id:'shopping',label:'Alışveriş',icon:'Check'}].map(v => {
            const Ic = Icons[v.icon];
            return (
              <button key={v.id} className={`adp-view-btn ${view===v.id?'active':''}`} onClick={() => setView(v.id)}>
                <Ic size={14}/> {v.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Day strip */}
      <section className="adp-day-strip">
        {days.map((d,i) => {
          const pct = target>0 ? Math.round((d.kcal/target)*100) : 0;
          return (
            <button key={d.key} className={`adp-day-card ${i===activeDayIdx?'active':''} ${!d.hasPlan?'future':''}`}
              onClick={() => { setActiveDayIdx(i); if(view==='week') setView('day'); }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', fontFamily:'var(--mono)' }}>{d.short}</span>
                <span style={{ fontFamily:'var(--serif)', fontSize:22, lineHeight:1, color:'var(--ink)', letterSpacing:'-0.02em' }}>{d.date.split(' ')[0]}</span>
              </div>
              <div style={{ height:36, background:'rgba(0,0,0,.04)', borderRadius:6, overflow:'hidden', display:'flex', alignItems:'flex-end' }}>
                <div style={{ width:'100%', background:'var(--accent)', borderRadius:4, height:Math.min(pct,100)+'%', minHeight:2, transition:'height .8s cubic-bezier(0.22,1,0.36,1)' }}/>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
                <strong style={{ fontSize:13, color:'var(--ink)', fontFamily:'var(--mono)', fontWeight:600 }}>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                <span style={{ fontSize:10, color:'var(--ink-mute)' }}>kcal</span>
              </div>
            </button>
          );
        })}
      </section>

      {view==='week' && (
        <section style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {days.map((d,i) => (
            <article key={d.key} style={{ background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:'22px 24px', display:'flex', flexDirection:'column', gap:16 }}>
              <header style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, paddingBottom:12, borderBottom:'1px solid var(--line-soft)' }}>
                <div>
                  <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:4 }}>{d.date}</span>
                  <h3 style={{ fontFamily:'var(--serif)', fontSize:26, fontWeight:400, lineHeight:1, letterSpacing:'-0.02em', color:'var(--ink)', marginTop:4 }}>{d.label}</h3>
                </div>
                <button style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:12, color:'var(--ink-soft)', padding:'6px 10px', borderRadius:999, border:'1px solid var(--line)', background:'transparent', cursor:'pointer' }}
                  onClick={() => { setActiveDayIdx(i); setView('day'); }}>
                  Detay <Icons.ArrowRight size={14}/>
                </button>
              </header>
              {d.hasPlan ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
                  {d.meals.map((m,j) => (
                    <div key={j} style={{ background:'var(--bg-warm)', border:'1px solid var(--line-soft)', borderRadius:10, padding:12, display:'flex', flexDirection:'column', gap:6 }}>
                      <div style={{ fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.06em', fontFamily:'var(--mono)' }}>{m.time}</div>
                      <div style={{ fontSize:10, color:'var(--ink-mute)', textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'var(--mono)' }}>{m.type}</div>
                      <div style={{ fontSize:13, fontWeight:600, color:'var(--ink)', lineHeight:1.3, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {m.items.map(it=>it.name).join(', ') || m.type}
                      </div>
                      {m.kcal>0 && <div style={{ fontSize:11, color:'var(--ink-soft)', marginTop:'auto', paddingTop:4, borderTop:'1px solid var(--line-soft)', fontFamily:'var(--mono)' }}>{m.kcal} kcal</div>}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize:13, color:'var(--ink-mute)', fontStyle:'italic', paddingTop:4 }}>Bu gün için plan eklenmemiş.</p>
              )}
            </article>
          ))}
        </section>
      )}

      {view==='day' && (
        <section style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24, flexWrap:'wrap' }}>
            <div>
              <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:4 }}>{today.date} · {today.label.toUpperCase()}</span>
              <h2 style={{ fontFamily:'var(--serif)', fontWeight:400, fontSize:'clamp(32px,4vw,48px)', lineHeight:1.02, letterSpacing:'-0.025em', color:'var(--ink)', marginTop:4 }}>Bugünün <em style={{ fontStyle:'italic', color:'var(--accent-deep)' }}>menüsü</em></h2>
            </div>
          </div>
          {!today.hasPlan ? (
            <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--ink-mute)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <p style={{ fontSize:15 }}>Bu gün için henüz plan eklenmemiş.</p>
            </div>
          ) : (
            <div>
              {today.meals.map((m,i) => (
                <article key={i} style={{ display:'grid', gridTemplateColumns:'84px 1fr', gap:20, paddingBottom:20 }}>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, paddingTop:22 }}>
                    <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--ink)', fontWeight:600, letterSpacing:'0.04em' }}>{m.time}</div>
                    <div style={{ width:32, height:32, borderRadius:'50%', background:'#fff', border:'2px solid var(--line)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'var(--ink-mute)' }}>{i+1}</div>
                    {i < today.meals.length-1 && <div style={{ width:2, flex:1, background:'var(--line)', marginTop:4 }}/>}
                  </div>
                  <div style={{ background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:24, display:'flex', flexDirection:'column', gap:18 }}>
                    <div>
                      <div style={{ fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.16em', fontFamily:'var(--mono)' }}>{m.type.toUpperCase()}</div>
                      <h3 style={{ fontFamily:'var(--serif)', fontSize:22, fontWeight:400, lineHeight:1.1, letterSpacing:'-0.015em', color:'var(--ink)', margin:'4px 0 8px' }}>
                        {m.items.length>0 ? m.items.slice(0,2).map(it=>it.name).join(' + ') : m.type}
                      </h3>
                    </div>
                    {m.items.length>0 && (
                      <ul style={{ listStyle:'none', display:'grid', gridTemplateColumns:'repeat(2,1fr)', background:'var(--bg-warm)', borderRadius:12, padding:6 }}>
                        {m.items.map((it,j) => (
                          <li key={j} style={{ display:'grid', gridTemplateColumns:'auto 1fr auto', gap:10, alignItems:'center', padding:'10px 12px', borderRadius:8, fontSize:13 }}>
                            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', flexShrink:0 }}/>
                            <span style={{ color:'var(--ink)', fontWeight:500 }}>{it.name}</span>
                            <span style={{ fontSize:11, color:'var(--ink-mute)', fontFamily:'var(--mono)' }}>{it.amount}{it.unit}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {view==='shopping' && (
        <section style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <div>
            <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>HAFTA {activeWeek+1} · ALIŞVERİŞ LİSTESİ</span>
            <h2 style={{ fontFamily:'var(--serif)', fontWeight:400, fontSize:'clamp(32px,4vw,48px)', lineHeight:1.02, letterSpacing:'-0.025em', color:'var(--ink)' }}>{shopping.length} <em style={{ fontStyle:'italic', color:'var(--accent-deep)' }}>kalem</em></h2>
          </div>
          {shopping.length===0 ? (
            <p style={{ textAlign:'center', padding:'40px 24px', color:'var(--ink-mute)' }}>Bu hafta için içerik bulunamadı.</p>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8, background:'#fff', border:'1px solid var(--line)', borderRadius:12, padding:10 }}>
              {shopping.map((it,i) => <ShopItem key={i} name={it.name} amount={it.amount} unit={it.unit}/>)}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/* ── main ── */
export default function ClientActiveDietPlan() {
  const clientMode = localStorage.getItem('clientMode') || 'free';
  const isAIMode   = clientMode === 'ai';

  const [aiPlan,   setAiPlan]   = useState(null);
  const [dietPlan, setDietPlan] = useState(null);
  const [planMeta, setPlanMeta] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (isAIMode) {
      aiService.getAIPlans()
        .then(async r => {
          const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
          if (list.length > 0) {
            const detail = await aiService.getAIPlanDetail(list[0].id);
            setAiPlan(detail.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      dietService.getPlans()
        .then(async r => {
          const list = Array.isArray(r.data) ? r.data : (r.data?.results || []);
          const active = list.find(p => p.status === 'Active') || list[0];
          if (active) {
            const detail = await dietService.getPlanDetail(active.id);
            setDietPlan(detail.data);
            setPlanMeta(active);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isAIMode]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:280 }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(101,163,13,.2)', borderTopColor:'var(--accent)', animation:'adpSpin .8s linear infinite' }}/>
      <style>{`@keyframes adpSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const noAI   = isAIMode   && !aiPlan;
  const noDiet = !isAIMode  && !dietPlan;

  if (noAI || noDiet) return (
    <div style={{ textAlign:'center', padding:'80px 24px' }}>
      <div style={{ fontSize:60, marginBottom:20 }}>🍽️</div>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--ink)', fontWeight:400, marginBottom:12 }}>Aktif plan bulunamadı</h2>
      <p style={{ fontSize:15, color:'var(--ink-mute)', maxWidth:400, margin:'0 auto', lineHeight:1.65 }}>
        {isAIMode ? 'Henüz bir AI diyet planı oluşturmadın.' : 'Diyetisyenin henüz bir plan hazırlamadı.'}
      </p>
    </div>
  );

  return (
    <>
      <style>{ADP_CSS}</style>
      {isAIMode
        ? <AIPlanView plan={aiPlan} />
        : <DietPlanView plan={dietPlan} planMeta={planMeta} />
      }
    </>
  );
}

/* ── CSS ── */
const ADP_CSS = `
  @keyframes adpPulse { 0%,100% { box-shadow:0 0 0 0 rgba(101,163,13,.5); } 50% { box-shadow:0 0 0 6px rgba(101,163,13,0); } }

  .adp-body { padding:28px 32px 80px; }

  .adp-eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:var(--accent-deep); }
  .adp-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:adpPulse 2s ease-out infinite; }

  .adp-hero { display:flex; align-items:flex-start; justify-content:space-between; gap:24px; margin-bottom:32px; background:#fff; border:1px solid var(--line); border-radius:20px; padding:32px 36px; flex-wrap:wrap; }
  .adp-title { font-family:var(--serif); font-size:clamp(36px,4vw,58px); font-weight:400; line-height:1.02; letter-spacing:-0.025em; color:var(--ink); margin-top:4px; }
  .adp-title em { font-style:italic; color:var(--accent-deep); }
  .adp-title-sub { font-size:15px; font-family:var(--mono); font-weight:400; color:var(--ink-mute); display:inline-block; margin-top:10px; }
  .adp-lede { font-size:14px; color:var(--ink-soft); line-height:1.6; margin-top:8px; }

  .adp-stats-row { display:flex; gap:4px; background:var(--bg-warm); border:1px solid var(--line); border-radius:12px; padding:6px; flex-shrink:0; align-self:flex-start; }
  .adp-stat { padding:12px 18px; display:flex; flex-direction:column; gap:2px; border-right:1px solid var(--line-soft); min-width:80px; }
  .adp-stat:last-child { border-right:none; }
  .adp-stat strong { font-family:var(--serif); font-size:26px; color:var(--ink); letter-spacing:-0.02em; line-height:1.1; }
  .adp-stat span { font-size:11px; color:var(--ink-mute); }

  .adp-hero-card { display:flex; gap:24px; align-items:center; background:var(--bg-warm); border:1px solid var(--line); border-radius:12px; padding:24px; flex-shrink:0; }
  .adp-rings-meta { display:flex; flex-direction:column; gap:4px; }
  .adp-rings-num { font-family:var(--serif); font-size:28px; line-height:1.1; letter-spacing:-0.02em; color:var(--ink); }
  .adp-rings-num small { font-size:13px; color:var(--ink-mute); font-family:var(--mono); }

  .adp-days { display:flex; flex-direction:column; gap:16px; margin-bottom:28px; }
  .adp-day { background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px 24px; }
  .adp-day-title { font-family:var(--serif); font-size:22px; font-weight:400; color:var(--ink); margin:0 0 14px; border-bottom:1px solid var(--line-soft); padding-bottom:10px; }
  .adp-meals { display:flex; flex-direction:column; gap:10px; }
  .adp-meal { background:var(--bg-warm); border-radius:10px; padding:14px 16px; }
  .adp-meal-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
  .adp-meal-type { font-family:var(--mono); font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent-deep); }
  .adp-meal-kcal { font-family:var(--mono); font-size:11px; color:var(--ink-mute); background:#fff; padding:2px 8px; border-radius:999px; border:1px solid var(--line); }
  .adp-meal-contents { font-size:13.5px; color:var(--ink-soft); line-height:1.6; margin:0; }

  .adp-content-section { background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; }
  .adp-content-toggle { display:flex; align-items:center; gap:8px; width:100%; padding:16px 20px; background:none; border:none; font-size:13px; font-weight:600; color:var(--ink-soft); cursor:pointer; transition:background .15s; }
  .adp-content-toggle:hover { background:var(--bg-warm); }
  .adp-content-text { padding:0 20px 20px; font-size:13px; color:var(--ink-soft); line-height:1.7; white-space:pre-wrap; font-family:var(--mono); margin:0; }

  .adp-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:16px; flex-wrap:wrap; }
  .adp-week-pills { display:flex; gap:4px; background:#fff; border:1px solid var(--line); border-radius:999px; padding:4px; }
  .adp-week-pill { padding:8px 16px; border-radius:999px; font-size:13px; font-weight:500; color:var(--ink-soft); display:inline-flex; align-items:center; gap:6px; transition:all .2s; white-space:nowrap; border:none; cursor:pointer; background:transparent; }
  .adp-week-pill:hover { color:var(--ink); background:var(--bg-warm); }
  .adp-week-pill.active { background:var(--ink); color:#FBFAF5; }
  .adp-view-toggle { display:flex; background:#fff; border:1px solid var(--line); border-radius:999px; padding:4px; }
  .adp-view-btn { padding:8px 14px; border-radius:999px; font-size:13px; font-weight:500; color:var(--ink-soft); display:inline-flex; align-items:center; gap:6px; transition:all .2s; border:none; cursor:pointer; background:transparent; }
  .adp-view-btn:hover { color:var(--ink); }
  .adp-view-btn.active { background:var(--accent-tint); color:var(--accent-deep); font-weight:600; }

  .adp-day-strip { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:28px; }
  .adp-day-card { background:#fff; border:1px solid var(--line); border-radius:12px; padding:14px 12px; display:flex; flex-direction:column; gap:10px; cursor:pointer; transition:all .25s; text-align:left; }
  .adp-day-card:hover { transform:translateY(-2px); border-color:var(--ink-soft); }
  .adp-day-card.active { background:var(--ink); border-color:var(--ink); }
  .adp-day-card.active * { color:#FBFAF5 !important; }

  .adp-shop-item { display:grid; grid-template-columns:22px 1fr auto; gap:12px; align-items:center; padding:12px 14px; border-radius:8px; cursor:pointer; transition:all .15s; user-select:none; }
  .adp-shop-item:hover { background:var(--bg-warm); }
  .adp-shop-check { width:20px; height:20px; border-radius:6px; border:1.5px solid var(--line); background:#fff; display:inline-flex; align-items:center; justify-content:center; color:transparent; transition:all .2s; flex-shrink:0; }
  .adp-shop-check.adp-checked { background:var(--accent); border-color:var(--accent); color:#fff; }

  @media(max-width:1100px) { .adp-hero { flex-direction:column; } }
  @media(max-width:760px) { .adp-body { padding:20px; } .adp-day-strip { gap:4px; } .adp-day-card { padding:10px 8px; } }
`;
