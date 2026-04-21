import { Link } from 'react-router-dom';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4">
      <header className="fixed top-0 left-0 right-0 flex justify-between items-center w-full px-6 py-8">
        <Link to="/" className="text-2xl font-bold text-primary tracking-tighter font-headline">NutriConnect</Link>
      </header>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-64 h-64 rounded-full bg-tertiary/5 blur-3xl" />
      </div>

      <main className="w-full max-w-[600px] mt-12 mb-12 animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-headline font-extrabold text-on-surface tracking-tight mb-2">Hesap Oluştur</h1>
          <p className="text-on-surface-variant text-lg">NutriConnect'e nasıl katılmak istersiniz?</p>
        </div>

        <div className="grid gap-6">
          <Link
            to="/register/client"
            className="group glass-card rounded-3xl p-8 ambient-shadow ghost-border hover:shadow-[0px_16px_40px_rgba(23,29,27,0.08)] transition-all duration-300 hover:scale-[1.02] flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center shrink-0 group-hover:bg-primary transition-colors">
              <span className="material-symbols-outlined text-on-primary-container group-hover:text-white text-3xl transition-colors">person</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Danışan Olarak</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Uzman diyetisyenler bulun, kişiselleştirilmiş programınızı oluşturun ve sağlığınızı takip edin.</p>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors transform group-hover:translate-x-1">arrow_forward</span>
          </Link>

          <Link
            to="/register/dietician"
            className="group glass-card rounded-3xl p-8 ambient-shadow ghost-border hover:shadow-[0px_16px_40px_rgba(23,29,27,0.08)] transition-all duration-300 hover:scale-[1.02] flex items-center gap-6"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center shrink-0 group-hover:bg-secondary transition-colors">
              <span className="material-symbols-outlined text-on-secondary-container group-hover:text-white text-3xl transition-colors">psychology</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-headline font-bold text-on-surface mb-1">Diyetisyen Olarak</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">Ağımıza katılın, danışanlarınızı klinik hassasiyetle yönetin ve pratiğinizi büyütün.</p>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors transform group-hover:translate-x-1">arrow_forward</span>
          </Link>
        </div>

        <p className="text-center text-sm text-on-surface-variant mt-10">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Giriş Yap
          </Link>
        </p>
      </main>

      <footer className="mt-auto w-full py-8 flex justify-center">
        <div className="font-headline text-xs uppercase tracking-widest text-outline">
          © 2024 NUTRICONNECT.
        </div>
      </footer>
    </div>
  );
}
