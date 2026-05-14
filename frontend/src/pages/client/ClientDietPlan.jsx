import { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import Icons from '../../components/landing/LandingIcons';
import dietService from '../../services/dietService';
import aiService from '../../services/aiService';
import { useAuth } from '../../contexts/AuthContext';
import AiDietPDF from '../../components/pdf/AiDietPDF';
import DieticianDietPDF from '../../components/pdf/DieticianDietPDF';

function turkishGenitive(fullName) {
  if (!fullName) return 'Danışan';
  const name = fullName.trim();
  const last = name[name.length - 1].toLowerCase();
  const vowels = 'aeıioöuü';
  const backVowels = 'aıou';
  let lastVowel = 'a';
  for (let i = name.length - 1; i >= 0; i--) {
    if (vowels.includes(name[i].toLowerCase())) { lastVowel = name[i].toLowerCase(); break; }
  }
  const suffix = vowels.includes(last)
    ? (backVowels.includes(lastVowel) ? "'nın" : "'nin")
    : (backVowels.includes(lastVowel) ? "'ın"  : "'in");
  return name + suffix;
}

/* ── constants ─────────────────────────────────────────── */
const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const TR_TO_EN_DAY = {
  'Pazartesi': 'Monday', 'Salı': 'Tuesday', 'Çarşamba': 'Wednesday',
  'Perşembe': 'Thursday', 'Cuma': 'Friday', 'Cumartesi': 'Saturday', 'Pazar': 'Sunday',
};
const DAY_META  = {
  Monday:    { label: 'Pazartesi', short: 'PZT' },
  Tuesday:   { label: 'Salı',      short: 'SAL' },
  Wednesday: { label: 'Çarşamba',  short: 'ÇAR' },
  Thursday:  { label: 'Perşembe',  short: 'PER' },
  Friday:    { label: 'Cuma',      short: 'CUM' },
  Saturday:  { label: 'Cumartesi', short: 'CMT' },
  Sunday:    { label: 'Pazar',     short: 'PAZ' },
};
const MEAL_TIMES = {
  'Kahvaltı': '08:00', 'Ara Öğün': '10:30',
  'Öğle': '13:00', 'Öğle Yemeği': '13:00',
  'İkindi': '16:30', 'Akşam': '19:30', 'Akşam Yemeği': '19:30',
};

/* ── helpers ────────────────────────────────────────────── */
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
      title: m.meal_type,
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

/* ── sub-components ─────────────────────────────────────── */
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

function StatusBadge({ status }) {
  const map = {
    Active:    { label:'Aktif',      bg:'rgba(101,163,13,.12)', color:'var(--accent-deep)' },
    Completed: { label:'Tamamlandı', bg:'rgba(0,0,0,.06)',      color:'var(--ink-mute)'   },
    Pending:   { label:'Bekliyor',   bg:'rgba(212,165,116,.2)', color:'#9e6a1e'           },
    Canceled:  { label:'İptal',      bg:'rgba(192,57,43,.1)',   color:'#c0392b'           },
  };
  const s = map[status] || { label:status, bg:'rgba(0,0,0,.06)', color:'var(--ink-mute)' };
  return <span style={{ fontSize:11, padding:'3px 9px', borderRadius:999, background:s.bg, color:s.color, fontWeight:600 }}>{s.label}</span>;
}

function ShopItem({ name, amount, unit }) {
  const [checked, setChecked] = useState(false);
  const display = amount >= 1000 && unit === 'g' ? `${(amount/1000).toFixed(1)} kg` : `${amount} ${unit}`;
  return (
    <label className="dp-shop-item" onClick={() => setChecked(c => !c)}>
      <span className={`dp-shop-check ${checked ? 'dp-checked' : ''}`}>{checked && <Icons.Check size={11}/>}</span>
      <span className="dp-shop-name" style={{ textDecoration: checked?'line-through':'none', color: checked?'var(--ink-mute)':'var(--ink)' }}>{name}</span>
      <span className="dp-shop-g">{display}</span>
    </label>
  );
}

/* ── Plan List Panel ─────────────────────────────────────── */
function PlanListPanel({ plans, aiPlans, selectedId, selectedType, onSelectDiet, onSelectAI, clientMode }) {
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day:'numeric', month:'short', year:'numeric' }) : '—';
  const showAI       = clientMode !== 'dietician';
  const showDietician = clientMode !== 'ai';
  const totalCount   = (showAI ? aiPlans.length : 0) + (showDietician ? plans.length : 0);
  return (
    <aside className="dp-list-panel">
      <div className="dp-list-header">
        <span className="dp-list-title">Diyet Planlarım</span>
        <span className="dp-list-count">{totalCount} plan</span>
      </div>

      {showAI && (
        <div className="dp-list-section">
          <div className="dp-list-section-label">
            <Icons.Sparkle size={11} /> AI Planları
          </div>
          {aiPlans.length === 0 ? (
            <div className="dp-list-empty"><p>Henüz AI planı yok.</p></div>
          ) : (
            aiPlans.map(plan => (
              <button
                key={`ai-${plan.id}`}
                className={`dp-list-item${selectedType === 'ai' && selectedId === plan.id ? ' active' : ''}`}
                onClick={() => onSelectAI(plan.id)}
              >
                <div className="dp-list-item-badge ai">AI</div>
                <div className="dp-list-item-body">
                  <div className="dp-list-item-title">{plan.planTitle || plan.summary || 'AI Diyet Planı'}</div>
                  <div className="dp-list-item-date">{fmtDate(plan.created_at)}</div>
                </div>
                <Icons.ArrowRight size={12} style={{ flexShrink: 0, color: 'var(--ink-mute)' }} />
              </button>
            ))
          )}
        </div>
      )}

      {showDietician && (
        <div className="dp-list-section">
          <div className="dp-list-section-label">
            <Icons.Stethoscope size={11} /> Diyetisyen Planları
          </div>
          {plans.length === 0 ? (
            <div className="dp-list-empty"><p>Henüz diyetisyen planı yok.</p></div>
          ) : (
            plans.map(plan => (
              <button
                key={`diet-${plan.id}`}
                className={`dp-list-item${selectedType === 'dietician' && selectedId === plan.id ? ' active' : ''}`}
                onClick={() => onSelectDiet(plan.id)}
              >
                <div className="dp-list-item-badge dietician">Dyt</div>
                <div className="dp-list-item-body">
                  <div className="dp-list-item-title"><StatusBadge status={plan.status} /></div>
                  <div className="dp-list-item-date">{plan.start_date} → {plan.end_date}</div>
                </div>
                <Icons.ArrowRight size={12} style={{ flexShrink: 0, color: 'var(--ink-mute)' }} />
              </button>
            ))
          )}
        </div>
      )}
    </aside>
  );
}

/* ── AI Plan Detail View ─────────────────────────────────── */
function AIPlanDetail({ detail, loading, planTitle }) {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [view,         setView]         = useState('week');
  const [expandContent, setExpandContent] = useState(false);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div className="dp-spinner" />
    </div>
  );
  if (!detail) return (
    <div style={{ textAlign:'center', padding:'80px 24px', color:'var(--ink-mute)' }}>
      <div style={{ fontSize:48, marginBottom:16 }}>🤖</div>
      <p>Plan yüklenemedi veya bulunamadı.</p>
    </div>
  );

  const days    = buildAIDays(detail.meals || []);
  const today   = days[activeDayIdx] || days[0] || { label:'', short:'', date:'', kcal:0, meals:[], hasPlan:false };
  const avgKcal = days.length > 0 ? Math.round(days.reduce((s, d) => s + d.kcal, 0) / days.length) : 0;
  const target  = avgKcal || 2000;
  const fmtDate = detail.created_at ? new Date(detail.created_at).toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' }) : '—';

  return (
    <div className="dp-body">
      <section className="dp-hero">
        <div className="dp-hero-text">
          <span className="dp-eyebrow"><span className="dp-eyebrow-dot"/>AI Diyet Planı</span>
          <h1 className="dp-title">
            <em>{planTitle || detail.summary || 'Yapay Zeka Planı'}</em>
            <span className="dp-title-sub">{avgKcal > 0 ? `${avgKcal.toLocaleString('tr-TR')} kcal/gün ort.` : ''} · {days.length} gün</span>
          </h1>
          <p className="dp-hero-lede">Oluşturulma: {fmtDate}</p>
          <div className="dp-hero-actions">
            <PDFDownloadLink document={<AiDietPDF plan={detail} planTitle={planTitle || detail.summary || 'AI Diyet Planı'} />} fileName="ai-diyet-plani.pdf">
              {({ loading: pdfLoading }) => (
                <button className="dp-btn dp-btn-ghost dp-btn-sm">
                  <Icons.ArrowRight size={14} style={{ transform:'rotate(90deg)' }} />
                  {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        </div>
        <div className="dp-hero-card">
          <div className="dp-rings"><Ring value={today.kcal} target={target}/></div>
          <div className="dp-rings-meta">
            <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', marginBottom:4 }}>BUGÜN · {today.label.toUpperCase()}</div>
            <div className="dp-rings-num">{today.kcal > 0 ? today.kcal.toLocaleString('tr-TR') : '—'}<small> / {target.toLocaleString('tr-TR')}</small></div>
            <div className="dp-rings-lbl">kalori</div>
            <div style={{ fontSize:12, color:'var(--ink-mute)' }}>{today.meals.length} öğün</div>
          </div>
        </div>
      </section>

      <section className="dp-toolbar">
        <div style={{ fontSize:12, color:'var(--ink-mute)', fontFamily:'var(--mono)' }}>{days.length} günlük plan</div>
        <div className="dp-view-toggle">
          {[{id:'week',label:'Hafta',icon:'Calendar'},{id:'day',label:'Gün',icon:'Bolt'}].map(v => {
            const Ic = Icons[v.icon];
            return (
              <button key={v.id} className={`dp-view-btn ${view===v.id?'active':''}`} onClick={() => setView(v.id)}>
                <Ic size={14}/> {v.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="dp-day-strip">
        {days.map((d, i) => {
          const pct = target > 0 ? Math.round((d.kcal / target) * 100) : 0;
          return (
            <button key={d.key} className={`dp-day-card ${i===activeDayIdx?'active':''}`}
              onClick={() => { setActiveDayIdx(i); if(view==='week') setView('day'); }}>
              <div className="dp-day-head">
                <span className="dp-day-short">{d.short}</span>
                <span className="dp-day-num" style={{ fontSize:16 }}>{i+1}</span>
              </div>
              <div className="dp-day-bar"><div className="dp-day-bar-fill" style={{ height: Math.min(pct,100)+'%' }}/></div>
              <div className="dp-day-kcal">
                <strong>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                <span>kcal</span>
              </div>
            </button>
          );
        })}
      </section>

      {view==='week' && (
        <section className="dp-week-view">
          {days.map((d, i) => (
            <article key={d.key} className="dp-week-row">
              <header className="dp-week-row-head">
                <h3 className="dp-week-row-title">{d.label}</h3>
                <div className="dp-week-row-stats">
                  <div className="dp-week-stat">
                    <strong>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                    <span>kcal</span>
                  </div>
                  <div className="dp-week-row-bar"><div className="dp-week-row-bar-fill" style={{ width: Math.min((d.kcal/target)*100,100)+'%' }}/></div>
                  <button className="dp-week-row-go" onClick={() => { setActiveDayIdx(i); setView('day'); }}>Detay <Icons.ArrowRight size={14}/></button>
                </div>
              </header>
              <div className="dp-week-meals">
                {d.meals.map((m, j) => (
                  <div key={j} className="dp-week-meal">
                    <div className="dp-week-meal-time">{m.time}</div>
                    <div className="dp-week-meal-body">
                      <div className="dp-week-meal-type">{m.type}</div>
                      <div className="dp-week-meal-title" style={{ WebkitLineClamp:3 }}>{m.contents}</div>
                    </div>
                    {m.kcal > 0 && <div className="dp-week-meal-kcal">{m.kcal} kcal</div>}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}

      {view==='day' && (
        <section className="dp-day-view">
          <div className="dp-day-header">
            <div><h2 className="dp-day-title"><em>{today.label}</em></h2></div>
            <div className="dp-day-summary">
              <div className="dp-summary-block">
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>KALORİ</span>
                <strong>{today.kcal > 0 ? today.kcal.toLocaleString('tr-TR') : '—'}</strong>
                <small>{target.toLocaleString('tr-TR')} hedef</small>
              </div>
              <div className="dp-summary-block">
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>ÖĞÜN</span>
                <strong>{today.meals.length}</strong>
                <small>planlandı</small>
              </div>
            </div>
          </div>
          <div className="dp-meals">
            {today.meals.map((m, i) => (
              <article key={i} className="dp-meal">
                <div className="dp-meal-rail">
                  <div className="dp-meal-time">{m.time}</div>
                  <div className="dp-meal-bullet">{i+1}</div>
                  {i < today.meals.length-1 && <div className="dp-meal-line"/>}
                </div>
                <div className="dp-meal-card">
                  <header className="dp-meal-card-head">
                    <div>
                      <div className="dp-meal-type">{m.type.toUpperCase()}</div>
                      <h3 className="dp-meal-title">{m.type}</h3>
                    </div>
                    {m.kcal > 0 && <div className="dp-meal-card-meta"><div className="dp-meal-kcal">{m.kcal}<small> kcal</small></div></div>}
                  </header>
                  <div className="dp-meal-photo">
                    <div className="dp-meal-photo-bg" data-type={m.type}/>
                    <span className="dp-photo-label">{m.type}</span>
                  </div>
                  <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.7, margin:0, padding:'4px 0' }}>{m.contents}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {detail.content && (
        <section className="dp-ai-content-section" style={{ marginTop:24 }}>
          <button className="dp-ai-content-toggle" onClick={() => setExpandContent(c => !c)}>
            <Icons.ClipboardList size={14} />
            Tam plan metni
            <Icons.ArrowRight size={14} style={{ transform: expandContent ? 'rotate(90deg)' : 'none', transition:'transform .2s' }} />
          </button>
          {expandContent && <pre className="dp-ai-content-text">{detail.content}</pre>}
        </section>
      )}
    </div>
  );
}

/* ── main (Diyet Planlarım — list + detail) ─────────────── */
export default function ClientDietPlan() {
  const { user } = useAuth();
  const clientMode = localStorage.getItem('clientMode') || 'free';
  const genitive  = turkishGenitive(user?.fullName);
  const aiPlanTitle = `${genitive} Özel Yapay Zeka Planı`;

  const [plans,        setPlans]        = useState([]);
  const [aiPlans,      setAiPlans]      = useState([]);
  const [selectedId,   setSelectedId]   = useState(null);
  const [selectedType, setSelectedType] = useState('dietician');
  const [detail,       setDetail]       = useState(null);
  const [aiDetail,     setAiDetail]     = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [detailLoad,   setDetailLoad]   = useState(false);
  const [activeWeek,   setActiveWeek]   = useState(0);
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [view,         setView]         = useState('week');

  useEffect(() => {
    const fetchDiet = clientMode !== 'ai';
    const fetchAI   = clientMode !== 'dietician';

    Promise.all([
      fetchDiet ? dietService.getPlans().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
      fetchAI   ? aiService.getAIPlans().catch(() => ({ data: [] })) : Promise.resolve({ data: [] }),
    ]).then(([dietRes, aiRes]) => {
      const dietList = fetchDiet ? (Array.isArray(dietRes.data) ? dietRes.data : (dietRes.data?.results || [])) : [];
      const aiList   = fetchAI   ? (Array.isArray(aiRes.data)   ? aiRes.data   : (aiRes.data?.results   || [])) : [];
      setPlans(dietList);
      setAiPlans(aiList);

      if (aiList.length > 0) {
        loadAIDetail(aiList[0].id);
      } else if (dietList.length > 0) {
        const active = dietList.find(p => p.status === 'Active') || dietList[0];
        loadDietDetail(active.id);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDietDetail = async (id) => {
    setSelectedId(id); setSelectedType('dietician');
    setDetailLoad(true); setActiveWeek(0); setActiveDayIdx(0); setView('week');
    try { const r = await dietService.getPlanDetail(id); setDetail(r.data); } catch (_) {}
    setDetailLoad(false);
  };

  const loadAIDetail = async (id) => {
    setSelectedId(id); setSelectedType('ai');
    setDetailLoad(true);
    try { const r = await aiService.getAIPlanDetail(id); setAiDetail(r.data); } catch (_) { setAiDetail(null); }
    setDetailLoad(false);
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:280 }}>
      <div className="dp-spinner"/>
    </div>
  );

  if (plans.length === 0 && aiPlans.length === 0) return (
    <div style={{ textAlign:'center', padding:'80px 24px' }}>
      <div style={{ fontSize:60, marginBottom:20 }}>🍽️</div>
      <h2 style={{ fontFamily:'var(--serif)', fontSize:32, color:'var(--ink)', fontWeight:400, marginBottom:12 }}>Henüz diyet planın yok</h2>
      <p style={{ fontSize:15, color:'var(--ink-mute)', maxWidth:400, margin:'0 auto', lineHeight:1.65 }}>
        {clientMode === 'ai' ? 'AI ile plan oluşturabilirsin.' : clientMode === 'dietician' ? 'Diyetisyenin henüz plan oluşturmamış.' : 'AI ile plan oluştur ya da bir diyetisyenle eşleş.'}
      </p>
    </div>
  );

  const week       = detail?.weekly_plan?.[activeWeek];
  const days       = buildDays(week?.daily_plan, week?.start_date);
  const today      = days[activeDayIdx];
  const shopping   = buildShopping(days);
  const target     = detail?.daily_calories || 2000;
  const totalWeeks = detail?.weekly_plan?.length || 1;
  const selPlan    = plans.find(p => p.id === selectedId);

  return (
    <>
      <style>{DP_CSS}</style>
      <div className="dp-layout">

        <PlanListPanel
          plans={plans}
          aiPlans={aiPlans.map(p => ({ ...p, planTitle: aiPlanTitle }))}
          selectedId={selectedId}
          selectedType={selectedType}
          onSelectDiet={loadDietDetail}
          onSelectAI={loadAIDetail}
          clientMode={clientMode}
        />

        <div className="dp-detail-panel">
          {selectedType === 'ai' && (
            <AIPlanDetail detail={aiDetail} loading={detailLoad} planTitle={aiPlanTitle} />
          )}
          {selectedType === 'dietician' && (
          <div className="dp-body">
            {detailLoad ? (
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:280 }}><div className="dp-spinner"/></div>
            ) : !detail ? null : (<>
                <section className="dp-hero">
                  <div className="dp-hero-text">
                    <span className="dp-eyebrow"><span className="dp-eyebrow-dot"/>Hafta {activeWeek+1}/{totalWeeks}</span>
                    <h1 className="dp-title">
                      Diyet <em>planım</em>.
                      <span className="dp-title-sub">{target.toLocaleString('tr-TR')} kcal/gün · {totalWeeks*7} gün</span>
                    </h1>
                    {selPlan && (
                      <p className="dp-hero-lede">
                        Tarih aralığı <span style={{ fontFamily:'var(--mono)', fontSize:13 }}>{selPlan.start_date} → {selPlan.end_date}</span>
                      </p>
                    )}
                    <div className="dp-hero-actions">
                      <PDFDownloadLink document={<DieticianDietPDF plan={detail} planMeta={selPlan} />} fileName="diyet-plani.pdf">
                        {({ loading: pdfLoading }) => (
                          <button className="dp-btn dp-btn-ghost dp-btn-sm">
                            <Icons.ArrowRight size={14} style={{ transform:'rotate(90deg)' }} />
                            {pdfLoading ? 'Hazırlanıyor...' : 'PDF İndir'}
                          </button>
                        )}
                      </PDFDownloadLink>
                    </div>
                  </div>
                  <div className="dp-hero-card">
                    <div className="dp-rings"><Ring value={today.kcal} target={target}/></div>
                    <div className="dp-rings-meta">
                      <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.14em', marginBottom:4 }}>BUGÜN · {today.label.toUpperCase()}</div>
                      <div className="dp-rings-num">{today.kcal.toLocaleString('tr-TR')}<small> / {target.toLocaleString('tr-TR')}</small></div>
                      <div className="dp-rings-lbl">kalori tüketimi</div>
                      <div style={{ fontSize:12, color:'var(--ink-mute)' }}>{today.meals.length} öğün planlandı</div>
                    </div>
                  </div>
                </section>
                <section className="dp-toolbar">
                  <div className="dp-week-pills">
                    {(detail.weekly_plan||[]).map((_,i) => (
                      <button key={i} className={`dp-week-pill ${activeWeek===i?'active':''}`}
                        onClick={() => { setActiveWeek(i); setActiveDayIdx(0); }}>
                        <span style={{ fontFamily:'var(--mono)', fontSize:9, letterSpacing:'0.12em', opacity:.7 }}>HAFTA</span> {i+1}
                      </button>
                    ))}
                  </div>
                  <div className="dp-view-toggle">
                    {[{id:'week',label:'Hafta',icon:'Calendar'},{id:'day',label:'Gün',icon:'Bolt'},{id:'shopping',label:'Alışveriş',icon:'Check'}].map(v => {
                      const Ic = Icons[v.icon];
                      return (
                        <button key={v.id} className={`dp-view-btn ${view===v.id?'active':''}`} onClick={() => setView(v.id)}>
                          <Ic size={14}/> {v.label}
                        </button>
                      );
                    })}
                  </div>
                </section>
                <DietDetailBody days={days} today={today} view={view} setView={setView} setActiveDayIdx={setActiveDayIdx} target={target} activeWeek={activeWeek} shopping={shopping} />
              </>)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}

/* ── Dietician detail body (day strip + views) ──────────── */
function DietDetailBody({ days, today, view, setView, setActiveDayIdx, target, activeWeek, shopping }) {
  return (
    <>
      <section className="dp-day-strip">
        {days.map((d,i) => {
          const pct = target>0 ? Math.round((d.kcal/target)*100) : 0;
          return (
            <button key={d.key} className={`dp-day-card ${today.key===d.key?'active':''} ${!d.hasPlan?'future':''}`}
              onClick={() => { setActiveDayIdx(i); if(view==='week') setView('day'); }}>
              <div className="dp-day-head">
                <span className="dp-day-short">{d.short}</span>
                <span className="dp-day-num">{d.date.split(' ')[0]}</span>
              </div>
              <div className="dp-day-bar">
                <div className="dp-day-bar-fill" style={{ height: Math.min(pct,100)+'%' }}/>
              </div>
              <div className="dp-day-kcal">
                <strong>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                <span>kcal</span>
              </div>
            </button>
          );
        })}
      </section>

      {view==='week' && (
        <section className="dp-week-view">
          {days.map((d,i) => (
            <article key={d.key} className="dp-week-row">
              <header className="dp-week-row-head">
                <div>
                  <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:4 }}>{d.date}</span>
                  <h3 className="dp-week-row-title">{d.label}</h3>
                </div>
                <div className="dp-week-row-stats">
                  <div className="dp-week-stat">
                    <strong>{d.kcal===0?'—':d.kcal.toLocaleString('tr-TR')}</strong>
                    <span>/ {target.toLocaleString('tr-TR')} kcal</span>
                  </div>
                  <div className="dp-week-row-bar">
                    <div className="dp-week-row-bar-fill" style={{ width: Math.min((d.kcal/target)*100,100)+'%' }}/>
                  </div>
                  <button className="dp-week-row-go" onClick={() => { setActiveDayIdx(i); setView('day'); }}>
                    Detay <Icons.ArrowRight size={14}/>
                  </button>
                </div>
              </header>
              {d.hasPlan ? (
                <div className="dp-week-meals">
                  {d.meals.map((m,j) => (
                    <div key={j} className="dp-week-meal">
                      <div className="dp-week-meal-time">{m.time}</div>
                      <div className="dp-week-meal-body">
                        <div className="dp-week-meal-type">{m.type}</div>
                        <div className="dp-week-meal-title">{m.items.map(it=>it.name).join(', ') || m.type}</div>
                      </div>
                      <div className="dp-week-meal-kcal">{m.kcal>0?`${m.kcal} kcal`:''}</div>
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
        <section className="dp-day-view">
          <div className="dp-day-header">
            <div>
              <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:4 }}>{today.date} · {today.label.toUpperCase()}</span>
              <h2 className="dp-day-title">Bugünün <em>menüsü</em></h2>
            </div>
            <div className="dp-day-summary">
              <div className="dp-summary-block">
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>KALORİ</span>
                <strong>{today.kcal.toLocaleString('tr-TR')}<small>/{target.toLocaleString('tr-TR')}</small></strong>
                <small>hedef kcal</small>
              </div>
              <div className="dp-summary-block">
                <span style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--ink-mute)', letterSpacing:'0.14em' }}>ÖĞÜN</span>
                <strong>{today.meals.length}<small>/5</small></strong>
                <small>planlandı</small>
              </div>
            </div>
          </div>
          {!today.hasPlan ? (
            <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--ink-mute)' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📋</div>
              <p style={{ fontSize:15 }}>Bu gün için henüz plan eklenmemiş.</p>
            </div>
          ) : (
            <div className="dp-meals">
              {today.meals.map((m,i) => (
                <article key={i} className="dp-meal">
                  <div className="dp-meal-rail">
                    <div className="dp-meal-time">{m.time}</div>
                    <div className="dp-meal-bullet">{i+1}</div>
                    {i < today.meals.length-1 && <div className="dp-meal-line"/>}
                  </div>
                  <div className="dp-meal-card">
                    <header className="dp-meal-card-head">
                      <div>
                        <div className="dp-meal-type">{m.type.toUpperCase()}</div>
                        <h3 className="dp-meal-title">
                          {m.items.length>0 ? m.items.slice(0,2).map(it=>it.name).join(' + ') : m.type}
                        </h3>
                      </div>
                      {m.kcal>0 && (
                        <div className="dp-meal-card-meta">
                          <div className="dp-meal-kcal">{m.kcal}<small> kcal</small></div>
                        </div>
                      )}
                    </header>
                    <div className="dp-meal-photo">
                      <div className="dp-meal-photo-bg" data-type={m.type}/>
                      <span className="dp-photo-label">{m.type}</span>
                    </div>
                    {m.items.length>0 && (
                      <ul className="dp-meal-items">
                        {m.items.map((it,j) => (
                          <li key={j} className="dp-meal-item">
                            <span className="dp-meal-item-dot"/>
                            <span className="dp-meal-item-name">{it.name}</span>
                            <span className="dp-meal-item-g">{it.amount}{it.unit}</span>
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
        <section className="dp-shopping">
          <div className="dp-shopping-head">
            <div>
              <span style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.1em', display:'block', marginBottom:6 }}>HAFTA {activeWeek+1} · ALIŞVERİŞ LİSTESİ</span>
              <h2 className="dp-day-title">{shopping.length} <em>kalem</em></h2>
            </div>
          </div>
          {shopping.length===0 ? (
            <p style={{ textAlign:'center', padding:'40px 24px', color:'var(--ink-mute)' }}>Bu hafta için içerik bulunamadı.</p>
          ) : (
            <div className="dp-shopping-grid">
              {shopping.map((it,i) => <ShopItem key={i} name={it.name} amount={it.amount} unit={it.unit}/>)}
            </div>
          )}
        </section>
      )}
    </>
  );
}

/* ── CSS ─────────────────────────────────────────────────── */
const DP_CSS = `
  @keyframes dpSpin  { to { transform: rotate(360deg); } }
  @keyframes dpPulse { 0%,100% { box-shadow:0 0 0 0 rgba(101,163,13,.5); } 50% { box-shadow:0 0 0 6px rgba(101,163,13,0); } }

  .dp-spinner { width:32px; height:32px; border-radius:50%; border:3px solid rgba(101,163,13,.2); border-top-color:var(--accent); animation:dpSpin .8s linear infinite; }

  /* ── TWO-COLUMN LAYOUT ── */
  .dp-layout { display:grid; grid-template-columns:260px 1fr; gap:0; min-height:calc(100vh - 80px); }

  /* ── LIST PANEL ── */
  .dp-list-panel {
    border-right:1px solid var(--line);
    display:flex; flex-direction:column;
    background:#fff; overflow-y:auto;
    position:sticky; top:0; height:calc(100vh - 80px);
  }
  .dp-list-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:18px 16px 12px; border-bottom:1px solid var(--line);
    flex-shrink:0;
  }
  .dp-list-title { font-size:13px; font-weight:700; color:var(--ink); }
  .dp-list-count { font-family:var(--mono); font-size:11px; color:var(--ink-mute); background:var(--bg-warm); padding:2px 8px; border-radius:999px; }
  .dp-list-section { padding:12px 0; border-bottom:1px solid var(--line-soft); }
  .dp-list-section:last-child { border-bottom:none; flex:1; }
  .dp-list-section-label {
    display:flex; align-items:center; gap:6px;
    font-family:var(--mono); font-size:10px; font-weight:700;
    letter-spacing:0.1em; text-transform:uppercase; color:var(--ink-mute);
    padding:0 16px 8px;
  }
  .dp-list-empty { padding:8px 16px 4px; }
  .dp-list-empty p { font-size:12px; color:var(--ink-mute); margin:0; }
  .dp-list-item {
    display:flex; align-items:center; gap:10px;
    width:100%; padding:10px 16px; background:none; border:none;
    cursor:pointer; text-align:left; transition:background .15s;
  }
  .dp-list-item:hover { background:var(--bg-warm); }
  .dp-list-item.active { background:var(--accent-tint); }
  .dp-list-item-badge {
    width:28px; height:28px; border-radius:8px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:700; font-family:var(--mono); letter-spacing:0.05em;
  }
  .dp-list-item-badge.ai { background:rgba(101,163,13,.12); color:var(--accent-deep); }
  .dp-list-item-badge.dietician { background:#EFF6FF; color:#1D4ED8; }
  .dp-list-item-body { flex:1; min-width:0; }
  .dp-list-item-title { font-size:12px; font-weight:600; color:var(--ink); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:2px; display:flex; align-items:center; gap:4px; }
  .dp-list-item-date { font-family:var(--mono); font-size:10px; color:var(--ink-mute); }

  /* ── DETAIL PANEL ── */
  .dp-detail-panel { overflow-y:auto; height:calc(100vh - 80px); }
  .dp-body { padding:28px 32px 80px; --r-md:12px; --r-lg:20px; --r-pill:999px; --ease-out:cubic-bezier(0.22,1,0.36,1); }

  /* ── AI CONTENT COLLAPSIBLE ── */
  .dp-ai-content-section { background:#fff; border:1px solid var(--line); border-radius:16px; overflow:hidden; }
  .dp-ai-content-toggle { display:flex; align-items:center; gap:8px; width:100%; padding:16px 20px; background:none; border:none; font-size:13px; font-weight:600; color:var(--ink-soft); cursor:pointer; transition:background .15s; }
  .dp-ai-content-toggle:hover { background:var(--bg-warm); color:var(--ink); }
  .dp-ai-content-text { padding:0 20px 20px; font-size:13px; color:var(--ink-soft); line-height:1.7; white-space:pre-wrap; font-family:var(--mono); margin:0; }

  /* eyebrow */
  .dp-eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:var(--accent-deep); }
  .dp-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); animation:dpPulse 2s ease-out infinite; }

  /* HERO */
  .dp-hero { display:grid; grid-template-columns:1.4fr 1fr; gap:24px; margin-bottom:32px; background:#fff; border:1px solid var(--line); border-radius:var(--r-lg); padding:32px 36px; position:relative; overflow:hidden; }
  .dp-hero::before { content:""; position:absolute; right:-120px; top:-120px; width:360px; height:360px; border-radius:50%; background:radial-gradient(circle,var(--accent-tint),transparent 70%); pointer-events:none; }
  .dp-hero-text { display:flex; flex-direction:column; gap:14px; position:relative; z-index:1; }
  .dp-title { font-family:var(--serif); font-size:clamp(36px,4vw,60px); font-weight:400; line-height:1.02; letter-spacing:-0.025em; color:var(--ink); margin-top:4px; }
  .dp-title em { font-style:italic; color:var(--accent-deep); }
  .dp-title-sub { font-size:15px; font-family:var(--mono); font-weight:400; color:var(--ink-mute); display:inline-block; margin-top:10px; }
  .dp-hero-lede { font-size:14px; color:var(--ink-soft); max-width:460px; line-height:1.6; }
  .dp-hero-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:8px; }
  .dp-hero-card { background:var(--bg-warm); border:1px solid var(--line); border-radius:var(--r-md); padding:24px; display:grid; grid-template-columns:auto 1fr; gap:24px; align-items:center; position:relative; z-index:1; }
  .dp-rings { display:flex; align-items:center; justify-content:center; }
  .dp-rings-meta { display:flex; flex-direction:column; gap:4px; }
  .dp-rings-num { font-family:var(--serif); font-size:28px; line-height:1.1; letter-spacing:-0.02em; color:var(--ink); }
  .dp-rings-num small { font-size:13px; color:var(--ink-mute); font-family:var(--mono); }
  .dp-rings-lbl { font-size:12px; color:var(--ink-mute); margin-bottom:6px; }

  .dp-btn { display:inline-flex; align-items:center; gap:6px; padding:12px 18px; border-radius:var(--r-pill); font-size:14px; font-weight:600; cursor:pointer; font-family:var(--sans,"Plus Jakarta Sans",sans-serif); transition:all .25s var(--ease-out); border:1.5px solid transparent; background:transparent; }
  .dp-btn-sm { padding:9px 14px; font-size:13px; }
  .dp-btn-ghost { color:var(--ink-soft); border-color:var(--line); }
  .dp-btn-ghost:hover { border-color:var(--ink-soft); color:var(--ink); background:var(--bg-warm); }

  .dp-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; gap:16px; flex-wrap:wrap; }
  .dp-week-pills { display:flex; gap:4px; background:#fff; border:1px solid var(--line); border-radius:var(--r-pill); padding:4px; }
  .dp-week-pill { padding:8px 16px; border-radius:var(--r-pill); font-size:13px; font-weight:500; color:var(--ink-soft); display:inline-flex; align-items:center; gap:6px; transition:all .2s; white-space:nowrap; border:none; cursor:pointer; background:transparent; }
  .dp-week-pill:hover { color:var(--ink); background:var(--bg-warm); }
  .dp-week-pill.active { background:var(--ink); color:#FBFAF5; }
  .dp-view-toggle { display:flex; background:#fff; border:1px solid var(--line); border-radius:var(--r-pill); padding:4px; }
  .dp-view-btn { padding:8px 14px; border-radius:var(--r-pill); font-size:13px; font-weight:500; color:var(--ink-soft); display:inline-flex; align-items:center; gap:6px; transition:all .2s; border:none; cursor:pointer; background:transparent; }
  .dp-view-btn:hover { color:var(--ink); }
  .dp-view-btn.active { background:var(--accent-tint); color:var(--accent-deep); font-weight:600; }

  .dp-day-strip { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; margin-bottom:28px; }
  .dp-day-card { background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:14px 12px; display:flex; flex-direction:column; gap:10px; cursor:pointer; transition:all .25s var(--ease-out); text-align:left; }
  .dp-day-card:hover { transform:translateY(-2px); border-color:var(--ink-soft); box-shadow:var(--shadow-sm); }
  .dp-day-card.active { background:var(--ink); border-color:var(--ink); }
  .dp-day-card.active .dp-day-short,.dp-day-card.active .dp-day-num,.dp-day-card.active .dp-day-kcal strong,.dp-day-card.active .dp-day-kcal span { color:#FBFAF5; }
  .dp-day-card.active .dp-day-bar { background:rgba(255,255,255,.12); }
  .dp-day-card.active .dp-day-bar-fill { background:var(--accent); }
  .dp-day-card.future .dp-day-bar-fill { background:var(--line); }
  .dp-day-head { display:flex; justify-content:space-between; align-items:baseline; }
  .dp-day-short { font-size:10px; color:var(--ink-mute); letter-spacing:0.14em; font-family:var(--mono); }
  .dp-day-num { font-family:var(--serif); font-size:22px; line-height:1; color:var(--ink); letter-spacing:-0.02em; }
  .dp-day-bar { height:36px; background:rgba(0,0,0,.04); border-radius:6px; overflow:hidden; display:flex; align-items:flex-end; }
  .dp-day-bar-fill { width:100%; background:var(--accent); border-radius:4px; transition:height .8s var(--ease-out); min-height:2px; }
  .dp-day-kcal { display:flex; align-items:baseline; gap:4px; }
  .dp-day-kcal strong { font-size:13px; color:var(--ink); font-family:var(--mono); font-weight:600; }
  .dp-day-kcal span { font-size:10px; color:var(--ink-mute); }

  .dp-week-view { display:flex; flex-direction:column; gap:14px; }
  .dp-week-row { background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:22px 24px; display:flex; flex-direction:column; gap:16px; transition:border-color .2s; }
  .dp-week-row:hover { border-color:var(--ink-soft); }
  .dp-week-row-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; padding-bottom:12px; border-bottom:1px solid var(--line-soft); }
  .dp-week-row-title { font-family:var(--serif); font-size:26px; font-weight:400; line-height:1; letter-spacing:-0.02em; color:var(--ink); margin-top:4px; }
  .dp-week-row-stats { display:grid; grid-template-columns:auto 180px auto; align-items:center; gap:16px; flex:1; max-width:460px; }
  .dp-week-stat { display:flex; align-items:baseline; gap:6px; }
  .dp-week-stat strong { font-family:var(--serif); font-size:22px; color:var(--ink); letter-spacing:-0.02em; }
  .dp-week-stat span { font-size:12px; color:var(--ink-mute); font-family:var(--mono); }
  .dp-week-row-bar { height:6px; background:rgba(0,0,0,.06); border-radius:4px; overflow:hidden; }
  .dp-week-row-bar-fill { height:100%; background:var(--accent); border-radius:4px; transition:width .8s var(--ease-out); }
  .dp-week-row-go { display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--ink-soft); padding:6px 10px; border-radius:var(--r-pill); border:1px solid var(--line); transition:all .2s; white-space:nowrap; background:transparent; cursor:pointer; }
  .dp-week-row-go:hover { background:var(--ink); color:#FBFAF5; border-color:var(--ink); }
  .dp-week-meals { display:grid; grid-template-columns:repeat(4,1fr); gap:10px; }
  .dp-week-meal { background:var(--bg-warm); border:1px solid var(--line-soft); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:6px; transition:all .2s; }
  .dp-week-meal:hover { background:#fff; border-color:var(--line); transform:translateY(-1px); }
  .dp-week-meal-time { font-size:10px; color:var(--ink-mute); letter-spacing:0.06em; font-family:var(--mono); }
  .dp-week-meal-body { display:flex; flex-direction:column; gap:3px; flex:1; }
  .dp-week-meal-type { font-size:10px; color:var(--ink-mute); text-transform:uppercase; letter-spacing:0.1em; font-family:var(--mono); }
  .dp-week-meal-title { font-size:13px; font-weight:600; color:var(--ink); line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .dp-week-meal-kcal { font-size:11px; color:var(--ink-soft); margin-top:auto; padding-top:4px; border-top:1px solid var(--line-soft); font-family:var(--mono); }

  .dp-day-view { display:flex; flex-direction:column; gap:24px; }
  .dp-day-header { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; }
  .dp-day-title { font-family:var(--serif); font-weight:400; font-size:clamp(32px,4vw,48px); line-height:1.02; letter-spacing:-0.025em; color:var(--ink); margin-top:4px; }
  .dp-day-title em { font-style:italic; color:var(--accent-deep); }
  .dp-day-summary { display:flex; gap:4px; background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:6px; }
  .dp-summary-block { padding:12px 18px; display:flex; flex-direction:column; gap:2px; border-right:1px solid var(--line-soft); min-width:100px; }
  .dp-summary-block:last-child { border-right:0; }
  .dp-summary-block strong { font-family:var(--serif); font-size:24px; color:var(--ink); letter-spacing:-0.02em; line-height:1.1; }
  .dp-summary-block strong small { font-size:13px; color:var(--ink-mute); font-family:var(--mono); font-weight:400; }
  .dp-summary-block small { font-size:11px; color:var(--ink-mute); }
  .dp-meals { display:flex; flex-direction:column; }
  .dp-meal { display:grid; grid-template-columns:84px 1fr; gap:20px; padding-bottom:20px; }
  .dp-meal-rail { display:flex; flex-direction:column; align-items:center; gap:8px; position:relative; padding-top:22px; }
  .dp-meal-time { font-family:var(--mono); font-size:12px; color:var(--ink); font-weight:600; letter-spacing:0.04em; }
  .dp-meal-bullet { width:32px; height:32px; border-radius:50%; background:#fff; border:2px solid var(--line); display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:var(--ink-mute); z-index:2; }
  .dp-meal-line { width:2px; flex:1; background:var(--line); margin-top:4px; }
  .dp-meal-card { background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:24px; display:flex; flex-direction:column; gap:18px; transition:all .25s var(--ease-out); }
  .dp-meal-card:hover { border-color:var(--ink-soft); box-shadow:var(--shadow-sm); }
  .dp-meal-card-head { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; }
  .dp-meal-type { font-size:10px; color:var(--ink-mute); letter-spacing:0.16em; font-family:var(--mono); }
  .dp-meal-title { font-family:var(--serif); font-size:22px; font-weight:400; line-height:1.1; letter-spacing:-0.015em; color:var(--ink); margin:4px 0 8px; }
  .dp-meal-card-meta { display:flex; flex-direction:column; gap:8px; align-items:flex-end; flex-shrink:0; }
  .dp-meal-kcal { font-family:var(--serif); font-size:28px; line-height:1; color:var(--ink); letter-spacing:-0.02em; }
  .dp-meal-kcal small { font-size:13px; color:var(--ink-mute); font-family:var(--mono); }
  .dp-meal-photo { height:120px; border-radius:var(--r-md); position:relative; overflow:hidden; display:flex; align-items:flex-end; padding:14px; }
  .dp-meal-photo-bg { position:absolute; inset:0; background:linear-gradient(135deg,#E8DFC8,#D4C5A0 50%,#B8A175); }
  .dp-meal-photo-bg[data-type="Kahvaltı"] { background:radial-gradient(ellipse at 30% 30%,#F2D9A4,#D4A574 70%); }
  .dp-meal-photo-bg[data-type="Ara Öğün"] { background:radial-gradient(ellipse at 60% 40%,#E8DFC8,#B8A175 70%); }
  .dp-meal-photo-bg[data-type="Öğle"],.dp-meal-photo-bg[data-type="Öğle Yemeği"] { background:radial-gradient(ellipse at 40% 60%,#C4D9A0,#8FA876 70%); }
  .dp-meal-photo-bg[data-type="Akşam"],.dp-meal-photo-bg[data-type="Akşam Yemeği"] { background:radial-gradient(ellipse at 70% 30%,#B8927D,#5C4738 80%); }
  .dp-photo-label { position:relative; z-index:1; background:rgba(255,255,255,.85); backdrop-filter:blur(4px); font-size:11px; padding:6px 12px; border-radius:var(--r-pill); color:var(--ink); font-family:var(--mono); }
  .dp-meal-items { list-style:none; display:grid; grid-template-columns:repeat(2,1fr); background:var(--bg-warm); border-radius:var(--r-md); padding:6px; }
  .dp-meal-item { display:grid; grid-template-columns:auto 1fr auto; gap:10px; align-items:center; padding:10px 12px; border-radius:8px; font-size:13px; }
  .dp-meal-item:hover { background:#fff; }
  .dp-meal-item-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); flex-shrink:0; }
  .dp-meal-item-name { color:var(--ink); font-weight:500; }
  .dp-meal-item-g { font-size:11px; color:var(--ink-mute); font-family:var(--mono); }

  .dp-shopping { display:flex; flex-direction:column; gap:24px; }
  .dp-shopping-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; }
  .dp-shopping-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:8px; background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:10px; }
  .dp-shop-item { display:grid; grid-template-columns:22px 1fr auto; gap:12px; align-items:center; padding:12px 14px; border-radius:8px; cursor:pointer; transition:all .15s; user-select:none; }
  .dp-shop-item:hover { background:var(--bg-warm); }
  .dp-shop-check { width:20px; height:20px; border-radius:6px; border:1.5px solid var(--line); background:#fff; display:inline-flex; align-items:center; justify-content:center; color:transparent; transition:all .2s; flex-shrink:0; }
  .dp-shop-check.dp-checked { background:var(--accent); border-color:var(--accent); color:#fff; }
  .dp-shop-name { font-size:14px; font-weight:500; }
  .dp-shop-g { font-size:12px; color:var(--ink-mute); font-family:var(--mono); }

  @media(max-width:1100px) {
    .dp-layout { grid-template-columns:1fr; }
    .dp-list-panel { position:static; height:auto; border-right:none; border-bottom:1px solid var(--line); max-height:280px; }
    .dp-detail-panel { height:auto; }
    .dp-hero { grid-template-columns:1fr; }
    .dp-week-meals { grid-template-columns:repeat(3,1fr); }
    .dp-meal-items { grid-template-columns:1fr; }
  }
  @media(max-width:760px) {
    .dp-body,.dp-ai-detail { padding:20px; }
    .dp-day-strip { gap:4px; }
    .dp-day-card { padding:10px 8px; }
    .dp-week-meals { grid-template-columns:1fr; }
    .dp-meal { grid-template-columns:60px 1fr; gap:12px; }
    .dp-week-row-stats { grid-template-columns:1fr; gap:8px; }
    .dp-toolbar { flex-direction:column; align-items:stretch; }
  }
`;
