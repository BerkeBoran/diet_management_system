import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dietService from '../../services/dietService';
import userService from '../../services/userService';
import appointmentService from '../../services/appointmentService';
import Icons from '../../components/landing/LandingIcons';

const PAGE_CSS = `
/* ── HELLO ───────────────────────────────── */
.dash-hello {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 16px;
  flex-wrap: wrap;
}
.dash-hello-actions { display: flex; gap: 10px; flex-shrink: 0; }
.eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #9CA3AF;
  letter-spacing: 0.06em;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.eyebrow-dot {
  width: 5px;
  height: 5px;
  background: #65A30D;
  border-radius: 50%;
  display: inline-block;
}
.dash-h1 {
  font-family: 'Instrument Serif', serif;
  font-size: 30px;
  color: #1A1A1A;
  line-height: 1.15;
  margin: 0 0 6px;
}
.dash-hello-sub { font-size: 14px; color: #6B7280; margin: 0; }

/* ── STATS ───────────────────────────────── */
.dash-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}
.dstat {
  background: white;
  border: 1px solid #E5E0D5;
  border-radius: 16px;
  padding: 18px;
}
.dstat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.dstat-icon-1 { background: #F0FDF4; color: #65A30D; }
.dstat-icon-2 { background: #FEF3C7; color: #D97706; }
.dstat-icon-3 { background: #F0FDF4; color: #16A34A; }
.dstat-icon-4 { background: #F0F9FF; color: #0369A1; }
.dstat-num {
  font-family: 'Instrument Serif', serif;
  font-size: 26px;
  color: #1A1A1A;
  line-height: 1.1;
  margin-bottom: 3px;
}
.dstat-num small {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #9CA3AF;
  font-style: normal;
}
.dstat-lbl { font-size: 12.5px; font-weight: 600; color: #1A1A1A; margin-bottom: 2px; }
.dstat-sub { font-size: 11px; color: #9CA3AF; }

/* ── GRID ────────────────────────────────── */
.dash-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}
.dash-col { display: flex; flex-direction: column; gap: 16px; }

/* ── CARDS ───────────────────────────────── */
.dcard {
  background: white;
  border: 1px solid #E5E0D5;
  border-radius: 20px;
  padding: 22px;
}
.dcard-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.dcard-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #9CA3AF;
  text-transform: uppercase;
  margin-bottom: 3px;
}
.dcard-title {
  font-family: 'Instrument Serif', serif;
  font-size: 17px;
  color: #1A1A1A;
  margin: 0;
  font-weight: 400;
}
.dcard-link {
  font-size: 12px;
  color: #65A30D;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
}
.dcard-link:hover { text-decoration: underline; }
.dcard-foot { display: flex; gap: 10px; margin-top: 16px; }

/* ── PLAN CARD ───────────────────────────── */
.plan-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.plan-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}
.plan-pill-active { background: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0; }
.plan-dates { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #9CA3AF; }
.plan-progress-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 6px;
}
.plan-progress-row strong {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #1A1A1A;
}
.plan-bar {
  height: 6px;
  background: #F3F0E8;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 14px;
}
.plan-bar-fill {
  height: 100%;
  background: #65A30D;
  border-radius: 3px;
  transition: width 0.6s ease;
}
.plan-macros { display: flex; flex-direction: column; gap: 8px; }
.macro-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6B7280;
  margin-bottom: 3px;
}
.macro-row span:last-child { font-family: 'JetBrains Mono', monospace; font-size: 11px; }
.macro-bar { height: 4px; background: #F3F0E8; border-radius: 2px; overflow: hidden; }
.macro-bar > div { height: 100%; border-radius: 2px; transition: width 0.6s; }
.plan-meals {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #E5E0D5;
}
.meal {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6B7280;
  padding: 3px 0;
}
.meal-done { color: #9CA3AF; }
.meal-now { color: #1A1A1A; font-weight: 500; }
.dot-live {
  width: 6px;
  height: 6px;
  background: #65A30D;
  border-radius: 50%;
  flex-shrink: 0;
  animation: dashPulse 1.5s infinite;
}
@keyframes dashPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.4); }
}

/* ── APPOINTMENT ─────────────────────────── */
.appt { display: flex; gap: 14px; align-items: flex-start; }
.appt-date {
  background: #F9F6EF;
  border: 1px solid #E5E0D5;
  border-radius: 12px;
  padding: 10px 14px;
  text-align: center;
  flex-shrink: 0;
  min-width: 54px;
}
.appt-month { font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; color: #65A30D; letter-spacing: 0.1em; display: block; }
.appt-day { font-family: 'Instrument Serif', serif; font-size: 28px; color: #1A1A1A; display: block; line-height: 1; }
.appt-time { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #9CA3AF; display: block; margin-top: 3px; }
.appt-info { flex: 1; }
.appt-with { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.appt-avatar {
  width: 36px;
  height: 36px;
  background: #1A1A1A;
  color: #FBFAF5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-family: 'Instrument Serif', serif;
  flex-shrink: 0;
}
.appt-name { font-size: 13.5px; font-weight: 600; color: #1A1A1A; }
.appt-spec { font-size: 11px; color: #9CA3AF; }
.appt-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.appt-plain-link {
  background: none;
  border: none;
  padding: 0;
  font-size: 12px;
  color: #65A30D;
  font-weight: 500;
  cursor: pointer;
}
.appt-plain-link:hover { text-decoration: underline; }

/* ── AI CARD ─────────────────────────────── */
.dcard-ai {
  background: linear-gradient(135deg, #1A1A1A 0%, #2D4A1E 100%);
  border: none;
  display: flex;
  flex-direction: column;
}
.dcard-ai .dcard-eyebrow { color: #65A30D; }
.dcard-ai .dcard-title { color: #FBFAF5; }
.dcard-ai-body {
  font-size: 13.5px;
  color: rgba(251,250,245,0.7);
  line-height: 1.65;
  margin: 0 0 14px;
}
.ai-pulse {
  width: 28px;
  height: 28px;
  background: rgba(101,163,13,0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ai-pulse span {
  width: 8px;
  height: 8px;
  background: #65A30D;
  border-radius: 50%;
  animation: dashPulse 1.5s infinite;
}

/* ── QUICK ACCESS ────────────────────────── */
.dash-quick-title { font-size: 14px; font-weight: 700; color: #1A1A1A; margin: 0 0 14px; }
.dash-quick-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.qbtn {
  background: white;
  border: 1px solid #E5E0D5;
  border-radius: 16px;
  padding: 18px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-decoration: none;
}
.qbtn:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.07); transform: translateY(-2px); }
.qbtn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}
.qbtn-icon-1 { background: #F0F9FF; color: #0369A1; }
.qbtn-icon-2 { background: #F0FDF4; color: #65A30D; }
.qbtn-icon-3 { background: #FFF7ED; color: #C2683C; }
.qbtn-icon-4 { background: #F5F3FF; color: #7C3AED; }
.qbtn strong { font-size: 13px; color: #1A1A1A; font-family: 'Plus Jakarta Sans', sans-serif; }
.qbtn .qbtn-sub { font-size: 11px; color: #9CA3AF; line-height: 1.4; }

/* ── EMPTY STATES ────────────────────────── */
.dcard-empty { text-align: center; padding: 24px 0; }
.dcard-empty p { font-size: 13px; color: #9CA3AF; margin: 0 0 14px; }

/* ── RESPONSIVE ──────────────────────────── */
@media (max-width: 1100px) {
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
  .dash-grid { grid-template-columns: 1fr; }
  .dash-quick-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .dash-hello { flex-direction: column; }
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
  .dash-quick-grid { grid-template-columns: repeat(2, 1fr); }
  .dash-h1 { font-size: 24px; }
}
`;

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_LABELS = { breakfast: 'Kahvaltı', lunch: 'Öğle', dinner: 'Akşam', snack: 'Ara öğün' };
const MONTHS_TR = ['OCA', 'ŞUB', 'MAR', 'NİS', 'MAY', 'HAZ', 'TEM', 'AĞU', 'EYL', 'EKİ', 'KAS', 'ARA'];
const WEEKDAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function turkishDate(d = new Date()) {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · ${WEEKDAYS_TR[d.getDay()]}`;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      userService.getProfile(),
      dietService.getAssignments(),
      dietService.getPlans(),
      appointmentService.getAppointments(),
    ]).then(async ([prof, assign, plans, appt]) => {
      setProfile(prof.data);

      const activeAssign = assign.data?.find(a => a.status === 'InProgress');
      setAssignment(activeAssign || null);

      const planList = plans.data || [];
      const ap = planList.find(p => p.status === 'Active') || planList[0] || null;
      setActivePlan(ap);

      if (ap) {
        try {
          const det = await dietService.getPlanDetail(ap.id);
          setPlanDetail(det.data);
        } catch {}
      }

      const now = new Date();
      const upcoming = (appt.data || [])
        .filter(a => a.status !== 'Canceled' && new Date(a.date) >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setAppointments(upcoming.slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const todayDay = DAYS[now.getDay()];
  const upcomingAppt = appointments[0] || null;

  const todayMeals = (() => {
    if (!planDetail?.weekly_plan) return [];
    for (const week of planDetail.weekly_plan) {
      const s = new Date(week.start_date);
      const e = new Date(week.end_date);
      if (s <= now && now <= e) {
        return week.daily_plan?.find(dp => dp.day === todayDay)?.meals || [];
      }
    }
    return [];
  })();

  const firstName = user?.fullName?.split(' ')[0] || 'Danışan';
  const dieticianDetail = assignment?.dietician_detail;
  const dieticianName = dieticianDetail
    ? `${dieticianDetail.title || 'Dyt.'} ${dieticianDetail.first_name} ${dieticianDetail.last_name}`
    : null;

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <div className="spinner" />
    </div>
  );

  const apptDate = upcomingAppt ? new Date(upcomingAppt.date) : null;
  const dietInitials = dieticianDetail
    ? `${dieticianDetail.first_name?.[0] || ''}${dieticianDetail.last_name?.[0] || ''}`
    : '—';

  return (
    <>
      <style>{PAGE_CSS}</style>

      {/* Hello */}
      <div className="dash-hello">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            {turkishDate(now)}
          </div>
          <h1 className="dash-h1">
            Hoş geldin,{' '}
            <em style={{ fontStyle: 'italic', color: '#3F6212' }}>{firstName}</em>.
          </h1>
          <p className="dash-hello-sub">Bugünkü beslenme hedeflerine göz at.</p>
        </div>
        <div className="dash-hello-actions">
          <Link to="/client/appointments" className="btn btn-ghost btn-sm">
            <Icons.Calendar size={13} /> Randevu al
          </Link>
          <Link to="/client/ai-diet" className="btn btn-primary btn-sm">
            <Icons.Sparkle size={13} /> AI ile plan
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <article className="dstat">
          <div className="dstat-icon dstat-icon-1"><Icons.Bolt size={15} /></div>
          {profile?.height
            ? <div className="dstat-num">{profile.height} <small>cm</small></div>
            : <div className="dstat-num">—</div>}
          <div className="dstat-lbl">Boy</div>
          <div className="dstat-sub">Kayıtlı</div>
        </article>

        <article className="dstat">
          <div className="dstat-icon dstat-icon-2"><Icons.Heart size={15} /></div>
          {profile?.weight
            ? <div className="dstat-num">{profile.weight} <small>kg</small></div>
            : <div className="dstat-num">—</div>}
          <div className="dstat-lbl">Kilo</div>
          <div className="dstat-sub">Güncel</div>
        </article>

        <article className="dstat">
          <div className="dstat-icon dstat-icon-3"><Icons.Check size={15} /></div>
          <div className="dstat-num" style={{ fontSize: 20, lineHeight: 1.3 }}>
            {activePlan ? 'Aktif' : 'Yok'}
          </div>
          <div className="dstat-lbl">Plan durumu</div>
          <div className="dstat-sub">
            {activePlan
              ? `→ ${activePlan.end_date}`
              : 'Plan atanmadı'}
          </div>
        </article>

        <article className="dstat">
          <div className="dstat-icon dstat-icon-4"><Icons.Stethoscope size={15} /></div>
          <div className="dstat-num" style={{ fontSize: 18, lineHeight: 1.3 }}>
            {dieticianDetail ? `${dieticianDetail.title || 'Dyt.'} ${dieticianDetail.last_name}` : '—'}
          </div>
          <div className="dstat-lbl">Diyetisyen</div>
          <div className="dstat-sub">
            {assignment ? 'Bağlı' : 'Atanmadı'}
          </div>
        </article>
      </div>

      {/* Main grid */}
      <div className="dash-grid">
        {/* Plan card */}
        <article className="dcard dcard-plan">
          <div className="dcard-head">
            <div>
              <div className="dcard-eyebrow">DİYET PLANI</div>
              <h3 className="dcard-title">
                {activePlan ? `Haftalık Plan` : 'Plan Yok'}
              </h3>
            </div>
            <Link to="/client/diet-plans" className="dcard-link">Tümünü gör →</Link>
          </div>

          {activePlan ? (
            <>
              <div className="plan-meta">
                <span className="plan-pill plan-pill-active">● Aktif</span>
                <span className="plan-dates">
                  {activePlan.start_date} → {activePlan.end_date}
                </span>
              </div>

              {planDetail?.daily_calories && (
                <div className="plan-progress">
                  <div className="plan-progress-row">
                    <span>Günlük kalori hedefi</span>
                    <strong>{planDetail.daily_calories} kcal</strong>
                  </div>
                  <div className="plan-bar">
                    <div className="plan-bar-fill" style={{ width: '0%' }} />
                  </div>
                </div>
              )}

              {todayMeals.length > 0 ? (
                <div className="plan-meals">
                  {todayMeals.map((meal, i) => (
                    <div key={meal.id || i} className="meal">
                      <Icons.Check size={11} />
                      {MEAL_LABELS[meal.meal_type] || meal.meal_type}
                      {meal.calories && (
                        <span style={{ marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#9CA3AF' }}>
                          {meal.calories} kcal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E5E0D5' }}>
                  <p style={{ fontSize: 13, color: '#9CA3AF', margin: 0 }}>Bugün için öğün planı bulunamadı.</p>
                </div>
              )}

              <div className="dcard-foot">
                <Link to="/client/diet-plans" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Planı görüntüle <Icons.ArrowRight size={13} />
                </Link>
              </div>
            </>
          ) : (
            <div className="dcard-empty">
              <p>Henüz aktif bir diyet planınız yok.</p>
              <Link to="/client/dietitians" className="btn btn-ghost btn-sm">Diyetisyen Bul</Link>
            </div>
          )}
        </article>

        {/* Right column */}
        <div className="dash-col">
          {/* Appointment */}
          <article className="dcard">
            <div className="dcard-head">
              <div>
                <div className="dcard-eyebrow">YAKLAŞAN RANDEVU</div>
                <h3 className="dcard-title">
                  {upcomingAppt
                    ? new Date(upcomingAppt.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })
                    : 'Randevu Yok'}
                </h3>
              </div>
              <Link to="/client/appointments" className="dcard-link">Tümü →</Link>
            </div>

            {upcomingAppt && apptDate ? (
              <div className="appt">
                <div className="appt-date">
                  <span className="appt-month">{MONTHS_TR[apptDate.getMonth()]}</span>
                  <span className="appt-day">{apptDate.getDate()}</span>
                  <span className="appt-time">{upcomingAppt.start_time?.slice(0, 5)}</span>
                </div>
                <div className="appt-info">
                  <div className="appt-with">
                    <span className="appt-avatar">{dietInitials}</span>
                    <div>
                      <div className="appt-name">{upcomingAppt.dietician_name || dieticianName || '—'}</div>
                      <div className="appt-spec">
                        Online görüşme · {upcomingAppt.start_time?.slice(0, 5)}–{upcomingAppt.end_time?.slice(0, 5)}
                      </div>
                    </div>
                  </div>
                  <div className="appt-actions">
                    <Link to="/client/appointments" className="btn btn-primary btn-sm">
                      Detayları gör
                    </Link>
                    <Link to="/client/appointments" className="appt-plain-link">
                      Yeniden planla
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="dcard-empty">
                <p>Yaklaşan randevunuz yok.</p>
                <Link to="/client/appointments" className="btn btn-ghost btn-sm">Randevu Al</Link>
              </div>
            )}
          </article>

          {/* AI tip */}
          <article className="dcard dcard-ai">
            <div className="dcard-head">
              <div>
                <div className="dcard-eyebrow">AI ASİSTAN</div>
                <h3 className="dcard-title">Bugün için ipucu</h3>
              </div>
              <span className="ai-pulse"><span /></span>
            </div>
            <p className="dcard-ai-body">
              Günlük protein hedefinize ulaşmak için öğle yemeğinize ızgara tavuk ya da yumurta ekleyin.
              Küçük değişiklikler <em style={{ color: '#65A30D', fontStyle: 'italic' }}>büyük fark</em> yaratır.
            </p>
            <Link to="/client/ai-diet" className="btn btn-accent btn-sm" style={{ alignSelf: 'flex-start' }}>
              <Icons.Sparkle size={13} /> AI ile sohbet et
            </Link>
          </article>
        </div>
      </div>

      {/* Quick access */}
      <section>
        <h4 className="dash-quick-title">Hızlı Erişim</h4>
        <div className="dash-quick-grid">
          <Link to="/client/dietitians" className="qbtn">
            <span className="qbtn-icon qbtn-icon-1"><Icons.Users size={17} /></span>
            <strong>Diyetisyen Bul</strong>
            <span className="qbtn-sub">Uzman diyetisyenleri keşfet</span>
          </Link>
          <Link to="/client/ai-diet" className="qbtn">
            <span className="qbtn-icon qbtn-icon-2"><Icons.Sparkle size={17} /></span>
            <strong>AI Diyet Planı</strong>
            <span className="qbtn-sub">Yapay zeka ile plan oluştur</span>
          </Link>
          <Link to="/client/messages" className="qbtn">
            <span className="qbtn-icon qbtn-icon-3"><Icons.Chat size={17} /></span>
            <strong>Mesajlaşma</strong>
            <span className="qbtn-sub">Diyetisyenine ulaş</span>
          </Link>
          <Link to="/client/appointments" className="qbtn">
            <span className="qbtn-icon qbtn-icon-4"><Icons.Calendar size={17} /></span>
            <strong>Randevu Al</strong>
            <span className="qbtn-sub">Uygun zamanı seç</span>
          </Link>
        </div>
      </section>
    </>
  );
}
