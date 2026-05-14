import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../../services/appointmentService';
import userService from '../../services/userService';

const TODAY = new Date().toISOString().split('T')[0];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAY_SHORT = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];

// ── Zaman yardımcıları ───────────────────────────────────────
const toMin = t => {
  if (!t) return 0;
  const [h, m] = t.split(':');
  return Number(h) * 60 + Number(m);
};
const fmtTime = min =>
  `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;

const fmtDate = d => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const getMondayOf = dateStr => {
  const d = new Date(dateStr + 'T00:00');
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return fmtDate(d);
};

const getWeekDates = mondayStr =>
  Array.from({ length: 7 }, (_, i) => {
    const d = new Date(mondayStr + 'T00:00');
    d.setDate(d.getDate() + i);
    return fmtDate(d);
  });

// ── Slot üretici ─────────────────────────────────────────────
const generateSlots = (startMin, endMin, duration) => {
  const slots = [];
  for (let cur = startMin; cur + duration <= endMin; cur += duration) {
    slots.push({ startMin: cur, endMin: cur + duration });
  }
  return slots;
};

// dowIndex: 0=Pzt … 5=Cmt, 6=Paz
const getDayConfig = (dowIdx, schedule) => {
  const isWeekend = dowIdx >= 5;
  if (isWeekend && !schedule.weekend_workings) return null;
  const startMin = toMin(isWeekend ? schedule.weekend_work_time_start : schedule.work_time_start);
  const endMin   = toMin(isWeekend ? schedule.weekend_work_time_end   : schedule.work_time_end);
  return { startMin, endMin, slots: generateSlots(startMin, endMin, schedule.appointment_duration) };
};

// ── Slot durumu ───────────────────────────────────────────────
const getSlotStatus = (date, startMin, endMin, appointments, unavailabilities) => {
  const block = unavailabilities.find(u => {
    if (u.date !== date) return false;
    if (u.is_full_day) return true;
    return toMin(u.start_time) < endMin && toMin(u.end_time) > startMin;
  });
  const appt = appointments.find(a => {
    if (a.date !== date || a.status === 'CANCELED') return false;
    return toMin(a.start_time) === startMin;
  });
  if (appt)  return { type: 'appointment', data: appt };
  if (block) return { type: 'blocked',     data: block };
  return { type: 'available' };
};

const statusLabel = s => ({ PENDING:'Bekliyor', CONFIRMED:'Onaylı', COMPLETED:'Tamamlandı', CANCELED:'İptal' }[s] || s);
const statusBg    = s => ({ PENDING:'#f59e0b',  CONFIRMED:'#10b981', COMPLETED:'#6b7280',   CANCELED:'#ef4444' }[s] || '#6b7280');

// ── Ana bileşen ───────────────────────────────────────────────
export default function DieticianAvailability() {
  const [schedule,         setSchedule]         = useState(null);
  const [scheduleErr,      setScheduleErr]      = useState(false);
  const [appointments,     setAppointments]     = useState([]);
  const [unavailabilities, setUnavailabilities] = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [weekStart,        setWeekStart]        = useState(getMondayOf(TODAY));
  const [selectedSlot,     setSelectedSlot]     = useState(null);
  const [reason,           setReason]           = useState('');
  const [saving,           setSaving]           = useState(false);
  const [error,            setError]            = useState('');

  const load = useCallback(async () => {
    const [s, a, u] = await Promise.allSettled([
      userService.getSchedule(),
      appointmentService.getAppointments(),
      appointmentService.getUnavailabilities(),
    ]);

    if (s.status === 'fulfilled') {
      const d = s.value.data;
      const item = Array.isArray(d) ? d[0] : d;
      if (item?.work_time_start) { setSchedule(item); setScheduleErr(false); }
      else setScheduleErr(true);
    } else setScheduleErr(true);

    if (a.status === 'fulfilled') {
      const d = a.value.data;
      setAppointments(Array.isArray(d) ? d : d?.results || []);
    }
    if (u.status === 'fulfilled') {
      const d = u.value.data;
      setUnavailabilities(Array.isArray(d) ? d : d?.results || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Navigasyon ────────────────────────────────────────────
  const shiftWeek = n => {
    const d = new Date(weekStart + 'T00:00');
    d.setDate(d.getDate() + n * 7);
    setWeekStart(fmtDate(d));
    setSelectedSlot(null);
  };

  // ── Slot tıklama ──────────────────────────────────────────
  const handleSlotClick = (date, startMin, endMin) => {
    const status = getSlotStatus(date, startMin, endMin, appointments, unavailabilities);
    if (status.type === 'appointment') {
      setSelectedSlot({ date, startMin, endMin, status });
      return;
    }
    setSelectedSlot({ date, startMin, endMin, status });
    setReason('');
    setError('');
  };

  // ── Slot kapat ────────────────────────────────────────────
  const handleBlock = async () => {
    if (!selectedSlot) return;
    setSaving(true); setError('');
    try {
      await appointmentService.createUnavailability({
        date:       selectedSlot.date,
        reason:     reason || 'Kapalı',
        is_full_day: false,
        start_time: fmtTime(selectedSlot.startMin) + ':00',
        end_time:   fmtTime(selectedSlot.endMin)   + ':00',
      });
      setSelectedSlot(null);
      setReason('');
      await load();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' ') || 'Bir hata oluştu.');
    } finally { setSaving(false); }
  };

  // ── Günü tamamen kapat ────────────────────────────────────
  const handleBlockDay = async date => {
    setSaving(true); setError('');
    try {
      await appointmentService.createUnavailability({
        date, reason: 'Gün kapalı', is_full_day: true,
        start_time: '00:00:00', end_time: '23:59:00',
      });
      setSelectedSlot(null);
      await load();
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : Object.values(d || {}).flat().join(' ') || 'Bir hata oluştu.');
    } finally { setSaving(false); }
  };

  // ── Kapatmayı sil ─────────────────────────────────────────
  const handleUnblock = async id => {
    setUnavailabilities(u => u.filter(x => x.id !== id));
    setSelectedSlot(null);
    try { await appointmentService.deleteUnavailability(id); }
    catch { await load(); }
  };

  // ── Türetilmiş veriler ────────────────────────────────────
  const weekDates  = getWeekDates(weekStart);
  const dayConfigs = weekDates.map((_, i) => schedule ? getDayConfig(i, schedule) : null);

  // Tüm çalışma dakikası başlangıçlarını birleştir
  const allStartMins = [...new Set(
    dayConfigs.flatMap(cfg => cfg ? cfg.slots.map(s => s.startMin) : [])
  )].sort((a, b) => a - b);

  const weekLabel = () => {
    const s = new Date(weekStart + 'T00:00');
    const e = new Date(weekStart + 'T00:00'); e.setDate(e.getDate() + 6);
    const sm = MONTHS[s.getMonth()], em = MONTHS[e.getMonth()];
    return s.getMonth() === e.getMonth()
      ? `${s.getDate()} - ${e.getDate()} ${sm} ${s.getFullYear()}`
      : `${s.getDate()} ${sm} - ${e.getDate()} ${em} ${e.getFullYear()}`;
  };

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}>
      <div className="spinner" />
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:30, color:'var(--forest)', marginBottom:4 }}>
          Müsaitlik Yönetimi
        </h1>
        <p style={{ fontSize:14, color:'var(--ink-light)' }}>
          Çalışma saatlerinize tıklayarak o dilimi kapatın veya açın
        </p>
      </div>

      {scheduleErr && (
        <div style={{ background:'#fef3c7', border:'1px solid #f59e0b', borderRadius:12, padding:'12px 16px', marginBottom:20, fontSize:13, color:'#92400e' }}>
          ⚠️ Çalışma programı yüklenemedi. Lütfen Profil sayfasından çalışma saatlerinizi ayarlayın.
        </div>
      )}

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:12, padding:'12px 16px', marginBottom:16, fontSize:13, color:'#dc2626' }}>
          {error}
        </div>
      )}

      {/* Hafta navigasyonu */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => shiftWeek(-1)} style={navBtn}>‹</button>
          <span style={{ fontFamily:'var(--font-serif)', fontSize:17, color:'var(--forest)' }}>{weekLabel()}</span>
          <button onClick={() => shiftWeek(1)}  style={navBtn}>›</button>
        </div>
        <button
          onClick={() => { setWeekStart(getMondayOf(TODAY)); setSelectedSlot(null); }}
          style={{ padding:'7px 16px', borderRadius:8, border:'1.5px solid var(--forest)', background:'white', color:'var(--forest)', fontSize:13, fontWeight:600, cursor:'pointer' }}
        >
          Bugün
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16, alignItems:'start' }}>

        {/* ── Saat-Gün takvim ───────────────────────────── */}
        <div style={{ background:'white', border:'1px solid var(--parchment-dark)', borderRadius:20, overflow:'hidden' }}>

          {/* Başlık satırı */}
          <div style={{ display:'grid', gridTemplateColumns:`52px repeat(7, 1fr)`, borderBottom:'2px solid var(--parchment-dark)', position:'sticky', top:0, background:'white', zIndex:2 }}>
            <div /> {/* zaman etiketi sütunu boşluğu */}
            {weekDates.map((date, idx) => {
              const dayNum = parseInt(date.split('-')[2], 10);
              const isToday = date === TODAY;
              const isPast  = date < TODAY;
              const cfg     = dayConfigs[idx];
              const fullBlocked = unavailabilities.some(u => u.date === date && u.is_full_day);

              return (
                <div key={date} style={{
                  padding:'10px 6px 8px',
                  textAlign:'center',
                  borderLeft:'1px solid var(--parchment-dark)',
                  background: fullBlocked ? 'rgba(239,68,68,0.04)' : 'white',
                }}>
                  <div style={{ fontSize:10, fontWeight:700, color: isToday ? 'var(--forest)' : 'var(--ink-light)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:3 }}>
                    {DAY_SHORT[idx]}
                  </div>
                  <div style={{
                    width:28, height:28, borderRadius:'50%',
                    background: isToday ? 'var(--forest)' : 'transparent',
                    color: isToday ? 'white' : isPast ? 'var(--ink-light)' : 'var(--ink)',
                    fontSize:13, fontWeight: isToday ? 700 : 500,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    margin:'0 auto 6px',
                  }}>
                    {dayNum}
                  </div>

                  {/* Günü kapat / Günü aç butonu */}
                  {cfg && !isPast && (
                    fullBlocked ? (
                      <button
                        onClick={() => {
                          const u = unavailabilities.find(x => x.date === date && x.is_full_day);
                          if (u) handleUnblock(u.id);
                        }}
                        style={dayBtn('#16a34a', '#bbf7d0')}
                      >
                        Günü Aç
                      </button>
                    ) : (
                      <button onClick={() => handleBlockDay(date)} disabled={saving} style={dayBtn('#dc2626', '#fca5a5')}>
                        Günü Kapat
                      </button>
                    )
                  )}
                  {!cfg && <div style={{ fontSize:9, color:'var(--ink-light)', marginTop:4 }}>tatil</div>}
                  {cfg && isPast && <div style={{ fontSize:9, color:'var(--ink-light)', marginTop:4 }}>geçmiş</div>}
                </div>
              );
            })}
          </div>

          {/* Slot satırları */}
          {!schedule ? (
            <div style={{ padding:'48px', textAlign:'center', color:'var(--ink-light)', fontSize:13 }}>
              Çalışma programı tanımlanmamış
            </div>
          ) : allStartMins.length === 0 ? (
            <div style={{ padding:'48px', textAlign:'center', color:'var(--ink-light)', fontSize:13 }}>
              Bu hafta için çalışma saati bulunamadı
            </div>
          ) : (
            <div style={{ overflowY:'auto', maxHeight:560 }}>
              {allStartMins.map(startMin => {
                const endMin = startMin + schedule.appointment_duration;
                return (
                  <div
                    key={startMin}
                    style={{ display:'grid', gridTemplateColumns:`52px repeat(7, 1fr)`, borderBottom:'1px solid var(--parchment-dark)' }}
                  >
                    {/* Zaman etiketi */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', padding:'0 8px', borderRight:'1px solid var(--parchment-dark)' }}>
                      <span style={{ fontSize:10, color:'var(--ink-light)', fontWeight:600, fontFamily:'monospace', whiteSpace:'nowrap' }}>
                        {fmtTime(startMin)}
                      </span>
                    </div>

                    {/* Gün hücreleri */}
                    {weekDates.map((date, dayIdx) => {
                      const cfg     = dayConfigs[dayIdx];
                      const isPast  = date < TODAY;
                      const fullBlocked = unavailabilities.some(u => u.date === date && u.is_full_day);
                      const inRange = cfg && startMin >= cfg.startMin && endMin <= cfg.endMin;

                      // Çalışma saati dışı
                      if (!inRange) return (
                        <div key={date} style={{ borderLeft:'1px solid var(--parchment-dark)', background:'#f9f8f4', minHeight:34 }} />
                      );

                      // Tam gün kapalı
                      if (fullBlocked) return (
                        <div
                          key={date}
                          onClick={() => {
                            const u = unavailabilities.find(x => x.date === date && x.is_full_day);
                            if (u) setSelectedSlot({ date, startMin, endMin, status:{ type:'blocked', data:u } });
                          }}
                          style={{
                            borderLeft:'1px solid var(--parchment-dark)',
                            minHeight:34,
                            cursor:'pointer',
                            background:'repeating-linear-gradient(45deg, rgba(239,68,68,0.09) 0px, rgba(239,68,68,0.09) 4px, transparent 4px, transparent 12px)',
                          }}
                        />
                      );

                      const status = getSlotStatus(date, startMin, endMin, appointments, unavailabilities);
                      const isSel  = selectedSlot?.date === date && selectedSlot?.startMin === startMin;

                      return (
                        <SlotCell
                          key={date}
                          status={status}
                          isPast={isPast}
                          isSelected={isSel}
                          onClick={() => !isPast && handleSlotClick(date, startMin, endMin)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Yan panel ──────────────────────────────────── */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {selectedSlot ? (
            <SlotPanel
              slot={selectedSlot}
              reason={reason}
              setReason={setReason}
              onBlock={handleBlock}
              onUnblock={handleUnblock}
              saving={saving}
              error={error}
            />
          ) : (
            <div style={{ background:'white', border:'1px solid var(--parchment-dark)', borderRadius:20, padding:'44px 24px', textAlign:'center' }}>
              <div style={{ fontSize:40, marginBottom:12 }}>🕐</div>
              <div style={{ fontSize:14, fontWeight:600, color:'var(--ink)', marginBottom:6 }}>Saat seçin</div>
              <p style={{ fontSize:12, color:'var(--ink-light)' }}>
                Takvimden bir saate tıklayarak kapatın, açın veya randevu bilgisi görün
              </p>
            </div>
          )}

          {/* Lejant */}
          <div style={{ background:'white', border:'1px solid var(--parchment-dark)', borderRadius:16, padding:'14px 16px' }}>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--ink-light)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:10 }}>Renk Açıklaması</div>
            {[
              { bg:'white', bd:'1px solid var(--parchment-dark)', label:'Müsait — tıklayarak kapat' },
              { bg:'rgba(59,130,246,0.15)', label:'Randevu var' },
              { bg:'repeating-linear-gradient(45deg,rgba(239,68,68,0.12) 0,rgba(239,68,68,0.12) 4px,transparent 4px,transparent 12px)', label:'Kapalı — tıklayarak aç' },
              { bg:'#f9f8f4', label:'Çalışma saati dışı' },
            ].map(({ bg, bd, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                <div style={{ width:16, height:16, borderRadius:3, background:bg, border:bd||'none', flexShrink:0 }} />
                <span style={{ fontSize:11, color:'var(--ink)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Slot hücresi ─────────────────────────────────────────────
function SlotCell({ status, isPast, isSelected, onClick }) {
  const bg = (() => {
    if (isSelected && status.type === 'available') return 'rgba(45,90,39,0.08)';
    if (status.type === 'appointment') return 'rgba(59,130,246,0.12)';
    if (status.type === 'blocked')     return 'rgba(239,68,68,0.08)';
    if (isPast) return '#fafaf8';
    return 'white';
  })();

  return (
    <div
      onClick={onClick}
      style={{
        borderLeft:'1px solid var(--parchment-dark)',
        minHeight:34,
        background:bg,
        cursor: isPast || status.type === 'appointment' ? 'default' : 'pointer',
        outline: isSelected ? '2px solid var(--forest)' : 'none',
        outlineOffset:'-2px',
        display:'flex', alignItems:'center', justifyContent:'center',
        position:'relative',
        transition:'background 0.1s',
      }}
    >
      {status.type === 'blocked' && (
        <div style={{
          position:'absolute', inset:0,
          background:'repeating-linear-gradient(45deg, rgba(239,68,68,0.12) 0px, rgba(239,68,68,0.12) 3px, transparent 3px, transparent 9px)',
        }} />
      )}
      {status.type === 'appointment' && (
        <span style={{ fontSize:9, color:'#1d4ed8', fontWeight:700, padding:'1px 4px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'95%', position:'relative', zIndex:1 }}>
          {status.data.client_name || 'Rdv'}
        </span>
      )}
    </div>
  );
}

// ── Saat paneli ──────────────────────────────────────────────
function SlotPanel({ slot, reason, setReason, onBlock, onUnblock, saving, error }) {
  const d = new Date(slot.date + 'T00:00');
  const dateLabel = d.toLocaleDateString('tr-TR', { weekday:'long', day:'numeric', month:'long' });
  const timeLabel = `${fmtTime(slot.startMin)} – ${fmtTime(slot.endMin)}`;

  return (
    <div style={{ background:'white', border:'1px solid var(--parchment-dark)', borderRadius:20, padding:'20px' }}>
      <div style={{ fontFamily:'var(--font-serif)', fontSize:15, color:'var(--forest)', marginBottom:2 }}>{dateLabel}</div>
      <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)', marginBottom:16 }}>{timeLabel}</div>

      {error && (
        <div style={{ background:'#fef2f2', border:'1px solid #fca5a5', borderRadius:8, padding:'8px 12px', marginBottom:12, fontSize:12, color:'#dc2626' }}>
          {error}
        </div>
      )}

      {slot.status.type === 'available' && (
        <>
          <div className="form-group">
            <label className="form-label" style={{ fontSize:12 }}>Sebep (opsiyonel)</label>
            <input
              className="form-input"
              type="text"
              placeholder="ör. Toplantı, İzin..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={onBlock} disabled={saving} style={{ width:'100%' }}>
            {saving ? 'Kaydediliyor...' : '🔒 Bu Saati Kapat'}
          </button>
        </>
      )}

      {slot.status.type === 'blocked' && (
        <>
          <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'10px 12px', marginBottom:14 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'#dc2626', marginBottom:2 }}>
              {slot.status.data.is_full_day ? 'Tüm Gün Kapalı' : 'Kapalı Saat'}
            </div>
            {slot.status.data.reason && (
              <div style={{ fontSize:12, color:'var(--ink-light)' }}>{slot.status.data.reason}</div>
            )}
            {!slot.status.data.is_full_day && (
              <div style={{ fontSize:11, color:'var(--ink-light)', marginTop:4 }}>
                {slot.status.data.start_time?.slice(0,5)} – {slot.status.data.end_time?.slice(0,5)}
              </div>
            )}
          </div>
          <button
            onClick={() => onUnblock(slot.status.data.id)}
            disabled={saving}
            style={{ width:'100%', padding:'9px', borderRadius:8, border:'1.5px solid #fca5a5', background:'none', color:'#dc2626', fontSize:13, fontWeight:600, cursor:'pointer' }}
          >
            {saving ? '...' : '🔓 Bu Saati Aç'}
          </button>
        </>
      )}

      {slot.status.type === 'appointment' && (
        <div style={{ background:'rgba(59,130,246,0.06)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:10, padding:'12px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#1d4ed8', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Randevu</div>
          <div style={{ fontSize:14, fontWeight:700, color:'var(--ink)', marginBottom:4 }}>
            {slot.status.data.client_name || `Danışan #${slot.status.data.client}`}
          </div>
          {slot.status.data.notes && (
            <div style={{ fontSize:12, color:'var(--ink-light)', marginBottom:8 }}>{slot.status.data.notes}</div>
          )}
          <span style={{ fontSize:10, fontWeight:700, color:'white', background:statusBg(slot.status.data.status), borderRadius:4, padding:'2px 7px' }}>
            {statusLabel(slot.status.data.status)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Stil sabitleri ───────────────────────────────────────────
const navBtn = {
  background:'none', border:'1px solid var(--parchment-dark)', borderRadius:8,
  width:32, height:32, cursor:'pointer', fontSize:18, color:'var(--ink-mid)',
  display:'flex', alignItems:'center', justifyContent:'center', lineHeight:1,
};

const dayBtn = (color, borderColor) => ({
  fontSize:9, padding:'2px 6px', borderRadius:4,
  border:`1px solid ${borderColor}`, background:'none',
  color, cursor:'pointer', fontWeight:700,
});
