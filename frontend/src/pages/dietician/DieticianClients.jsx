import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dietService from '../../services/dietService';

const durationLabel = d => ({ '1M': '1 Ay', '3M': '3 Ay', '6M': '6 Ay', '12M': '12 Ay' }[d] || d || '—');

const goalLabel = { Lose: 'Kilo Vermek', Gain: 'Kilo Almak', Maintain: 'Formumu Korumak' };
const activityLabel = { NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Haftada 4-5 kez', VERY_HIGH: 'Her gün' };
const sugarLabel = { NONE: 'Hiç', LOW: 'Haftada 1-2 kez', MEDIUM: 'Haftada 3-4 kez', HIGH: 'Her gün', CRAVINGS: 'Anlık tatlı krizleri' };
const dietLabel = { VEGAN: 'Vegan', VEGETARIAN: 'Vejetaryan', NORMAL: 'Normal' };
const genderLabel = { Male: 'Erkek', Female: 'Kadın', Other: 'Diğer' };

function ClientDetailModal({ assignment, onClose }) {
  const cd = assignment.client_detail;
  const hs = cd?.health_snapshot;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'white', borderRadius: 20, padding: 32, maxWidth: 540, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)' }}>
            {cd?.first_name} {cd?.last_name}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--ink-light)' }}>✕</button>
        </div>

        {hs ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[
                { label: 'Hedef', value: goalLabel[hs.goal] || hs.goal || '—' },
                { label: 'Aktivite', value: activityLabel[hs.activity_level] || hs.activity_level || '—' },
                { label: 'Tatlı Tüketimi', value: sugarLabel[hs.sugar_intake] || hs.sugar_intake || '—' },
                { label: 'Beslenme', value: dietLabel[hs.dietary_preference] || hs.dietary_preference || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--parchment)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ fontSize: 11, color: 'var(--ink-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
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
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-light)', marginBottom: 6 }}>İlaçlar</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {hs.medications.map((m, i) => (
                    <span key={i} style={{ background: 'var(--parchment)', borderRadius: 8, padding: '4px 10px', fontSize: 13 }}>{m}</span>
                  ))}
                </div>
              </div>
            )}

            {hs.dislike_foods?.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-light)', marginBottom: 6 }}>Sevmediği Yiyecekler</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
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
  );
}

export default function DieticianClients() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(null);
  const [tab, setTab] = useState('pending');
  const [detailAssignment, setDetailAssignment] = useState(null);

  const load = async () => {
    try {
      const [assignRes, clientsRes] = await Promise.all([
        dietService.getAssignments(),
        dietService.getDieticianClients(),
      ]);
      const raw = Array.isArray(assignRes.data) ? assignRes.data : (assignRes.data?.results || []);
      const dcList = Array.isArray(clientsRes.data) ? clientsRes.data : (clientsRes.data?.results || []);

      const idMap = Object.fromEntries(dcList.map(dc => [dc.id, dc.client]));
      const uniqueIds = [...new Set(dcList.map(dc => dc.client).filter(Boolean))];
      const nameMap = {};
      await Promise.all(uniqueIds.map(async id => {
        try {
          const r = await dietService.getClientDetail(id);
          nameMap[id] = r.data?.name || null;
        } catch {}
      }));

      setAssignments(raw.map(a => {
        const cid = idMap[a.id];
        return { ...a, _clientId: cid, _clientName: cid != null ? (nameMap[cid] || null) : null };
      }));
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const respond = async (id, newStatus) => {
    setResponding(id);
    try {
      await dietService.respondToAssignment(id, { status: newStatus });
      load();
    } catch {}
    finally { setResponding(null); }
  };

  const pendingName = (a) => {
    const cd = a.client_detail;
    if (cd?.first_name || cd?.last_name) return `${cd.first_name || ''} ${cd.last_name || ''}`.trim();
    return a._clientName || 'Danışan Talebi';
  };

  const pending = assignments.filter(a => a.status === 'Pending');
  const active = assignments.filter(a => a.status === 'InProgress');
  const ended = assignments.filter(a => a.status === 'Ended' || a.status === 'Canceled');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      {detailAssignment && (
        <ClientDetailModal assignment={detailAssignment} onClose={() => setDetailAssignment(null)} />
      )}

      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>Danışanlarım</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Danışan taleplerini yönetin ve aktif danışanlarınızı görüntüleyin</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--parchment-dark)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'pending', label: `Bekleyen (${pending.length})` },
          { key: 'active', label: `Aktif (${active.length})` },
          { key: 'ended', label: `Geçmiş (${ended.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.key ? 'var(--forest)' : 'transparent', color: tab === t.key ? 'var(--parchment)' : 'var(--ink-light)', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'pending' && (
        <div>
          {pending.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)', marginBottom: 8 }}>Bekleyen Talep Yok</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Yeni danışan talepleri burada görünecek</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {pending.map(a => (
                <div key={a.id} style={{ background: 'white', border: '1px solid rgba(201,168,76,0.3)', borderLeft: '4px solid var(--gold)', borderRadius: 16, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{pendingName(a)}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-light)' }}>Süre: <strong>{durationLabel(a.duration)}</strong></div>
                    </div>
                    <span className="badge badge-gold">Bekliyor</span>
                  </div>
                  {a.client_note && (
                    <div style={{ background: 'var(--parchment)', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: 'var(--ink-mid)', marginBottom: 14, lineHeight: 1.5 }}>
                      "{a.client_note}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => respond(a.id, 'InProgress')}
                      disabled={responding === a.id}
                      className="btn-primary"
                      style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                    >
                      {responding === a.id ? <span className="spinner-sm" /> : '✓ Kabul Et'}
                    </button>
                    <button
                      onClick={() => respond(a.id, 'Canceled')}
                      disabled={responding === a.id}
                      className="btn-danger"
                      style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                    >
                      ✕ Reddet
                    </button>
                    <button
                      onClick={() => setDetailAssignment(a)}
                      className="btn-ghost"
                      style={{ flex: 1, padding: '9px 0', fontSize: 13 }}
                    >
                      Detay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'active' && (
        <div>
          {active.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)', marginBottom: 8 }}>Aktif Danışan Yok</h2>
              <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Talepleri kabul ettiğinizde danışanlar burada görünür</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {active.map(a => (
                <div key={a.id} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 16, padding: '20px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--forest)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 18 }}>
                        {a._clientName?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{a._clientName || '—'}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{durationLabel(a.duration)}</div>
                      </div>
                    </div>
                    <span className="badge badge-green">Aktif</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <Link to={`/dietician/clients/${a._clientId}`} className="btn-ghost" style={{ textAlign: 'center', fontSize: 13 }}>
                      Detay
                    </Link>
                    <Link to={`/dietician/diet-plan-create?assignment=${a.id}`} className="btn-primary" style={{ textAlign: 'center', fontSize: 13 }}>
                      Plan Oluştur
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'ended' && (
        <div>
          {ended.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20 }}>
              <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Geçmiş kayıt yok</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {ended.map(a => (
                <div key={a.id} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 14, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.7 }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{a._clientName || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{durationLabel(a.duration)}</div>
                  </div>
                  <span className="badge badge-gray">{a.status === 'Ended' ? 'Bitti' : 'İptal'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
