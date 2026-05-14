import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dietService from '../../services/dietService';

const val = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return v;
};

const genderLabel = g => ({ Male: 'Erkek', Female: 'Kadın', Other: 'Diğer' }[g] || g || '—');
const activityLabel = a => ({ NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Haftada 4-5 kez', VERY_HIGH: 'Her gün' }[a] || a || '—');
const sugarLabel = s => ({ NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Her gün', CRAVINGS: 'Anlık tatlı krizleri' }[s] || s || '—');
const goalLabel = g => ({ Lose: 'Kilo Vermek', Gain: 'Kilo Almak', Maintain: 'Formumu Korumak' }[g] || g || '—');
const dietLabel = d => ({ VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryan', NORMAL: 'Normal' }[d] || d || '—');

export default function DieticianClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dietService.getClientDetail(id),
      dietService.getAssignments(),
    ])
      .then(([c, assignRes]) => {
        setClient(c.data);
        const list = Array.isArray(assignRes.data) ? assignRes.data : (assignRes.data?.results || []);
        const found = list.find(a => String(a.client_detail?.id) === String(id) && a.status === 'InProgress')
          || list.find(a => String(a.client_detail?.id) === String(id));
        setAssignment(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  if (!client) return (
    <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20 }}>
      <p style={{ color: 'var(--ink-light)' }}>Danışan bulunamadı.</p>
    </div>
  );

  const hs = assignment?.client_detail?.health_snapshot;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>
            {client.name || `Danışan #${id}`}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Sağlık ve profil bilgileri</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/dietician/clients" className="btn-ghost" style={{ fontSize: 13 }}>← Geri</Link>
          {assignment && (
            <Link to={`/dietician/diet-plan-create?assignment=${assignment.id}`} className="btn-primary" style={{ fontSize: 13 }}>
              Plan Oluştur
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
        {/* Kişisel bilgiler */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--forest)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 22, flexShrink: 0 }}>
              {client.name?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, color: 'var(--forest)' }}>{client.name || `Danışan #${id}`}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>
                {genderLabel(client.gender)} · {client.age ? `${client.age} yaş` : '—'}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Boy', value: client.height ? `${client.height} cm` : '—' },
              { label: 'Kilo', value: client.weight ? `${client.weight} kg` : '—' },
              { label: 'Yaş', value: val(client.age) },
              { label: 'Cinsiyet', value: genderLabel(client.gender) },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: 'var(--parchment)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--forest)' }}>{value}</div>
              </div>
            ))}
          </div>

          {client.allergies?.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Alerjiler</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(Array.isArray(client.allergies) ? client.allergies : [client.allergies]).map(a => (
                  <span key={a} className="badge badge-red">{a}</span>
                ))}
              </div>
            </div>
          )}

          {assignment && (
            <div style={{ marginTop: 20, background: 'rgba(45,90,39,0.06)', border: '1px solid rgba(45,90,39,0.2)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Aktif Atama</div>
              <div style={{ fontSize: 13, color: 'var(--ink-mid)' }}>
                Atama #{assignment.id} · {({ '1M': '1 Ay', '3M': '3 Ay', '6M': '6 Ay', '12M': '12 Ay' }[assignment.duration] || assignment.duration)}
              </div>
              {assignment.accepted_at && (
                <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4 }}>
                  Kabul: {new Date(assignment.accepted_at).toLocaleDateString('tr-TR')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sağlık bilgileri */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 18 }}>Sağlık Bilgileri</div>

          {hs ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {[
                  { label: 'Hedef', value: goalLabel(hs.goal) },
                  { label: 'Beslenme', value: dietLabel(hs.dietary_preference) },
                  { label: 'Aktivite', value: activityLabel(hs.activity_level) },
                  { label: 'Tatlı Tüketimi', value: sugarLabel(hs.sugar_intake) },
                  { label: 'Diyet Bütçesi', value: { LOW: 'Düşük', MEDIUM: 'Orta', HIGH: 'Yüksek' }[hs.budget] || '—' },
                ].map(({ label, value }) => (
                  <div key={label} style={{ background: 'var(--parchment)', borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--forest)' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {[
                  { label: 'Hamilelik', value: hs.is_pregnant },
                  { label: 'Emziriyor', value: hs.is_breastfeeding },
                  { label: 'Alkol', value: hs.alcohol_use },
                  { label: 'Sigara', value: hs.smoking_use },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: value ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.05)', color: value ? '#dc2626' : 'var(--ink-light)' }}>
                    {label}: {value ? 'Evet' : 'Hayır'}
                  </div>
                ))}
              </div>

              {hs.medications?.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>İlaçlar</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {hs.medications.map((m, i) => (
                      <span key={i} style={{ background: 'var(--parchment)', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {hs.dislike_foods?.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Sevmediği Yiyecekler</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {hs.dislike_foods.map((f, i) => (
                      <span key={i} style={{ background: 'var(--parchment)', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>{f}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-light)', fontSize: 14 }}>
              Sağlık bilgisi bulunamadı
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
