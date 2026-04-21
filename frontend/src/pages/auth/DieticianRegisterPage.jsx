import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/Toast';

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

  const inputClass = "w-full pl-12 pr-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)]";

  return (
    <div className="min-h-screen bg-surface flex flex-col font-body">
      {/* Header */}
      <header className="bg-surface flex justify-between items-center w-full px-6 py-4 max-w-full sticky top-0 z-50">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tighter font-headline">NutriConnect</Link>
        <Link to="/login" className="text-sm font-bold text-primary font-headline">Giriş Yap</Link>
      </header>

      <main className="flex-grow flex flex-col md:flex-row w-full max-w-[1600px] mx-auto px-4 md:px-8 py-10 gap-12">
        {/* Sidebar: Why join us? */}
        <aside className="w-full md:w-[400px] flex flex-col gap-12">
          <div className="relative h-[300px] md:h-[500px] rounded-3xl overflow-hidden bg-primary-container shadow-2xl group">
            <img 
              src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000" 
              alt="Clinical laboratory" 
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/95 to-transparent flex flex-col justify-end p-8">
              <h2 className="font-headline text-3xl font-extrabold text-white leading-tight mb-4">Uzmanlığınızla Fark Yaratın.</h2>
              <p className="text-white/90 text-sm leading-relaxed">Danışanlarınızı klinik hassasiyetle yönetin ve ileri düzey analiz araçlarıyla kariyerinizi büyütün.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <h3 className="font-headline text-xl font-bold text-primary tracking-tight">Neden Bize Katılmalısınız?</h3>
            <div className="flex gap-4 items-start bg-surface-container-low p-4 rounded-2xl">
              <span className="material-symbols-outlined text-primary bg-primary-container/10 p-2 rounded-xl">analytics</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Gelişmiş Takip</h4>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">Danışanlarınızın kalori ve makro analizlerini tek tıkla inceleyin ve kolayca diyet planı oluşturun.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start bg-surface-container-low p-4 rounded-2xl">
              <span className="material-symbols-outlined text-primary bg-primary-container/10 p-2 rounded-xl">auto_awesome</span>
              <div>
                <h4 className="font-bold text-sm text-on-surface">Yapay Zeka Destekli</h4>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">AI servisimiz, size danışan bağlamına göre alternatif öğün ve plan taslağı önererek hız kazandırır.</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Registration Form Section */}
        <section className="flex-grow bg-surface-container-low rounded-[2rem] p-6 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
        
          <header className="mb-12">
            <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-2 block">DİYETİSYEN BAŞVURUSU</span>
            <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface tracking-tighter leading-tight mb-4">
              Profesyonel Profil<br/>Oluşturun.
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl">Ağa katılmak için yetkinlik belgelerinizi ileterek doğrulama sürecini başlatın.</p>
          </header>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Ad</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">person</span>
                <input type="text" value={form.first_name} onChange={(e) => update('first_name', e.target.value)} required placeholder="Adınız" className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Soyad</label>
              <input type="text" value={form.last_name} onChange={(e) => update('last_name', e.target.value)} required placeholder="Soyadınız" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-all shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)]" />
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

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">TC Kimlik / Pasaport No</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">badge</span>
                <input type="text" value={form.tc_no} onChange={(e) => update('tc_no', e.target.value)} required maxLength={11} placeholder="11 haneli TCKN" className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Lisans Numarası</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">policy</span>
                <input type="text" value={form.license_number} onChange={(e) => update('license_number', e.target.value)} placeholder="Opsiyonel lisans no." className={inputClass} />
              </div>
            </div>

            <div className="space-y-1.5">
               <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Yaş</label>
               <input type="number" value={form.age} onChange={(e) => update('age', e.target.value)} required min={20} max={80} placeholder="30" className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-semibold text-center placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Unvan</label>
              <div className="relative">
                <select value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full pl-4 pr-10 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface font-semibold appearance-none focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)]">
                  <option value="DIETICIAN">Diyetisyen</option>
                  <option value="EXPERT_DIETICIAN">Uzman Diyetisyen</option>
                  <option value="INTERN_DIETICIAN">Stajyer Diyetisyen</option>
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-outline">expand_more</span>
              </div>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Biyografi & Uzmanlık</label>
              <textarea value={form.biography} onChange={(e) => update('biography', e.target.value)} rows={3} placeholder="Klinik geçmişinizi ve odaklandığınız beslenme alanlarını yazın..." className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all resize-none" />
            </div>

            {/* Document Upload */}
            <div className="md:col-span-2 mt-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 mb-2 block">Lisans / Mezuniyet Belgesi</label>
              <div className="border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center bg-surface-container-lowest hover:bg-surface-container-highest transition-colors cursor-pointer group relative">
                <span className="material-symbols-outlined text-4xl text-outline mb-3 group-hover:text-primary transition-colors">upload_file</span>
                <p className="text-on-surface font-semibold text-center">{licenseFile ? licenseFile.name : 'Dosya yüklemek için tıklayın (PDF, JPG)'}</p>
                <p className="text-outline text-xs mt-1 text-center">Doğrulama için diploma veya denklik belgesi gereklidir.</p>
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => setLicenseFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Şifre</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required placeholder="••••••••" minLength={8} className={inputClass} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Şifre Tekrar</label>
              <input type="password" value={form.password_confirm} onChange={(e) => update('password_confirm', e.target.value)} required placeholder="••••••••" minLength={8} className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all" />
            </div>

            <div className="md:col-span-2 mt-6">
              <button type="submit" disabled={loading} className="w-full md:w-auto px-12 py-5 gradient-primary text-white font-headline font-bold text-lg rounded-xl shadow-[0px_8px_20px_rgba(0,104,86,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Başvuruyu Gönder'}
              </button>
              <p className="text-outline text-xs mt-4 italic">
                * Gönder butonuna tıklayarak profesyonel doğrulama sürecimizi ve kişisel verilerin işlenmesi şartlarını kabul etmiş olursunuz.
              </p>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
