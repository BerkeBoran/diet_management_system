import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await dietService.getDieticianClients();
        setClients(Array.isArray(data) ? data : data?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchClients();
  }, []);

  const filtered = clients.filter(c => {
    const term = search.toLowerCase();
    const name = (c.client_name || c.name || `Danışan #${c.client || c.id}`).toLowerCase();
    return name.includes(term);
  });

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">KLİNİK TAKİP</span>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Danışan Listesi.
          </h1>
        </div>
        <div className="flex gap-3">
          <div className="bg-surface-container-low px-6 py-4 rounded-3xl flex items-center justify-center flex-col shadow-sm ghost-border">
            <span className="font-headline text-2xl font-black text-secondary leading-none">{clients.length}</span>
            <span className="text-[10px] text-outline font-bold uppercase tracking-widest mt-1">Takip Edilen</span>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <section className="mb-10">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            type="text" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Danışan adı veya ID ile arayın..." 
            className="w-full bg-surface-container-lowest border-none rounded-[2rem] pl-16 pr-6 py-5 focus:ring-2 focus:ring-primary shadow-[0px_12px_32px_rgba(23,29,27,0.04)] text-on-surface placeholder:text-outline-variant font-headline font-semibold text-lg transition-all"
          />
        </div>
      </section>

      {/* Roster Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => {
          const isEnded = c.status === 'Ended';
          const nameStr = c.client_name || c.name || `Danışan #${c.client || c.id}`;
          return (
            <div key={c.id} className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border hover:shadow-[0px_16px_40px_rgba(23,29,27,0.08)] transition-all duration-300 flex flex-col group">
              
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-secondary to-tertiary flex items-center justify-center text-white font-headline text-2xl font-bold shadow-lg">
                  {nameStr[0]?.toUpperCase() || '?'}
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-1 ${isEnded ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                  {isEnded ? <><span className="material-symbols-outlined text-[14px]">history</span> Tamamlandı</> : <><span className="material-symbols-outlined text-[14px]">vital_signs</span> Aktif Süreç</>}
                </span>
              </div>

              <div className="mb-6 flex-1">
                <h3 className="font-headline text-2xl font-bold text-on-surface mb-2 truncate">{nameStr}</h3>
                <div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  {c.duration ? `${c.duration} Aylık Plan` : 'Süre Belirtilmemiş'}
                </div>
              </div>
              
              <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-outline-variant/30">
                <Link 
                  to={`/chat`} 
                  className="col-span-1 py-3 bg-surface-container-low text-on-surface-variant font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-colors flex items-center justify-center gap-1.5 border border-transparent hover:border-outline-variant/30"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span> Mesaj
                </Link>
                <Link 
                  to={`/dietician/clients/${c.client || c.id}`} 
                  className="col-span-1 py-3 bg-primary/10 text-primary font-headline font-bold rounded-xl hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  Klinik Özet
                </Link>
              </div>

            </div>
          );
        })}
      </section>

      {filtered.length === 0 && (
        <section className="text-center py-24 bg-surface-container-lowest rounded-[2rem] mt-8 ghost-border">
          <div className="w-20 h-20 bg-surface-container-highest rounded-full flex items-center justify-center mx-auto mb-6 text-outline">
             <span className="material-symbols-outlined text-4xl">search_off</span>
          </div>
          <p className="text-on-surface-variant font-headline font-bold text-xl mb-2">Danışan Bulunamadı</p>
          <p className="text-outline">Aktif veya geçmiş takipte olan bir danışan verisi listeleyemiyoruz.</p>
        </section>
      )}
    </div>
  );
}
