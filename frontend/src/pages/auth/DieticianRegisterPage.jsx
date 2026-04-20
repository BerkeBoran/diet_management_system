import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth.js';
import { useToast } from '../../components/useToast.js';
import { HiOutlineSparkles, HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlinePhone, HiOutlineIdentification, HiOutlineDocumentText } from 'react-icons/hi2';

export default function DieticianRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone_number: '',
    password: '', password_confirm: '', tc_no: '', license_number: '',
    age: '', biography: '', title: 'DIETICIAN',
  });
  const [licenseFile, setLicenseFile] = useState(null);
  const { registerDietician } = useAuth();
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key === 'age') formData.append(key, Number(val));
        else formData.append(key, val);
      });
      if (licenseFile) formData.append('license_document', licenseFile);

      await registerDietician(formData);
      toast.success('Başvurunuz alındı! Onay sürecinden sonra giriş yapabileceksiniz.');
      navigate('/login');
    } catch (err) {
      const errors = err.response?.data;
      if (errors && typeof errors === 'object') {
        const first = Object.values(errors).flat()[0];
        toast.error(typeof first === 'string' ? first : 'Kayıt başarısız.');
      } else {
        toast.error('Kayıt başarısız.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <HiOutlineSparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">NutriAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Diyetisyen Başvurusu</h1>
          <p className="text-slate-400 mt-1">Profil bilgilerinizi doldurun</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Telefon</label>
                <div className="relative">
                  <HiOutlinePhone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={form.phone_number} onChange={(e) => update('phone_number', e.target.value)} required placeholder="05XX XXX XXXX" maxLength={11} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Yaş</label>
                <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} required min={20} max={80} placeholder="30" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all text-center" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">TC Kimlik No</label>
                <div className="relative">
                  <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={form.tc_no} onChange={(e) => update('tc_no', e.target.value)} required maxLength={11} placeholder="XXXXXXXXXXX" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Lisans No</label>
                <div className="relative">
                  <HiOutlineDocumentText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input type="text" value={form.license_number} onChange={(e) => update('license_number', e.target.value)} placeholder="Lisans numaranız" className={inputClass} />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Unvan</label>
              <div className="flex gap-2">
                {[{ v: 'DIETICIAN', l: 'Diyetisyen' }, { v: 'EXPERT_DIETICIAN', l: 'Uzman' }, { v: 'INTERN_DIETICIAN', l: 'Stajyer' }].map((t) => (
                  <button key={t.v} type="button" onClick={() => update('title', t.v)}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${form.title === t.v ? 'bg-emerald-500 text-white' : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'}`}
                  >{t.l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Biyografi</label>
              <textarea value={form.biography} onChange={(e) => update('biography', e.target.value)} rows={3} placeholder="Kendinizi tanıtın..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 transition-all resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Lisans Belgesi</label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setLicenseFile(e.target.files[0])} className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 file:cursor-pointer cursor-pointer" />
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

            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Başvuruyu Gönder'}
            </button>
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
