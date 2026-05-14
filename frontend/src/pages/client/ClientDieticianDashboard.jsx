import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dietService from '../../services/dietService';
import appointmentService from '../../services/appointmentService';
import Icons from '../../components/landing/LandingIcons';

const CSS = `
.dd-hello { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
.dd-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0369A1; letter-spacing: 0.06em; display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
.dd-eyebrow-dot { width: 5px; height: 5px; background: #0369A1; border-radius: 50%; display: inline-block; }
.dd-h1 { font-family: 'Instrument Serif', serif; font-size: 30px; color: #1A1A1A; line-height: 1.15; margin: 0 0 6px; }
.dd-sub { font-size: 14px; color: #6B7280; margin: 0; }
.dd-hello-actions { display: flex; gap: 10px; flex-shrink: 0; }

.dd-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; margin-bottom: 24px; }
.dd-col { display: flex; flex-direction: column; gap: 16px; }

.dd-card {
  background: white; border: 1px solid #E5E0D5;
  border-radius: 20px; padding: 22px;
}
.dd-card-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.dd-card-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #9CA3AF; text-transform: uppercase; margin-bottom: 3px; }
.dd-card-title { font-family: 'Instrument Serif', serif; font-size: 17px; color: #1A1A1A; margin: 0; font-weight: 400; }
.dd-card-link { font-size: 12px; color: #65A30D; font-weight: 600; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
.dd-card-link:hover { text-decoration: underline; }
.dd-card-foot { display: flex; gap: 10px; margin-top: 16px; }
.dd-empty { text-align: center; padding: 24px 0; }
.dd-empty p { font-size: 13px; color: #9CA3AF; margin: 0 0 14px; }

.dd-dietician-card {
  display: flex; align-items: center; gap: 16px;
  padding: 18px; border-radius: 16px;
  background: #F0F9FF; border: 1px solid #BAE6FD;
  margin-bottom: 16px;
}
.dd-dietician-avatar {
  width: 52px; height: 52px; border-radius: 50%;
  background: #0369A1; color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Instrument Serif', serif; font-size: 18px; flex-shrink: 0;
}
.dd-dietician-name { font-size: 15px; font-weight: 700; color: #1A1A1A; margin-bottom: 3px; }
.dd-dietician-spec { font-size: 12px; color: #0369A1; }
.dd-dietician-status { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; margin-top: 4px; display: inline-block; }

.dd-plan-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.dd-plan-pill { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
.dd-plan-active { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
.dd-plan-dates { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9CA3AF; }

.dd-appt { display: flex; gap: 14px; align-items: flex-start; }
.dd-appt-date { background: #F9F6EF; border: 1px solid #E5E0D5; border-radius: 12px; padding: 10px 14px; text-align: center; flex-shrink: 0; min-width: 54px; }
.dd-appt-month { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; color: #0369A1; letter-spacing: 0.1em; display: block; }
.dd-appt-day { font-family: 'Instrument Serif', serif; font-size: 28px; color: #1A1A1A; display: block; line-height: 1; }
.dd-appt-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #9CA3AF; display: block; margin-top: 3px; }
.dd-appt-info { flex: 1; }
.dd-appt-with { font-size: 13.5px; font-weight: 600; color: #1A1A1A; margin-bottom: 6px; }
.dd-appt-sub { font-size: 11px; color: #9CA3AF; margin-bottom: 12px; }

.dd-msgs-list { display: flex; flex-direction: column; gap: 8px; }
.dd-msg-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; background: #F9F6EF; border: 1px solid #E5E0D5; }
.dd-msg-dot { width: 8px; height: 8px; border-radius: 50%; background: #65A30D; flex-shrink: 0; }
.dd-msg-text { font-size: 13px; color: #1A1A1A; flex: 1; }
.dd-msg-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #9CA3AF; }

.dd-switch { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6B7280; margin-top: 24px; }
.dd-switch a { color: #65A30D; font-weight: 600; text-decoration: none; }
.dd-switch a:hover { text-decoration: underline; }

@media(max-width:1100px){ .dd-grid{grid-template-columns:1fr;} }
@media(max-width:640px){ .dd-hello{flex-direction:column;} .dd-h1{font-size:24px;} }
`;

const MONTHS_TR = ['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];

export default function ClientDieticianDashboard() {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [pendingAssignment, setPendingAssignment] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const firstName = user?.fullName?.split(' ')[0] || 'Danışan';

  useEffect(() => {
    Promise.all([
      dietService.getAssignments().catch(() => ({ data: [] })),
      dietService.getPlans().catch(() => ({ data: [] })),
      appointmentService.getAppointments().catch(() => ({ data: [] })),
    ]).then(([assignRes, plansRes, apptRes]) => {
      const assignments = assignRes.data || [];
      const activeAssign = assignments.find(a => a.status === 'InProgress');
      const pending = assignments.find(a => a.status === 'Pending');
      setAssignment(activeAssign || null);
      setPendingAssignment(pending || null);

      const planList = plansRes.data || [];
      setActivePlan(planList.find(p => p.status === 'Active') || planList[0] || null);

      const now = new Date();
      const upcoming = (apptRes.data || [])
        .filter(a => a.status !== 'Canceled' && new Date(a.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(upcoming.slice(0, 2));
    }).finally(() => setLoading(false));
  }, []);

  const dietician = assignment?.dietician_detail;
  const dieticianName = dietician
    ? `${dietician.title || 'Dyt.'} ${dietician.first_name} ${dietician.last_name}`
    : null;
  const dieticianInitials = dietician
    ? `${dietician.first_name?.[0] || ''}${dietician.last_name?.[0] || ''}`
    : '—';

  const upcomingAppt = appointments[0] || null;
  const apptDate = upcomingAppt ? new Date(upcomingAppt.date) : null;

  return (
    <>
      <style>{CSS}</style>

      <div className="dd-hello">
        <div>
          <div className="dd-eyebrow">
            <span className="dd-eyebrow-dot" />
            DİYETİSYEN PANELİ
          </div>
          <h1 className="dd-h1">
            Hoş geldin,{' '}
            <em style={{ fontStyle: 'italic', color: '#3F6212' }}>{firstName}</em>.
          </h1>
          <p className="dd-sub">
            {dieticianName ? `${dieticianName} ile çalışıyorsun.` : 'Henüz bir diyetisyen seçmedin.'}
          </p>
        </div>
        <div className="dd-hello-actions">
          <Link to="/client/appointments" className="btn btn-primary btn-sm">
            <Icons.Calendar size={13} /> Randevu Al
          </Link>
        </div>
      </div>

      {!loading && pendingAssignment && !assignment && (
        <div style={{
          background: '#FFF7ED',
          border: '1.5px solid #FDE68A',
          borderRadius: 20,
          padding: '32px 28px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 14,
          marginBottom: 24,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: '#FEF3C7',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
          }}>
            ⏳
          </div>
          <div>
            <div style={{
              fontFamily: 'Instrument Serif, serif',
              fontSize: 22,
              color: '#1A1A1A',
              marginBottom: 8,
            }}>
              Diyetisyen Onayı Bekleniyor
            </div>
            <div style={{ fontSize: 14, color: '#92400E', lineHeight: 1.6, maxWidth: 360 }}>
              {(() => {
                const d = pendingAssignment.dietician_detail;
                const name = d ? `${d.title || 'Dyt.'} ${d.first_name} ${d.last_name}` : 'Diyetisyen';
                return `${name}'e danışmanlık talebiniz iletildi. Diyetisyen talebinizi inceleyip onayladığında buradan devam edebilirsiniz.`;
              })()}
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 10,
            padding: '8px 16px',
            fontSize: 12,
            color: '#92400E',
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />
            Talep tarihi: {new Date(pendingAssignment.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/client/dietitians" className="btn btn-ghost btn-sm">
              Başka Diyetisyen Bul
            </Link>
            <Link to="/client/ai-dashboard" className="btn btn-primary btn-sm">
              <Icons.Sparkle size={13} /> AI ile Devam Et
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
          <div className="spinner" />
        </div>
      ) : (
        <div className="dd-grid">
          <div className="dd-col">
            <article className="dd-card">
              <div className="dd-card-head">
                <div>
                  <div className="dd-card-eyebrow">DİYETİSYENİM</div>
                  <h3 className="dd-card-title">
                    {dieticianName || 'Diyetisyen Bulunamadı'}
                  </h3>
                </div>
                <Link to="/client/dietitians" className="dd-card-link">
                  {dietician ? 'Değiştir →' : 'Bul →'}
                </Link>
              </div>

              {dietician ? (
                <div className="dd-dietician-card">
                  <div className="dd-dietician-avatar">{dieticianInitials}</div>
                  <div>
                    <div className="dd-dietician-name">{dieticianName}</div>
                    <div className="dd-dietician-spec">
                      Diyetisyen
                    </div>
                    <span className="dd-dietician-status">● Aktif Danışan</span>
                  </div>
                </div>
              ) : (
                <div className="dd-empty">
                  <p>Henüz bir diyetisyen seçmedin.</p>
                  <Link to="/client/dietitians" className="btn btn-primary btn-sm">
                    <Icons.Users size={13} /> Diyetisyen Bul
                  </Link>
                </div>
              )}

              <div className="dd-card-head" style={{ marginBottom: 12, marginTop: 4 }}>
                <div>
                  <div className="dd-card-eyebrow">AKTİF DİYET PLANI</div>
                  <h3 className="dd-card-title">
                    {activePlan ? 'Haftalık Plan' : 'Plan Yok'}
                  </h3>
                </div>
                <Link to="/client/diet-plans" className="dd-card-link">Gör →</Link>
              </div>

              {activePlan ? (
                <>
                  <div className="dd-plan-meta">
                    <span className="dd-plan-pill dd-plan-active">● Aktif</span>
                    <span className="dd-plan-dates">
                      {activePlan.start_date} → {activePlan.end_date}
                    </span>
                  </div>
                  <div className="dd-card-foot">
                    <Link to="/client/diet-plans" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      Planı görüntüle <Icons.ArrowRight size={13} />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="dd-empty">
                  <p>Henüz bir diyet planın yok.</p>
                </div>
              )}
            </article>
          </div>

          <div className="dd-col">
            <article className="dd-card">
              <div className="dd-card-head">
                <div>
                  <div className="dd-card-eyebrow">YAKLAŞAN RANDEVU</div>
                  <h3 className="dd-card-title">
                    {upcomingAppt
                      ? new Date(upcomingAppt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
                      : 'Randevu Yok'}
                  </h3>
                </div>
                <Link to="/client/appointments" className="dd-card-link">Tümü →</Link>
              </div>

              {upcomingAppt && apptDate ? (
                <div className="dd-appt">
                  <div className="dd-appt-date">
                    <span className="dd-appt-month">{MONTHS_TR[apptDate.getMonth()]}</span>
                    <span className="dd-appt-day">{apptDate.getDate()}</span>
                    <span className="dd-appt-time">{upcomingAppt.start_time?.slice(0, 5)}</span>
                  </div>
                  <div className="dd-appt-info">
                    <div className="dd-appt-with">
                      {upcomingAppt.dietician_name || dieticianName || '—'}
                    </div>
                    <div className="dd-appt-sub">
                      Online görüşme · {upcomingAppt.start_time?.slice(0, 5)}–{upcomingAppt.end_time?.slice(0, 5)}
                    </div>
                    <Link to="/client/appointments" className="btn btn-primary btn-sm">
                      Detayları gör
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="dd-empty">
                  <p>Yaklaşan randevun yok.</p>
                  <Link to="/client/appointments" className="btn btn-ghost btn-sm">
                    <Icons.Calendar size={13} /> Randevu Al
                  </Link>
                </div>
              )}
            </article>

            <article className="dd-card">
              <div className="dd-card-head">
                <div>
                  <div className="dd-card-eyebrow">MESAJLAR</div>
                  <h3 className="dd-card-title">Diyetisyeninle Sohbet</h3>
                </div>
                <Link to="/client/messages" className="dd-card-link">Aç →</Link>
              </div>
              <div className="dd-empty" style={{ paddingBottom: 0 }}>
                <p style={{ marginBottom: 10 }}>
                  {dietician
                    ? 'Diyetisyeninle mesajlaşmak için tıkla.'
                    : 'Diyetisyen seçtikten sonra mesajlaşabilirsin.'}
                </p>
                <Link to="/client/messages" className="btn btn-ghost btn-sm">
                  <Icons.Chat size={13} /> Mesajlaşmaya Git
                </Link>
              </div>
            </article>
          </div>
        </div>
      )}

      <p className="dd-switch">
        AI diyetisyenle çalışmak ister misin?{' '}
        <Link to="/client/ai-dashboard">AI Paneline Geç</Link>
      </p>
    </>
  );
}
