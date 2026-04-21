import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ProfilePage() {
  const { user, isClient, isDietician } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const titleMap = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };
  const initials = (profile?.first_name?.[0] || user?.full_name?.[0] || 'U').toUpperCase();

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-12">
        <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">YÖNETİM</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
          Profil Ayarları.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl">
           Kişisel bilgileriniz, klinik verileriniz ve uygulama tercihleriniz.
        </p>
      </header>

      {/* Main Profile Info */}
      <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 sm:p-12 shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border mb-8 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
         <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
         
         <div className="relative z-10 w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline text-5xl font-bold shadow-2xl shrink-0">
           {initials}
           <div className="absolute -bottom-3 -right-3 bg-surface p-2 rounded-2xl shadow-sm border border-outline-variant/20">
             <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
           </div>
         </div>
         
         <div className="relative z-10 text-center md:text-left flex-1">
           <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2">{profile?.first_name} {profile?.last_name}</h2>
           <p className="text-lg font-bold text-primary mb-6">
             {isClient ? 'Klinik Danışan Kimliği' : isDietician ? (titleMap[profile?.title] || 'Klinik Uzman') : 'Kullanıcı'}
           </p>
           
           <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
             <button className="px-6 py-3 bg-surface-container-low text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-2 border border-outline-variant/30">
               <span className="material-symbols-outlined text-[18px]">edit</span> Profili Düzenle
             </button>
             <button className="px-6 py-3 bg-error/10 text-error font-headline font-bold rounded-xl hover:bg-error hover:text-white transition-colors flex items-center justify-center gap-2 border border-error/20">
               <span className="material-symbols-outlined text-[18px]">logout</span> Oturumu Kapat
             </button>
           </div>
         </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Contact Info */}
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border self-start">
          <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-secondary bg-secondary-container/20 p-2 rounded-xl">contact_mail</span> İletişim & Güvenlik
          </h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant shrink-0">
                 <span className="material-symbols-outlined">mail</span>
               </div>
               <div>
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">E-posta Adresi</p>
                 <p className="font-headline font-bold text-on-surface select-all">{profile?.email || 'Belirtilmedi'}</p>
               </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant shrink-0">
                 <span className="material-symbols-outlined">call</span>
               </div>
               <div>
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Telefon Numarası</p>
                 <p className="font-headline font-bold text-on-surface select-all">{profile?.phone_number || 'Belirtilmedi'}</p>
               </div>
            </div>
          </div>
        </section>

        {/* Dynamic Blocks depending on role */}
        
        {isClient && profile && (
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-tertiary bg-tertiary-container/30 p-2 rounded-xl">accessibility_new</span> Güncel Vücut Metrikleri
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center gap-3">
                 <span className="material-symbols-outlined text-outline">cake</span>
                 <div>
                   <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Yaş</p>
                   <p className="font-headline font-bold text-on-surface">{profile.age || '-'}</p>
                 </div>
               </div>
               <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center gap-3">
                 <span className="material-symbols-outlined text-outline">straighten</span>
                 <div>
                   <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Boy</p>
                   <p className="font-headline font-bold text-on-surface">{profile.height ? `${profile.height} cm` : '-'}</p>
                 </div>
               </div>
               <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 flex items-center gap-3">
                 <span className="material-symbols-outlined text-outline">scale</span>
                 <div>
                   <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Kilo</p>
                   <p className="font-headline font-bold text-on-surface">{profile.weight ? `${profile.weight} kg` : '-'}</p>
                 </div>
               </div>
               <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
                 <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>monitor_weight</span>
                 <div>
                   <p className="text-[10px] text-primary font-bold uppercase tracking-widest mb-0.5">BMI</p>
                   <p className="font-headline font-bold text-primary">{profile.height && profile.weight ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '-'}</p>
                 </div>
               </div>
            </div>

            {profile.allergies?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-error/20">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-error">warning</span> Kayıtlı Alerjiler
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((a, i) => (
                    <span key={i} className="px-4 py-1.5 bg-error-container/30 text-error font-bold text-sm rounded-xl border border-error/10">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {isDietician && profile && (
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
             <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
               <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded-xl">medical_information</span> Klinik Ayarları
             </h3>
             <div className="space-y-4">
               
               <div className="bg-surface-container-low p-5 rounded-2xl flex items-center justify-between ghost-border">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant">hourglass_empty</span>
                     <div>
                       <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Standart Randevu Süresi</p>
                       <p className="font-headline font-bold text-on-surface">{profile.appointment_duration ? `${profile.appointment_duration} Dakika` : 'Ayarlanmadı'}</p>
                     </div>
                  </div>
               </div>
               
               <div className="bg-surface-container-low p-5 rounded-2xl flex items-center justify-between ghost-border">
                  <div className="flex items-center gap-3">
                     <span className="material-symbols-outlined text-on-surface-variant">schedule</span>
                     <div>
                       <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">Klinik Kabul Saatleri</p>
                       <p className="font-headline font-bold text-on-surface">{profile.work_time_start && profile.work_time_end ? `${profile.work_time_start} - ${profile.work_time_end}` : 'Ayarlanmadı'}</p>
                     </div>
                  </div>
               </div>

             </div>
          </section>
        )}

      </div>
    </div>
  );
}
