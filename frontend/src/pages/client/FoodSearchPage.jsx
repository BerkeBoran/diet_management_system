import { useState } from 'react';
import foodService from '../../services/foodService';
import { useToast } from '../../components/Toast';

export default function FoodSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [amount, setAmount] = useState(100);
  const toast = useToast();

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await foodService.searchFoods(query);
      setResults(Array.isArray(data) ? data : data?.results || []);
    } catch { toast.error('Arama sırasında bir hata oluştu.'); }
    setLoading(false);
  };

  const selectFood = async (food) => {
    setDetailLoading(true);
    setAmount(100);
    try {
      const detail = await foodService.getFoodDetail(food.id, 100);
      setSelected(detail);
    } catch { toast.error('Besin detayları alınamadı.'); }
    setDetailLoading(false);
  };

  const recalculate = async () => {
    if (!selected) return;
    setDetailLoading(true);
    try {
      const detail = await foodService.getFoodDetail(selected.id, amount);
      setSelected(detail);
    } catch { /* silent */ }
    setDetailLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Header & Search */}
      <section className="mb-12">
        <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">VERİTABANI & ANALİZ</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
          Besin Kütüphanesi.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl mb-8">
          USDA ve lokal gıda veritabanlarında arama yaparak detaylı mikro ve makro besin değerlerini gramaj bazında hesaplayın.
        </p>

        <form onSubmit={search} className="bg-surface-container-lowest p-3 rounded-[2rem] shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border flex items-center gap-3">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              id="food-search" 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Besin adı veya barkod no yazın..." 
              className="w-full pl-14 pr-4 py-4 bg-transparent border-none text-on-surface placeholder:text-outline-variant font-headline font-semibold text-lg focus:ring-0 transition-all" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading} 
            className="px-8 py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-95 transition-transform disabled:opacity-50 min-w-[120px] flex justify-center items-center h-full"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sorgula'}
          </button>
        </form>
      </section>

      {/* Results Grid */}
      {results.length > 0 && (
        <section className="mb-12">
           <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest ml-2 mb-4">Arama Sonuçları ({results.length})</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {results.map((food) => (
               <button 
                 key={food.id} 
                 onClick={() => selectFood(food)} 
                 className="group bg-surface-container-lowest p-6 rounded-[2rem] text-left hover:shadow-[0px_16px_40px_rgba(23,29,27,0.08)] ghost-border transition-all duration-300 hover:scale-[1.02] flex flex-col h-full"
               >
                 <div className="flex justify-between items-start mb-4">
                   <div className="w-12 h-12 bg-primary-container/20 text-primary rounded-2xl flex items-center justify-center shrink-0">
                     <span className="material-symbols-outlined text-2xl">nutrition</span>
                   </div>
                   <span className="bg-surface-container-low px-3 py-1 rounded-lg text-xs font-bold text-on-surface-variant">100g</span>
                 </div>
                 
                 <h3 className="font-headline font-bold text-lg text-on-surface mb-4 line-clamp-2">{food.name_tr || food.name}</h3>
                 
                 <div className="mt-auto grid grid-cols-4 gap-2 border-t border-outline-variant/30 pt-4">
                   <div className="text-center">
                     <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">KCAL</p>
                     <p className="font-bold text-primary">{food.calories}</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">PRO</p>
                     <p className="font-bold text-on-surface-variant">{food.proteins}g</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">KARB</p>
                     <p className="font-bold text-on-surface-variant">{food.carbs}g</p>
                   </div>
                   <div className="text-center">
                     <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-0.5">YAĞ</p>
                     <p className="font-bold text-on-surface-variant">{food.fat}g</p>
                   </div>
                 </div>
               </button>
             ))}
           </div>
        </section>
      )}

      {results.length === 0 && query && !loading && (
        <section className="text-center py-24 bg-surface-container-lowest rounded-[2rem] mt-8 ghost-border">
          <span className="material-symbols-outlined text-4xl text-outline mb-4">search_off</span>
          <p className="text-on-surface-variant font-headline font-semibold text-lg">Aramanızla eşleşen besin bulunamadı.</p>
        </section>
      )}

      {/* Detail & Calculator Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" />
          <div className="relative bg-surface rounded-[2rem] p-8 w-full max-w-lg z-10 animate-slide-up shadow-2xl ghost-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-primary-container" />
            
            <button onClick={() => setSelected(null)} className="absolute top-6 right-6 material-symbols-outlined text-outline hover:text-on-surface transition-colors bg-surface-container-lowest rounded-full p-1">close</button>

            <div className="mb-8 pr-8">
               <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">MAKRO HESAPLAYICI</span>
               <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight leading-tight">{selected.name_tr || selected.name}</h3>
            </div>

            {/* Calculator Input */}
            <div className="bg-surface-container-low p-6 rounded-2xl mb-8 flex items-end gap-4 ghost-border">
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Porsiyon Miktarı (Gram)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))} 
                    min={1} 
                    className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold text-2xl focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all" 
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-outline uppercase tracking-widest text-sm">GR</span>
                </div>
              </div>
              <button 
                onClick={recalculate} 
                disabled={detailLoading}
                className="px-6 py-4 gradient-primary text-white font-headline font-bold rounded-xl shadow-md hover:scale-95 transition-transform disabled:opacity-50 h-[64px] flex items-center justify-center shrink-0"
              >
                {detailLoading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : 'Hesapla'}
              </button>
            </div>

            {/* Results Grid */}
            {selected.nutrition_for_amount && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="bg-surface-container-lowest rounded-2xl p-4 text-center ghost-border shadow-sm col-span-2 sm:col-span-3">
                  <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">Toplam Enerji</p>
                  <p className="font-headline text-3xl font-extrabold text-primary">{selected.nutrition_for_amount.calories} <span className="text-lg text-outline-variant font-bold">KCAL</span></p>
                </div>

                {[
                  { label: 'Protein', value: `${selected.nutrition_for_amount.proteins}g`, color: 'text-secondary' },
                  { label: 'Karbonhidrat', value: `${selected.nutrition_for_amount.carbs}g`, color: 'text-tertiary' },
                  { label: 'Yağ', value: `${selected.nutrition_for_amount.fat}g`, color: 'text-error' },
                  { label: 'Lif', value: `${selected.nutrition_for_amount.fiber}g`, color: 'text-primary' },
                  { label: 'Şeker', value: `${selected.nutrition_for_amount.sugar}g`, color: 'text-on-surface-variant' },
                  { label: 'Sodyum', value: `${selected.nutrition_for_amount.sodium || 0}mg`, color: 'text-on-surface-variant' },
                ].map((n) => (
                  <div key={n.label} className="bg-surface-container-lowest rounded-2xl p-4 text-center ghost-border">
                    <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">{n.label}</p>
                    <p className={`font-headline text-xl font-bold ${n.color}`}>{n.value}</p>
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
