import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../../services/appointmentService';
import userService from '../../services/userService';
import Icons from '../../components/landing/LandingIcons';

const TODAY = new Date().toISOString().split('T')[0];
const MONTH_NAMES = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const MONTH_SHORT = ['OCA','ŞUB','MAR','NİS','MAY','HAZ','TEM','AĞU','EYL','EKİ','KAS','ARA'];
const DOW_SHORT   = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

const fmtDate = d =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

const titleLabel = t =>
  t === 'EXPERT_DIETICIAN' ? 'Uzman Diyetisyen · Klinik Beslenme'
  : t === 'INTERN_DIETICIAN' ? 'Stajyer Diyetisyen'
  : 'Diyetisyen · Klinik Beslenme';

const statusMap = {
  Pending:   { label:'BEKLİYOR',    cls:'pending'   },
  PENDING:   { label:'BEKLİYOR',    cls:'pending'   },
  Confirmed: { label:'ONAYLI',      cls:'active'    },
  CONFIRMED: { label:'ONAYLI',      cls:'active'    },
  Completed: { label:'TAMAMLANDI',  cls:'completed' },
  COMPLETED: { label:'TAMAMLANDI',  cls:'completed' },
  Canceled:  { label:'İPTAL',       cls:'cancelled' },
  CANCELED:  { label:'İPTAL',       cls:'cancelled' },
};

function buildCalDays(year, month, weekendOk = false) {
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  let startDow = firstDay.getDay(); // 0=Sun
  startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0..Sun=6

  const days = [];
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: fmtDate(d), d: d.getDate(), other: true });
  }
  for (let d = 1; d <= lastDate; d++) {
    const date = new Date(year, month, d);
    const dateStr = fmtDate(date);
    const isPast = dateStr < TODAY;
    const isToday = dateStr === TODAY;
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    const blockedWeekend = isWeekend && !weekendOk;
    days.push({ date: dateStr, d, today: isToday, disabled: isPast || blockedWeekend, hasSlots: !isPast && !blockedWeekend });
  }
  const rem = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= rem; i++) {
    const d = new Date(year, month + 1, i);
    days.push({ date: fmtDate(d), d: i, other: true });
  }
  return days;
}

function groupSlots(slots) {
  const morning = [], afternoon = [], evening = [];
  slots.forEach(s => {
    if (!s.is_available) return;
    const h = parseInt(s.start_time.split(':')[0], 10);
    if (h < 12) morning.push(s);
    else if (h < 16) afternoon.push(s);
    else evening.push(s);
  });
  return [
    { key: 'morning',   label: 'Sabah',          items: morning   },
    { key: 'afternoon', label: 'Öğleden Sonra',   items: afternoon },
    { key: 'evening',   label: 'Akşamüstü',       items: evening   },
  ].filter(g => g.items.length > 0);
}

export default function ClientAppointments() {
  const [loading,         setLoading]         = useState(true);
  const [appointments,    setAppointments]    = useState([]);
  const [activeDietician, setActiveDietician] = useState(null);
  const [calYear,         setCalYear]         = useState(new Date().getFullYear());
  const [calMonth,        setCalMonth]        = useState(new Date().getMonth());
  const [selectedDate,    setSelectedDate]    = useState(null);
  const [slots,           setSlots]           = useState([]);
  const [slotsLoading,    setSlotsLoading]    = useState(false);
  const [selectedSlot,    setSelectedSlot]    = useState(null);
  const [notes,           setNotes]           = useState('');
  const [booking,         setBooking]         = useState(false);
  const [bookError,       setBookError]       = useState('');
  const [tab,             setTab]             = useState('upcoming');

  const load = useCallback(async () => {
    const [apptRes, assignRes] = await Promise.allSettled([
      appointmentService.getAppointments(),
      userService.getAssignments(),
    ]);
    if (apptRes.status === 'fulfilled') {
      const d = apptRes.value.data;
      setAppointments(Array.isArray(d) ? d : d?.results || []);
    }
    if (assignRes.status === 'fulfilled') {
      const d = assignRes.value.data;
      const list = Array.isArray(d) ? d : d?.results || [];
      const active = list.find(a => a.status === 'InProgress' && a.dietician_detail);
      setActiveDietician(active?.dietician_detail ?? null);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const shiftMonth = n => {
    const d = new Date(calYear, calMonth + n, 1);
    setCalYear(d.getFullYear());
    setCalMonth(d.getMonth());
    setSelectedDate(null); setSlots([]); setSelectedSlot(null);
  };

  const selectDay = async dateStr => {
    if (!activeDietician) return;
    setSelectedDate(dateStr); setSelectedSlot(null); setSlots([]); setBookError('');
    setSlotsLoading(true);
    try {
      const r = await appointmentService.getAvailableSlots(activeDietician.id, dateStr);
      setSlots(r.data.slots || []);
    } catch (_) { setSlots([]); }
    finally { setSlotsLoading(false); }
  };

  const handleBook = async () => {
    if (!selectedSlot || !activeDietician) return;
    setBooking(true); setBookError('');
    try {
      await appointmentService.createAppointment({
        dietician:  activeDietician.id,
        date:       selectedDate,
        start_time: selectedSlot.start_time,
        notes,
      });
      setSelectedDate(null); setSlots([]); setSelectedSlot(null); setNotes('');
      await load();
    } catch (err) {
      const d = err.response?.data;
      setBookError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' ') || 'Bir hata oluştu.');
    } finally { setBooking(false); }
  };

  const handleCancel = async id => {
    if (!window.confirm('Randevuyu iptal etmek istiyor musunuz?')) return;
    try { await appointmentService.updateAppointment(id, { status: 'Canceled' }); await load(); } catch (_) {}
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div className="spinner" />
    </div>
  );

  const calDays    = buildCalDays(calYear, calMonth, activeDietician?.weekend_workings ?? false);
  const slotGroups = groupSlots(slots);
  const canBook    = selectedDate && selectedSlot;
  const monthLabel = `${MONTH_NAMES[calMonth]} ${calYear}`;

  const upcoming = appointments.filter(a =>
    a.status !== 'Canceled' && a.status !== 'CANCELED' &&
    new Date(a.date + 'T00:00') >= new Date(TODAY + 'T00:00')
  );
  const past = appointments.filter(a =>
    a.status === 'Canceled' || a.status === 'CANCELED' ||
    new Date(a.date + 'T00:00') < new Date(TODAY + 'T00:00')
  );
  const listItems = tab === 'upcoming' ? upcoming : past;

  const selDateObj  = selectedDate ? new Date(selectedDate + 'T00:00') : null;
  const selDateLabel = selDateObj
    ? `${selDateObj.getDate()} ${MONTH_NAMES[selDateObj.getMonth()]} · ${DOW_SHORT[(selDateObj.getDay() + 6) % 7]}`
    : null;

  const dytInitials = activeDietician
    ? `${activeDietician.first_name?.[0] || ''}${activeDietician.last_name?.[0] || ''}`
    : '';

  return (
    <>
      <style>{APPT_CSS}</style>
      <div className="appt-body">

        {/* ── Hero ── */}
        <div className="appt-hero">
          <div className="appt-hero-text">
            <span className="appt-eyebrow"><span className="appt-eyebrow-dot"/>Randevu Sistemi</span>
            <h1 className="appt-title">
              Diyetisyenden <em>randevu al</em>.
            </h1>
            <p className="appt-lede">
              Bağlı diyetisyeninle uygun zamanı seç. Takvim senkronlansın, randevun onaylansın.
            </p>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="appt-grid">

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Step 1 — Diyetisyen */}
            <article className="appt-card">
              <div className="appt-step">
                <span className="appt-step-num">1</span>
                <span className="appt-step-txt">DİYETİSYEN</span>
              </div>
              {activeDietician ? (
                <div className="appt-dyt-row">
                  <span className="appt-dyt-avatar">{dytInitials}</span>
                  <div className="appt-dyt-info">
                    <div className="appt-dyt-name">
                      Dyt. {activeDietician.first_name} {activeDietician.last_name}
                    </div>
                    <div className="appt-dyt-meta">
                      <span><Icons.Stethoscope size={12}/> {titleLabel(activeDietician.title)}</span>
                      {activeDietician.average_rating > 0 && (
                        <span><Icons.Star size={12}/> {activeDietician.average_rating?.toFixed(1)} · {activeDietician.review_count} görüşme</span>
                      )}
                    </div>
                  </div>
                  <span className="appt-dyt-tag">BAĞLI</span>
                </div>
              ) : (
                <div className="appt-no-dyt">
                  <div style={{ fontSize:36, marginBottom:10 }}>👨‍⚕️</div>
                  <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:4 }}>Aktif diyetisyeniniz yok</div>
                  <p style={{ fontSize:13, color:'var(--ink-mute)', margin:0 }}>Randevu alabilmek için önce bir diyetisyenle çalışma başlatın.</p>
                </div>
              )}
            </article>

            {/* Step 2 — Takvim */}
            <article className="appt-card">
              <div className="appt-step">
                <span className="appt-step-num">2</span>
                <span className="appt-step-txt">TARİH</span>
              </div>

              <div className="appt-cal-head">
                <h3 className="appt-cal-month">{monthLabel}</h3>
                <div className="appt-cal-nav">
                  <button aria-label="Önceki" onClick={() => shiftMonth(-1)}>
                    <Icons.ArrowRight size={14} style={{ transform:'rotate(180deg)' }}/>
                  </button>
                  <button aria-label="Sonraki" onClick={() => shiftMonth(1)}>
                    <Icons.ArrowRight size={14}/>
                  </button>
                </div>
              </div>

              <div className="appt-cal">
                {DOW_SHORT.map(d => <span key={d} className="appt-cal-dow">{d}</span>)}
                {calDays.map((day, i) => (
                  <button key={i} type="button"
                    className={[
                      'appt-cal-day',
                      day.other    ? 'other'    : '',
                      day.disabled ? 'disabled' : '',
                      day.today    ? 'today'    : '',
                      day.hasSlots ? 'has-slots': '',
                      !day.other && selectedDate === day.date ? 'active' : '',
                    ].filter(Boolean).join(' ')}
                    disabled={day.other || day.disabled || !activeDietician}
                    onClick={() => !day.other && !day.disabled && selectDay(day.date)}>
                    <span>{day.d}</span>
                    {day.hasSlots && selectedDate !== day.date && <span className="slot-mark"/>}
                  </button>
                ))}
              </div>
            </article>

            {/* Step 3 — Saat */}
            <article className="appt-card">
              <div className="appt-step">
                <span className="appt-step-num">3</span>
                <span className="appt-step-txt">SAAT</span>
              </div>

              {!selectedDate ? (
                <div className="appt-slots-empty">Önce takvimden bir tarih seçin</div>
              ) : slotsLoading ? (
                <div className="appt-slots-empty"><div className="spinner" style={{ margin:'0 auto' }}/></div>
              ) : slots.filter(s => s.is_available).length === 0 ? (
                <div className="appt-slots-empty">Bu gün için müsait saat bulunmuyor</div>
              ) : (
                <>
                  <div className="appt-times-head">
                    <h4>{selDateLabel}</h4>
                    <span>{slots.filter(s => s.is_available).length} müsait saat</span>
                  </div>
                  {slotGroups.map(g => (
                    <div key={g.key} className="appt-times-period">
                      <span className="appt-times-period-label">{g.label}</span>
                      <div className="appt-time-grid">
                        {g.items.map(s => (
                          <button key={s.start_time} type="button"
                            className={`appt-time ${selectedSlot?.start_time === s.start_time ? 'active' : ''}`}
                            onClick={() => setSelectedSlot(selectedSlot?.start_time === s.start_time ? null : s)}>
                            {s.start_time.slice(0,5)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </article>

            {/* Step 4 — Not */}
            <article className="appt-card">
              <div className="appt-step">
                <span className="appt-step-num">4</span>
                <span className="appt-step-txt">NOT (OPSİYONEL)</span>
              </div>
              <textarea className="appt-textarea"
                placeholder="Diyetisyenine iletmek istediğin bir not? Örn. son tahlil sonuçların, son zamanlarda yaşadığın belirtiler..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </article>
          </div>

          {/* RIGHT — Summary */}
          <aside className="appt-summary">
            <div className="appt-summary-head">
              <span className="appt-summary-eyebrow"><Icons.Calendar size={12}/> ÖZET</span>
              <h3 className="appt-summary-title">Randevu detayı</h3>
            </div>

            <div className="appt-summary-rows">
              <div className={`appt-summary-row ${activeDietician ? 'filled' : ''}`}>
                <span className="appt-summary-icon"><Icons.Users size={12}/></span>
                <div>
                  <span className="appt-summary-lbl">DİYETİSYEN</span>
                  <span className={`appt-summary-val ${!activeDietician ? 'empty' : ''}`}>
                    {activeDietician
                      ? `Dyt. ${activeDietician.first_name} ${activeDietician.last_name}`
                      : 'Diyetisyen yok'}
                  </span>
                </div>
              </div>

              <div className={`appt-summary-row ${selectedDate ? 'filled' : ''}`}>
                <span className="appt-summary-icon"><Icons.Calendar size={12}/></span>
                <div>
                  <span className="appt-summary-lbl">TARİH</span>
                  <span className={`appt-summary-val ${!selectedDate ? 'empty' : ''}`}>
                    {selDateLabel || 'Tarih seç'}
                  </span>
                </div>
              </div>

              <div className={`appt-summary-row ${selectedSlot ? 'filled' : ''}`}>
                <span className="appt-summary-icon"><Icons.Bolt size={12}/></span>
                <div>
                  <span className="appt-summary-lbl">SAAT</span>
                  <span className={`appt-summary-val ${!selectedSlot ? 'empty' : ''}`}>
                    {selectedSlot
                      ? `${selectedSlot.start_time?.slice(0,5)} – ${selectedSlot.end_time?.slice(0,5)}`
                      : 'Saat seç'}
                  </span>
                </div>
              </div>
            </div>

            {bookError && (
              <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:10, padding:'10px 14px', fontSize:13, color:'#dc2626' }}>
                {bookError}
              </div>
            )}

            <button className="appt-summary-cta" disabled={!canBook || booking} onClick={handleBook}>
              <Icons.Check size={16}/>
              {booking ? 'Kaydediliyor...' : 'Randevuyu Onayla'}
            </button>

            <p className="appt-summary-note">
              <Icons.Shield size={12}/>
              Randevu onaylandığında diyetisyenine bildirim gider. 24 saate kadar ücretsiz iptal/erteleme yapabilirsin.
            </p>
          </aside>
        </div>

        {/* ── Randevu Listesi ── */}
        <section className="appt-list-section">
          <header className="appt-list-head">
            <div>
              <span className="appt-card-eyebrow">RANDEVULARIM</span>
              <h2 className="appt-list-title">Yaklaşan &amp; geçmiş <em>randevular</em></h2>
            </div>
            <div className="appt-list-tabs">
              <button className={`appt-list-tab ${tab === 'upcoming' ? 'active' : ''}`} onClick={() => setTab('upcoming')}>
                Yaklaşan ({upcoming.length})
              </button>
              <button className={`appt-list-tab ${tab === 'past' ? 'active' : ''}`} onClick={() => setTab('past')}>
                Geçmiş ({past.length})
              </button>
            </div>
          </header>

          {listItems.length === 0 ? (
            <div className="appt-list-empty-state">
              <div style={{ fontSize:48, marginBottom:12 }}>📅</div>
              <p style={{ fontSize:15, color:'var(--ink-mute)' }}>
                {tab === 'upcoming' ? 'Yaklaşan randevunuz yok.' : 'Geçmiş randevu bulunamadı.'}
              </p>
            </div>
          ) : (
            <div className="appt-list">
              {listItems.map((a, i) => {
                const date = new Date(a.date + 'T00:00');
                const s = statusMap[a.status] || { label: a.status, cls: 'completed' };
                const isUpcoming = tab === 'upcoming';
                return (
                  <article key={a.id || i} className="appt-list-item">
                    <div className="appt-list-date">
                      <span className="appt-list-month">{MONTH_SHORT[date.getMonth()]}</span>
                      <span className="appt-list-day">{date.getDate()}</span>
                      <span className="appt-list-time">{a.start_time?.slice(0,5)}</span>
                    </div>
                    <div className="appt-list-info">
                      <span className="appt-list-with">{a.dietician_name || '—'}</span>
                      <span className="appt-list-meta">
                        {a.start_time && <span>{a.start_time.slice(0,5)}{a.end_time ? ` – ${a.end_time.slice(0,5)}` : ''}</span>}
                        {a.notes && <span>· {a.notes}</span>}
                      </span>
                    </div>
                    <span className={`appt-list-status ${s.cls}`}>{s.label}</span>
                    <div className="appt-list-actions">
                      {isUpcoming && s.cls === 'active' && (
                        <button className="appt-action-btn primary">Katıl</button>
                      )}
                      {isUpcoming && s.cls !== 'cancelled' && (
                        <button className="appt-action-btn outline" onClick={() => handleCancel(a.id)}>İptal</button>
                      )}
                      {!isUpcoming && (
                        <button className="appt-action-btn outline">Detay</button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

const APPT_CSS = `
  .appt-body { padding: 32px 36px 80px; max-width: 1280px; --r-sm:10px; --r-md:16px; --r-lg:24px; --r-pill:999px; }

  .appt-hero { margin-bottom: 28px; }
  .appt-hero-text { display:flex; flex-direction:column; gap:10px; max-width:720px; }
  .appt-eyebrow { display:inline-flex; align-items:center; gap:8px; font-family:var(--mono); font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:var(--accent-deep); }
  .appt-eyebrow-dot { width:6px; height:6px; border-radius:50%; background:var(--accent); }
  .appt-title { font-family:var(--serif); font-size:clamp(40px,4.4vw,60px); line-height:1.02; letter-spacing:-0.025em; color:var(--ink); margin-top:4px; font-weight:400; }
  .appt-title em { font-style:italic; color:var(--accent-deep); }
  .appt-lede { font-size:15px; color:var(--ink-soft); line-height:1.55; max-width:540px; }

  .appt-grid { display:grid; grid-template-columns:1.5fr 1fr; gap:20px; align-items:start; }

  .appt-card {
    background:#fff; border:1px solid var(--line);
    border-radius:var(--r-lg); padding:32px;
    display:flex; flex-direction:column; gap:22px;
  }
  .appt-card-eyebrow { font-size:10px; font-family:var(--mono); letter-spacing:0.16em; color:var(--ink-mute); text-transform:uppercase; }

  .appt-step { display:flex; align-items:center; gap:10px; }
  .appt-step-num { width:26px; height:26px; border-radius:50%; background:var(--accent-tint); color:var(--accent-deep); display:inline-flex; align-items:center; justify-content:center; font-family:var(--mono); font-size:12px; font-weight:600; flex-shrink:0; }
  .appt-step-txt { font-size:11px; font-family:var(--mono); letter-spacing:0.16em; color:var(--ink-mute); text-transform:uppercase; }

  /* Step 1 */
  .appt-dyt-row { display:flex; gap:16px; align-items:center; padding:16px; border:1px solid var(--line); border-radius:var(--r-md); background:var(--bg-warm); }
  .appt-dyt-avatar { width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#C97B5C,#8E6A55); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:16px; font-weight:600; letter-spacing:0.04em; flex-shrink:0; font-family:var(--mono); }
  .appt-dyt-info { flex:1; min-width:0; display:flex; flex-direction:column; gap:4px; }
  .appt-dyt-name { font-size:18px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.01em; }
  .appt-dyt-meta { font-size:12px; color:var(--ink-mute); display:flex; gap:12px; flex-wrap:wrap; }
  .appt-dyt-meta span { display:inline-flex; align-items:center; gap:4px; }
  .appt-dyt-tag { background:var(--accent-tint); color:var(--accent-deep); font-size:11px; padding:5px 10px; border-radius:var(--r-pill); font-weight:600; }
  .appt-no-dyt { background:#fffbeb; border:1px solid #fde68a; border-radius:var(--r-md); padding:24px; text-align:center; }

  /* Step 2 — Calendar */
  .appt-cal-head { display:flex; justify-content:space-between; align-items:center; gap:8px; }
  .appt-cal-month { font-size:18px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.01em; font-weight:400; }
  .appt-cal-nav { display:flex; gap:6px; }
  .appt-cal-nav button { width:32px; height:32px; border-radius:8px; background:var(--bg-warm); border:1px solid var(--line); display:inline-flex; align-items:center; justify-content:center; color:var(--ink-soft); transition:all .2s; cursor:pointer; }
  .appt-cal-nav button:hover { border-color:var(--ink); color:var(--ink); }
  .appt-cal { display:grid; grid-template-columns:repeat(7,1fr); gap:4px; }
  .appt-cal-dow { font-size:10px; font-family:var(--mono); letter-spacing:0.12em; color:var(--ink-mute); text-align:center; padding:8px 0; }
  .appt-cal-day { aspect-ratio:1/1; border-radius:10px; background:transparent; border:1px solid transparent; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:14px; color:var(--ink); cursor:pointer; transition:all .2s; position:relative; }
  .appt-cal-day:hover:not(:disabled):not(.disabled) { background:var(--bg-warm); border-color:var(--line); }
  .appt-cal-day.other { color:var(--line); pointer-events:none; }
  .appt-cal-day.disabled { color:var(--line); cursor:not-allowed; text-decoration:line-through; }
  .appt-cal-day.today { font-weight:600; }
  .appt-cal-day.today::after { content:""; width:4px; height:4px; border-radius:50%; background:var(--accent); position:absolute; bottom:6px; }
  .appt-cal-day.has-slots { font-weight:500; }
  .appt-cal-day.has-slots .slot-mark { width:5px; height:5px; border-radius:50%; background:var(--accent); position:absolute; bottom:7px; }
  .appt-cal-day.active { background:var(--ink); color:#FBFAF5; border-color:var(--ink); }
  .appt-cal-day.active .slot-mark { background:var(--accent); }
  .appt-cal-day.active::after { background:var(--accent); }

  /* Step 3 — Slots */
  .appt-slots-empty { text-align:center; padding:24px; color:var(--ink-mute); font-size:14px; }
  .appt-times-head { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
  .appt-times-head h4 { font-size:16px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.01em; font-weight:400; }
  .appt-times-head span { font-size:12px; color:var(--ink-mute); font-family:var(--mono); }
  .appt-times-period { display:flex; flex-direction:column; gap:8px; margin-top:8px; }
  .appt-times-period-label { font-size:10px; font-family:var(--mono); letter-spacing:0.14em; color:var(--ink-mute); text-transform:uppercase; }
  .appt-time-grid { display:grid; grid-template-columns:repeat(6,1fr); gap:8px; }
  .appt-time { padding:10px 0; border-radius:10px; background:var(--bg-warm); border:1px solid var(--line); font-size:13px; font-family:var(--mono); color:var(--ink-soft); font-weight:500; cursor:pointer; transition:all .2s; text-align:center; }
  .appt-time:hover { border-color:var(--ink-soft); color:var(--ink); }
  .appt-time.active { background:var(--ink); color:#FBFAF5; border-color:var(--ink); }

  /* Step 4 — Notes */
  .appt-textarea { width:100%; min-height:90px; resize:vertical; background:var(--bg-warm); border:1px solid var(--line); border-radius:var(--r-md); padding:14px 16px; font-family:var(--sans); font-size:14px; color:var(--ink); outline:none; transition:all .2s; }
  .appt-textarea:focus { border-color:var(--accent); background:#fff; box-shadow:0 0 0 4px rgba(101,163,13,0.1); }
  .appt-textarea::placeholder { color:var(--ink-mute); }

  /* Summary */
  .appt-summary { background:#fff; border:1px solid var(--line); border-radius:var(--r-lg); padding:28px; display:flex; flex-direction:column; gap:20px; position:sticky; top:90px; }
  .appt-summary-head { display:flex; flex-direction:column; gap:6px; padding-bottom:18px; border-bottom:1px solid var(--line-soft); }
  .appt-summary-eyebrow { display:inline-flex; align-items:center; gap:6px; font-size:10px; color:var(--accent-deep); letter-spacing:0.14em; font-family:var(--mono); }
  .appt-summary-title { font-size:22px; font-family:var(--serif); letter-spacing:-0.01em; color:var(--ink); font-weight:400; }
  .appt-summary-rows { display:flex; flex-direction:column; gap:14px; }
  .appt-summary-row { display:grid; grid-template-columns:24px 1fr; gap:12px; align-items:flex-start; }
  .appt-summary-icon { width:24px; height:24px; border-radius:7px; background:var(--bg-warm); color:var(--ink-mute); display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; }
  .appt-summary-row.filled .appt-summary-icon { background:var(--accent-tint); color:var(--accent-deep); }
  .appt-summary-row > div { display:flex; flex-direction:column; gap:2px; min-width:0; }
  .appt-summary-lbl { font-size:10px; font-family:var(--mono); letter-spacing:0.12em; color:var(--ink-mute); text-transform:uppercase; }
  .appt-summary-val { font-size:14px; color:var(--ink); font-weight:500; }
  .appt-summary-val.empty { color:var(--ink-mute); font-weight:400; font-style:italic; }
  .appt-summary-cta { width:100%; padding:16px; background:var(--ink); color:#FBFAF5; border-radius:var(--r-pill); font-size:15px; font-weight:600; display:inline-flex; align-items:center; justify-content:center; gap:10px; transition:all .25s; cursor:pointer; border:none; }
  .appt-summary-cta:hover:not(:disabled) { background:var(--accent-deep); transform:translateY(-1px); box-shadow:0 12px 28px -10px rgba(77,124,15,0.55); }
  .appt-summary-cta:disabled { opacity:0.4; cursor:not-allowed; }
  .appt-summary-note { font-size:11px; color:var(--ink-mute); line-height:1.5; display:flex; gap:8px; align-items:flex-start; padding-top:14px; border-top:1px solid var(--line-soft); }
  .appt-summary-note svg { color:var(--accent-deep); flex-shrink:0; margin-top:1px; }

  /* List */
  .appt-list-section { margin-top:36px; }
  .appt-list-head { display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:16px; gap:16px; flex-wrap:wrap; }
  .appt-list-title { font-size:28px; font-family:var(--serif); letter-spacing:-0.015em; color:var(--ink); font-weight:400; }
  .appt-list-title em { font-style:italic; color:var(--accent-deep); }
  .appt-list-tabs { display:inline-flex; gap:4px; padding:4px; background:var(--bg-warm); border:1px solid var(--line); border-radius:var(--r-pill); }
  .appt-list-tab { padding:8px 16px; border-radius:var(--r-pill); font-size:13px; font-weight:600; color:var(--ink-soft); cursor:pointer; transition:all .2s; background:transparent; border:none; }
  .appt-list-tab.active { background:var(--ink); color:#FBFAF5; }
  .appt-list-empty-state { text-align:center; padding:60px 24px; color:var(--ink-mute); }
  .appt-list { display:flex; flex-direction:column; gap:10px; }
  .appt-list-item { display:grid; grid-template-columns:80px 1fr auto auto; gap:20px; align-items:center; background:#fff; border:1px solid var(--line); border-radius:var(--r-md); padding:18px 22px; transition:all .2s; }
  .appt-list-item:hover { border-color:var(--ink-soft); transform:translateY(-1px); box-shadow:0 1px 2px rgba(26,37,22,0.04),0 1px 3px rgba(26,37,22,0.06); }
  .appt-list-date { display:flex; flex-direction:column; align-items:center; gap:2px; padding:8px 0; background:var(--bg-warm); border-radius:var(--r-md); }
  .appt-list-month { font-size:10px; font-family:var(--mono); color:var(--accent-deep); letter-spacing:0.12em; }
  .appt-list-day { font-size:28px; font-family:var(--serif); color:var(--ink); letter-spacing:-0.02em; line-height:1; }
  .appt-list-time { font-size:11px; font-family:var(--mono); color:var(--ink-mute); }
  .appt-list-info { display:flex; flex-direction:column; gap:4px; min-width:0; }
  .appt-list-with { font-size:16px; font-weight:600; color:var(--ink); }
  .appt-list-meta { font-size:12px; color:var(--ink-mute); display:flex; gap:10px; flex-wrap:wrap; }
  .appt-list-status { font-size:11px; font-family:var(--mono); letter-spacing:0.1em; padding:5px 10px; border-radius:var(--r-pill); }
  .appt-list-status.active    { background:var(--accent-tint); color:var(--accent-deep); font-weight:600; }
  .appt-list-status.pending   { background:rgba(212,165,116,0.18); color:#8E6A55; }
  .appt-list-status.completed { background:var(--bg-warm); color:var(--ink-mute); }
  .appt-list-status.cancelled { background:rgba(201,123,92,0.12); color:var(--terracotta); }
  .appt-list-actions { display:flex; gap:6px; }
  .appt-action-btn { padding:8px 14px; border-radius:var(--r-pill); font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; border:1px solid; }
  .appt-action-btn.primary { background:var(--ink); color:#FBFAF5; border-color:var(--ink); }
  .appt-action-btn.primary:hover { background:var(--accent-deep); border-color:var(--accent-deep); }
  .appt-action-btn.outline { background:transparent; color:var(--ink-soft); border-color:var(--line); }
  .appt-action-btn.outline:hover { border-color:var(--ink); color:var(--ink); }

  @media (max-width:1100px) {
    .appt-grid { grid-template-columns:1fr; }
    .appt-summary { position:static; }
    .appt-time-grid { grid-template-columns:repeat(4,1fr); }
    .appt-list-item { grid-template-columns:70px 1fr; row-gap:12px; }
    .appt-list-status, .appt-list-actions { grid-column:2/-1; }
  }
  @media (max-width:760px) {
    .appt-body { padding:20px; }
    .appt-card { padding:20px; }
    .appt-time-grid { grid-template-columns:repeat(3,1fr); }
    .appt-cal-day { font-size:12px; }
  }
`;
