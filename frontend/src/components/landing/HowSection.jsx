import { useState } from 'react';
import Icons from './LandingIcons';

const AI_STEPS = [
  {
    n: '01', tag: '90 sn',
    title: 'Profilini oluştur',
    body: '90 saniyede profilini oluştur. Yaş, cinsiyet, kilo, hedef ve yaşam tarzın gibi temel bilgiler alınır.',
    Icon: Icons.Scale,
  },
  {
    n: '02', tag: '60 sn',
    title: 'Sağlık bilgilerini gir',
    body: 'Sigara, alkol, sevmediğin yemekler, alerjiler ve kronik rahatsızlıkların gibi bilgiler alınır — diyet bunlara göre oluşturulur.',
    Icon: Icons.Heart,
  },
  {
    n: '03', tag: '≈ 8 sn',
    title: 'AI diyeti oluşturur',
    body: 'Sana özel haftalık menü saniyeler içinde oluşturulur, onayına sunulur. Değiştirmek istediğin yerler için revizyon yapılır.',
    Icon: Icons.Sparkle,
  },
  {
    n: '04', tag: 'Sürekli',
    title: 'Yaşa, takip et, ayarla',
    body: 'Günlük takip ve haftalık check-in. Plan; sen değiştikçe seninle birlikte değişir.',
    Icon: Icons.Bolt,
  },
];

const UZMAN_STEPS = [
  {
    n: '01', tag: 'Sen seç',
    title: 'Diyetisyenini seç',
    body: 'Uzmanlık alanına, deneyimine ve tarzına göre kadromuzdaki diyetisyenler arasından sana en uygun olanını seç.',
    Icon: Icons.Users,
  },
  {
    n: '02', tag: '45 dk',
    title: 'Online görüşme yap',
    body: 'Diyetisyenin seninle 45 dakikalık bir tanışma görüşmesi yapar. Sağlık geçmişin, hedeflerin ve yaşam tarzın detaylıca konuşulur.',
    Icon: Icons.Chat,
  },
  {
    n: '03', tag: '24 saat',
    title: 'Kişiye özel plan',
    body: 'Diyetisyenin sana özel kapsamlı bir plan hazırlar. Tüm öğünler, makro hedefler ve klinik notlar uygulamana yüklenir.',
    Icon: Icons.Stethoscope,
  },
  {
    n: '04', tag: 'Haftalık',
    title: 'Yaşa, takip et, ayarla',
    body: 'Haftalık 1:1 görüşmeler, mesajlaşma desteği ve düzenli plan revizyonu. Diyetisyenin yolculuğun boyunca seninle.',
    Icon: Icons.Heart,
  },
];

export default function HowSection() {
  const [tab, setTab] = useState('ai');
  const steps = tab === 'ai' ? AI_STEPS : UZMAN_STEPS;

  return (
    <section id="nasil" className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow"><span className="eyebrow-dot" />Nasıl çalışır</span>
          <h2 className="display serif">
            Plan oluşturmak <em>düşündüğünden</em><br />çok daha basit.
          </h2>
          <p className="lede">İki yol, iki uzmanlık. Sana uygun olanı seç ve hemen başla.</p>
        </div>

        <div className="how-tabs" role="tablist" aria-label="Diyet türü seçimi">
          <button
            role="tab" aria-selected={tab === 'ai'}
            className={tab === 'ai' ? 'active' : ''}
            onClick={() => setTab('ai')}
          >
            <Icons.Sparkle size={16} /> AI ile diyet
          </button>
          <button
            role="tab" aria-selected={tab === 'uzman'}
            className={tab === 'uzman' ? 'active' : ''}
            onClick={() => setTab('uzman')}
          >
            <Icons.Stethoscope size={16} /> Diyetisyen ile diyet
          </button>
          <div className="how-tabs-indicator" style={{ transform: tab === 'uzman' ? 'translateX(100%)' : 'translateX(0)' }} />
        </div>

        <div className="how-grid" key={tab} role="tabpanel">
          {steps.map((s, i) => (
            <article key={s.n} className="how-card" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="how-card-top">
                <span className="how-num serif">{s.n}</span>
                <span className="how-tag">{s.tag}</span>
              </div>
              <div className="how-icon"><s.Icon size={22} /></div>
              <h3 className="how-title">{s.title}</h3>
              <p className="how-body">{s.body}</p>
              <div className="how-line" />
            </article>
          ))}
        </div>
      </div>

      <style>{`
        .how-tabs {
          position: relative; display: inline-flex;
          background: #FBFAF5; border: 1px solid #E8E4D5;
          border-radius: 999px; padding: 4px; margin-bottom: 40px;
        }
        .how-tabs button {
          padding: 12px 22px; border-radius: 999px;
          font-size: 14px; font-weight: 600; color: #3F4A38;
          transition: color .3s; position: relative; z-index: 2;
          display: inline-flex; align-items: center; gap: 8px;
          background: none; border: none; cursor: pointer; font-family: inherit;
        }
        .how-tabs button.active { color: #FBFAF5; }
        .how-tabs-indicator {
          position: absolute; top: 4px; bottom: 4px; left: 4px;
          width: calc(50% - 4px); background: #1A2516; border-radius: 999px;
          transition: transform .4s cubic-bezier(0.34,1.56,0.64,1); z-index: 1;
        }

        .how-grid {
          display: grid; grid-template-columns: repeat(4,1fr);
          gap: 1px; background: #E8E4D5;
          border: 1px solid #E8E4D5; border-radius: 24px; overflow: hidden;
        }
        .how-card {
          background: #fff; padding: 32px 28px 36px;
          display: flex; flex-direction: column; gap: 14px; position: relative;
          transition: background .35s cubic-bezier(0.22,1,0.36,1);
          min-height: 320px; opacity: 0;
          animation: lp-card-in .5s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        .how-card:hover { background: #FAFBF3; }
        .how-card:hover .how-icon { background: #65A30D; color: #fff; transform: rotate(-6deg) scale(1.05); }
        .how-card:hover .how-line { transform: scaleX(1); }
        .how-card-top { display: flex; justify-content: space-between; align-items: baseline; }
        .how-num {
          font-size: 56px; line-height: 1; font-style: italic;
          color: #1A2516; letter-spacing: -0.03em;
        }
        .how-tag {
          font-family: "JetBrains Mono", monospace; font-size: 10px;
          padding: 4px 10px; border-radius: 999px;
          background: #F7FBE8; color: #4D7C0F; letter-spacing: 0.06em;
        }
        .how-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: #FBFAF5; color: #4D7C0F;
          display: flex; align-items: center; justify-content: center;
          margin-top: 12px; transition: all .4s cubic-bezier(0.34,1.56,0.64,1);
        }
        .how-title {
          font-size: 20px; font-weight: 600; letter-spacing: -0.01em;
          color: #1A2516; margin-top: 4px;
        }
        .how-body { font-size: 14px; color: #6B7363; line-height: 1.6; }
        .how-line {
          position: absolute; left: 0; right: 0; bottom: 0; height: 3px;
          background: #65A30D; transform: scaleX(0); transform-origin: left;
          transition: transform .55s cubic-bezier(0.22,1,0.36,1);
        }

        @media (max-width: 980px) { .how-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 560px)  { .how-grid { grid-template-columns: 1fr; } .how-card { min-height: auto; } }
      `}</style>
    </section>
  );
}
