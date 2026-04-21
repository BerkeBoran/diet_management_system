import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function DieticianListPage() {
  const [dieticians, setDieticians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDieticians = async () => {
      try {
        const data = await userService.getDieticians();
        setDieticians(Array.isArray(data) ? data : data?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchDieticians();
  }, []);

  const titleMap = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };
  const getInitials = (first, last) => `${first?.[0] || '?'}${last?.[0] || ''}`.toUpperCase();

  const filtered = dieticians.filter((d) => {
    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Hero Header Section */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="max-w-2xl">
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-4 leading-[1.1]">
              Uzman <span className="text-primary italic">Klinik</span> Diyetisyenler.
            </h1>
            <p className="text-lg text-on-surface-variant max-w-lg leading-relaxed">
              Klinik beslenme, spor metabolizması ve bütünsel diyetetik alanında uzman profesyonellerle sağlığınızı yönetin.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center bg-surface-container-low px-6 py-4 rounded-3xl">
              <span className="text-2xl font-headline font-bold text-primary">{dieticians.length}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Aktif Uzman</span>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="mb-12">
        <div className="bg-surface-container-low p-4 rounded-3xl flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[280px] relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim veya uzmanlık ara..."
              className="w-full bg-surface-container-lowest border-none rounded-2xl pl-12 pr-4 py-4 focus:ring-2 focus:ring-primary/20 text-on-surface placeholder:text-outline-variant font-medium transition-all"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button className="px-5 py-3 bg-surface-container-highest text-on-surface rounded-full text-sm font-medium hover:bg-outline-variant/20 transition-all whitespace-nowrap">Metabolik Sağlık</button>
            <button className="px-5 py-3 bg-surface-container-highest text-on-surface rounded-full text-sm font-medium hover:bg-outline-variant/20 transition-all whitespace-nowrap">Kilo Verme</button>
            <button className="px-5 py-3 bg-on-surface text-surface rounded-full flex items-center gap-2 text-sm font-medium whitespace-nowrap">
              <span className="material-symbols-outlined text-sm">tune</span> Filtreler
            </button>
          </div>
        </div>
      </section>

      {/* Dietician Bento Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map((d) => (
          <div key={d.id} className="group bg-surface-container-lowest rounded-[2rem] overflow-hidden hover:shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border transition-all duration-500 flex flex-col">
            
            <div className="relative h-48 bg-surface-container-highest flex items-center justify-center overflow-hidden">
               {/* Pattern Background in place of missing image */}
              <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiMwMDAwMDAiLz48L3N2Zz4=')]"></div>
              
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline text-3xl font-bold shadow-xl relative z-10 group-hover:scale-110 transition-transform duration-500">
                {getInitials(d.first_name, d.last_name)}
              </div>
              
              <div className="absolute top-4 left-4 z-10">
                <span className="bg-surface/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary shadow-sm">
                  {titleMap[d.title] || 'Klinik Uzman'}
                </span>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-headline text-xl font-bold text-on-surface">{d.first_name} {d.last_name}</h3>
                </div>
                <div className="flex items-center bg-surface-container-low px-2.5 py-1.5 rounded-lg">
                  <span className="material-symbols-outlined text-tertiary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="text-xs font-bold ml-1">{d.average_rating ? Number(d.average_rating).toFixed(1) : '5.0'}</span>
                </div>
              </div>
              
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8 line-clamp-3">
                {d.biography || 'Bu uzmanımız henüz biyografi eklememiş. Beslenme programları ve klinik hedefleriniz için iletişime geçebilirsiniz.'}
              </p>
              
              <div className="mt-auto flex justify-between items-center">
                <span className="text-[10px] text-outline font-bold uppercase tracking-widest">{d.review_count || 0} DANIŞAN</span>
                <Link to={`/dieticians/${d.id}`} className="bg-primary/10 text-primary hover:bg-primary hover:text-white px-6 py-2.5 rounded-xl font-headline font-bold text-sm transition-colors">
                  Profili İncele
                </Link>
              </div>
            </div>
          </div>
        ))}
      </section>

      {filtered.length === 0 && (
        <div className="text-center py-24 bg-surface-container-lowest rounded-[2rem] mt-8 ghost-border">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">person_off</span>
          <p className="text-on-surface-variant font-headline font-semibold text-lg">Aramanızla eşleşen uzman bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
