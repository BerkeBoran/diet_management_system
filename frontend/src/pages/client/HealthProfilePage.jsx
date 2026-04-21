import { useState } from 'react';
import userService from '../../services/userService';
import { useToast } from '../../components/Toast';

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
      toast.success('Klinik verileriniz kaydedildi.');
      setSubmitted(true);
    } catch {
      toast.error('Kayıt işlemi başarısız oldu.');
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-20 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-tertiary-container/30 flex items-center justify-center mx-auto mb-6 shadow-inner ghost-border">
          <span className="material-symbols-outlined text-5xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>task_alt</span>
        </div>
        <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Klinik Verileriniz Kaydedildi</h2>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto leading-relaxed mb-8">
          Sağlık profiliniz başarıyla güncellendi. Bu veriler diyetisyeniniz ve AI asistanımız tarafından daha isabetli programlar hazırlamak için kullanılacaktır.
        </p>
        <button onClick={() => setSubmitted(false)} className="px-8 py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform">
          Profilimi Düzenle
        </button>
      </div>
    );
  }

  const selectBtn = (field, value, label) => (
    <button 
      type="button" 
      key={value} 
      onClick={() => update(field, value)}
      className={`px-5 py-3 text-sm font-bold rounded-xl transition-all border-2 flex-grow sm:flex-grow-0
        ${form[field] === value 
          ? 'bg-primary-container/20 border-primary text-primary shadow-sm scale-105' 
          : 'bg-surface-container-lowest border-transparent text-on-surface-variant hover:border-outline-variant/30 hover:bg-surface-container-highest'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-10">
        <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">TIBBİ ANAMNEZ & VERİLER</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
          Sağlık Profili.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Klinik durumunuzu, alışkanlıklarınızı ve hedeflerinizi eksiksiz doldurarak, bizim ve uzmanın sizin için en güvenilir beslenme planını hazırlamasını sağlayın.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - Main Form */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Goals and Diets */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary bg-primary-container/20 p-2 rounded-xl">flag</span>
              Temel Hedefler & Tercihler
            </h2>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3 pl-1">Metabolik Hedef</label>
                <div className="flex flex-wrap gap-3">
                  {selectBtn('goal', 'Lose', 'Kilo Kaybı')}
                  {selectBtn('goal', 'Maintain', 'Kilo Koruma')}
                  {selectBtn('goal', 'Gain', 'Kasa/Kilo Kazanımı')}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3 pl-1">Beslenme Protokolü</label>
                <div className="flex flex-wrap gap-3">
                  {selectBtn('dietary_preference', 'NORMAL', 'Standart (Hepçil)')}
                  {selectBtn('dietary_preference', 'VEGETARIAN', 'Vejetaryen')}
                  {selectBtn('dietary_preference', 'VEGAN', 'Vegan')}
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Lifestyle */}
          <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary bg-secondary-container/20 p-2 rounded-xl">directions_run</span>
              Yaşam Tarzı Puanlaması
            </h2>

            <div className="space-y-8">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3 pl-1">Aktif Egzersiz Yoğunluğu</label>
                <div className="flex flex-wrap gap-3">
                  {selectBtn('activity_level', 'NONE', 'Yok / Sedanter')}
                  {selectBtn('activity_level', 'LOW', 'Düşük (1-2 Gün)')}
                  {selectBtn('activity_level', 'MEDIUM', 'Orta (3-4 Gün)')}
                  {selectBtn('activity_level', 'HIGH', 'Yüksek (4-5 Gün)')}
                  {selectBtn('activity_level', 'VERY_HIGH', 'Atletik / Her Gün')}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-3 pl-1">İlave Şeker Eğilimi</label>
                <div className="flex flex-wrap gap-3">
                  {selectBtn('sugar_intake', 'NONE', 'Tüketmiyorum')}
                  {selectBtn('sugar_intake', 'LOW', 'Nadiren')}
                  {selectBtn('sugar_intake', 'MEDIUM', 'Haftada Birkaç')}
                  {selectBtn('sugar_intake', 'HIGH', 'Sık Tüketim')}
                  {selectBtn('sugar_intake', 'CRAVINGS', 'Kontrolsüz Şeker Krizi')}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column - Secondary Form & Medical Flags */}
        <div className="lg:col-span-4 space-y-8">
          
          <section className="bg-surface-container-low rounded-[2.5rem] p-8 ghost-border">
            <h2 className="font-headline text-lg font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-error">warning</span>
              Klinik Uyarılar
            </h2>

            <div className="space-y-3 mb-8">
              {[
                { field: 'is_pregnant', label: 'Hamilelik Durumu' },
                { field: 'is_breastfeeding', label: 'Laktasyon (Emzirme)' },
                { field: 'alcohol_use', label: 'Alkol Tüketimi' },
                { field: 'smoking_use', label: 'Sigara / Tütün Kul.' },
              ].map((item) => (
                <button 
                  key={item.field} 
                  type="button" 
                  onClick={() => update(item.field, !form[item.field])}
                  className={`w-full py-4 px-5 text-sm font-bold rounded-2xl transition-all border-2 flex justify-between items-center
                    ${form[item.field] 
                      ? 'bg-error-container/20 border-error text-error shadow-sm' 
                      : 'bg-surface-container-lowest border-transparent text-on-surface-variant hover:border-outline-variant/30 hover:bg-surface-container-highest'}`}
                >
                  {item.label}
                  <span className="material-symbols-outlined text-lg" style={form[item.field] ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {form[item.field] ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-6">
              {/* Medications */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2 pl-1">Düzenli İlaç/Takviyeler</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={medInput} 
                    onChange={(e) => setMedInput(e.target.value)} 
                    placeholder="İlaç veya takviye ismini yazın..." 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('medications', medInput, setMedInput))} 
                    className="w-full pl-4 pr-12 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm placeholder-outline-variant focus:ring-2 focus:ring-primary shadow-inner transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={() => addToList('medications', medInput, setMedInput)} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-1 hover:bg-primary-container/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
                {form.medications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pl-1">
                    {form.medications.map((m, i) => (
                      <span key={i} className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                        {m} 
                        <button type="button" onClick={() => removeFromList('medications', i)} className="text-outline hover:text-error transition-colors mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Dislike Foods */}
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block mb-2 pl-1">Tüketilemeyen Gıdalar</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={dislikeInput} 
                    onChange={(e) => setDislikeInput(e.target.value)} 
                    placeholder="Alerjen veya sevilmeyen gıda..." 
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addToList('dislike_foods', dislikeInput, setDislikeInput))} 
                    className="w-full pl-4 pr-12 py-3 bg-surface-container-lowest border-none rounded-xl text-on-surface text-sm placeholder-outline-variant focus:ring-2 focus:ring-primary shadow-inner transition-all" 
                  />
                  <button 
                    type="button" 
                    onClick={() => addToList('dislike_foods', dislikeInput, setDislikeInput)} 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-primary p-1 hover:bg-primary-container/20 rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-xl">add</span>
                  </button>
                </div>
                {form.dislike_foods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3 pl-1">
                    {form.dislike_foods.map((f, i) => (
                      <span key={i} className="px-3 py-1.5 bg-surface-container text-on-surface-variant text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm">
                        {f} 
                        <button type="button" onClick={() => removeFromList('dislike_foods', i)} className="text-outline hover:text-error transition-colors mt-0.5">
                          <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="pt-8 mt-8 border-t border-outline-variant/30">
               <button 
                 type="submit" 
                 disabled={loading} 
                 className="w-full py-4 gradient-primary text-white font-headline font-bold text-lg rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Verileri Sisteme Kaydet'}
               </button>
            </div>
          </section>

        </div>
      </form>
    </div>
  );
}
