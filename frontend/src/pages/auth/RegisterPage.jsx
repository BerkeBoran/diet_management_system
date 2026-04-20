import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineUser, HiOutlineAcademicCap, HiArrowRight } from 'react-icons/hi2';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center">
              <HiOutlineSparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gradient">NutriAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Hesap Oluştur</h1>
          <p className="text-slate-400 mt-1">Nasıl kayıt olmak istiyorsunuz?</p>
        </div>

        <div className="grid gap-4">
          <Link
            to="/register/client"
            className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <HiOutlineUser className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Danışan olarak kayıt ol</h3>
              <p className="text-sm text-slate-400">Diyetisyen bul, AI ile diyet planı oluştur, sağlığını takip et.</p>
            </div>
            <HiArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/register/dietician"
            className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <HiOutlineAcademicCap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1">Diyetisyen olarak kayıt ol</h3>
              <p className="text-sm text-slate-400">Danışanlarınızı yönetin, diyet planları oluşturun, büyüyün.</p>
            </div>
            <HiArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}