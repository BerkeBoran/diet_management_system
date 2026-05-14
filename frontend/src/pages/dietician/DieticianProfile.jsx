import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';

const TITLE_LABEL = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };
const TITLE_OPTIONS = [
  { value: 'DIETICIAN', label: 'Diyetisyen' },
  { value: 'EXPERT_DIETICIAN', label: 'Uzman Diyetisyen' },
  { value: 'INTERN_DIETICIAN', label: 'Stajyer Diyetisyen' },
];

export default function DieticianProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ title: '', biography: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const [editSchedule, setEditSchedule] = useState(false);
  const [schedForm, setSchedForm] = useState({
    work_time_start: '09:00',
    work_time_end: '18:00',
    appointment_duration: 30,
    weekend_workings: false,
    weekend_work_time_start: '10:00',
    weekend_work_time_end: '14:00',
    monthly_price: '',
  });
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [schedError, setSchedError] = useState('');

  useEffect(() => {
    Promise.all([userService.getProfile(), userService.getSchedule()])
      .then(([p, s]) => {
        const prof = p.data;
        setProfile(prof);
        setProfileForm({ title: prof.title || 'DIETICIAN', biography: prof.biography || '' });

        const sched = Array.isArray(s.data) ? s.data[0] : s.data;
        if (sched || prof.work_time_start) {
          setHasSchedule(true);
          const schedData = Array.isArray(s.data) ? s.data[0] : s.data;
          setSchedForm({
            work_time_start: prof.work_time_start?.slice(0, 5) || '09:00',
            work_time_end: prof.work_time_end?.slice(0, 5) || '18:00',
            appointment_duration: prof.appointment_duration || 30,
            weekend_workings: prof.weekend_workings || false,
            weekend_work_time_start: prof.weekend_work_time_start?.slice(0, 5) || '10:00',
            weekend_work_time_end: prof.weekend_work_time_end?.slice(0, 5) || '14:00',
            monthly_price: schedData?.monthly_price ?? prof.monthly_price ?? '',
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const setPF = (k, v) => setProfileForm(p => ({ ...p, [k]: v }));
  const setSF = (k, v) => setSchedForm(p => ({ ...p, [k]: v }));

  const handleSaveProfile = async () => {
    setProfileError(''); setSavingProfile(true);
    try {
      const r = await userService.updateProfile(profileForm);
      setProfile(p => ({ ...p, ...r.data }));
      setEditProfile(false);
    } catch (err) {
      const d = err.response?.data;
      setProfileError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' ') || 'Hata oluştu.');
    } finally { setSavingProfile(false); }
  };

  const handleSaveSchedule = async () => {
    setSchedError(''); setSavingSchedule(true);
    try {
      const payload = {
        work_time_start: schedForm.work_time_start,
        work_time_end: schedForm.work_time_end,
        appointment_duration: schedForm.appointment_duration,
        weekend_workings: schedForm.weekend_workings,
        weekend_work_time_start: schedForm.weekend_workings ? schedForm.weekend_work_time_start : '00:00',
        weekend_work_time_end: schedForm.weekend_workings ? schedForm.weekend_work_time_end : '00:00',
        ...(schedForm.monthly_price !== '' && { monthly_price: schedForm.monthly_price }),
      };
      await userService.updateSchedule(payload);
      setProfile(p => ({
        ...p,
        work_time_start: schedForm.work_time_start,
        work_time_end: schedForm.work_time_end,
        appointment_duration: schedForm.appointment_duration,
        weekend_workings: schedForm.weekend_workings,
        weekend_work_time_start: schedForm.weekend_workings ? schedForm.weekend_work_time_start : null,
        weekend_work_time_end: schedForm.weekend_workings ? schedForm.weekend_work_time_end : null,
      }));
      setEditSchedule(false);
    } catch (err) {
      const d = err.response?.data;
      setSchedError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' ') || 'Hata oluştu.');
    } finally { setSavingSchedule(false); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  if (!profile) return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--ink-light)' }}>Profil yüklenemedi.</div>
  );

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>Profilim</h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>Profesyonel bilgilerinizi görüntüleyin ve düzenleyin</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* Profil Kartı */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
              {profile.profile_photo ? (
                <img src={profile.profile_photo} alt="" style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--forest)', color: 'var(--parchment)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-serif)', fontSize: 22, flexShrink: 0 }}>
                  {user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?'}
                </div>
              )}
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontSize: 19, color: 'var(--forest)' }}>
                  {user?.fullName || `${profile.first_name} ${profile.last_name}`}
                </div>
                <div style={{ marginTop: 4 }}>
                  <span className="badge badge-green">{TITLE_LABEL[profile.title] || profile.title || 'Diyetisyen'}</span>
                </div>
              </div>
            </div>
            <button
              className="btn-ghost"
              style={{ fontSize: 12, padding: '7px 14px', flexShrink: 0 }}
              onClick={() => { setEditProfile(v => !v); setProfileError(''); }}
            >
              {editProfile ? 'İptal' : 'Düzenle'}
            </button>
          </div>

          {editProfile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {profileError && <div className="alert alert-error">{profileError}</div>}

              <div className="form-group">
                <label className="form-label">Ünvan</label>
                <select className="form-select" value={profileForm.title} disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                  {TITLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Biyografi</label>
                <textarea
                  className="form-input"
                  rows={4}
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                  value={profileForm.biography}
                  onChange={e => setPF('biography', e.target.value)}
                  placeholder="Kendinizi ve uzmanlık alanlarınızı kısaca tanıtın..."
                />
              </div>

              <button className="btn-primary" onClick={handleSaveProfile} disabled={savingProfile}>
                {savingProfile ? <span className="spinner-sm" /> : 'Kaydet'}
              </button>
            </div>
          ) : (
            <>
              {[
                { label: 'E-posta', value: profile.email || '—' },
                { label: 'Telefon', value: profile.phone_number || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Biyografi</div>
                {profile.biography ? (
                  <p style={{ fontSize: 13, color: 'var(--ink-mid)', lineHeight: 1.7 }}>{profile.biography}</p>
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--ink-light)', fontStyle: 'italic' }}>Henüz biyografi eklenmemiş.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Çalışma Saatleri Kartı */}
        <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Çalışma Saatleri</div>
            {hasSchedule && (
              <button
                className="btn-ghost"
                style={{ fontSize: 12, padding: '7px 14px' }}
                onClick={() => { setEditSchedule(v => !v); setSchedError(''); }}
              >
                {editSchedule ? 'İptal' : 'Düzenle'}
              </button>
            )}
          </div>

          {editSchedule ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {schedError && <div className="alert alert-error">{schedError}</div>}

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Hafta içi</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Başlangıç</label>
                    <input className="form-input" type="time" value={schedForm.work_time_start} onChange={e => setSF('work_time_start', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bitiş</label>
                    <input className="form-input" type="time" value={schedForm.work_time_end} onChange={e => setSF('work_time_end', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Randevu Süresi</label>
                <select className="form-select" value={schedForm.appointment_duration} onChange={e => setSF('appointment_duration', Number(e.target.value))}>
                  {[30, 45, 60, 90].map(d => <option key={d} value={d}>{d} dakika</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Aylık Danışmanlık Ücreti (₺)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="örn. 1500"
                  value={schedForm.monthly_price}
                  onChange={e => setSF('monthly_price', e.target.value)}
                />
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Hafta sonu</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', marginBottom: 14 }}>
                  <div
                    onClick={() => setSF('weekend_workings', !schedForm.weekend_workings)}
                    style={{ width: 42, height: 24, borderRadius: 12, background: schedForm.weekend_workings ? 'var(--forest)' : 'var(--parchment-dark)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: 3, left: schedForm.weekend_workings ? 21 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                    {schedForm.weekend_workings ? 'Hafta sonu çalışıyor' : 'Hafta sonu çalışmıyor'}
                  </span>
                </label>

                {schedForm.weekend_workings && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="form-group">
                      <label className="form-label">Başlangıç</label>
                      <input className="form-input" type="time" value={schedForm.weekend_work_time_start} onChange={e => setSF('weekend_work_time_start', e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Bitiş</label>
                      <input className="form-input" type="time" value={schedForm.weekend_work_time_end} onChange={e => setSF('weekend_work_time_end', e.target.value)} />
                    </div>
                  </div>
                )}
              </div>

              <button className="btn-primary" onClick={handleSaveSchedule} disabled={savingSchedule}>
                {savingSchedule ? <span className="spinner-sm" /> : 'Kaydet'}
              </button>
            </div>
          ) : hasSchedule ? (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Hafta içi</div>
              {[
                { label: 'Başlangıç', value: profile.work_time_start?.slice(0, 5) || '—' },
                { label: 'Bitiş', value: profile.work_time_end?.slice(0, 5) || '—' },
                { label: 'Randevu Süresi', value: profile.appointment_duration ? `${profile.appointment_duration} dk` : '—' },
                { label: 'Aylık Ücret', value: schedForm.monthly_price ? `₺ ${schedForm.monthly_price}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                  <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
                </div>
              ))}

              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 16, marginBottom: 8 }}>Hafta sonu</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>Durum</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: profile.weekend_workings ? 'var(--forest)' : 'var(--ink-light)' }}>
                  {profile.weekend_workings ? 'Çalışıyor' : 'Kapalı'}
                </span>
              </div>
              {profile.weekend_workings && (
                <>
                  {[
                    { label: 'Başlangıç', value: profile.weekend_work_time_start?.slice(0, 5) || '—' },
                    { label: 'Bitiş', value: profile.weekend_work_time_end?.slice(0, 5) || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--parchment-dark)' }}>
                      <span style={{ fontSize: 13, color: 'var(--ink-light)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{value}</span>
                    </div>
                  ))}
                </>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-light)', fontSize: 13 }}>
              Çalışma saati bilgisi bulunamadı.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
