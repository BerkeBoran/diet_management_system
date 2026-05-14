import { useState, useEffect } from 'react';
import appointmentService from '../../services/appointmentService';

const STATUS = {
  PENDING: { label: 'Bekliyor', cls: 'badge-gold' },
  CONFIRMED: { label: 'Onaylandı', cls: 'badge-green' },
  COMPLETED: { label: 'Tamamlandı', cls: 'badge-gray' },
  CANCELED: { label: 'İptal', cls: 'badge-red' },
};

export default function DieticianAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [tab, setTab] = useState('upcoming');

  const load = () => {
    appointmentService.getAppointments()
      .then(r => setAppointments(Array.isArray(r.data) ? r.data : r.data?.results || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try { await appointmentService.updateAppointment(id, { status }); load(); }
    catch { /* ignore */ }
    finally { setUpdating(null); }
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = appointments.filter(a => a.status !== 'CANCELED' && a.date >= today);
  const past = appointments.filter(a => a.status === 'CANCELED' || a.date < today);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>Randevular</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Danışan randevularınızı yönetin</p>
      </div>

      <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'var(--parchment-dark)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {[
          { key: 'upcoming', label: `Yaklaşan (${upcoming.length})` },
          { key: 'past', label: `Geçmiş (${past.length})` },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{ padding: '9px 22px', borderRadius: 9, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === t.key ? 'var(--forest)' : 'transparent', color: tab === t.key ? 'var(--parchment)' : 'var(--ink-light)', transition: 'all 0.2s' }}>
            {t.label}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)', marginBottom: 8 }}>
            {tab === 'upcoming' ? 'Yaklaşan Randevu Yok' : 'Geçmiş Kayıt Yok'}
          </h2>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {list.map(a => {
            const date = new Date(a.date);
            const s = STATUS[a.status] || { label: a.status, cls: 'badge-gray' };
            const isPast = tab === 'past';
            return (
              <div key={a.id}
                style={{ background: isPast ? 'var(--cream)' : 'white', border: '1px solid var(--parchment-dark)', borderRadius: 16, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap', opacity: isPast ? 0.75 : 1 }}>
                {/* Date block */}
                <div style={{ textAlign: 'center', minWidth: 48, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: 'var(--forest)', lineHeight: 1 }}>{date.getDate()}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase' }}>
                    {date.toLocaleDateString('tr-TR', { month: 'short' })}
                  </div>
                </div>
                <div style={{ width: 1, height: 40, background: 'var(--parchment-dark)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{a.client_name || `Danışan #${a.client}`}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-light)' }}>
                    {a.start_time?.slice(0, 5)}{a.end_time ? ` — ${a.end_time.slice(0, 5)}` : ''}
                  </div>
                  {a.notes && <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 4, fontStyle: 'italic' }}>{a.notes}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                  {!isPast && a.status === 'PENDING' && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => updateStatus(a.id, 'CONFIRMED')}
                        disabled={updating === a.id}
                        className="btn-primary"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                      >
                        {updating === a.id ? <span className="spinner-sm" /> : 'Onayla'}
                      </button>
                      <button
                        onClick={() => updateStatus(a.id, 'CANCELED')}
                        disabled={updating === a.id}
                        className="btn-danger"
                        style={{ fontSize: 12, padding: '6px 14px' }}
                      >
                        İptal
                      </button>
                    </div>
                  )}
                  {!isPast && a.status === 'CONFIRMED' && (
                    <button
                      onClick={() => updateStatus(a.id, 'COMPLETED')}
                      disabled={updating === a.id}
                      className="btn-ghost"
                      style={{ fontSize: 12, padding: '6px 14px' }}
                    >
                      Tamamlandı
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
