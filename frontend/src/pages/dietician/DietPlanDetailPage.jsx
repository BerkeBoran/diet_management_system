import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineSun, HiOutlineMoon, HiOutlineFire } from 'react-icons/hi2';

const dayMap = { Monday: 'Pazartesi', Tuesday: 'Salı', Wednesday: 'Çarşamba', Thursday: 'Perşembe', Friday: 'Cuma', Saturday: 'Cumartesi', Sunday: 'Pazar' };
const mealTypeMap = { Breakfast: 'Kahvaltı', SnackAm: 'Kuşluk', Lunch: 'Öğle', SnackPM: 'İkindi', Dinner: 'Akşam' };

export default function DietPlanDetailPage() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const data = await dietService.getDietPlanDetail(id);
        setPlan(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchPlan();
  }, [id]);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!plan) return <div className="text-center py-20 text-slate-400">Plan bulunamadı.</div>;

  const weeks = plan.weekly_plan || [];
  const currentWeek = weeks[selectedWeek];
  const days = currentWeek?.daily_plan || [];
  const currentDay = selectedDay ? days.find((d) => d.day === selectedDay) : days[0];

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Plan Detayı</h1>
        <p className="text-slate-400 mt-1">{plan.client_name} • {plan.daily_calories} kcal/gün</p>
      </div>

      {weeks.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {weeks.map((w, i) => (
            <button key={w.id} onClick={() => { setSelectedWeek(i); setSelectedDay(null); }}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${selectedWeek === i ? 'bg-emerald-500 text-white' : 'glass text-slate-400 hover:text-white'}`}
            >{w.week_number}. Hafta</button>
          ))}
        </div>
      )}

      {days.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button key={d.day} onClick={() => setSelectedDay(d.day)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${(selectedDay || days[0]?.day) === d.day ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'glass text-slate-400 hover:text-white'}`}
            >{dayMap[d.day] || d.day}</button>
          ))}
        </div>
      )}

      {currentDay && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-white">{dayMap[currentDay.day]}</h3>
            <span className="text-sm text-slate-400">{currentDay.total_calories} kcal</span>
          </div>
          {(currentDay.meals || []).map((meal) => {
            const MealIcon = meal.meal_type === 'Breakfast' ? HiOutlineSun : meal.meal_type === 'Dinner' ? HiOutlineMoon : HiOutlineFire;
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
                {meal.items?.length > 0 && (
                  <div className="space-y-2">
                    {meal.items.map((item) => (
                      <div key={item.id} className="flex justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
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

      {weeks.length === 0 && (
        <div className="text-center py-16 text-slate-400">Bu plan için henüz haftalık plan oluşturulmamış.</div>
      )}
    </div>
  );
}
