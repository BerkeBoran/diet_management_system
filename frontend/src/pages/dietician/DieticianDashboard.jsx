import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DieticianDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, clientsRes] = await Promise.allSettled([
          dietService.getAssignments(),
          dietService.getDieticianClients(),
        ]);
        if (assignRes.status === 'fulfilled') setAssignments(Array.isArray(assignRes.value) ? assignRes.value : assignRes.value?.results || []);
        if (clientsRes.status === 'fulfilled') setClients(Array.isArray(clientsRes.value) ? clientsRes.value : clientsRes.value?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const pendingAssignments = assignments.filter((a) => a.verification_status === 'Pending');
  const activeClients = clients.filter((c) => c.status === 'InProgress');

  const respondToAssignment = async (id, status) => {
    try {
      await dietService.respondAssignment(id, { verification_status: status });
      setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, verification_status: status } : a));
    } catch { /* silent */ }
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Header - Editorial Greeting */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">KLİNİK PANEL</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            İyi Çalışmalar, <br className="hidden md:block" /> {user?.title === 'EXPERT_DIETICIAN' ? 'Uzm. Dyt.' : 'Dyt.'} <span className="text-secondary">{user?.first_name || user?.full_name?.split(' ')[0] || 'Diyetisyen'}</span>.
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/dietician/create-plan" className="px-6 py-3 rounded-full gradient-primary text-white font-headline font-bold shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-95 transition-transform flex items-center gap-2 whitespace-nowrap">
            <span className="material-symbols-outlined text-sm">add</span> Yeni Plan
          </Link>
        </div>
      </header>

      {/* Main Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-secondary text-white p-6 rounded-[2rem] shadow-[0px_12px_32px_rgba(0,99,151,0.2)] relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="material-symbols-outlined text-white">groups</span>
            </div>
            <span className="font-headline font-bold">Aktif Danışan</span>
          </div>
          <div className="relative z-10">
            <h2 className="font-headline text-5xl font-black">{activeClients.length}</h2>
            <p className="text-white/80 text-sm font-medium mt-1">Takip edilen klinik süreç</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-error-container/30 text-error rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined">pending_actions</span>
            </div>
            <span className="font-headline font-bold text-on-surface">Bekleyen Başvuru</span>
          </div>
          <div>
            <h2 className="font-headline text-5xl font-black text-on-surface">{pendingAssignments.length}</h2>
            <p className="text-on-surface-variant text-sm font-medium mt-1">Onay bekleyen danışan adaptasyonları</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-[2rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-tertiary-container/30 text-tertiary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <span className="font-headline font-bold text-on-surface">Klinik Puanı</span>
          </div>
          <div>
            <h2 className="font-headline text-5xl font-black text-on-surface">{user?.average_rating ? Number(user.average_rating).toFixed(1) : '5.0'}</h2>
            <p className="text-on-surface-variant text-sm font-medium mt-1">{user?.review_count || 0} değerlendirme bazında</p>
          </div>
        </div>

      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Pending Assignments & Recent Activity */}
        <div className="lg:col-span-8 space-y-8">
          
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
              <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1.5 rounded-lg">assignment_ind</span> Onay Bekleyenler
              </h2>
              <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-xl text-xs">{pendingAssignments.length} Yeni</span>
            </div>

            {pendingAssignments.length > 0 ? (
              <div className="space-y-4">
                {pendingAssignments.map((a) => (
                  <div key={a.id} className="bg-surface-container-low p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:bg-surface-container-high border justify-center border-transparent hover:border-outline-variant/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-container-highest text-on-surface-variant rounded-xl flex items-center justify-center font-bold font-headline text-lg">
                        D#{a.client || a.id}
                      </div>
                      <div>
                        <p className="font-headline font-bold text-on-surface">Danışan Başvurusu</p>
                        {a.client_note ? (
                          <p className="text-sm text-on-surface-variant mt-0.5 line-clamp-1 italic">"{a.client_note}"</p>
                        ) : (
                          <p className="text-sm text-on-surface-variant mt-0.5">Süreç detayı belirtilmemiş.</p>
                        )}
                        <p className="text-xs text-secondary font-bold mt-1 uppercase tracking-widest">{a.duration} Aylık Plan</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <button onClick={() => respondToAssignment(a.id, 'Rejected')} className="flex-1 sm:flex-none px-4 py-2 bg-surface text-on-surface-variant text-sm font-bold rounded-xl hover:bg-error/10 hover:text-error transition-colors flex items-center justify-center gap-1.5 border border-outline-variant/20 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">close</span> Red
                      </button>
                      <button onClick={() => respondToAssignment(a.id, 'Accepted')} className="flex-1 sm:flex-none px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5 shadow-md">
                        <span className="material-symbols-outlined text-[16px]">check</span> Kabul Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-4 text-outline-variant">
                  <span className="material-symbols-outlined text-3xl">inbox</span>
                </div>
                <p className="font-headline font-semibold text-on-surface-variant">Bekleyen başvuru bulunmuyor.</p>
              </div>
            )}
          </section>

          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
             <div className="flex justify-between items-center mb-6">
               <h2 className="font-headline text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary bg-secondary-container/20 p-1.5 rounded-lg">speed</span> Aktif Danışanlar
                </h2>
                <Link to="/dietician/clients" className="text-sm font-bold text-primary hover:underline">Tümünü Yönet</Link>
             </div>
             
             {activeClients.length > 0 ? (
                <div className="space-y-3">
                  {activeClients.slice(0, 3).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl hover:bg-surface-container-highest transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-container/30 text-primary font-bold rounded-xl flex items-center justify-center uppercase">
                          {c.client_name?.[0] || 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{c.client_name || `Danışan #${c.client}`}</p>
                          <p className="text-[10px] text-outline font-bold uppercase tracking-widest mt-0.5">Süreç Aktif</p>
                        </div>
                      </div>
                      <Link to={`/client/${c.client}`} className="material-symbols-outlined text-outline-variant hover:text-primary transition-colors">chevron_right</Link>
                    </div>
                  ))}
                </div>
             ) : (
                <p className="text-sm text-outline italic text-center py-6">Aktif takip edilen danışan yok.</p>
             )}
          </section>

        </div>

        {/* Right Column - Schedule & Tools */}
        <div className="lg:col-span-4 space-y-8">
          
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border h-full flex flex-col">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">calendar_today</span> Gündem & Araçlar
            </h3>

            <div className="space-y-3 flex-1">
              <Link to="/dietician/create-plan" className="w-full bg-primary/10 hover:bg-primary/15 text-primary p-4 rounded-add flex flex-col items-center justify-center text-center transition-colors rounded-2xl border border-primary/20 ghost-border py-8 mb-6 group">
                <span className="material-symbols-outlined text-4xl mb-2 group-hover:scale-110 transition-transform">post_add</span>
                <span className="font-headline font-bold">Yeni Plan Hazırla</span>
                <span className="text-xs font-medium opacity-80 mt-1">Danışanlara özel klinik diyet</span>
              </Link>
              
              <Link to="/chat" className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-highest transition-colors group border border-transparent hover:border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center group-hover:bg-secondary-container/30 group-hover:text-secondary transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">forum</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Klinik Mesajlar</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Danışan iletişiminiz</p>
                </div>
              </Link>

              <Link to="/appointments" className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container-highest transition-colors group border border-transparent hover:border-outline-variant/30">
                <div className="w-12 h-12 bg-surface-container-highest rounded-xl flex items-center justify-center group-hover:bg-tertiary-container/30 group-hover:text-tertiary transition-colors text-on-surface-variant">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Randevu Takvimi</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Seansları yönetin</p>
                </div>
              </Link>
            </div>
            
          </section>

        </div>
      </div>
    </div>
  );
}
