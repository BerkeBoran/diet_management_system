import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth.js';
import { useToast } from '../../components/useToast.js';
import { HiOutlineSparkles, HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlinePhone, HiOutlineScale, HiArrowLeft, HiArrowRight } from 'react-icons/hi2';

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

  const inputClass = "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <HiOutlineSparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">NutriAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Danışan Kaydı</h1>
          <p className="text-slate-400 mt-1">Adım {step} / 2</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-6">
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
          <div className={`h-1 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-700'}`} />
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Ad</label>
                    <div className="relative">
                      <HiOutlineUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required placeholder="Adınız" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Soyad</label>
                    <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required placeholder="Soyadınız" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">E-posta</label>
                  <div className="relative">
                    <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required placeholder="ornek@email.com" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefon</label>
                  <div className="relative">
                    <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} required placeholder="05XX XXX XXXX" maxLength={11} className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Şifre</label>
                    <div className="relative">
                      <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="••••••••" minLength={8} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Şifre Tekrar</label>
                    <input type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} required placeholder="••••••••" minLength={8} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all" />
                  </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2">
                  Devam Et <HiArrowRight className="w-5 h-5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Cinsiyet</label>
                  <div className="flex gap-2">
                    {[{ v: 'Male', l: 'Erkek' }, { v: 'Female', l: 'Kadın' }, { v: 'Other', l: 'Diğer' }].map((g) => (
                      <button key={g.v} type="button" onClick={() => update('gender', g.v)}
                        className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${form.gender === g.v ? 'bg-emerald-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'}`}
                      >{g.l}</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Yaş</label>
                    <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} required min={10} max={100} placeholder="25" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-center" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Boy (cm)</label>
                    <div className="relative">
                      <input type="number" value={form.height} onChange={(e) => update('height', e.target.value)} required min={100} max={250} placeholder="170" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-center" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Kilo (kg)</label>
                    <div className="relative">
                      <HiOutlineScale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <input type="number" value={form.weight} onChange={(e) => update('weight', e.target.value)} required min={30} max={300} placeholder="70" className={inputClass} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 glass glass-hover text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
                    <HiArrowLeft className="w-5 h-5" /> Geri
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Kayıt Ol'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">Giriş Yap</Link>
        </p>
      </div>
    </div>
  );
}
