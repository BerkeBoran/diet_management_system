import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import aiService from '../../services/aiService';

export default function ClientAiDiet() {
  const [threadId] = useState(() => `thread_${Date.now()}`);
  const [action, setAction] = useState('start');
  const [revisionNote, setRevisionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState('');
  const [approved, setApproved] = useState(false);
  const [mealTab, setMealTab] = useState('generate');
  const [mealImage, setMealImage] = useState(null);
  const [mealType, setMealType] = useState('kahvalti');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealResult, setMealResult] = useState(null);
  const [mealLoading, setMealLoading] = useState(false);
  const [mealError, setMealError] = useState('');

  const handleGenerate = async () => {
    setError(''); setLoading(true);
    try {
      const r = await aiService.generateDiet({ thread_id: threadId, action, revision_note: revisionNote || '' });
      setResponse(r.data);
      setAction('revise');
      setRevisionNote('');
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || 'AI ile bağlantı kurulamadı.');
    } finally { setLoading(false); }
  };

  const handleApprove = async () => {
    setError(''); setLoading(true);
    try {
      await aiService.generateDiet({ thread_id: threadId, action: 'approve', revision_note: '' });
      setApproved(true);
    } catch (err) {
      setError('Plan kaydedilemedi.');
    } finally { setLoading(false); }
  };

  const handleMealCheck = async () => {
    if (!mealImage) return setMealError('Fotoğraf yükleyin.');
    setMealError(''); setMealLoading(true);
    try {
      const fd = new FormData();
      fd.append('meal_type', mealType);
      fd.append('target_date', targetDate);
      fd.append('image_file', mealImage);
      const r = await aiService.checkMeal(fd);
      setMealResult(r.data);
    } catch (_) { setMealError('Analiz başarısız oldu.'); }
    finally { setMealLoading(false); }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>AI Diyet Asistanı</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Yapay zeka destekli kişisel diyet planı ve yemek analizi</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--parchment-dark)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {['generate', 'checker'].map(t => (
          <button key={t} onClick={() => setMealTab(t)} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: mealTab === t ? 'var(--forest)' : 'transparent', color: mealTab === t ? 'var(--parchment)' : 'var(--ink-light)', transition: 'all 0.2s' }}>
            {t === 'generate' ? '🤖 Diyet Planı Oluştur' : '🔍 Yemek Analizi'}
          </button>
        ))}
      </div>

      {mealTab === 'generate' ? (
        <div>
          {approved ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: 'var(--success-light)', border: '1px solid #a9e8c4', borderRadius: 20, padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 26, color: '#1a7a42', marginBottom: 8 }}>Plan Kaydedildi!</h2>
              <p style={{ fontSize: 14, color: '#2d7a4a' }}>Diyet planınız başarıyla oluşturuldu. Diyet Planlarım sayfasından inceleyebilirsiniz.</p>
            </motion.div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: response ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
              {/* Controls */}
              <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>
                  {action === 'start' ? 'Yeni Plan Oluştur' : 'Planı Revize Et'}
                </div>

                {action === 'revise' && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Revizyon Notu</label>
                    <textarea className="form-input" rows={4} placeholder="Planı nasıl değiştirmek istiyorsunuz? (ör. daha az karbonhidrat, vejetaryen alternatifler...)" value={revisionNote} onChange={e => setRevisionNote(e.target.value)} style={{ resize: 'vertical' }} />
                  </div>
                )}

                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ flex: 2 }}>
                    {loading ? <><span className="spinner-sm" /> Oluşturuluyor...</> : action === 'start' ? '🤖 Plan Oluştur' : '🔄 Revize Et'}
                  </button>
                  {response && (
                    <button className="btn-gold" onClick={handleApprove} disabled={loading} style={{ flex: 1 }}>
                      {loading ? <span className="spinner-sm" /> : '✅ Onayla'}
                    </button>
                  )}
                </div>

                {action === 'start' && (
                  <div style={{ background: 'var(--parchment)', border: '1px solid var(--parchment-dark)', borderRadius: 12, padding: '14px 16px', marginTop: 16, fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.6 }}>
                    💡 AI, sağlık profilinize göre kişiselleştirilmiş bir diyet planı oluşturacak. Profil bilgilerinizin güncel olduğundan emin olun.
                  </div>
                )}
              </div>

              {/* Response */}
              <AnimatePresence>
                {response && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px', maxHeight: 500, overflowY: 'auto' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--forest)', marginBottom: 12 }}>AI'dan Gelen Plan</div>
                    <div style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                      {response.content || response.message || JSON.stringify(response, null, 2)}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: mealResult ? '1fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 18 }}>Yemek Fotoğrafı Analizi</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">Öğün</label>
                  <select className="form-select" value={mealType} onChange={e => setMealType(e.target.value)}>
                    <option value="kahvalti">Kahvaltı</option>
                    <option value="ogle">Öğle</option>
                    <option value="aksam">Akşam</option>
                    <option value="ara">Ara Öğün</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tarih</label>
                  <input className="form-input" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
                </div>
              </div>

              <label style={{ display: 'block', border: `2px dashed ${mealImage ? 'var(--forest-light)' : 'var(--parchment-deeper)'}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: mealImage ? 'rgba(45,90,39,0.05)' : 'white', transition: 'all 0.2s' }}>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => e.target.files[0] && setMealImage(e.target.files[0])} />
                {mealImage ? (
                  <div>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📸</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--forest)', marginBottom: 4 }}>{mealImage.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>Değiştirmek için tıklayın</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-mid)', marginBottom: 4 }}>Yemek fotoğrafı yükleyin</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>JPG, PNG — maks 5MB</div>
                  </div>
                )}
              </label>

              {mealError && <div className="alert alert-error">{mealError}</div>}

              <button className="btn-primary" onClick={handleMealCheck} disabled={!mealImage || mealLoading} style={{ width: '100%' }}>
                {mealLoading ? <><span className="spinner-sm" /> Analiz ediliyor...</> : '🔍 Analiz Et'}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {mealResult && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--forest)', marginBottom: 16 }}>Analiz Sonucu</div>
                {mealResult.calorie_diff !== undefined && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--parchment)', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>Kalori Farkı</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: mealResult.calorie_diff > 0 ? 'var(--error)' : 'var(--success)' }}>
                      {mealResult.calorie_diff > 0 ? '+' : ''}{mealResult.calorie_diff} kcal
                    </div>
                  </div>
                )}
                {mealResult.feedback && (
                  <div style={{ fontSize: 14, color: 'var(--ink-mid)', lineHeight: 1.7, background: 'var(--cream)', borderRadius: 12, padding: '14px 16px' }}>
                    {mealResult.feedback}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
