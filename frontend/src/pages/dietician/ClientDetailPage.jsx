import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await dietService.getClientDetail(id);
        setClient(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchClient();
  }, [id]);

  const genderMap = { Male: 'Erkek', Female: 'Kadın', Other: 'Diçer' };
  const initials = (client?.name || client?.client_name || `K`)[0]?.toUpperCase();

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!client) return (
    <div className="max-w-3xl mx-auto py-24 text-center">
      <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-6 text-outline">
        <span className="material-symbols-outlined text-4xl">person_off</span>
      </div>
      <p className="text-on-surface-variant font-headline font-bold text-xl mb-2">Danışan Bulunamadı</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-8 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span> Listeye Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Profile & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border sticky top-24">
            
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-secondary to-tertiary flex items-center justify-center text-white font-headline text-4xl font-bold shadow-xl mb-6">
                {initials}
                <div className="absolute -bottom-2 -right-2 bg-surface text-secondary p-1.5 rounded-xl shadow-sm border border-outline-variant/20">
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
              </div>
              
              <h1 className="font-headline text-2xl font-bold text-on-surface mb-1 truncate w-full px-4">
                {client.name || client.client_name || `Danışan #${id}`}
              </h1>
              <p className="text-sm font-bold uppercase tracking-widest text-outline mb-6">
                Klinik Dosyası
              </p>

              <div className="flex flex-col w-full gap-3">
                 <button onClick={() => navigate(`/dietician/create-plan?client=${id}`)} className="w-full py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined text-sm">post_add</span> Yeni Program Oluştur
                 </button>
                 <button onClick={() => navigate(`/chat`)} className="w-full py-4 bg-surface-container-low text-on-surface-variant font-headline font-bold rounded-2xl hover:bg-surface-container-highest transition-colors border border-transparent hover:border-outline-variant/30 flex items-center justify-center gap-2">
                   <span className="material-symbols-outlined text-sm">chat</span> Mesaj Gönder
                 </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-8 space-y-8">
          
          <header className="mb-8">
             <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">TIBBİ PROFİL</span>
             <h2 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight">Danışan İzleme Raporu</h2>
          </header>

          {/* Biometrics */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1.5 rounded-lg">straighten</span> Biyometrik Veriler
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-center">
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Cinsiyet</p>
                 <p className="font-headline text-xl font-bold text-on-surface">{genderMap[client.gender] || client.gender || '-'}</p>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-center">
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Yaş</p>
                 <p className="font-headline text-xl font-bold text-on-surface">{client.age || '-'}</p>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-center">
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Boy</p>
                 <p className="font-headline text-xl font-bold text-on-surface">{client.height || '-'} <span className="text-sm text-on-surface-variant font-medium">cm</span></p>
               </div>
               <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 text-center">
                 <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Kilo</p>
                 <p className="font-headline text-xl font-bold text-on-surface">{client.weight || '-'} <span className="text-sm text-on-surface-variant font-medium">kg</span></p>
               </div>

               <div className="col-span-2 sm:col-span-4 bg-primary-container/10 border border-primary/20 rounded-2xl p-5 flex items-center justify-between mt-2">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-bold">BMI</div>
                   <div>
                     <p className="font-bold text-on-surface text-sm">Vücut Kitle İndeksi</p>
                     <p className="text-xs text-on-surface-variant line-clamp-1">Klinik risk analizi baz numarası</p>
                   </div>
                 </div>
                 <div className="text-2xl font-headline font-black text-primary">
                    {client.height && client.weight ? (client.weight / ((client.height / 100) ** 2)).toFixed(1) : '-'}
                 </div>
               </div>
            </div>
          </section>

          {/* Clinical Flags */}
          <section className="bg-surface-container-low rounded-[2.5rem] p-8 ghost-border relative overflow-hidden">
             {/* Alert Accent */}
             <div className="absolute top-0 left-0 right-0 h-1.5 bg-error"></div>
             
             <h3 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <span className="material-symbols-outlined text-error bg-error-container/20 p-1.5 rounded-lg">health_and_safety</span> Klinik Uyarılar & Analiz
            </h3>

            <div className="space-y-6 flex-1">
              {/* Allergies / Dislikes */}
              {client.allergies && client.allergies.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Besin Duyarlılığı / Alerjiler</p>
                  <div className="flex flex-wrap gap-2">
                    {client.allergies.map((a, i) => (
                      <span key={i} className="px-4 py-2 bg-error-container/30 text-error font-bold text-sm rounded-xl flex items-center gap-1.5 border border-error/10">
                        <span className="material-symbols-outlined text-[16px]">warning</span> {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chronic Conditions */}
              {client.chronic_conditions && client.chronic_conditions.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">Kronik Rahatsızlıklar</p>
                  <div className="flex flex-wrap gap-2">
                    {client.chronic_conditions.map((c, i) => (
                      <span key={i} className="px-4 py-2 bg-tertiary-container/30 text-tertiary-dark font-bold text-sm rounded-xl">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Lifestyle Summary */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-outline-variant/30">
                  {client.activity_level && (
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">directions_run</span>
                      <div>
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Aktivite Düzeyi</p>
                        <p className="text-sm font-bold text-on-surface">{client.activity_level}</p>
                      </div>
                    </div>
                  )}
                  {client.sugar_intake && (
                    <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 flex items-center gap-3">
                      <span className="material-symbols-outlined text-outline">cookie</span>
                      <div>
                        <p className="text-[10px] text-outline font-bold uppercase tracking-widest">Şeker Tüketimi</p>
                        <p className="text-sm font-bold text-on-surface">{client.sugar_intake}</p>
                      </div>
                    </div>
                  )}
               </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
