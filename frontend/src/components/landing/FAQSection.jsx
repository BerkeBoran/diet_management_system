import { useState } from 'react';
import Icons from './LandingIcons';

const ITEMS = [
  {
    q: 'AI önerilerine güvenebilir miyim?',
    a: 'Lifeetics AI, T.C. Sağlık Bakanlığı\'nın beslenme rehberleri ve uluslararası klinik kılavuzlar üzerine eğitilmiştir. Kritik kararlarda her zaman bir diyetisyen onayı önerilir.',
  },
  {
    q: 'Diyetisyen seansları nasıl gerçekleşiyor?',
    a: 'Tüm seanslar Lifeetics uygulaması üzerinden video görüşmesi ve mesajlaşma olarak yapılır.',
  },
  {
    q: 'AI diyetisyenini ücretsiz olarak mı kullanacağım?',
    a: 'Evet! Geliştirme aşamasında olduğumuz için belli bir süre AI diyetisyeni özelliğinden tamamen ücretsiz olarak yararlanabileceksiniz.',
  },
  {
    q: 'Verilerim güvende mi?',
    a: 'Tüm sağlık verilerin KVKK ve ISO 27001 standartlarında, Türkiye sınırları içinde şifreli olarak saklanır. Üçüncü taraflarla asla paylaşılmaz, AI eğitiminde anonimleştirilmiş veri kullanılır.',
  },
  {
    q: 'Çocuğum için kullanabilir miyim?',
    a: '12 yaş altı için sadece çocuk beslenmesinde uzman diyetisyenlerimiz tarafından oluşturulan planlar sunulur. AI tek başına çocuk planı oluşturmaz; bu güvenlik kararımızdır.',
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState(0);

  return (
    <section className="section lp-faq" aria-label="Sıkça sorulan sorular">
      <div className="container">
        <div className="faq-grid">
          <div className="faq-side reveal">
            <span className="eyebrow"><span className="eyebrow-dot" />Sıkça sorulan</span>
            <h2 className="display serif">
              Aklında soru<br /><em>kalmasın.</em>
            </h2>
            <p className="lede">
              Daha fazla sorun mu var?{' '}
              <a href="#destek" className="faq-link">Destek ekibimize yaz</a>
              {' '}— ortalama yanıt süremiz 12 dakika.
            </p>
          </div>

          <div className="faq-list reveal reveal-delay-1">
            {ITEMS.map((it, i) => {
              const isOpen = open === i;
              return (
                <div key={i} className={`faq-item${isOpen ? ' open' : ''}`}>
                  <button
                    className="faq-q"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                  >
                    <span>{it.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      {isOpen ? <Icons.Minus size={16} /> : <Icons.Plus size={16} />}
                    </span>
                  </button>
                  <div className="faq-a-wrap" role="region">
                    <p className="faq-a">{it.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .faq-grid {
          display: grid; grid-template-columns: 360px 1fr; gap: 80px; align-items: start;
        }
        .faq-side {
          position: sticky; top: 100px;
          display: flex; flex-direction: column; gap: 18px;
        }
        .faq-side .display { font-family: "Instrument Serif", serif; font-size: clamp(36px, 4.5vw, 56px); line-height: 1.02; }
        .faq-link { color: #4D7C0F; border-bottom: 1px solid currentColor; }

        .faq-list { display: flex; flex-direction: column; }
        .faq-item { border-top: 1px solid #E8E4D5; }
        .faq-item:last-child { border-bottom: 1px solid #E8E4D5; }
        .faq-q {
          width: 100%; text-align: left; padding: 24px 0;
          display: flex; justify-content: space-between; align-items: center; gap: 24px;
          font-size: 18px; font-weight: 500; color: #1A2516; letter-spacing: -0.005em;
          transition: color .2s; background: none; border: none; cursor: pointer; font-family: inherit;
        }
        .faq-q:hover { color: #4D7C0F; }
        .faq-icon {
          width: 32px; height: 32px; border-radius: 50%; background: #FBFAF5;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
          transition: background .25s, transform .25s;
        }
        .faq-item.open .faq-icon { background: #1A2516; color: #fff; transform: rotate(180deg); }
        .faq-a-wrap {
          display: grid; grid-template-rows: 0fr;
          transition: grid-template-rows .4s cubic-bezier(0.22,1,0.36,1);
        }
        .faq-item.open .faq-a-wrap { grid-template-rows: 1fr; }
        .faq-a-wrap > .faq-a { overflow: hidden; min-height: 0; }
        .faq-a {
          font-size: 15px; color: #3F4A38; line-height: 1.65;
          padding-bottom: 24px; max-width: 56ch;
        }

        @media (max-width: 860px) {
          .faq-grid { grid-template-columns: 1fr; gap: 32px; }
          .faq-side { position: static; }
        }
      `}</style>
    </section>
  );
}
