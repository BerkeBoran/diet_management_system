import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import dietService from '../../services/dietService';
import appointmentService from '../../services/appointmentService';

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } } };
const stagger = { show: { transition: { staggerChildren: 0.09 } } };

export default function DieticianDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dietService.getAssignments().catch(() => ({ data: [] })),
      appointmentService.getAppointments().catch(() => ({ data: [] })),
    ]).then(([a, ap]) => {
      setAssignments(a.data || []);
      setAppointments(ap.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const pending = assignments.filter(a => a.status === 'Pending');
  const active = assignments.filter(a => a.status === 'InProgress');
  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter(a => a.date === today && a.status !== 'Canceled');

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color: 'var(--forest)', marginBottom: 4 }}>
          Hoş Geldiniz, {user?.fullName?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: 15, color: 'var(--ink-light)' }}>Diyetisyen panelinize genel bakış</p>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Aktif Danışan', value: active.length, icon: '👥', color: 'var(--forest)' },
          { label: 'Bekleyen Talep', value: pending.length, icon: '⏳', color: 'var(--gold-dark)' },
          { label: 'Bugün Randevu', value: todayAppts.length, icon: '📅', color: 'var(--sage)' },
          { label: 'Toplam Randevu', value: appointments.length, icon: '🗓️', color: 'var(--ink-mid)' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 16, padding: '20px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 32, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-light)', fontWeight: 500, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Pending requests */}
        <motion.div variants={fadeUp}>
          <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Bekleyen Talepler</h3>
              <Link to="/dietician/clients" style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600 }}>Tümünü Gör</Link>
            </div>
            {pending.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-light)', fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
                Bekleyen talep yok
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {pending.slice(0, 4).map(a => (
                  <div key={a.id} style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>Danışan #{a.client}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>{durationLabel(a.duration)} • {a.client_note || 'Not yok'}</div>
                    </div>
                    <span className="badge badge-gold">Bekliyor</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Today's appointments */}
        <motion.div variants={fadeUp}>
          <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Bugünün Randevuları</h3>
              <Link to="/dietician/appointments" style={{ fontSize: 12, color: 'var(--forest)', fontWeight: 600 }}>Tümü</Link>
            </div>
            {todayAppts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--ink-light)', fontSize: 13 }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                Bugün randevu yok
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {todayAppts.map(a => (
                  <div key={a.id} style={{ background: 'var(--parchment)', borderRadius: 12, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{a.client_name}</div>
                      <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, color: 'var(--forest)', marginTop: 2 }}>{a.start_time?.slice(0, 5)}</div>
                    </div>
                    <span className={`badge ${a.status === 'Confirmed' ? 'badge-green' : 'badge-gold'}`}>{statusLabel(a.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} style={{ gridColumn: '1 / -1' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Hızlı İşlemler</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {[
              { to: '/dietician/clients', icon: '👥', label: 'Danışanlarım', desc: 'Talepleri yönet, danışanları gör' },
              { to: '/dietician/appointments', icon: '📅', label: 'Randevular', desc: 'Tüm randevuları görüntüle' },
              { to: '/dietician/availability', icon: '🔒', label: 'Müsaitlik', desc: 'Kapalı saatleri ayarla' },
              { to: '/dietician/messages', icon: '💬', label: 'Mesajlar', desc: 'Danışanlarla iletişim' },
            ].map(({ to, icon, label, desc }) => (
              <Link key={to} to={to} style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 16, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'flex-start', textDecoration: 'none', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
              >
                <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-light)', lineHeight: 1.4 }}>{desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function statusLabel(s) {
  return { Pending: 'Bekliyor', Confirmed: 'Onaylandı', Completed: 'Tamamlandı', Canceled: 'İptal' }[s] || s;
}

function durationLabel(d) {
  return { '1M': '1 Ay', '3M': '3 Ay', '6M': '6 Ay', '12M': '12 Ay' }[d] || d || '—';
}
