import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

export default function ClientRegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    password: '', password_confirm: '', gender: 'Male',
    age: '', height: '', weight: '', chronic_conditions: [],
  });
  const { registerClient } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password_confirm) {
      toast.error('Şifreler eşleşmiyor!');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, age: Number(form.age), height: Number(form.height), weight: Number(form.weight) };
      await registerClient(payload);
      toast.success('Kayıt başarılı! Hoş geldiniz.');
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        toast.error(typeof first === 'string' ? first : 'Kayıt başarısız.');
      } else {
        toast.error('Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* Header */}
      <header className="bg-surface flex justify-between items-center w-full px-6 py-4 max-w-full sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tighter font-headline">NutriConnect</Link>
        <Link to="/login" className="text-sm font-bold text-primary font-headline">Giriş Yap</Link>
      </header>

      <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1600px] mx-auto px-4 md:px-8 py-10 gap-12">
        {/* Sidebar Image area */}
        <aside className="hidden md:flex w-[400px] flex-col relative rounded-[2rem] overflow-hidden bg-primary shadow-2xl">
          <img 
            src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1000" 
            alt="Healthy food" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent p-10 flex flex-col justify-end">
            <h2 className="font-headline text-3xl font-extrabold text-white leading-tight mb-4">Metabolik sağlığınızı uzmanlarla yönetin.</h2>
            <p className="text-white/80 text-sm">Kanıta dayalı beslenme planları ve klinik hassasiyet ile tanışın.</p>
          </div>
        </aside>

        {/* Form Area */}
        <section className="flex-grow bg-surface-container-low rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
          
          <header className="mb-10">
            <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-2 block">DANIŞAN KAYDI</span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter leading-tight mb-4">Profilinizi<br/>Oluşturun.</h1>
            
            {/* Steps indicator */}
            <div className="flex gap-4 mt-8">
              <div className="flex bg-surface-container-highest rounded-full p-1 w-full max-w-sm">
                <div className={`flex-1 text-center text-xs font-bold py-2 rounded-full transition-all ${step === 1 ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant'}`}>
                  Hesap
                </div>
                <div className={`flex-1 text-center text-xs font-bold py-2 rounded-full transition-all ${step === 2 ? 'bg-primary text-white shadow-md' : 'text-on-surface-variant'}`}>
                  Metrikler
                </div>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="relative z-10 max-w-2xl">
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Ad</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">person</span>
                      <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required placeholder="Adınız" className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Soyad</label>
                    <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required placeholder="Soyadınız" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">E-posta</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">mail</span>
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="ornek@email.com" className={inputClass} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Telefon</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">phone</span>
                    <input type="text" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} required placeholder="05XX XXX XXXX" maxLength={11} className={inputClass} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Şifre</label>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                      <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="••••••••" minLength={8} className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Şifre Tekrar</label>
                    <input type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} required placeholder="••••••••" minLength={8} className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="button" onClick={() => setStep(2)} className="px-10 py-4 float-right gradient-primary text-white font-headline font-bold rounded-xl shadow-lg hover:scale-95 transition-all flex items-center gap-2">
                    Sonraki Adım <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Cinsiyet</label>
                  <div className="flex gap-3">
                    {[{ v: 'Male', l: 'Erkek', icon: 'man' }, { v: 'Female', l: 'Kadın', icon: 'woman' }, { v: 'Other', l: 'Diğer', icon: 'diversity_3' }].map((g) => (
                      <button 
                        key={g.v} 
                        type="button" 
                        onClick={() => update('gender', g.v)}
                        className={`flex-1 py-4 flex flex-col items-center justify-center gap-2 rounded-2xl transition-all border-2 
                          ${form.gender === g.v ? 'border-primary bg-primary-container/10 text-primary' : 'border-transparent bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'}`}
                      >
                        <span className="material-symbols-outlined text-2xl">{g.icon}</span>
                        <span className="font-bold text-sm tracking-tight">{g.l}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Yaş</label>
                    <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} required min={10} max={100} placeholder="25" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold text-xl text-center placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-sm transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Boy (cm)</label>
                    <input type="number" value={form.height} onChange={(e) => update('height', e.target.value)} required min={100} max={250} placeholder="170" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold text-xl text-center placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-sm transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Kilo (kg)</label>
                    <input type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} required min={30} max={300} placeholder="70" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold text-xl text-center placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-sm transition-all" />
                  </div>
                </div>

                <div className="pt-8 flex justify-between items-center border-t border-outline-variant/20">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-4 font-headline font-bold text-on-surface hover:bg-surface-container-highest rounded-xl transition-all flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">arrow_back</span> Geri
                  </button>
                  <button type="submit" disabled={loading} className="px-10 py-4 gradient-primary text-white font-headline font-bold rounded-xl shadow-[0px_8px_20px_rgba(0,104,86,0.3)] hover:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Kaydı Tamamla'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
