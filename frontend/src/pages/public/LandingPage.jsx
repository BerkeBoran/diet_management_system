import { useEffect } from 'react';
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
