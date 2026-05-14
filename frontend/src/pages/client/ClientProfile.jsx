import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';

export default function ClientProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSnapshotForm, setShowSnapshotForm] = useState(false);
  const [snapshotForm, setSnapshotForm] = useState({ dietary_preference: 'NORMAL', sugar_intake: 'NONE', activity_level: 'NONE', goal: 'Maintain', budget: 'MEDIUM', is_pregnant: false, is_breastfeeding: false, alcohol_use: false, smoking_use: false, medications: [], dislike_foods: [] });
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [snapshotError, setSnapshotError] = useState('');
  const [medInput, setMedInput] = useState('');
  const [foodInput, setFoodInput] = useState('');

  useEffect(() => {
    Promise.all([userService.getProfile(), userService.getHealthSnapshots()])
      .then(([p, s]) => { setProfile(p.data); setSnapshots(s.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const setSF = (k, v) => setSnapshotForm(p => ({ ...p, [k]: v }));

  const addTag = (field, input, setInput) => {
    const v = input.trim();
    if (!v || snapshotForm[field].includes(v)) return;
    setSF(field, [...snapshotForm[field], v]);
    setInput('');
  };

  const removeTag = (field, v) => setSF(field, snapshotForm[field].filter(i => i !== v));

  const handleSaveSnapshot = async () => {
    setSnapshotError(''); setSnapshotLoading(true);
    try {
      const r = await userService.createHealthSnapshot(snapshotForm);
      setSnapshots(p => [r.data.data || r.data, ...p]);
      setShowSnapshotForm(false);
    } catch (err) {
      const d = err.response?.data;
      setSnapshotError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' '));
    } finally { setSnapshotLoading(false); }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}><div className="spinner" /></div>;

  const latestSnapshot = snapshots[0];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>Profilim</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Kişisel ve sağlık bilgileriniz</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Personal info */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 24 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--forest)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 22 }}>
              {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)' }}>{user?.fullName}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>{user?.email}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Boy', value: profile?.height ? `${profile.height} cm` : '—' },
              { label: 'Kilo', value: profile?.weight ? `${profile.weight} kg` : '—' },
              { label: 'Yaş', value: profile?.age || '—' },
              { label: 'Cinsiyet', value: genderLabel(profile?.gender) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--parchment)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--forest)' }}>{value}</div>
              </div>
            ))}
          </div>

          {Array.isArray(profile?.allergies) && profile.allergies.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Alerjiler</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.allergies.map(a => <span key={a} className="badge badge-red">{a}</span>)}
              </div>
            </div>
          )}
          {Array.isArray(profile?.chronic_conditions) && profile.chronic_conditions.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Kronik Hastalıklar</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {profile.chronic_conditions.map(c => <span key={c} className="badge badge-gold">{c}</span>)}
              </div>
            </div>
          )}
        </div>

        {/* Health snapshot */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Yaşam Tarzı Profili</div>
            <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => {
              if (!showSnapshotForm && latestSnapshot) {
                setSnapshotForm({
                  dietary_preference: latestSnapshot.dietary_preference || 'NORMAL',
                  sugar_intake: latestSnapshot.sugar_intake || 'NONE',
                  activity_level: latestSnapshot.activity_level || 'NONE',
                  goal: latestSnapshot.goal || 'Maintain',
                  budget: latestSnapshot.budget || 'MEDIUM',
                  is_pregnant: latestSnapshot.is_pregnant || false,
                  is_breastfeeding: latestSnapshot.is_breastfeeding || false,
                  alcohol_use: latestSnapshot.alcohol_use || false,
                  smoking_use: latestSnapshot.smoking_use || false,
                  medications: latestSnapshot.medications || [],
                  dislike_foods: latestSnapshot.dislike_foods || [],
                });
              }
              setShowSnapshotForm(v => !v);
            }}>
              {showSnapshotForm ? 'İptal' : '+ Güncelle'}
            </button>
          </div>

          {showSnapshotForm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {snapshotError && <div className="alert alert-error">{snapshotError}</div>}
              <SelectField label="Beslenme Tercihi" value={snapshotForm.dietary_preference} onChange={v => setSF('dietary_preference', v)} options={[['VEGAN','Vegan'],['VEGETARIAN','Vejetaryen'],['NORMAL','Normal']]} />
              <SelectField label="Şeker Tüketimi" value={snapshotForm.sugar_intake} onChange={v => setSF('sugar_intake', v)} options={[['NONE','Hiç'],['LOW','Haftada 1-2 kez'],['MEDIUM','Haftada 3-4 kez'],['HIGH','Her gün'],['CRAVINGS','Anlık tatlı krizlerim var']]} />
              <SelectField label="Aktivite Seviyesi" value={snapshotForm.activity_level} onChange={v => setSF('activity_level', v)} options={[['NONE','Hiç'],['LOW','Haftada 1-2 kez'],['MEDIUM','Haftada 3-4 kez'],['HIGH','Haftada 4-5 kez'],['VERY_HIGH','Her gün']]} />
              <SelectField label="Hedef" value={snapshotForm.goal} onChange={v => setSF('goal', v)} options={[['Lose','Kilo Ver'],['Gain','Kilo Al'],['Maintain','Formumu Koru']]} />
              <SelectField label="Diyet Bütçesi" value={snapshotForm.budget} onChange={v => setSF('budget', v)} options={[['LOW','Düşük'],['MEDIUM','Orta'],['HIGH','Yüksek']]} />
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[['is_pregnant','Hamile'],['is_breastfeeding','Emziriyor'],['alcohol_use','Alkol'],['smoking_use','Sigara']]
                  .filter(([k]) => profile?.gender === 'Male' ? !['is_pregnant','is_breastfeeding'].includes(k) : true)
                  .map(([k,lbl]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" checked={snapshotForm[k]} onChange={e => setSF(k, e.target.checked)} />
                    {lbl}
                  </label>
                ))}
              </div>
              <TagInput label="İlaçlar" placeholder="İlaç ekle..." input={medInput} setInput={setMedInput} tags={snapshotForm.medications} onAdd={() => addTag('medications', medInput, setMedInput)} onRemove={v => removeTag('medications', v)} />
              <TagInput label="Sevmediğim Yiyecekler" placeholder="Yiyecek ekle..." input={foodInput} setInput={setFoodInput} tags={snapshotForm.dislike_foods} onAdd={() => addTag('dislike_foods', foodInput, setFoodInput)} onRemove={v => removeTag('dislike_foods', v)} />
              <button className="btn-primary" onClick={handleSaveSnapshot} disabled={snapshotLoading}>
                {snapshotLoading ? <span className="spinner-sm" /> : 'Kaydet'}
              </button>
            </div>
          ) : latestSnapshot ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Beslenme Tercihi', dietaryLabel(latestSnapshot.dietary_preference)],
                ['Aktivite Seviyesi', activityLabel(latestSnapshot.activity_level)],
                ['Şeker Tüketimi', sugarLabel(latestSnapshot.sugar_intake)],
                ['Hedef', goalLabel(latestSnapshot.goal)],
                ['Diyet Bütçesi', budgetLabel(latestSnapshot.budget)],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{v || '—'}</span>
                </div>
              ))}
              {[
                ['Sigara', latestSnapshot.smoking_use],
                ['Alkol', latestSnapshot.alcohol_use],
                ...(profile?.gender !== 'Male' ? [['Hamile', latestSnapshot.is_pregnant], ['Emziriyor', latestSnapshot.is_breastfeeding]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{k}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: v ? 'var(--rust)' : 'var(--ink)' }}>{v ? 'Evet' : 'Hayır'}</span>
                </div>
              ))}
              {latestSnapshot.medications?.length > 0 && (
                <div style={{ padding: '10px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 6 }}>İlaçlar</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{latestSnapshot.medications.map(m => <span key={m} className="badge badge-gold">{m}</span>)}</div>
                </div>
              )}
              {latestSnapshot.dislike_foods?.length > 0 && (
                <div style={{ padding: '10px 0' }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)', marginBottom: 6 }}>Sevmediğim Yiyecekler</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{latestSnapshot.dislike_foods.map(f => <span key={f} className="badge badge-red">{f}</span>)}</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-light)', fontSize: 13 }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📊</div>
              Yaşam tarzı profilinizi oluşturun
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select className="form-select" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

function TagInput({ label, placeholder, input, setInput, tags, onAdd, onRemove }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', gap: 8 }}>
        <input className="form-input" placeholder={placeholder} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); onAdd(); } }} style={{ flex: 1 }} />
        <button type="button" onClick={onAdd} className="btn-ghost" style={{ padding: '8px 12px', fontSize: 12 }}>+</button>
      </div>
      {tags.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>{tags.map(t => <div key={t} className="tag">{t}<button type="button" onClick={() => onRemove(t)}>✕</button></div>)}</div>}
    </div>
  );
}

function genderLabel(g) { return { Male: 'Erkek', Female: 'Kadın', Other: 'Diğer' }[g] || g || '—'; }
function goalLabel(g) { return { Lose: 'Kilo Vermek', Gain: 'Kilo Almak', Maintain: 'Formumu Korumak' }[g] || g || '—'; }
function dietaryLabel(v) { return { VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryen', NORMAL: 'Normal' }[v] || v || '—'; }
function activityLabel(v) { return { NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Haftada 4-5 kez', VERY_HIGH: 'Her gün' }[v] || v || '—'; }
function sugarLabel(v) { return { NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Her gün', CRAVINGS: 'Anlık tatlı krizlerim var' }[v] || v || '—'; }
function budgetLabel(v) { return { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek' }[v] || v || '—'; }
