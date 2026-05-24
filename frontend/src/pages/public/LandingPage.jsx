import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import '../../styles/landing.css';

import LandingNavbar   from '../../components/landing/LandingNavbar';
import LandingHero     from '../../components/landing/LandingHero';
import HowSection      from '../../components/landing/HowSection';
import StatsSection    from '../../components/landing/StatsSection';
import DietitianSection from '../../components/landing/DietitianSection';
import PricingSection  from '../../components/landing/PricingSection';
import AppCTASection   from '../../components/landing/AppCTASection';
import SupportSection  from '../../components/landing/SupportSection';
import FAQSection      from '../../components/landing/FAQSection';
import LandingFooter   from '../../components/landing/LandingFooter';

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal:not(.in)');
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function LandingPage() {
  useReveal();

  return (
    <div className="landing-page">
      <Helmet>
        <title>Lifeetics: Yapay zeka destekli diyet platformu</title>
        <meta name="description" content="Lifeetics; AI asistanı ve uzman diyetisyenleri tek çatı altında buluşturur. 90 saniyede sana özel diyet planı, 24 saatte uzman onayı." />
        <link rel="canonical" href="https://lifeetics.com/" />
        <meta property="og:title" content="Lifeetics: Yapay zeka destekli diyet platformu" />
        <meta property="og:description" content="AI asistanı ve uzman diyetisyenleri tek çatı altında buluşturan kişisel diyet yönetim platformu." />
        <meta property="og:url" content="https://lifeetics.com/" />
      </Helmet>
      <LandingNavbar />
      <main>
        <LandingHero />
        <HowSection />
        <StatsSection />
        <DietitianSection />
        <PricingSection />
        <AppCTASection />
        <SupportSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
