import { Link } from 'react-router-dom';

const features = [
  {
    icon: 'neurology',
    title: 'AI Destekli Biyometrik Program',
    desc: 'Metabolik verilerinize göre yapay zeka tarafından hesaplanan kişiselleştirilmiş diyet tasarımları.',
    colorClass: 'text-primary bg-primary-container/20',
  },
  {
    icon: 'group',
    title: 'Klinik Uzman Diyetisyenler',
    desc: 'Türkiye\'nin en iyi klinik sertifikalı diyetisyenleri ile doğrudan çalışma fırsatı.',
    colorClass: 'text-secondary bg-secondary-container/20',
  },
  {
    icon: 'forum',
    title: 'Anlık Teletıp Mesajlaşma',
    desc: 'Diyetisyeninizle dilediğiniz an iletişimde kalarak tedavi sürecini hızlandırın.',
    colorClass: 'text-tertiary bg-tertiary-container/30',
  },
  {
    icon: 'event',
    title: 'Seans ve Randevu Yönetimi',
    desc: 'Klinik randevularınızı online takvim üzerinden saniyeler içinde planlayın ve yönetin.',
    colorClass: 'text-primary bg-primary-container/20',
  },
  {
    icon: 'monitoring',
    title: 'Detaylı İlerleme Takibi',
    desc: 'Haftalık hedefler, makro dengesi ve kilo ölçümleri üzerinden anlık raporlama.',
    colorClass: 'text-secondary bg-secondary-container/20',
  },
  {
    icon: 'database',
    title: 'Geniş Lokal Besin Veritabanı',
    desc: 'Yerel ve global USDA verileri üzerinden gramaj ve kalori hesaplamaları yapın.',
    colorClass: 'text-tertiary bg-tertiary-container/30',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface">
      
      {/* Navigation Space (Navbar assumes top rendering) */}

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Editorial Background Lighting */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/30 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/20 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-tertiary-container/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-container-low text-primary font-headline text-xs font-bold tracking-widest uppercase mb-8 shadow-sm ghost-border animate-fade-in border border-outline-variant/30">
            <span className="material-symbols-outlined text-[16px] animate-pulse">auto_awesome</span>
            Klinik Yapay Zeka Diyet Asistanı
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-headline font-extrabold leading-[1.1] mb-6 animate-slide-up tracking-tight">
            <span className="text-on-surface">Beslenmenin</span>
            <br />
            <span className="text-transparent bg-clip-text gradient-primary pb-2">Klinik Evrimi.</span>
          </h1>

          <p className="text-lg sm:text-2xl text-on-surface-variant font-medium max-w-3xl mx-auto mb-10 animate-slide-up leading-relaxed" style={{ animationDelay: '0.1s' }}>
            NutriConnect AI, klinik diyetisyenliği yapay zeka ile birleştirerek metabolizmanıza en uygun, sürdürülebilir beslenme protokollerini tasarlar.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link
              to="/client-register"
              className="px-10 py-5 gradient-primary text-white font-headline font-bold text-lg rounded-[1.5rem] shadow-[0px_8px_24px_rgba(0,104,86,0.25)] hover:scale-95 transition-transform flex items-center justify-center gap-2 min-w-[200px]"
            >
               Sürece Başla <span className="material-symbols-outlined text-xl">arrow_forward</span>
            </Link>
            <Link
              to="/login"
              className="px-10 py-5 bg-surface-container-lowest text-on-surface font-headline font-bold text-lg rounded-[1.5rem] hover:bg-surface-container-low transition-colors shadow-sm ghost-border min-w-[200px]"
            >
              Üye Girişi
            </Link>
          </div>

          {/* Editorial Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-20 animate-slide-up" style={{ animationDelay: '0.3s' }}>
             <div className="bg-surface-container-lowest p-6 rounded-[2rem] ghost-border shadow-[0px_12px_32px_rgba(23,29,27,0.04)]">
               <span className="font-headline text-4xl font-black text-primary">12K+</span>
               <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Danışan</p>
             </div>
             <div className="bg-surface-container-lowest p-6 rounded-[2rem] ghost-border shadow-[0px_12px_32px_rgba(23,29,27,0.04)]">
               <span className="font-headline text-4xl font-black text-secondary">250+</span>
               <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Diyetisyen</p>
             </div>
             <div className="bg-surface-container-lowest p-6 rounded-[2rem] ghost-border shadow-[0px_12px_32px_rgba(23,29,27,0.04)]">
               <span className="font-headline text-4xl font-black text-tertiary">98%</span>
               <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">Başarı Oranı</p>
             </div>
             <div className="bg-surface-container-lowest p-6 rounded-[2rem] ghost-border shadow-[0px_12px_32px_rgba(23,29,27,0.04)]">
               <span className="font-headline text-4xl font-black text-on-surface">GPT4</span>
               <p className="text-xs font-bold text-outline uppercase tracking-widest mt-1">AI Modeli</p>
             </div>
          </div>
        </div>
      </section>

      {/* Value Proposition / Features Block */}
      <section className="py-32 px-4 relative bg-surface-container-lowest relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 max-w-3xl mx-auto">
             <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-3 block">BİLİMSEL YAKLAŞIM</span>
             <h2 className="text-4xl sm:text-5xl font-headline font-extrabold text-on-surface mb-6 tracking-tight">
              Klinik Atelier Standartları
            </h2>
            <p className="text-xl text-on-surface-variant font-medium leading-relaxed">
              Tıbbi doğruluk, sofistike teknoloji ve modern diyetisyenlik pratiğinin NutriConnect platformunda birleşimi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group bg-surface rounded-[2.5rem] p-8 transition-all duration-300 hover:shadow-[0px_24px_48px_rgba(23,29,27,0.08)] hover:-translate-y-1 block ghost-border hover:border-transparent"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.colorClass}`}>
                  <span className="material-symbols-outlined text-3xl font-light">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-headline font-bold text-on-surface mb-3">{feature.title}</h3>
                <p className="text-on-surface-variant leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Final Section */}
      <section className="py-32 px-4 bg-surface max-w-6xl mx-auto">
        <div className="bg-primary text-white rounded-[3rem] p-12 lg:p-20 relative overflow-hidden shadow-[0px_24px_64px_rgba(0,104,86,0.3)] ghost-border">
          {/* Internal gradients for depth */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-6xl text-white/50 mb-6 font-light">vital_signs</span>
            <h2 className="text-4xl sm:text-5xl font-headline font-extrabold mb-6 tracking-tight">
              Metabolik potansiyelinize ulaşın.
            </h2>
            <p className="text-xl text-white/80 mb-10 font-medium">
              NutriConnect platformuna bugün ücretsiz katılın, uzman atamalarınızı yapın veya yapay zeka asistanı ile ilk günlük planınızı hazırlayın.
            </p>
            <Link
              to="/client-register"
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary font-headline font-bold text-lg rounded-[1.5rem] transition-all hover:scale-95 shadow-lg mx-auto"
            >
              Danışan Kaydı Oluştur <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
            
            <div className="mt-8">
               <Link to="/dietician-register" className="text-sm font-bold text-white/80 hover:text-white underline underline-offset-4 decoration-white/30 hover:decoration-white transition-all">
                 Uzman Diyetisyen Başvurusu
               </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-outline-variant/30 py-12 px-4 bg-surface-container-lowest">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-[12px] flex items-center justify-center">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>eco</span>
            </div>
            <span className="text-xl font-headline font-bold text-on-surface">NutriConnect<span className="text-primary text-2xl leading-none">.</span>AI</span>
          </div>
          <p className="text-sm font-bold text-outline uppercase tracking-widest">© 2026 CLİNİCAL ATELIER.</p>
        </div>
      </footer>
    </div>
  );
}
