import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dietService from '../../services/dietService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT = { Monday: 'Pzt', Tuesday: 'Sal', Wednesday: 'Çar', Thursday: 'Per', Friday: 'Cum', Saturday: 'Cmt', Sunday: 'Paz' };
const DAY_FULL  = { Monday: 'Pazartesi', Tuesday: 'Salı', Wednesday: 'Çarşamba', Thursday: 'Perşembe', Friday: 'Cuma', Saturday: 'Cumartesi', Sunday: 'Pazar' };
const MEAL_TYPES = [
  { value: 'Breakfast', label: 'Kahvaltı' },
  { value: 'SnackAm',   label: 'Kuşluk'   },
  { value: 'Lunch',     label: 'Öğle'     },
  { value: 'SnackPM',   label: 'İkindi'   },
  { value: 'Dinner',    label: 'Akşam'    },
];
const mealLabel = v => MEAL_TYPES.find(t => t.value === v)?.label || v;

const makeWeek = n => ({ week_number: n, start_date: '', end_date: '', days: [] });
const makeDay  = d  => ({ day: d, meals: [] });
const makeMeal = t  => ({ meal_type: t, calories: '', protein: '', carbs: '', fat: '', items: [] });
const makeItem = () => ({ food_name: '', amount: '', unit: 'g' });

export default function DieticianDietPlanCreate() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();

  const [assignments,    setAssignments]    = useState([]);
  const [form,           setForm]           = useState({
    assignment:     params.get('assignment') || '',
    start_date:     '',
    end_date:       '',
    start_weight:   '',
    target_weight:  '',
    daily_calories: '',
    daily_protein:  '',
    daily_carbs:    '',
    daily_fat:      '',
    daily_water:    '',
  });
  const [weeks,          setWeeks]          = useState([]);
  const [activeWeekNum,  setActiveWeekNum]  = useState(null);
  const [selectedDay,    setSelectedDay]    = useState(null);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState('');
  const [success,        setSuccess]        = useState(false);

  useEffect(() => {
    dietService.getAssignments()
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data?.results || [];
        setAssignments(data.filter(a => a.status === 'InProgress'));
      })
      .catch(() => {});
  }, []);

  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Week ops ─────────────────────────────────────────
  const addWeek = () => {
    if (weeks.length >= 4) return;
    const n = weeks.length + 1;
    setWeeks(w => [...w, makeWeek(n)]);
    setActiveWeekNum(n);
    setSelectedDay(null);
  };

  const removeWeek = n => {
    setWeeks(w => w.filter(x => x.week_number !== n).map((x, i) => ({ ...x, week_number: i + 1 })));
    if (activeWeekNum === n) { setActiveWeekNum(null); setSelectedDay(null); }
    else if (activeWeekNum > n) setActiveWeekNum(a => a - 1);
  };

  const updateWeek = (n, k, v) =>
    setWeeks(w => w.map(x => x.week_number === n ? { ...x, [k]: v } : x));

  // ── Day ops ──────────────────────────────────────────
  const addDay = (wn, day) => {
    setWeeks(w => w.map(x => x.week_number === wn
      ? { ...x, days: [...x.days, makeDay(day)] }
      : x
    ));
    setSelectedDay(day);
  };

  const removeDay = (wn, day) => {
    setWeeks(w => w.map(x => x.week_number === wn
      ? { ...x, days: x.days.filter(d => d.day !== day) }
      : x
    ));
    if (selectedDay === day) setSelectedDay(null);
  };

  // ── Meal ops ─────────────────────────────────────────
  const addMeal = (wn, day, type) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: [...d.meals, makeMeal(type)]
      })
    }));

  const removeMeal = (wn, day, type) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: d.meals.filter(m => m.meal_type !== type)
      })
    }));

  const updateMeal = (wn, day, type, k, v) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: d.meals.map(m => m.meal_type !== type ? m : { ...m, [k]: v })
      })
    }));

  // ── Item ops ─────────────────────────────────────────
  const addItem = (wn, day, type) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: d.meals.map(m => m.meal_type !== type ? m : {
          ...m, items: [...m.items, makeItem()]
        })
      })
    }));

  const removeItem = (wn, day, type, idx) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: d.meals.map(m => m.meal_type !== type ? m : {
          ...m, items: m.items.filter((_, i) => i !== idx)
        })
      })
    }));

  const updateItem = (wn, day, type, idx, k, v) =>
    setWeeks(w => w.map(x => x.week_number !== wn ? x : {
      ...x, days: x.days.map(d => d.day !== day ? d : {
        ...d, meals: d.meals.map(m => m.meal_type !== type ? m : {
          ...m, items: m.items.map((it, i) => i !== idx ? it : { ...it, [k]: v })
        })
      })
    }));

  // ── Submit ───────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const payload = {
        assignment:     Number(form.assignment),
        start_date:     form.start_date    || undefined,
        end_date:       form.end_date      || undefined,
        start_weight:   Number(form.start_weight)  || undefined,
        target_weight:  Number(form.target_weight) || undefined,
        daily_calories: Number(form.daily_calories) || 0,
        daily_protein:  Number(form.daily_protein)  || 0,
        daily_carbs:    Number(form.daily_carbs)    || 0,
        daily_fat:      Number(form.daily_fat)      || 0,
        daily_water:    Number(form.daily_water)    || 0,
        weekly_plan: weeks.map(w => ({
          week_number: w.week_number,
          start_date:  w.start_date,
          end_date:    w.end_date,
          daily_plan:  w.days.map(d => ({
            day:   d.day,
            meals: d.meals.map(m => ({
              meal_type: m.meal_type,
              calories:  Number(m.calories) || 0,
              protein:   Number(m.protein)  || 0,
              carbs:     Number(m.carbs)    || 0,
              fat:       Number(m.fat)      || 0,
              meal_items: m.items.map(it => ({
                food_name: it.food_name,
                amount:    Number(it.amount),
                unit:      it.unit,
              })),
            })),
          })),
        })),
      };
      await dietService.createPlan(payload);
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      setError(typeof d === 'string' ? d : d?.detail || JSON.stringify(d) || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const currentWeek    = weeks.find(w => w.week_number === activeWeekNum);
  const currentDayData = currentWeek?.days.find(d => d.day === selectedDay);

  if (success) return (
    <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 24 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 28, color: '#1a7a42', marginBottom: 12 }}>Plan Oluşturuldu!</h2>
      <p  style={{ fontSize: 14, color: '#2d7a4a', marginBottom: 24 }}>Diyet planı başarıyla kaydedildi.</p>
      <button className="btn-primary" onClick={() => navigate('/dietician/clients')}>Danışanlara Dön</button>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, color: 'var(--forest)', marginBottom: 4 }}>
          Yeni Diyet Planı
        </h1>
        <p style={{ fontSize: 14, color: 'var(--ink-light)' }}>
          Danışanınız için haftalık beslenme takvimi oluşturun
        </p>
      </div>

      <PlanInfoCard form={form} setF={setF} assignments={assignments} />

      {/* Haftalık takvim */}
      <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, padding: '24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Haftalık Takvim</div>
            <div style={{ fontSize: 12, color: 'var(--ink-light)', marginTop: 2 }}>En fazla 4 hafta ekleyebilirsiniz</div>
          </div>
          {weeks.length < 4 && (
            <button
              onClick={addWeek}
              style={{ padding: '8px 18px', borderRadius: 10, border: 'none', background: 'var(--forest)', color: 'var(--parchment)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + Hafta Ekle
            </button>
          )}
        </div>

        {weeks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 24px', background: 'var(--parchment)', borderRadius: 16, border: '2px dashed var(--parchment-dark)' }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>📅</div>
            <p style={{ fontSize: 14, color: 'var(--ink-light)', marginBottom: 18 }}>
              Haftalık beslenme takvimi oluşturmak için başlayın
            </p>
            <button
              onClick={addWeek}
              style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: 'var(--forest)', color: 'var(--parchment)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              + İlk Haftayı Ekle
            </button>
          </div>
        ) : (
          <>
            {/* Hafta sekmeleri */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
              {weeks.map(w => {
                const active = activeWeekNum === w.week_number;
                return (
                  <div
                    key={w.week_number}
                    style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: `1.5px solid ${active ? 'var(--forest)' : 'var(--parchment-dark)'}` }}
                  >
                    <button
                      onClick={() => { setActiveWeekNum(w.week_number); setSelectedDay(null); }}
                      style={{
                        padding: '8px 16px', border: 'none',
                        background: active ? 'var(--forest)' : 'white',
                        color:      active ? 'var(--parchment)' : 'var(--ink-mid)',
                        fontSize: 13, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Hafta {w.week_number}
                      {w.days.length > 0 && (
                        <span style={{
                          marginLeft: 6, fontSize: 10,
                          background: active ? 'rgba(255,255,255,0.2)' : 'var(--parchment)',
                          borderRadius: 99, padding: '1px 6px',
                        }}>
                          {w.days.length}g
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => removeWeek(w.week_number)}
                      style={{
                        padding: '8px 10px', border: 'none',
                        borderLeft: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'var(--parchment-dark)'}`,
                        background: active ? 'var(--forest)' : 'white',
                        color: active ? 'rgba(255,255,255,0.6)' : 'var(--ink-light)',
                        fontSize: 11, cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            {currentWeek && (
              <>
                {/* Tarih aralığı */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hafta Başlangıcı</label>
                    <input
                      className="form-input" type="date"
                      value={currentWeek.start_date}
                      onChange={e => updateWeek(activeWeekNum, 'start_date', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Hafta Bitişi</label>
                    <input
                      className="form-input" type="date"
                      value={currentWeek.end_date}
                      onChange={e => updateWeek(activeWeekNum, 'end_date', e.target.value)}
                    />
                  </div>
                </div>

                {/* Takvim ızgarası */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: selectedDay ? 16 : 0 }}>
                  {DAYS.map(day => {
                    const dayData    = currentWeek.days.find(d => d.day === day);
                    const isActive   = !!dayData;
                    const isSelected = selectedDay === day;
                    const totalCal   = dayData?.meals.reduce((s, m) => s + (Number(m.calories) || 0), 0) || 0;

                    return (
                      <div key={day}>
                        <div style={{
                          textAlign: 'center', fontSize: 11, fontWeight: 700,
                          color: isActive ? 'var(--forest)' : 'var(--ink-light)',
                          textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6,
                        }}>
                          {DAY_SHORT[day]}
                        </div>

                        <div
                          onClick={() => {
                            if (!isActive) addDay(activeWeekNum, day);
                            else if (isSelected) setSelectedDay(null);
                            else setSelectedDay(day);
                          }}
                          style={{
                            minHeight: 108,
                            borderRadius: 12,
                            border: isSelected
                              ? '2px solid var(--forest)'
                              : isActive
                                ? '1.5px solid var(--parchment-dark)'
                                : '1.5px dashed #D5CFC4',
                            background: isSelected
                              ? 'rgba(45,90,39,0.05)'
                              : isActive ? 'white' : 'var(--parchment)',
                            cursor: 'pointer',
                            padding: isActive ? '8px 6px' : 0,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: isActive ? 'flex-start' : 'center',
                            gap: 3,
                            transition: 'all 0.15s',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {isActive ? (
                            <>
                              <button
                                onClick={e => { e.stopPropagation(); removeDay(activeWeekNum, day); }}
                                style={{
                                  position: 'absolute', top: 4, right: 4,
                                  background: 'none', border: 'none',
                                  cursor: 'pointer', fontSize: 9,
                                  color: 'var(--ink-light)', padding: '2px 3px',
                                  lineHeight: 1, borderRadius: 3, opacity: 0.6,
                                }}
                              >
                                ✕
                              </button>

                              {dayData.meals.length > 0 ? (
                                <>
                                  {dayData.meals.map(m => (
                                    <div key={m.meal_type} style={{
                                      width: '100%',
                                      padding: '2px 6px',
                                      background: isSelected ? 'rgba(45,90,39,0.12)' : 'var(--parchment)',
                                      borderRadius: 5,
                                      fontSize: 9,
                                      color: 'var(--forest)',
                                      fontWeight: 700,
                                      textAlign: 'center',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}>
                                      {mealLabel(m.meal_type)}
                                    </div>
                                  ))}
                                  {totalCal > 0 && (
                                    <div style={{ fontSize: 9, color: 'var(--ink-light)', fontWeight: 600, marginTop: 2 }}>
                                      {totalCal} kcal
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div style={{ fontSize: 10, color: 'var(--ink-light)', textAlign: 'center', padding: '10px 4px' }}>
                                  Öğün ekle
                                </div>
                              )}
                            </>
                          ) : (
                            <span style={{ fontSize: 22, color: 'var(--ink-light)', opacity: 0.35 }}>+</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Gün editörü */}
                {selectedDay && currentDayData && (
                  <DayEditorPanel
                    key={`${activeWeekNum}-${selectedDay}`}
                    dayData={currentDayData}
                    onAddMeal={type => addMeal(activeWeekNum, selectedDay, type)}
                    onRemoveMeal={type => removeMeal(activeWeekNum, selectedDay, type)}
                    onUpdateMeal={(type, k, v) => updateMeal(activeWeekNum, selectedDay, type, k, v)}
                    onAddItem={type => addItem(activeWeekNum, selectedDay, type)}
                    onRemoveItem={(type, idx) => removeItem(activeWeekNum, selectedDay, type, idx)}
                    onUpdateItem={(type, idx, k, v) => updateItem(activeWeekNum, selectedDay, type, idx, k, v)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          className="btn-ghost"
          onClick={() => navigate('/dietician/clients')}
          style={{ flex: 1 }}
        >
          İptal
        </button>
        <button
          className="btn-primary"
          onClick={handleSubmit}
          disabled={loading || !form.assignment || weeks.length === 0}
          style={{ flex: 2 }}
        >
          {loading ? 'Kaydediliyor...' : '✓ Diyet Planını Oluştur'}
        </button>
      </div>
    </div>
  );
}

function PlanInfoCard({ form, setF, assignments }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 20, marginBottom: 20, overflow: 'hidden' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 24px', cursor: 'pointer', borderBottom: open ? '1px solid var(--parchment-dark)' : 'none' }}
        onClick={() => setOpen(v => !v)}
      >
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Plan Bilgileri</div>
        <span style={{ fontSize: 12, color: 'var(--ink-light)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div style={{ padding: '20px 24px 24px' }}>
          <div className="form-group">
            <label className="form-label">Danışan (Aktif Atama)</label>
            <select className="form-select" value={form.assignment} onChange={e => setF('assignment', e.target.value)}>
              <option value="">Seçin...</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  Danışan #{a.client} — Atama #{a.id}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="form-group">
              <label className="form-label">Başlangıç Tarihi</label>
              <input className="form-input" type="date" value={form.start_date} onChange={e => setF('start_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Bitiş Tarihi</label>
              <input className="form-input" type="date" value={form.end_date} onChange={e => setF('end_date', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Başlangıç Kilosu (kg)</label>
              <input className="form-input" type="number" placeholder="ör. 80" value={form.start_weight} onChange={e => setF('start_weight', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Hedef Kilo (kg)</label>
              <input className="form-input" type="number" placeholder="ör. 72" value={form.target_weight} onChange={e => setF('target_weight', e.target.value)} />
            </div>
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            Günlük Hedefler
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            {[
              { k: 'daily_calories', label: 'Kalori',  unit: 'kcal' },
              { k: 'daily_protein',  label: 'Protein', unit: 'g'    },
              { k: 'daily_carbs',    label: 'Karb.',   unit: 'g'    },
              { k: 'daily_fat',      label: 'Yağ',     unit: 'g'    },
              { k: 'daily_water',    label: 'Su',      unit: 'L'    },
            ].map(({ k, label, unit }) => (
              <div key={k} className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: 11 }}>{label} ({unit})</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  placeholder="0"
                  value={form[k]}
                  onChange={e => setF(k, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DayEditorPanel({ dayData, onAddMeal, onRemoveMeal, onUpdateMeal, onAddItem, onRemoveItem, onUpdateItem }) {
  const usedTypes      = dayData.meals.map(m => m.meal_type);
  const availableTypes = MEAL_TYPES.filter(t => !usedTypes.includes(t.value));

  return (
    <div style={{
      border: '2px solid var(--forest)',
      borderRadius: 16,
      padding: '20px',
      background: 'rgba(45,90,39,0.02)',
      marginTop: 4,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: 'var(--forest)' }}>
          {DAY_FULL[dayData.day]}
        </div>
        {availableTypes.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {availableTypes.map(t => (
              <button
                key={t.value}
                onClick={() => onAddMeal(t.value)}
                style={{
                  padding: '6px 13px', borderRadius: 8,
                  border: '1.5px solid var(--forest)',
                  background: 'white', color: 'var(--forest)',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}
              >
                + {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {dayData.meals.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '28px', color: 'var(--ink-light)', fontSize: 13 }}>
          Yukarıdan öğün ekleyin
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {dayData.meals.map(m => (
            <MealCard
              key={m.meal_type}
              meal={m}
              onRemove={() => onRemoveMeal(m.meal_type)}
              onUpdate={(k, v) => onUpdateMeal(m.meal_type, k, v)}
              onAddItem={() => onAddItem(m.meal_type)}
              onRemoveItem={idx => onRemoveItem(m.meal_type, idx)}
              onUpdateItem={(idx, k, v) => onUpdateItem(m.meal_type, idx, k, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MealCard({ meal, onRemove, onUpdate, onAddItem, onRemoveItem, onUpdateItem }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--parchment-dark)', borderRadius: 12, padding: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{mealLabel(meal.meal_type)}</div>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: 'var(--ink-light)', cursor: 'pointer', fontSize: 14 }}>
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 14 }}>
        {[['calories', 'Kalori (kcal)'], ['protein', 'Protein (g)'], ['carbs', 'Karb. (g)'], ['fat', 'Yağ (g)']].map(([k, lbl]) => (
          <div key={k}>
            <div style={{ fontSize: 10, color: 'var(--ink-light)', fontWeight: 700, marginBottom: 4 }}>{lbl}</div>
            <input
              className="form-input"
              type="number"
              placeholder="0"
              value={meal[k]}
              onChange={e => onUpdate(k, e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
            />
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Besinler
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {meal.items.map((item, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 72px 72px 32px', gap: 7, alignItems: 'center' }}>
            <input
              className="form-input"
              placeholder="Besin adı"
              value={item.food_name}
              onChange={e => onUpdateItem(idx, 'food_name', e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
            />
            <input
              className="form-input"
              type="number"
              placeholder="Miktar"
              value={item.amount}
              onChange={e => onUpdateItem(idx, 'amount', e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
            />
            <input
              className="form-input"
              placeholder="Birim"
              value={item.unit}
              onChange={e => onUpdateItem(idx, 'unit', e.target.value)}
              style={{ padding: '6px 8px', fontSize: 12 }}
            />
            <button
              onClick={() => onRemoveItem(idx)}
              style={{
                background: 'none', border: '1px solid var(--parchment-dark)',
                borderRadius: 6, cursor: 'pointer', color: 'var(--ink-light)',
                height: 32, width: 32,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
              }}
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={onAddItem}
          style={{
            padding: '6px 12px', borderRadius: 8,
            border: '1px dashed var(--parchment-dark)',
            background: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--forest)', fontWeight: 600, textAlign: 'left',
          }}
        >
          + Besin Ekle
        </button>
      </div>
    </div>
  );
}
