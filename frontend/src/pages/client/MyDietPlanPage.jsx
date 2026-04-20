import { useState, useEffect } from 'react';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineClipboardDocumentList, HiOutlineSun, HiOutlineMoon, HiOutlineFire } from 'react-icons/hi2';

const dayMap = { Monday: 'Pazartesi', Tuesday: 'Salı', Wednesday: 'Çarşamba', Thursday: 'Perşembe', Friday: 'Cuma', Saturday: 'Cumartesi', Sunday: 'Pazar' };
const mealTypeMap = { Breakfast: 'Kahvaltı', SnackAm: 'Kuşluk', Lunch: 'Öğle', SnackPM: 'İkindi', Dinner: 'Akşam' };
const mealIcons = { Breakfast: HiOutlineSun, Lunch: HiOutlineFire, Dinner: HiOutlineMoon };

export default function MyDietPlanPage() {
  const [activePlan, setActivePlan] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await dietService.getDietPlans();
        const list = Array.isArray(data) ? data : data?.results || [];
        const active = list.find((p) => p.status === 'Active') || list[0];
        if (active) {
          const detail = await dietService.getDietPlanDetail(active.id);
          setActivePlan(detail);
        }
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchPlans();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  if (!activePlan) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <HiOutlineClipboardDocumentList className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Henüz diyet planınız yok</h2>
        <p className="text-slate-400">Bir diyetisyene başvurarak veya AI ile plan oluşturabilirsiniz.</p>
      </div>
    );
  }

  const weeks = activePlan.weekly_plan || [];
  const currentWeek = weeks[selectedWeek];
  const days = currentWeek?.daily_plan || [];
  const currentDay = selectedDay !== null ? days.find((d) => d.day === selectedDay) : days[0];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Diyet Planım</h1>
        <p className="text-slate-400 mt-1">{activePlan.client_name && `${activePlan.client_name} için`} günlük {activePlan.daily_calories || 0} kcal hedef</p>
      </div>

      {/* Macro Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Kalori', value: `${activePlan.daily_calories || 0}`, unit: 'kcal', color: 'text-emerald-400 bg-emerald-500/10' },
          { label: 'Protein', value: `${activePlan.daily_protein || 0}`, unit: 'g', color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Karbonhidrat', value: `${activePlan.daily_carbs || 0}`, unit: 'g', color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Yağ', value: `${activePlan.daily_fat || 0}`, unit: 'g', color: 'text-rose-400 bg-rose-500/10' },
        ].map((m) => (
          <div key={m.label} className="glass rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color.split(' ')[0]}`}>{m.value}<span className="text-sm font-normal text-slate-500 ml-1">{m.unit}</span></p>
          </div>
        ))}
      </div>

      {/* Week Selector */}
      {weeks.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weeks.map((w, i) => (
            <button key={w.id} onClick={() => { setSelectedWeek(i); setSelectedDay(null); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${selectedWeek === i ? 'bg-emerald-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
            >
              {w.week_number}. Hafta
            </button>
          ))}
        </div>
      )}

      {/* Day Selector */}
      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button key={d.day} onClick={() => setSelectedDay(d.day)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${(selectedDay || days[0]?.day) === d.day ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-slate-400 hover:text-white'}`}
            >
              {dayMap[d.day] || d.day}
            </button>
          ))}
        </div>
      )}

      {/* Meals */}
      {currentDay && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">{dayMap[currentDay.day] || currentDay.day}</h3>
            <span className="text-sm text-slate-400">{currentDay.total_calories} kcal</span>
          </div>

          {(currentDay.meals || []).map((meal) => {
            const MealIcon = mealIcons[meal.meal_type] || HiOutlineFire;
            return (
              <div key={meal.id} className="glass rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <MealIcon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-sm">{mealTypeMap[meal.meal_type] || meal.meal_type}</h4>
                    <p className="text-xs text-slate-500">{meal.calories} kcal</p>
                  </div>
                </div>

                {meal.items && meal.items.length > 0 && (
                  <div className="space-y-2">
                    {meal.items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
                        <div>
                          <p className="text-sm text-white">{item.food_name}</p>
                          <p className="text-xs text-slate-500">{item.amount} {item.unit}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">{item.calories} kcal</p>
                          <p className="text-xs text-slate-500">P:{item.protein}g K:{item.carbs}g Y:{item.fat}g</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
