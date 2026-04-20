import { useState } from 'react';
import userService from '../../services/userService';
import { useToast } from '../../components/useToast.js';
import { HiOutlineHeart, HiOutlineCheckCircle } from 'react-icons/hi2';

export default function HealthProfilePage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    dietary_preference: 'NORMAL', sugar_intake: 'NONE', activity_level: 'NONE',
    goal: 'Lose', is_pregnant: false, is_breastfeeding: false,
    alcohol_use: false, smoking_use: false, medications: [], dislike_foods: [],
  });
  const [medInput, setMedInput] = useState('');
  const [dislikeInput, setDislikeInput] = useState('');

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const addToList = (field, input, setInput) => {
    if (input.trim()) {
      setForm((prev) => ({ ...prev, [field]: [...prev[field], input.trim()] }));
      setInput('');
    }
  };

  const removeFromList = (field, index) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.createHealthSnapshot(form);
      toast.success('Sağlık bilgileriniz kaydedildi!');
      setSubmitted(true);
    } catch {
      toast.error('Kayıt başarısız.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Bilgileriniz Kaydedildi!</h2>
        <p className="text-slate-400">Sağlık profiliniz başarıyla güncellendi.</p>
      </div>
    );
  }

  const selectBtn = (field, value, label) => (
    <button type="button" key={value} onClick={() => update(field, value)}
      className={`px-3 py-2 text-sm rounded-lg transition-all ${form[field] === value ? 'bg-emerald-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'}`}
    >{label}</button>
  );

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineHeart className="w-7 h-7 text-emerald-400" /> Sağlık Profili
        </h1>
        <p className="text-slate-400 mt-1">Bu bilgiler diyet planınızın kişiselleştirilmesinde kullanılacak.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Beslenme Tercihi</label>
            <div className="flex flex-wrap gap-2">
              {selectBtn('dietary_preference', 'NORMAL', 'Normal')}
              {selectBtn('dietary_preference', 'VEGETARIAN', 'Vejetaryen')}
              {selectBtn('dietary_preference', 'VEGAN', 'Vegan')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Hedef</label>
            <div className="flex flex-wrap gap-2">
              {selectBtn('goal', 'Lose', 'Kilo Vermek')}
              {selectBtn('goal', 'Gain', 'Kilo Almak')}
              {selectBtn('goal', 'Maintain', 'Formumu Korumak')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Aktivite Düzeyi</label>
            <div className="flex flex-wrap gap-2">
              {selectBtn('activity_level', 'NONE', 'Hiç')}
              {selectBtn('activity_level', 'LOW', 'Haftada 1-2')}
              {selectBtn('activity_level', 'MEDIUM', 'Haftada 3-4')}
              {selectBtn('activity_level', 'HIGH', 'Haftada 4-5')}
              {selectBtn('activity_level', 'VERY_HIGH', 'Her gün')}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Şeker Tüketimi</label>
            <div className="flex flex-wrap gap-2">
              {selectBtn('sugar_intake', 'NONE', 'Hiç')}
              {selectBtn('sugar_intake', 'LOW', 'Haftada 1-2')}
              {selectBtn('sugar_intake', 'MEDIUM', 'Haftada 3-4')}
              {selectBtn('sugar_intake', 'HIGH', 'Her gün')}
              {selectBtn('sugar_intake', 'CRAVINGS', 'Tatlı krizi')}
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold text-white">Ek Bilgiler</h3>

          <div className="grid grid-cols-2 gap-3">
            {[
              { field: 'is_pregnant', label: 'Hamile' },
              { field: 'is_breastfeeding', label: 'Emziriyor' },
              { field: 'alcohol_use', label: 'Alkol' },
              { field: 'smoking_use', label: 'Sigara' },
            ].map((item) => (
              <button key={item.field} type="button" onClick={() => update(item.field, !form[item.field])}
                className={`py-3 text-sm rounded-xl transition-all ${form[item.field] ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50'}`}
              >{item.label}: {form[item.field] ? 'Evet' : 'Hayır'}</button>
            ))}
          </div>

          {/* Medications */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">İlaçlar</label>
            <div className="flex gap-2">
              <input type="text" value={medInput} onChange={(e) => setMedInput(e.target.value)} placeholder="İlaç adı ekle" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('medications', medInput, setMedInput))} className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500/50 transition-all" />
              <button type="button" onClick={() => addToList('medications', medInput, setMedInput)} className="px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/30 transition-all">Ekle</button>
            </div>
            {form.medications.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.medications.map((m, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-full flex items-center gap-1.5">
                    {m} <button type="button" onClick={() => removeFromList('medications', i)} className="text-slate-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Dislike Foods */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sevmediğiniz Yiyecekler</label>
            <div className="flex gap-2">
              <input type="text" value={dislikeInput} onChange={(e) => setDislikeInput(e.target.value)} placeholder="Yiyecek adı ekle" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('dislike_foods', dislikeInput, setDislikeInput))} className="flex-1 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 text-sm focus:border-emerald-500/50 transition-all" />
              <button type="button" onClick={() => addToList('dislike_foods', dislikeInput, setDislikeInput)} className="px-4 py-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl text-sm hover:bg-emerald-500/30 transition-all">Ekle</button>
            </div>
            {form.dislike_foods.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.dislike_foods.map((f, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800/50 text-slate-300 text-xs rounded-full flex items-center gap-1.5">
                    {f} <button type="button" onClick={() => removeFromList('dislike_foods', i)} className="text-slate-500 hover:text-red-400">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Kaydet'}
        </button>
      </form>
    </div>
  );
}
