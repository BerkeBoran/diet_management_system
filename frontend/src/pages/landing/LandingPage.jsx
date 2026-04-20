import { Link } from 'react-router-dom';
import { HiOutlineSparkles, HiOutlineUserGroup, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlineChartBarSquare, HiOutlineShieldCheck, HiArrowRight } from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineSparkles,
    title: 'AI Destekli Diyet Planı',
    desc: 'Yapay zeka, size özel kişiselleştirilmiş diyet planları oluşturur.',
    color: 'from-emerald-400 to-teal-500',
  },
  {
    icon: HiOutlineUserGroup,
    title: 'Uzman Diyetisyenler',
    desc: 'Onaylı diyetisyenlerle birebir çalışarak hedeflerinize ulaşın.',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    icon: HiOutlineChatBubbleLeftRight,
    title: 'Anlık Mesajlaşma',
    desc: 'Diyetisyeninizle gerçek zamanlı iletişim kurun.',
    color: 'from-purple-400 to-pink-500',
  },
  {
    icon: HiOutlineCalendarDays,
    title: 'Randevu Sistemi',
    desc: 'Online randevu alarak süreci kolayca yönetin.',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: HiOutlineChartBarSquare,
    title: 'İlerleme Takibi',
    desc: 'Haftalık ve günlük diyet planlarınızı detaylı takip edin.',
    color: 'from-rose-400 to-red-500',
  },
  {
    icon: HiOutlineShieldCheck,
    title: 'Güvenli Besin Veritabanı',
    desc: 'Binlerce besin ve barkod tarama ile kalori takibi yapın.',
    color: 'from-cyan-400 to-blue-500',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-emerald-400 text-sm font-medium mb-8 animate-fade-in">
            <HiOutlineSparkles className="w-4 h-4" />
            Yapay Zeka Destekli Beslenme Platformu
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-slide-up">
            <span className="text-white">Sağlıklı Yaşamın</span>
            <br />
            <span className="text-gradient">Akıllı Yolu</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            NutriAI ile kişiselleştirilmiş diyet planları oluşturun, uzman diyetisyenlerle çalışın
            ve yapay zeka desteğiyle beslenme hedeflerinize ulaşın.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/register"
              className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 flex items-center gap-2"
            >
              Hemen Başla
              <HiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 glass glass-hover text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
            >
              Giriş Yap
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            {[
              { value: '1000+', label: 'Mutlu Danışan' },
              { value: '50+', label: 'Uzman Diyetisyen' },
              { value: 'AI', label: 'Destekli Sistem' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-slate-600 flex justify-center pt-2">
            <div className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Neden <span className="text-gradient">NutriAI</span>?
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Modern teknoloji ve uzman bilgisini bir araya getirerek size en iyi beslenme deneyimini sunuyoruz.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group glass glass-hover rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl" />

            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 relative z-10">
              Sağlıklı yaşama bugün başlayın
            </h2>
            <p className="text-slate-400 mb-8 relative z-10">
              Ücretsiz hesap oluşturun ve AI destekli kişisel diyet planınızı hemen alın.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 relative z-10"
            >
              Ücretsiz Kayıt Ol
              <HiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <HiOutlineSparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">NutriAI</span>
          </div>
          <p className="text-sm text-slate-500">© 2026 NutriAI. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
