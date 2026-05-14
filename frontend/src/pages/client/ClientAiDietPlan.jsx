import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import aiService from '../../services/aiService';
import userService from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import Icons from '../../components/landing/LandingIcons';
import '../../styles/ai-pages.css';

function extractText(response) {
  if (!response) return '';
  const content = response.content;
  if (typeof content === 'string') return content;
  if (Array.isArray(content))
    return content.filter(b => b?.type === 'text').map(b => b.text).join('\n\n');
  if (content && typeof content === 'object' && content.type === 'text')
    return content.text;
  if (response.message && typeof response.message === 'string') return response.message;
  return JSON.stringify(response, null, 2);
}

const LOADING_STEPS = [
  'Sağlık profilin analiz ediliyor',
  'Kalori & makro dağılımı hesaplanıyor',
  'Mevsim ürünlerine göre menü kuruluyor',
  'Bütçe ve tercih filtresi uygulanıyor',
];

const GOAL_LABELS     = { Lose: 'Kilo Vermek', Gain: 'Kilo Almak', Maintain: 'Formumu Korumak' };
const DIET_LABELS     = { VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryan', NORMAL: 'Normal' };
const BUDGET_LABELS   = { LOW: 'Ekonomik', MEDIUM: 'Standart', HIGH: 'Premium' };
const ACTIVITY_LABELS = { NONE: 'Hareketsiz', LOW: 'Hafif Aktif', MEDIUM: 'Orta Aktif', HIGH: 'Aktif', VERY_HIGH: 'Çok Aktif' };
const SUGAR_LABELS    = { NONE: 'Hiç', LOW: 'Az', MEDIUM: 'Orta', HIGH: 'Çok', CRAVINGS: 'Tatlı Krizi' };

function getActivePlan(plans) {
  if (!plans?.length) return null;
  const latest = plans[0];
  const expiresAt = new Date(new Date(latest.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);
  return expiresAt > new Date() ? { ...latest, expiresAt } : null;
}

function daysRemaining(expiresAt) {
  const diff = new Date(expiresAt) - new Date();
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function ClientAiDietPlan() {
  const { user } = useAuth();
  const [threadId]    = useState(() => `thread_${Date.now()}`);
  const [stage, setStage]               = useState('form');
  const [loadingMode, setLoadingMode]   = useState('start');
  const [revisionNote, setRevisionNote] = useState('');
  const [loadingStep, setLoadingStep]   = useState(0);
  const [response, setResponse]         = useState(null);
  const [error, setError]               = useState('');
  const [snapshot, setSnapshot]         = useState(null);
  const [activePlan, setActivePlan]     = useState(null);
  const [plansLoading, setPlansLoading] = useState(true);
  const intervalRef = useRef(null);

  useEffect(() => {
    Promise.all([
      userService.getHealthSnapshots().catch(() => ({ data: [] })),
      aiService.getAIPlans().catch(() => ({ data: [] })),
    ]).then(([snapRes, planRes]) => {
      const snaps = snapRes.data;
      if (snaps?.length) setSnapshot(snaps[snaps.length - 1]);
      const plans = Array.isArray(planRes.data) ? planRes.data : (planRes.data?.results || []);
      setActivePlan(getActivePlan(plans));
    }).finally(() => setPlansLoading(false));
  }, []);

  const startLoadingAnim = () => {
    setLoadingStep(0);
    let s = 0;
    intervalRef.current = setInterval(() => {
      if (s < LOADING_STEPS.length - 1) {
        s += 1;
        setLoadingStep(s);
      } else {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 10000);
  };

  const stopLoadingAnim = (allDone = false) => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (allDone) setLoadingStep(LOADING_STEPS.length);
  };

  const callAPI = async (action, revNote) => {
    setError('');
    setLoadingMode(action === 'revise' ? 'revise' : 'start');
    setStage('loading');
    startLoadingAnim();
    try {
      const r = await aiService.generateDiet({ thread_id: threadId, action, revision_note: revNote });
      stopLoadingAnim(true);
      setTimeout(() => {
        setResponse(r.data);
        setRevisionNote('');
        setStage('result');
      }, 400);
    } catch (err) {
      stopLoadingAnim(false);
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || 'AI ile bağlantı kurulamadı.');
      setStage(action === 'start' ? 'form' : 'result');
    }
  };

  const handleGenerate = () => callAPI('start', '');
  const handleRevise   = () => callAPI('revise', revisionNote);

  const handleApprove = async () => {
    setError('');
    setStage('loading');
    startLoadingAnim();
    try {
      await aiService.generateDiet({ thread_id: threadId, action: 'approve', revision_note: '' });
      stopLoadingAnim(true);
      setTimeout(() => setStage('approved'), 400);
    } catch {
      stopLoadingAnim(false);
      setError('Plan kaydedilemedi.');
      setStage('result');
    }
  };

  const handleReset = () => { setStage('form'); setResponse(null); setError(''); };

  const goalLabel = snapshot?.goal ? (GOAL_LABELS[snapshot.goal] || snapshot.goal) : null;

  if (stage === 'approved') {
    return (
      <div className="ai-body">
        <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 'var(--r-lg)', padding: '64px 40px', textAlign: 'center', maxWidth: 520, margin: '40px auto' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--accent-tint)', color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Icons.Check size={28} />
          </div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 30, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 10 }}>Plan Kaydedildi!</h2>
          <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6, marginBottom: 28 }}>Diyet planınız başarıyla oluşturuldu. Diyet Planlarım sayfasından inceleyebilirsiniz.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/client/diet-plans" className="btn btn-primary btn-sm">
              <Icons.ClipboardList size={14} /> Planlarıma Git
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleReset}>
              <Icons.Sparkle size={14} /> Yeni Plan Oluştur
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-body">
      {stage === 'form' && (
        <>
          <div className="ai-hero">
            <div className="ai-hero-text">
              <span className="eyebrow"><span className="eyebrow-dot" />Yapay Zeka · Diyet Asistanı</span>
              <h1 className="ai-title">Sana özel <em>plan</em> oluştur.</h1>
              <p className="ai-lede">AI sağlık profiline göre haftalık menünü saniyeler içinde hazırlasın.</p>
            </div>
            <div className="ai-hero-actions">
              <Link to="/client/meal-analysis" className="btn btn-ghost btn-sm">
                <Icons.Search size={14} /> Yemek Analizi
              </Link>
            </div>
          </div>

          {plansLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
              <div className="spinner" style={{ width: 24, height: 24, border: '2px solid var(--line)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'aiSpin .7s linear infinite' }} />
            </div>
          ) : activePlan ? (
            <article className="ai-card" style={{ maxWidth: 560 }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 24 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-tint)', color: 'var(--accent-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.ClipboardList size={22} />
                </div>
                <div>
                  <span className="ai-card-eyebrow" style={{ display: 'block', marginBottom: 4 }}>AKTİF PLAN</span>
                  <h2 className="ai-card-title" style={{ fontSize: 22 }}>Mevcut planın devam ediyor</h2>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.65, marginBottom: 20 }}>
                Aktif diyet planın bitmeden yeni plan oluşturamazsın. Mevcut planın
                {' '}<strong style={{ color: 'var(--ink)' }}>{daysRemaining(activePlan.expiresAt)} gün</strong>{' '}
                daha devam edecek.
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderTop: '1px solid var(--line-soft)', borderBottom: '1px solid var(--line-soft)', marginBottom: 20 }}>
                <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Plan bitiş tarihi</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', fontFamily: 'var(--mono)' }}>
                  {new Date(activePlan.expiresAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Link to="/client/diet-plans" className="btn btn-primary btn-sm">
                  <Icons.ClipboardList size={14} /> Aktif Planı Görüntüle
                </Link>
                <Link to="/client/meal-analysis" className="btn btn-ghost btn-sm">
                  <Icons.Search size={14} /> Yemek Analizi Yap
                </Link>
              </div>
            </article>
          ) : (
            <div className="ai-form-grid">
              <article className="ai-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <span className="ai-card-eyebrow" style={{ display: 'block', marginBottom: 6 }}>YENİ PLAN</span>
                    <h2 className="ai-card-title">Yaşam Tarzı Profili</h2>
                  </div>
                  <Link to="/client/profile" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                    Değiştir →
                  </Link>
                </div>

                {snapshot ? (
                  <>
                    {[
                      ['Hedef',            goalLabel],
                      ['Beslenme Tercihi', DIET_LABELS[snapshot.dietary_preference]],
                      ['Aktivite Seviyesi', ACTIVITY_LABELS[snapshot.activity_level]],
                      ['Şeker Tüketimi',   SUGAR_LABELS[snapshot.sugar_intake]],
                      ['Diyet Bütçesi',    BUDGET_LABELS[snapshot.budget]],
                    ].map(([label, value]) => value && (
                      <div key={label} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '13px 0', borderBottom: '1px solid var(--line-soft)',
                      }}>
                        <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
                      </div>
                    ))}

                    {error && <div className="ai-error" style={{ marginTop: 16 }}>{error}</div>}

                    <div className="ai-form-foot" style={{ marginTop: 20 }}>
                      <button className="ai-submit" onClick={handleGenerate}>
                        <Icons.Sparkle size={16} /> Plan Oluştur
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--ink-mute)', marginBottom: 14 }}>
                      Henüz yaşam tarzı profiliniz oluşturulmamış.
                    </p>
                    <Link to="/client/profile" className="btn btn-primary btn-sm">
                      Profili Tamamla
                    </Link>
                  </div>
                )}
              </article>

              <aside className="ai-tip">
                <span className="ai-tip-eyebrow"><Icons.Sparkle size={12} /> NASIL ÇALIŞIR</span>
                <h3 className="ai-tip-title">AI nasıl bir plan hazırlar?</h3>
                <ul className="ai-tip-list">
                  <li><Icons.Check size={14} /> Hedefin, beslenme tercihin ve aktivite seviyen profilinden alınır.</li>
                  <li><Icons.Check size={14} /> Hedefine göre kalori açığı/fazlası hesaplanır.</li>
                  <li><Icons.Check size={14} /> Bütçe tercihin menüye yansır.</li>
                  <li><Icons.Check size={14} /> Mevsime uygun ürünler ve kolay tarifler tercih edilir.</li>
                </ul>
                <p className="ai-tip-foot">
                  AI önerileri yardımcı bilgidir. Tıbbi durumların için mutlaka uzmanına danış.
                </p>
              </aside>
            </div>
          )}
        </>
      )}

      {stage === 'loading' && (
        <div className="ai-loading">
          <span className="ai-loading-orb" />
          <h2 className="ai-loading-text">
            {loadingMode === 'revise' ? 'Plan revize ediliyor...' : 'Plan oluşturuluyor...'}
          </h2>
          <p className="ai-loading-sub">Bu genelde 10–25 saniye sürer.</p>
          <div className="ai-loading-steps">
            {LOADING_STEPS.map((s, i) => (
              <div key={i} className={`ai-loading-step ${i < loadingStep ? 'done' : i === loadingStep ? 'active' : ''}`}>
                <span className="ai-step-mark">
                  {i < loadingStep ? <Icons.Check size={9} /> : i + 1}
                </span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stage === 'result' && response && (
        <PlanResult
          response={response}
          snapshot={snapshot}
          goalLabel={goalLabel}
          user={user}
          onRevise={handleRevise}
          onApprove={handleApprove}
          onReset={handleReset}
          revisionNote={revisionNote}
          setRevisionNote={setRevisionNote}
          error={error}
        />
      )}
    </div>
  );
}

/* ─── Plan Result ─────────────────────────────────────────────────── */

const DAY_ORDER = ['Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi','Pazar'];

function turkishGenitive(fullName) {
  if (!fullName) return 'Danışan';
  const name = fullName.trim();
  const last = name[name.length - 1].toLowerCase();
  const vowels = 'aeıioöuü';
  const backVowels = 'aıou';
  // find last vowel in name to determine suffix harmony
  let lastVowel = 'a';
  for (let i = name.length - 1; i >= 0; i--) {
    if (vowels.includes(name[i].toLowerCase())) { lastVowel = name[i].toLowerCase(); break; }
  }
  const suffix = vowels.includes(last)
    ? (backVowels.includes(lastVowel) ? "'nın" : "'nin")
    : (backVowels.includes(lastVowel) ? "'ın"  : "'in");
  return name + suffix;
}

function groupByDay(meals) {
  const map = {};
  (meals || []).forEach(m => {
    if (!map[m.day]) map[m.day] = { day: m.day, meals: [], total: 0 };
    map[m.day].meals.push(m);
    map[m.day].total += m.calories || 0;
  });
  const ordered = DAY_ORDER.filter(d => map[d]).map(d => map[d]);
  Object.keys(map).forEach(d => { if (!DAY_ORDER.includes(d)) ordered.push(map[d]); });
  return ordered;
}

function PlanResult({ response, snapshot, goalLabel, user, onRevise, onApprove, onReset,
                      revisionNote, setRevisionNote, error }) {
  const meals   = response?.diet_plan || [];
  const days    = groupByDay(meals);
  const summary = response?.summary || '';
  const avgKcal = days.length
    ? Math.round(days.reduce((s, d) => s + d.total, 0) / days.length)
    : 0;
  const mealsPerDay = days.length ? Math.round(meals.length / days.length) : 0;

  const genitive = turkishGenitive(user?.fullName);
  const nameHead = `${genitive} Özel Yapay Zeka`;
  const nameTail = 'Planı';

  return (
    <div className="ai-plan-out">
      {/* Hero header */}
      <div className="ai-hero" style={{ marginBottom: 4 }}>
        <div className="ai-hero-text">
          <span className="eyebrow"><span className="eyebrow-dot" />AI tarafından oluşturuldu</span>
          <h1 className="ai-title">Plan <em>hazır</em>.</h1>
          <p className="ai-lede">İncele, gerekirse revize et veya onaylayarak aktif planın olarak kullan.</p>
        </div>
        <div className="ai-hero-actions">
          <button className="btn btn-ghost btn-sm" onClick={onReset}>
            <Icons.Sparkle size={14} /> Yeni Plan
          </button>
        </div>
      </div>

      {/* Plan hero card */}
      <article className="ai-plan-hero">
        <div className="ai-plan-hero-text">
          <span className="ai-plan-badge"><Icons.Sparkle size={11} /> AI'DAN GELEN PLAN</span>
          <h2 className="ai-plan-name">
            {nameHead} <em>{nameTail}</em>
          </h2>
          {summary && <p className="ai-plan-desc">{summary}</p>}
          <div className="ai-plan-meta">
            {goalLabel && <span>{goalLabel}</span>}
            {snapshot?.dietary_preference && <span>{DIET_LABELS[snapshot.dietary_preference]}</span>}
            {snapshot?.budget && <span>{BUDGET_LABELS[snapshot.budget]}</span>}
            {days.length > 0 && <span>{days.length} gün</span>}
          </div>
        </div>
        {avgKcal > 0 && (
          <div className="ai-plan-stats">
            <div className="ai-plan-stat">
              <span className="ai-plan-stat-num">{avgKcal.toLocaleString('tr-TR')}<small>kcal</small></span>
              <span className="ai-plan-stat-lbl">GÜNLÜK</span>
            </div>
            <div className="ai-plan-stat">
              <span className="ai-plan-stat-num">{days.length}</span>
              <span className="ai-plan-stat-lbl">GÜN</span>
            </div>
            <div className="ai-plan-stat">
              <span className="ai-plan-stat-num">{mealsPerDay}</span>
              <span className="ai-plan-stat-lbl">ÖĞÜN/GÜN</span>
            </div>
          </div>
        )}
      </article>

      {/* Day cards */}
      {days.length > 0 ? (
        <div className="ai-plan-days">
          {days.map((d, idx) => (
            <article key={d.day} className="ai-day">
              <header className="ai-day-head">
                <h3 className="ai-day-name">
                  {d.day}<small>GÜN {String(idx + 1).padStart(2, '0')}</small>
                </h3>
                <span className="ai-day-kcal">
                  <strong>{d.total.toLocaleString('tr-TR')}</strong> kcal
                </span>
              </header>
              <ul className="ai-day-meals">
                {d.meals.map((m, j) => (
                  <li key={j} className="ai-day-meal">
                    <span className="ai-day-meal-type">{m.meal_type}</span>
                    <div className="ai-day-meal-body">
                      <span className="ai-day-meal-title">
                        {m.items?.length > 0
                          ? m.items.map(i => i.food_name).join(', ')
                          : m.contents}
                      </span>
                      {m.contents && m.items?.length > 0 && (
                        <span className="ai-day-meal-detail">{m.contents}</span>
                      )}
                    </div>
                    <span className="ai-day-meal-kcal">{m.calories} kcal</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        /* Fallback: text if diet_plan not available */
        <article className="ai-card">
          <span className="ai-card-eyebrow" style={{ display: 'block', marginBottom: 16 }}>PLAN DETAYI</span>
          <div style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
            {extractText(response)}
          </div>
        </article>
      )}

      {/* Revision */}
      <article className="ai-revision">
        <div className="ai-revision-text">
          <span className="ai-card-eyebrow">DEĞİŞİKLİK İSTE</span>
          <h3>Planı revize ettir</h3>
          <p>AI'a istediğin değişikliği yaz: "Daha az karbonhidrat olsun", "Salı akşamı vejetaryen olsun" gibi.</p>
        </div>
        <div className="ai-revision-form">
          <textarea className="ai-textarea"
            placeholder="Örn. daha az karbonhidrat, vejetaryen alternatifler, ara öğünleri kaldır..."
            value={revisionNote} onChange={e => setRevisionNote(e.target.value)} />
          <button className="btn btn-outline btn-sm" style={{ alignSelf: 'flex-start' }}
            onClick={onRevise} disabled={!revisionNote.trim()}>
            <Icons.ArrowRight size={14} /> Revize et
          </button>
        </div>
      </article>

      {error && <div className="ai-error">{error}</div>}

      {/* CTA */}
      <article className="ai-cta">
        <div className="ai-cta-text">
          <span className="ai-cta-title">Bu plana başlamaya hazır mısın?</span>
          <span className="ai-cta-sub">Onayladığında aktif planın olarak ayarlanır.</span>
        </div>
        <div className="ai-cta-actions">
          <button className="btn btn-primary btn-sm" onClick={onApprove}>
            <Icons.Check size={14} /> Onayla & Aktif Et
          </button>
          <Link to="/client/diet-plans" className="btn btn-ghost btn-sm">
            <Icons.ClipboardList size={14} /> Planlarıma Git
          </Link>
        </div>
      </article>
    </div>
  );
}
