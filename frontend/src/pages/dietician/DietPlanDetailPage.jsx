import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

const dayMap = { Monday: 'Pazartesi', Tuesday: 'Salı', Wednesday: 'Çarşamba', Thursday: 'Perşembe', Friday: 'Cuma', Saturday: 'Cumartesi', Sunday: 'Pazar' };
const mealTypeMap = { Breakfast: 'Kahvaltı', SnackAm: 'Kuşluk', Lunch: 'Öğle', SnackPM: 'İkindi', Dinner: 'Akşam' };
const mealIcons = { Breakfast: 'light_mode', SnackAm: 'local_cafe', Lunch: 'wb_sun', SnackPM: 'tapas', Dinner: 'dark_mode' };

export default function DietPlanDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!plan) return (
    <div className="max-w-3xl mx-auto py-24 text-center">
      <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-6 text-outline">
        <span className="material-symbols-outlined text-4xl">inventory_2</span>
      </div>
      <p className="text-on-surface-variant font-headline font-bold text-xl mb-2">Program Bulunamadı</p>
    </div>
  );

  const weeks = plan.weekly_plan || [];
  const currentWeek = weeks[selectedWeek];
  const days = currentWeek?.daily_plan || [];
  const currentDay = selectedDay !== null ? days.find((d) => d.day === selectedDay) : days[0];

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-8 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span> Geri Dön
      </button>

      {/* Header */}
      <header className="mb-10 p-8 bg-surface-container-lowest rounded-[2.5rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 w-full">
          <div>
            <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">KLİNİK PROGRAM ÖZETİ</span>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-2">
              Danışan: {plan.client_name}
            </h1>
            <p className="text-lg text-on-surface-variant flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">local_fire_department</span> Günlük {plan.daily_calories} kcal Hedef
            </p>
          </div>
          <div className="flex gap-2">
            <span className="bg-surface-container-low px-4 py-2 rounded-xl text-sm font-bold text-on-surface-variant border border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">calendar_today</span> 
              {plan.duration ? `${plan.duration} Aylık` : 'Süre Belirtilmemiş'}
            </span>
          </div>
        </div>
      </header>

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
      {currentDay ? (
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
            {(currentDay.meals || []).map((meal) => {
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
      ) : (
        weeks.length === 0 && (
          <section className="text-center py-24 bg-surface-container-lowest rounded-[2rem] mt-8 ghost-border">
            <span className="material-symbols-outlined text-4xl text-outline mb-4">date_range</span>
            <p className="text-on-surface-variant font-headline font-semibold text-lg">Bu plan için henüz haftalık / günlük program oluşturulmamış.</p>
          </section>
        )
      )}
    </div>
  );
}
