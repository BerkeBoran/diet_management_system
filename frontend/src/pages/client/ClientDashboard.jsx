import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, assignRes] = await Promise.allSettled([
          dietService.getDietPlans(),
          dietService.getAssignments(),
        ]);
        if (plansRes.status === 'fulfilled') setPlans(Array.isArray(plansRes.value) ? plansRes.value : plansRes.value?.results || []);
        if (assignRes.status === 'fulfilled') setAssignments(Array.isArray(assignRes.value) ? assignRes.value : assignRes.value?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const activePlan = plans.find((p) => p.status === 'Active');
  const activeAssignment = assignments.find((a) => a.status === 'InProgress');

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      {/* Header - Editorial Greeting */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">Metabolik Panel</span>
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">
            Merhaba, {user?.first_name || user?.full_name?.split(' ')[0] || 'Kullanıcı'}.
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/ai-diet" className="px-5 py-2.5 rounded-full bg-surface-container-highest text-on-surface-variant font-headline font-bold text-sm hover:bg-surface-variant transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">auto_awesome</span> AI Analiz
          </Link>
          <Link to="/chat" className="px-5 py-2.5 rounded-full gradient-primary text-white font-headline font-bold text-sm shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-95 transition-transform flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">chat</span> Uzmanına Danış
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Diet & Macros */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Main Active Plan Summary Bento Card */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h3 className="font-headline text-xl font-bold text-on-surface mb-1">Günlük Hedefler</h3>
                <p className="text-sm text-on-surface-variant">
                  {activePlan ? 'Aktif diyet planınız devrede.' : 'Şu an aktif bir diyet planınız bulunmuyor.'}
                </p>
              </div>
              {activePlan && (
                <Link to="/my-diet" className="text-primary hover:bg-primary-container/10 p-2 rounded-xl transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
              {/* Circular Progress (Calories) */}
              <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-surface-container-highest" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="40" className="stroke-primary" strokeWidth="8" fill="none" strokeDasharray="251.2" strokeDashoffset={activePlan ? "60" : "251.2"} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline text-3xl font-extrabold text-on-surface">{activePlan?.daily_calories || 0}</span>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">KCAL / GÜN</span>
                </div>
              </div>

              {/* Macro Bars */}
              <div className="flex-1 w-full space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-headline font-bold text-on-surface">Protein</span>
                    <span className="font-bold text-on-surface-variant">{activePlan?.daily_protein || 0}g</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: activePlan ? '40%' : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-headline font-bold text-on-surface">Karbonhidrat</span>
                    <span className="font-bold text-on-surface-variant">{activePlan?.daily_carbs || 0}g</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2.5">
                    <div className="bg-secondary h-2.5 rounded-full" style={{ width: activePlan ? '45%' : '0%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-headline font-bold text-on-surface">Yağ</span>
                    <span className="font-bold text-on-surface-variant">{activePlan?.daily_fat || 0}g</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2.5">
                    <div className="bg-tertiary h-2.5 rounded-full" style={{ width: activePlan ? '25%' : '0%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Appointment / Expert Card */}
          <section className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-[0px_16px_40px_rgba(0,104,86,0.25)]">
            <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-tl-[100px] -mr-8 -mb-8"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="material-symbols-outlined text-3xl text-white">psychology</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold mb-1">Diyetisyeniniz</h3>
                  <p className="text-white/80 font-medium">
                    {activeAssignment?.dietician_detail?.first_name 
                      ? `Uzm. Dyt. ${activeAssignment.dietician_detail.first_name} ${activeAssignment.dietician_detail.last_name || ''}`
                      : 'Henüz bir uzmana atanmadınız.'}
                  </p>
                </div>
              </div>
              <Link 
                to={activeAssignment ? "/chat" : "/dieticians"} 
                className="bg-white text-primary px-6 py-3 rounded-full font-headline font-bold hover:scale-95 transition-transform whitespace-nowrap"
              >
                {activeAssignment ? 'Mesaj Gönder' : 'Uzman Bul'}
              </Link>
            </div>
          </section>

        </div>

        {/* Right Column: Quick Stats & Navigation */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-secondary-container/30 text-on-secondary-container rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
              </div>
              <span className="font-headline text-2xl font-black text-on-surface">{plans.length}</span>
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Toplam Plan</span>
            </div>
            
            <Link to="/appointments" className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] flex flex-col items-center justify-center text-center hover:bg-surface-container-highest transition-colors">
              <div className="w-12 h-12 bg-tertiary-container/30 text-on-tertiary-container rounded-full flex items-center justify-center mb-3">
                <span className="material-symbols-outlined shrink-0">event</span>
              </div>
              <span className="font-headline text-lg font-bold text-on-surface mb-0.5">Randevu</span>
              <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Oluştur</span>
            </Link>
          </div>

          <div className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0px_12px_32px_rgba(23,29,27,0.06)]">
            <h3 className="font-headline font-bold text-lg mb-4">Hızlı Seçenekler</h3>
            <div className="space-y-2">
              <Link to="/foods" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-primary-container/20 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">search_insights</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-on-surface">Besin & Makro Ara</h4>
                  <p className="text-xs text-on-surface-variant">Besin değerlerini hesapla</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary text-sm">chevron_right</span>
              </Link>
              
              <Link to="/health-profile" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-surface-container-low transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center group-hover:bg-rose-500/10 group-hover:text-rose-600 transition-colors">
                  <span className="material-symbols-outlined text-sm">health_metrics</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-on-surface">Sağlık Profili</h4>
                  <p className="text-xs text-on-surface-variant">Metabolik verilerini incele</p>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-rose-600 text-sm">chevron_right</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
