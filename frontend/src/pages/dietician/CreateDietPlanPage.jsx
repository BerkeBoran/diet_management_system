import { useState, useEffect } from 'react';
import dietService from '../../services/dietService';
import { useToast } from '../../components/useToast.js';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineClipboardDocumentList, HiOutlineCheckCircle } from 'react-icons/hi2';

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
      toast.success('Diyet planı oluşturuldu!');
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.assignment?.[0] || err.response?.data?.detail || 'Plan oluşturulamadı.';
      toast.error(msg);
    }
    setSubmitting(false);
  };

  if (loading) return <LoadingSpinner fullScreen />;

  if (success) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Plan Oluşturuldu!</h2>
        <p className="text-slate-400">Diyet planı başarıyla kaydedildi.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 px-6 py-2.5 glass glass-hover text-white rounded-xl transition-all">Yeni Plan Oluştur</button>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all";

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineClipboardDocumentList className="w-7 h-7 text-emerald-400" /> Diyet Planı Oluştur
        </h1>
        <p className="text-slate-400 mt-1">Danışanınız için yeni bir diyet planı oluşturun</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Genel Bilgiler</h3>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Danışan (Atama)</label>
            <select value={form.assignment} onChange={(e) => update('assignment', e.target.value)} required className={inputClass}>
              <option value="" className="bg-slate-800">Seçin...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-800">
                  {c.client_name || c.name || `Atama #${c.id}`} ({c.duration})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Başlangıç Tarihi</label>
              <input type="date" value={form.start_date} onChange={(e) => update('start_date', e.target.value)} required className={`${inputClass} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bitiş Tarihi</label>
              <input type="date" value={form.end_date} onChange={(e) => update('end_date', e.target.value)} required className={`${inputClass} [color-scheme:dark]`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Başlangıç Kilosu (kg)</label>
              <input type="number" step="0.1" value={form.start_weight} onChange={(e) => update('start_weight', e.target.value)} placeholder="70.5" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Hedef Kilo (kg)</label>
              <input type="number" step="0.1" value={form.target_weight} onChange={(e) => update('target_weight', e.target.value)} placeholder="65.0" className={inputClass} />
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Günlük Hedefler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { field: 'daily_calories', label: 'Kalori (kcal)', ph: '2000' },
              { field: 'daily_protein', label: 'Protein (g)', ph: '120' },
              { field: 'daily_carbs', label: 'Karbonhidrat (g)', ph: '200' },
              { field: 'daily_fat', label: 'Yağ (g)', ph: '65' },
              { field: 'daily_water', label: 'Su (L)', ph: '2.5' },
            ].map((item) => (
              <div key={item.field}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{item.label}</label>
                <input type="number" step="0.1" value={form[item.field]} onChange={(e) => update(item.field, e.target.value)} placeholder={item.ph} className={inputClass} />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={submitting} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Plan Oluştur'}
        </button>
      </form>
    </div>
  );
}
