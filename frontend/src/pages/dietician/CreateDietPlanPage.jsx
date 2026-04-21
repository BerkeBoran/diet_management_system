import { useState, useEffect } from 'react';
import dietService from '../../services/dietService';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CreateDietPlanPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    assignment: '', start_date: '', end_date: '', start_weight: '',
    target_weight: '', daily_calories: '', daily_protein: '',
    daily_carbs: '', daily_fat: '', daily_water: '',
  });
  const toast = useToast();

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

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        assignment: Number(form.assignment),
        start_weight: Number(form.start_weight) || undefined,
        target_weight: Number(form.target_weight) || undefined,
        daily_calories: Number(form.daily_calories) || undefined,
        daily_protein: Number(form.daily_protein) || undefined,
        daily_carbs: Number(form.daily_carbs) || undefined,
        daily_fat: Number(form.daily_fat) || undefined,
        daily_water: Number(form.daily_water) || undefined,
      };
      await dietService.createDietPlan(payload);
      toast.success('Klinik beslenme programı kaydedildi.');
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.assignment?.[0] || err.response?.data?.detail || 'Program oluşturulamadı.';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;

  if (success) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-20 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-tertiary-container/30 flex items-center justify-center mx-auto mb-6 shadow-inner ghost-border">
          <span className="material-symbols-outlined text-5xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
        </div>
        <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Program Aktifleştirildi</h2>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto leading-relaxed mb-8">
          Danışan için oluşturduğunuz klinik diyet planı sisteme işlendi. Danışan kendi paneli üzerinden programa erişebilir.
        </p>
        <button onClick={() => setSuccess(false)} className="px-8 py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform flex items-center gap-2 mx-auto">
          <span className="material-symbols-outlined text-sm">add</span> Yeni Program Oluştur
        </button>
      </div>
    );
  }

  const DateInput = ({ label, field, type="date" }) => (
    <div className="space-y-2">
      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{label}</label>
      <div className="relative group">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_month</span>
        <input 
          type={type} 
          value={form[field]} 
          onChange={(e) => update(field, e.target.value)} 
          required 
          className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest focus:bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer" 
        />
      </div>
    </div>
  );

  const NumberInput = ({ label, field, placeholder, icon, unit }) => (
    <div className="space-y-2 flex-1 min-w-[200px]">
      <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">{label}</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">{icon}</span>
        <input 
          type="number" 
          step="0.1" 
          value={form[field]} 
          onChange={(e) => update(field, e.target.value)} 
          placeholder={placeholder} 
          className="w-full pl-12 pr-12 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm placeholder-outline-variant focus:ring-2 focus:ring-primary shadow-inner transition-all" 
        />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-outline text-xs">{unit}</span>}
      </div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-10">
        <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">KLİNİK TASARIM</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
          Yeni Beslenme Planı.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl">
          Danışanınız için metabolik hedefleri belirleyin ve tedavi/diyet periyodunu planlayın.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Assignment & Dates */}
        <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-primary bg-primary-container/20 p-1.5 rounded-lg">person_search</span> 
            Danışan ve Periyot
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Hedef Danışan</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">person</span>
                <select 
                  value={form.assignment} 
                  onChange={(e) => update('assignment', e.target.value)} 
                  required 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-bold focus:ring-2 focus:ring-primary shadow-inner appearance-none transition-all cursor-pointer"
                >
                  <option value="" disabled>Lütfen bir danışan seçin...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.client_name || c.name || `Atama #${c.id}`} — ({c.duration} Aylık Süreç)
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateInput label="Klinik Başlangıç" field="start_date" />
              <DateInput label="Hedeflenen Bitiş" field="end_date" />
            </div>
          </div>
        </div>

        {/* Step 2: Metrics */}
        <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-secondary bg-secondary-container/20 p-1.5 rounded-lg">monitor_weight</span> 
            Ağırlık Yönetimi
          </h2>

          <div className="flex flex-wrap gap-6">
            <NumberInput label="Mevcut Ağırlık" field="start_weight" placeholder="Örn: 75.0" icon="scale" unit="KG" />
            <NumberInput label="Hedef Ağırlık" field="target_weight" placeholder="Örn: 68.0" icon="flag" unit="KG" />
          </div>
        </div>

        {/* Step 3: Macros */}
        <div className="bg-surface-container-low rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
            <span className="material-symbols-outlined text-tertiary bg-tertiary-container/20 p-1.5 rounded-lg">pie_chart</span> 
            Günlük Makro Hedefleri
          </h2>

          <div className="flex flex-wrap gap-6">
            <div className="w-full">
               <NumberInput label="Günlük Kalori Limiti" field="daily_calories" placeholder="Örn: 1850" icon="local_fire_department" unit="KCAL" />
            </div>
            <NumberInput label="Protein" field="daily_protein" placeholder="120" icon="fitness_center" unit="G" />
            <NumberInput label="Karbonhidrat" field="daily_carbs" placeholder="200" icon="grain" unit="G" />
            <NumberInput label="Yağ" field="daily_fat" placeholder="65" icon="water_drop" unit="G" />
            <NumberInput label="Su Tüketimi" field="daily_water" placeholder="2.5" icon="water" unit="L" />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 pb-12 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting} 
            className="px-10 py-5 gradient-primary text-white font-headline font-bold text-lg rounded-2xl shadow-[0px_8px_20px_rgba(0,104,86,0.25)] hover:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-3 w-full md:w-auto"
          >
            {submitting ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><span className="material-symbols-outlined text-xl">assignment_turned_in</span> Klinik Programı Aktifleştir</>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
