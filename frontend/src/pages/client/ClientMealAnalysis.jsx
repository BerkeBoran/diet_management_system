import { useState, useRef, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import aiService from '../../services/aiService';
import Icons from '../../components/landing/LandingIcons';
import '../../styles/ai-pages.css';

const DAILY_LIMIT = 8;
const STORAGE_KEY = 'meal_analysis_daily';

function getTodayCount() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const today = new Date().toISOString().split('T')[0];
    if (stored?.date === today) return stored.count;
  } catch {}
  return 0;
}

function incrementDailyCount() {
  const today = new Date().toISOString().split('T')[0];
  const count = getTodayCount() + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
  return count;
}

function extractText(val) {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.filter(b => b?.type === 'text').map(b => b.text).join('\n\n');
  if (typeof val === 'object' && val.type === 'text') return val.text;
  return JSON.stringify(val, null, 2);
}

const CameraIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const TODAY = new Date().toISOString().split('T')[0];

const MEAL_TYPES = [
  { value: 'Kahvaltı',      label: 'Kahvaltı'      },
  { value: 'Öğlen Yemeği',  label: 'Öğle Yemeği'   },
  { value: 'Akşam Yemeği',  label: 'Akşam Yemeği'  },
  { value: '1.Ara Öğün',    label: 'Ara Öğün'       },
  { value: 'Kaçamak',       label: 'Kaçamak'        },
];

export default function ClientMealAnalysis() {
  const [imageFile, setImageFile]   = useState(null);
  const [mealType, setMealType]     = useState('Kahvaltı');
  const [analyzing, setAnalyzing]   = useState(false);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState('');
  const [dailyCount, setDailyCount] = useState(getTodayCount);
  const fileRef = useRef(null);

  const limitReached = dailyCount >= DAILY_LIMIT;
  const remaining = Math.max(0, DAILY_LIMIT - dailyCount);

  const previewUrl = useMemo(() => imageFile ? URL.createObjectURL(imageFile) : null, [imageFile]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setResult(null); setError(''); }
  };

  const handleAnalyze = async () => {
    if (!imageFile || limitReached) return;
    setError(''); setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('meal_type', mealType);
      fd.append('target_date', TODAY);
      fd.append('image_file', imageFile);
      const r = await aiService.checkMeal(fd);
      const newCount = incrementDailyCount();
      setDailyCount(newCount);
      setResult(r.data);
    } catch (err) {
      const d = err.response?.data;
      if (err.response?.status === 429) {
        setDailyCount(DAILY_LIMIT);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toISOString().split('T')[0], count: DAILY_LIMIT }));
      }
      setError(typeof d === 'string' ? d : d?.error || d?.detail || 'Analiz başarısız oldu.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setResult(null);
    setError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const foods = result?.vision_summary?.foods || [];
  const totalKcal = result?.vision_summary?.total_calories || 0;

  return (
    <div className="ai-body">
      {/* Hero */}
      <div className="ai-hero">
        <div className="ai-hero-text">
          <span className="eyebrow"><span className="eyebrow-dot" />Yapay Zeka · Görüntü Analizi</span>
          <h1 className="ai-title">Tabağını çek, AI <em>analiz etsin</em>.</h1>
          <p className="ai-lede">
            Fotoğraf yükle, yapay zeka yiyecekleri tanısın, kalori değerlerini hesaplasın.
          </p>
        </div>
        <div className="ai-hero-actions">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '7px 14px', borderRadius: 'var(--r-pill)',
              background: limitReached ? '#FEF2F2' : 'var(--accent-tint)',
              border: `1px solid ${limitReached ? '#FECACA' : 'rgba(101,163,13,0.25)'}`,
              fontFamily: 'var(--mono)', fontSize: 12,
              color: limitReached ? '#DC2626' : 'var(--accent-deep)',
            }}>
              {limitReached ? '⛔' : <Icons.Check size={12} />}
              Günlük {dailyCount}/{DAILY_LIMIT} analiz
            </span>
            <Link to="/client/ai-diet" className="btn btn-ghost btn-sm">
              <Icons.Sparkle size={14} /> Plan Oluştur
            </Link>
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="ai-analyze-grid">
        {/* Section 1 — Upload */}
        <article className="ai-card">
          <div className="ai-section-title">
            <span className="ai-section-title-num">1</span>
            <span className="ai-section-title-txt">YEMEK FOTOĞRAFI</span>
          </div>
          <header className="ai-card-head" style={{ marginBottom: 20 }}>
            <h2 className="ai-card-title">Fotoğraf yükle</h2>
            <p className="ai-card-sub">Net çekilmiş, yiyeceklerin görünür olduğu fotoğraflar daha doğru analiz verir.</p>
          </header>

          <div className="ai-form" style={{ gap: 16 }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div className="ai-field" style={{ flex: 1 }}>
                <label>Öğün Türü</label>
                <select className="ai-select" value={mealType} onChange={e => setMealType(e.target.value)}>
                  {MEAL_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div style={{
                padding: '11px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--bg-warm)', border: '1px solid var(--line)',
                fontSize: 13, color: 'var(--ink-soft)', fontFamily: 'var(--mono)',
                whiteSpace: 'nowrap', lineHeight: 1,
              }}>
                {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {limitReached ? (
              <div style={{
                border: '2px dashed #FECACA', borderRadius: 'var(--r-md)',
                padding: '40px 24px', textAlign: 'center',
                background: '#FEF2F2', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center',
              }}>
                <span style={{ fontSize: 32 }}>⛔</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#DC2626' }}>Günlük limit doldu</span>
                <span style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
                  Bugün 8 analiz yaptırdın. Yarın tekrar analiz yapabilirsin.
                </span>
              </div>
            ) : !imageFile ? (
              <div className="ai-upload" onClick={() => fileRef.current?.click()}>
                <span className="ai-upload-icon"><CameraIcon size={26} /></span>
                <span className="ai-upload-title">Yemek fotoğrafı yükle</span>
                <span className="ai-upload-sub">JPG, PNG · maks 5MB · kalan {remaining} hak</span>
                <span className="ai-upload-or">— veya —</span>
                <span className="btn btn-outline btn-sm" style={{ pointerEvents: 'none' }}>
                  <Icons.Plus size={14} /> Dosya Seç
                </span>
              </div>
            ) : (
              <div style={{ position: 'relative', borderRadius: 'var(--r-md)', overflow: 'hidden', cursor: 'pointer' }}
                   onClick={() => fileRef.current?.click()}>
                <img
                  src={previewUrl}
                  alt="Yüklenen yemek"
                  style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                  pointerEvents: 'none',
                }} />
                <span style={{
                  position: 'absolute', bottom: 12, left: 14,
                  background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)',
                  padding: '5px 12px', borderRadius: 'var(--r-pill)',
                  fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--ink)',
                  maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{imageFile.name}</span>
                <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
                  <button className="ai-upload-preview-btn"
                    onClick={e => { e.stopPropagation(); handleReset(); }}
                    aria-label="Kaldır">
                    <Icons.Plus size={14} style={{ transform: 'rotate(45deg)' }} />
                  </button>
                </div>
              </div>
            )}

            {error && <div className="ai-error">{error}</div>}

            <div className="ai-form-foot" style={{ marginTop: 0 }}>
              <button className="ai-submit"
                onClick={handleAnalyze}
                disabled={!imageFile || analyzing || limitReached}
                style={(!imageFile || limitReached) ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>
                {analyzing
                  ? <><span className="spinner" /> Analiz ediliyor...</>
                  : <><Icons.Sparkle size={16} /> Analiz Et ({remaining} hak)</>}
              </button>
            </div>
          </div>
        </article>

        {/* Section 2 — Result */}
        <article className="ai-card">
          <div className="ai-section-title">
            <span className="ai-section-title-num">2</span>
            <span className="ai-section-title-txt">ANALİZ SONUCU</span>
          </div>

          {!result ? (
            <div className="ai-result-empty">
              <span className="ai-result-empty-icon"><Icons.Sparkle size={28} /></span>
              <span className="ai-result-empty-title">Henüz analiz yok</span>
              <span className="ai-result-empty-sub">
                Sol tarafa bir yemek fotoğrafı yükle ve "Analiz Et" butonuna bas. Sonuç burada görünecek.
              </span>
            </div>
          ) : (
            <div className="ai-result">
              <div className="ai-result-head">
                <div>
                  <span className="ai-card-eyebrow" style={{ display: 'block', marginBottom: 4 }}>TANIMLANAN YEMEK</span>
                  <h3 className="ai-result-meal-name">{mealType}</h3>
                </div>
                <span className="ai-result-confidence">
                  <Icons.Check size={11} /> AI ANALİZİ
                </span>
              </div>

              <div className="ai-result-kcal-row">
                <span className="ai-result-kcal-num">
                  {totalKcal.toLocaleString('tr-TR')}<small>kcal</small>
                </span>
                <div className="ai-result-kcal-lbl">
                  <span>TOPLAM</span>
                  <strong>{mealType} · {foods.length} bileşen</strong>
                </div>
              </div>

              {foods.length > 0 && (
                <div>
                  <span className="ai-card-eyebrow" style={{ display: 'block', marginBottom: 8 }}>BİLEŞENLER</span>
                  <div className="ai-result-items">
                    {foods.map((f, i) => (
                      <div key={i} className="ai-result-item">
                        <span className="ai-result-item-name">{f.name}</span>
                        <span className="ai-result-item-g">{f.portion}</span>
                        <span className="ai-result-item-kcal">{f.calories} kcal</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.feedback && (
                <div className="ai-feedback">
                  {extractText(result.feedback)}
                </div>
              )}

              {result.calorie_diff === 0 && result.feedback && (
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 'var(--r-md)',
                  padding: '12px 16px', fontSize: 13, color: '#92400E',
                }}>
                  <span>⚠️</span>
                  <span>Bu öğün için aktif diyet planında eşleşme bulunamadı. Karşılaştırma yapılamıyor — backend tarih dönüşümü düzeltilince aktif olacak.</span>
                </div>
              )}

              {result.calorie_diff !== undefined && result.calorie_diff !== 0 && (
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--bg-warm)', border: '1px solid var(--line)', borderRadius: 'var(--r-md)',
                  padding: '12px 16px',
                }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Plandan Kalori Farkı</span>
                  <span style={{
                    fontFamily: 'var(--serif)', fontSize: 20,
                    color: result.calorie_diff > 0 ? '#DC2626' : '#16A34A',
                  }}>
                    {result.calorie_diff > 0 ? '+' : ''}{result.calorie_diff} kcal
                  </span>
                </div>
              )}

              <div className="ai-result-foot">
                <button className="btn btn-ghost btn-sm" onClick={handleReset}>
                  <Icons.Plus size={14} style={{ transform: 'rotate(45deg)' }} /> Yeniden Analiz Et
                </button>
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
