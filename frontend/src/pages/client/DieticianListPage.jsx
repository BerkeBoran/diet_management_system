import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../../services/userService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineStar, HiStar, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

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

  const filtered = dieticians.filter((d) => {
    const fullName = `${d.first_name} ${d.last_name}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Diyetisyenler</h1>
        <p className="text-slate-400 mt-1">Size en uygun diyetisyeni bulun</p>
      </div>

      {/* Search */}
      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input
          id="dietician-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Diyetisyen ara..."
          className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all border border-white/10"
        />
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <Link
            key={d.id}
            to={`/dieticians/${d.id}`}
            className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                {d.first_name?.[0] || '?'}{d.last_name?.[0] || ''}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                  {d.first_name} {d.last_name}
                </h3>
                <p className="text-xs text-emerald-400/80 mt-0.5">{titleMap[d.title] || 'Diyetisyen'}</p>

                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      star <= Math.round(d.average_rating || 0)
                        ? <HiStar key={star} className="w-4 h-4 text-amber-400" />
                        : <HiOutlineStar key={star} className="w-4 h-4 text-slate-600" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500">({d.review_count || 0})</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-400">Diyetisyen bulunamadı.</p>
        </div>
      )}
    </div>
  );
}
