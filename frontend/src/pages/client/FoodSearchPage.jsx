import { useState } from 'react';
import foodService from '../../services/foodService';
import { useToast } from '../../components/useToast.js';
import { HiOutlineMagnifyingGlass, HiOutlineXMark } from 'react-icons/hi2';

export default function FoodSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [amount, setAmount] = useState(100);
  const toast = useToast();

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await foodService.searchFoods(query);
      setResults(Array.isArray(data) ? data : data?.results || []);
    } catch { toast.error('Arama başarısız.'); }
    setLoading(false);
  };

  const selectFood = async (food) => {
    try {
      const detail = await foodService.getFoodDetail(food.id, amount);
      setSelected(detail);
    } catch { toast.error('Detay alınamadı.'); }
  };

  const recalculate = async () => {
    if (!selected) return;
    try {
      const detail = await foodService.getFoodDetail(selected.id, amount);
      setSelected(detail);
    } catch { /* silent */ }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Besin Arama</h1>
        <p className="text-slate-400 mt-1">Besinlerin kalori ve besin değerlerini öğrenin</p>
      </div>

      {/* Search */}
      <form onSubmit={search} className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input id="food-search" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Besin adı veya barkod yazın..." className="w-full pl-12 pr-24 py-3.5 glass rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all border border-white/10" />
        <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-all">
          {loading ? '...' : 'Ara'}
        </button>
      </form>

      {/* Results */}
      <div className="grid md:grid-cols-2 gap-3">
        {results.map((food) => (
          <button key={food.id} onClick={() => selectFood(food)} className="glass glass-hover rounded-xl p-4 text-left transition-all hover:scale-[1.01]">
            <h3 className="font-semibold text-white text-sm">{food.name_tr || food.name}</h3>
            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">{food.calories} kcal</span>
              <span>P: {food.proteins}g</span>
              <span>K: {food.carbs}g</span>
              <span>Y: {food.fat}g</span>
            </div>
          </button>
        ))}
      </div>

      {results.length === 0 && query && !loading && (
        <p className="text-center text-slate-400 py-8">Sonuç bulunamadı.</p>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass rounded-2xl p-8 w-full max-w-md z-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <HiOutlineXMark className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-white mb-1">{selected.name_tr || selected.name}</h3>
            <p className="text-sm text-emerald-400 mb-4">100g başına {selected.calories} kcal</p>

            <div className="flex gap-2 mb-4">
              <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} min={1} className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white text-center focus:border-emerald-500/50 transition-all" />
              <span className="flex items-center text-slate-400 text-sm">gram</span>
              <button onClick={recalculate} className="px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/30 transition-all">Hesapla</button>
            </div>

            {selected.nutrition_for_amount && (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Kalori', value: `${selected.nutrition_for_amount.calories} kcal`, color: 'text-emerald-400' },
                  { label: 'Protein', value: `${selected.nutrition_for_amount.proteins}g`, color: 'text-blue-400' },
                  { label: 'Karbonhidrat', value: `${selected.nutrition_for_amount.carbs}g`, color: 'text-amber-400' },
                  { label: 'Yağ', value: `${selected.nutrition_for_amount.fat}g`, color: 'text-rose-400' },
                  { label: 'Lif', value: `${selected.nutrition_for_amount.fiber}g`, color: 'text-green-400' },
                  { label: 'Şeker', value: `${selected.nutrition_for_amount.sugar}g`, color: 'text-purple-400' },
                ].map((n) => (
                  <div key={n.label} className="bg-slate-800/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500">{n.label}</p>
                    <p className={`text-lg font-bold ${n.color}`}>{n.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
