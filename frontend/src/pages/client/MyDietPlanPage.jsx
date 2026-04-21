import { useState, useEffect } from 'react';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

const dayMap = { Monday: 'Pazartesi', Tuesday: 'Salı', Wednesday: 'Çarşamba', Thursday: 'Perşembe', Friday: 'Cuma', Saturday: 'Cumartesi', Sunday: 'Pazar' };
const mealTypeMap = { Breakfast: 'Kahvaltı', SnackAm: 'Kuşluk', Lunch: 'Öğle', SnackPM: 'İkindi', Dinner: 'Akşam' };
const mealIcons = { Breakfast: 'light_mode', SnackAm: 'local_cafe', Lunch: 'wb_sun', SnackPM: 'tapas', Dinner: 'dark_mode' };

export default function MyDietPlanPage() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedDay, setSelectedDay] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const data = await dietService.getDietPlans();
        const list = Array.isArray(data) ? data : data?.results || [];
        setPlans(list);
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

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  if (!activePlan) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-32 text-center">
        <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center text-outline-variant mb-6 shadow-inner">
          <span className="material-symbols-outlined text-4xl">inventory_2</span>
        </div>
        <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Henüz bir planınız yok.</h2>
        <p className="text-on-surface-variant max-w-md mx-auto leading-relaxed">Uzman bir diyetisyene başvurarak kişiselleştirilmiş klinik beslenme programınızı başlatın veya AI ile taslak plan oluşturun.</p>
      </div>
    );
  }

  const weeks = activePlan.weekly_plan || [];
  const currentWeek = weeks[selectedWeek];
  const days = currentWeek?.daily_plan || [];
  const currentDay = selectedDay !== null ? days.find((d) => d.day === selectedDay) : days[0];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-10">
        <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">KLİNİK BESLENME PROGRAMI</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">Diyet Planım</h1>
        <p className="text-lg text-on-surface-variant">
          {activePlan.client_name && <span className="font-bold text-on-surface">{activePlan.client_name}</span>} için hazırlanan günlük 
          <span className="font-bold text-primary ml-1">{activePlan.daily_calories || 0} kcal</span> hedefli metabolik plan.
        </p>
      </header>

      {/* Target Macros Bento */}
      <section className="bg-surface-container-low rounded-[2rem] p-6 mb-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Kalori', value: `${activePlan.daily_calories || 0}`, unit: 'KCAL', color: 'primary', icon: 'local_fire_department' },
            { label: 'Protein', value: `${activePlan.daily_protein || 0}`, unit: 'G', color: 'secondary', icon: 'fitness_center' },
            { label: 'Karbonhidrat', value: `${activePlan.daily_carbs || 0}`, unit: 'G', color: 'tertiary', icon: 'grain' },
            { label: 'Yağ', value: `${activePlan.daily_fat || 0}`, unit: 'G', color: 'error', icon: 'water_drop' },
          ].map((m) => (
            <div key={m.label} className="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center justify-center text-center ghost-border hover:shadow-md transition-shadow">
              <span className={`material-symbols-outlined text-${m.color} mb-2 bg-${m.color}-container/20 p-2 rounded-xl`}>{m.icon}</span>
              <p className="font-headline text-2xl font-black text-on-surface leading-none mb-1">{m.value}</p>
              <div className="flex gap-1 items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-outline">{m.label}</span>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">{m.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline Controls (Week & Day Pickers) */}
      <section className="mb-10 space-y-6">
        {weeks.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-2 mb-3">Zaman Çizelgesi</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {weeks.map((w, i) => (
                <button 
                  key={w.id} 
                  onClick={() => { setSelectedWeek(i); setSelectedDay(null); }}
                  className={`px-5 py-3 text-sm font-bold rounded-xl whitespace-nowrap transition-all border-2
                    ${selectedWeek === i 
                      ? 'bg-primary-container text-on-primary-container border-primary shadow-sm' 
                      : 'bg-surface-container-lowest text-on-surface-variant border-transparent hover:bg-surface-container-highest'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">calendar_view_week</span>
                    {w.week_number}. Hafta
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {days.length > 0 && (
          <div className="bg-surface-container-lowest rounded-2xl p-2 flex gap-1 overflow-x-auto no-scrollbar shadow-inner ghost-border">
            {days.map((d) => {
              const isSelected = (selectedDay || days[0]?.day) === d.day;
              return (
                <button 
                  key={d.day} 
                  onClick={() => setSelectedDay(d.day)}
                  className={`flex-1 min-w-[100px] py-3 px-2 text-sm font-bold rounded-xl whitespace-nowrap transition-all text-center
                    ${isSelected 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-on-surface-variant hover:bg-surface-container-highest'}`}
                >
                  {dayMap[d.day] || d.day}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Meals Timeline */}
      {currentDay && (
        <section>
          <div className="flex items-center justify-between mb-8 border-b border-outline-variant/30 pb-4">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">restaurant_menu</span>
              {dayMap[currentDay.day] || currentDay.day} <span className="text-outline font-medium">Programı</span>
            </h2>
            <div className="bg-surface-container-low px-4 py-2 rounded-xl font-bold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">local_fire_department</span>
              {currentDay.total_calories} kcal
            </div>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-outline-variant/30 before:via-outline-variant/30 before:to-transparent">
            {(currentDay.meals || []).map((meal, index) => {
              const iconName = mealIcons[meal.meal_type] || 'restaurant';
              return (
                <div key={meal.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Timeline Badge */}
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-container-lowest border-4 border-surface shadow-[0px_4px_16px_rgba(23,29,27,0.08)] shrink-0 z-10 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-2xl">{iconName}</span>
                  </div>
                  
                  {/* Meal Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2rem)] bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0px_12px_32px_rgba(23,29,27,0.04)] ghost-border hover:shadow-[0px_16px_40px_rgba(23,29,27,0.08)] transition-shadow">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className="font-headline text-xl font-bold text-on-surface">{mealTypeMap[meal.meal_type] || meal.meal_type}</h4>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-outline">Klinik Öğün</span>
                      </div>
                      <span className="bg-primary/10 text-primary font-bold px-3 py-1.5 rounded-xl text-sm whitespace-nowrap">
                        {meal.calories} kcal
                      </span>
                    </div>

                    {meal.items && meal.items.length > 0 ? (
                      <div className="space-y-3">
                        {meal.items.map((item) => (
                          <div key={item.id} className="flex flex-col bg-surface-container-low/50 hover:bg-surface-container-low rounded-2xl p-4 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                              <p className="font-bold text-sm text-on-surface">{item.food_name}</p>
                              <p className="text-xs font-bold text-on-surface-variant bg-surface-container-highest px-2 py-1 rounded-md shrink-0">
                                {item.amount} {item.unit}
                              </p>
                            </div>
                            <div className="flex gap-4 text-[10px] font-bold text-outline uppercase tracking-wider">
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>{item.protein}g P</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>{item.carbs}g K</span>
                              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-error"></span>{item.fat}g Y</span>
                              <span className="ml-auto text-primary">{item.calories} KCAL</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-outline italic py-4 text-center">Bu öğün için içerik eklenmemiş.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
