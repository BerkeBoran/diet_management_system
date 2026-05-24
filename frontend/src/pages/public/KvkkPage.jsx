import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SECTIONS = [
  {
    id: 'veri-sorumlusu',
    title: '1. Veri Sorumlusu',
    content: (
      <>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verilerinizin veri
          sorumlusu <strong>Lifeetics</strong> ("Lifeetics", "Şirket" veya "biz")
          olup bu Aydınlatma Metni, hangi kişisel verilerin neden ve nasıl işlendiğini açıklamak amacıyla
          hazırlanmıştır.
        </p>
        <InfoBox>
          <strong>Unvan:</strong> Lifeetics<br />
          <strong>Merkez:</strong> İstanbul, Türkiye<br />
          <strong>E-posta:</strong> kvkk@lifeetics.com<br />
          <strong>Web:</strong> www.lifeetics.com
        </InfoBox>
      </>
    ),
  },
  {
    id: 'islenen-veriler',
    title: '2. İşlenen Kişisel Veriler',
    content: (
      <>
        <p>Kullanıcı rolünüze göre aşağıdaki kişisel veriler işlenmektedir.</p>

        <SubTitle>Tüm Kullanıcılar</SubTitle>
        <Table rows={[
          ['Kimlik Verileri', 'Ad, soyad'],
          ['İletişim Verileri', 'E-posta adresi, telefon numarası'],
          ['Demografik Veri', 'Yaş'],
          ['İşlem Güvenliği', 'Şifre özeti (hash), oturum bilgisi'],
        ]} />

        <SubTitle>Danışanlar</SubTitle>
        <Table rows={[
          ['Sağlık Verileri *', 'Boy, kilo, cinsiyet'],
          ['Sağlık Verileri *', 'Alerjiler, kronik hastalıklar'],
          ['Sağlık Verileri *', 'İlaç kullanımı'],
          ['Sağlık Verileri *', 'Hamilelik ve emzirme durumu'],
          ['Yaşam Tarzı Verileri', 'Beslenme tercihi, aktivite seviyesi, şeker tüketimi, sigara ve alkol kullanımı'],
          ['Görsel Veri', 'Yemek fotoğrafları (AI öğün analizi için yüklenen)'],
          ['Finansal Veri', 'Abonelik tutarı, ödeme durumu, İyzico işlem referans numaraları'],
        ]} />
        <p style={{ fontSize: 13, color: 'var(--ink-light)', marginTop: 8 }}>
          * KVKK Madde 6 kapsamında <strong>özel nitelikli kişisel veri</strong> olarak sınıflandırılmaktadır.
        </p>

        <SubTitle>Diyetisyenler</SubTitle>
        <Table rows={[
          ['Kimlik Verileri', 'T.C. kimlik numarası'],
          ['Mesleki Veri', 'Lisans numarası, lisans belgesi (dosya)'],
          ['Görsel Veri', 'Profil fotoğrafı'],
          ['İş Bilgisi', 'Biyografi, unvan, çalışma saatleri, danışmanlık ücreti'],
        ]} />
      </>
    ),
  },
  {
    id: 'amaç-hukuki-sebep',
    title: '3. İşleme Amaçları ve Hukuki Sebepler',
    content: (
      <Table
        headers={['Amaç', 'Hukuki Dayanak (KVKK Md.5–6)']}
        rows={[
          ['Hesap oluşturma ve kimlik doğrulama', 'Sözleşmenin kurulması ve ifası'],
          ['Kişiselleştirilmiş diyet planı oluşturma', 'Açık rıza (sağlık verisi) / Sözleşme ifası'],
          ['AI destekli öğün analizi yapma', 'Açık rıza'],
          ['Diyetisyen ile randevu yönetimi', 'Sözleşmenin ifası'],
          ['Mesajlaşma ve danışmanlık hizmeti sunma', 'Sözleşmenin ifası'],
          ['Diyetisyen başvurusunu değerlendirme', 'Meşru menfaat / Yasal yükümlülük'],
          ['Ödeme işlemlerini gerçekleştirme', 'Sözleşmenin ifası / Yasal yükümlülük'],
          ['Yasal saklama yükümlülüklerini yerine getirme', 'Yasal yükümlülük (VUK, TTK)'],
          ['Platform güvenliği ve sahteciliğin önlenmesi', 'Meşru menfaat'],
        ]}
      />
    ),
  },
  {
    id: 'ozel-nitelikli',
    title: '4. Özel Nitelikli Kişisel Veriler',
    content: (
      <>
        <p>
          Sağlık ve biyometrik nitelikli kişisel verileriniz (alerjiler, kronik hastalıklar, ilaç bilgileri,
          hamilelik/emzirme durumu, boy-kilo gibi fizyolojik ölçümler) KVKK Madde 6 uyarınca
          <strong> açık rızanıza</strong> dayanılarak işlenmektedir.
        </p>
        <p>
          Bu verileri sisteme girerek işlenmesine rıza vermiş sayılırsınız; rızanızı dilediğiniz zaman
          geri çekebilirsiniz. Rıza geri çekimi, geri çekme tarihinden önceki işlemlerin hukuka
          aykırı hale gelmesini sağlamaz.
        </p>
      </>
    ),
  },
  {
    id: 'aktarim',
    title: '5. Kişisel Verilerin Aktarılması',
    content: (
      <>
        <p>Kişisel verileriniz aşağıdaki taraflarla, belirtilen amaçlar doğrultusunda paylaşılabilir.</p>
        <Table
          headers={['Alıcı', 'Aktarılan Veri', 'Amaç']}
          rows={[
            ['Seçtiğiniz Diyetisyen', 'Sağlık anlık görüntüsü, randevu bilgisi, mesajlar', 'Danışmanlık hizmetinin sunulması'],
            ['Google LLC (Gemini AI)', 'Yemek fotoğrafları, diyet planı girdileri', 'AI destekli öğün analizi ve plan oluşturma'],
            ['İyzico Ödeme Hizmetleri A.Ş.', 'İsim, e-posta, ödeme tutarı', 'Güvenli ödeme işlemi'],
            ['Yetkili Kamu Kurum ve Kuruluşları', 'Yasal zorunluluk kapsamındaki veriler', 'Yasal yükümlülüklerin yerine getirilmesi'],
          ]}
        />
        <InfoBox type="warning">
          Google LLC, Avrupa Ekonomik Alanı dışında (ABD) yerleşik bir veri işleyicidir. Veri aktarımı,
          Google'ın KVKK uyumlu Veri İşleme Ek Sözleşmesi ve Standart Sözleşme Maddeleri kapsamında
          gerçekleştirilmektedir.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'toplama-yontemi',
    title: '6. Kişisel Verilerin Toplanma Yöntemi',
    content: (
      <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <li><strong>Kayıt formu:</strong> Hesap oluştururken girdiğiniz kimlik ve iletişim bilgileri.</li>
        <li><strong>Profil güncellemeleri:</strong> Boy, kilo, sağlık anlık görüntüsü vb. bilgiler.</li>
        <li><strong>Platform kullanımı:</strong> Randevular, mesajlar, diyet planı etkileşimleri.</li>
        <li><strong>Yüklenen dosyalar:</strong> Yemek fotoğrafları (öğün analizi), diyetisyen lisans belgesi.</li>
        <li><strong>Ödeme işlemi:</strong> İyzico ödeme altyapısı üzerinden.</li>
        <li><strong>Otomatik yollar:</strong> Oturum çerezleri, sunucu erişim kayıtları.</li>
      </ul>
    ),
  },
  {
    id: 'saklama-sure',
    title: '7. Saklama Süreleri',
    content: (
      <Table
        headers={['Veri Kategorisi', 'Saklama Süresi']}
        rows={[
          ['Hesap ve kimlik bilgileri', 'Hesap aktif olduğu sürece + 3 yıl'],
          ['Sağlık ve yaşam tarzı verileri', 'Hesap aktif olduğu sürece + 2 yıl'],
          ['Ödeme kayıtları', '10 yıl (VUK / TTK yükümlülüğü)'],
          ['Mesajlar ve randevu kayıtları', '2 yıl'],
          ['AI analiz sonuçları ve yemek fotoğrafları', '1 yıl'],
          ['Diyetisyen lisans belgesi', 'Üyelik süresince + 5 yıl'],
        ]}
      />
    ),
  },
  {
    id: 'haklariniz',
    title: '8. Veri Sahibi Hakları',
    content: (
      <>
        <p>KVKK Madde 11 uyarınca aşağıdaki haklara sahipsiniz:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 12 }}>
          {[
            ['Bilgi Alma', 'Kişisel verilerinizin işlenip işlenmediğini öğrenme'],
            ['Erişim', 'İşlenen verilerinize ve işleme amaçlarına erişme'],
            ['Düzeltme', 'Yanlış veya eksik verilerin düzeltilmesini isteme'],
            ['Silme', 'Koşulların varlığı halinde verilerinizin silinmesini talep etme'],
            ['İşlemenin Kısıtlanması', 'Belirli koşullarda işlemenin durdurulmasını isteme'],
            ['İtiraz', 'Meşru menfaate dayalı işlemelere itiraz etme'],
            ['Zararın Giderilmesi', 'Kanuna aykırı işleme nedeniyle uğradığınız zararın tazminini isteme'],
          ].map(([h, d]) => (
            <div key={h} style={{ background: 'var(--parchment)', borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--forest)', marginBottom: 4 }}>{h}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-light)', lineHeight: 1.5 }}>{d}</div>
            </div>
          ))}
        </div>
        <InfoBox style={{ marginTop: 20 }}>
          Başvurularınızı <strong>kvkk@lifeetics.com</strong> adresine e-posta ile veya{' '}
          <Link to="/support">destek sayfamızdaki</Link> form aracılığıyla iletebilirsiniz.
          Talebiniz en geç <strong>30 gün</strong> içinde yanıtlanır.
        </InfoBox>
      </>
    ),
  },
  {
    id: 'cerezler',
    title: '9. Çerezler',
    content: (
      <p>
        Platformumuz yalnızca kimlik doğrulama oturumunu sürdürmek için zorunlu çerezler kullanmaktadır.
        Pazarlama veya üçüncü taraf izleme çerezleri kullanılmamaktadır.
      </p>
    ),
  },
  {
    id: 'degisiklikler',
    title: '10. Metinde Değişiklik',
    content: (
      <p>
        Bu metin güncellendiğinde yeni versiyon platform üzerinden duyurulur. Önemli değişiklikler
        kayıtlı e-posta adresinize bildirilir. Güncelleme tarihinden itibaren platformu kullanmaya
        devam etmeniz güncellenmiş metni kabul ettiğiniz anlamına gelir.
      </p>
    ),
  },
];

function SubTitle({ children }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginTop: 20, marginBottom: 8 }}>
      {children}
    </div>
  );
}

function InfoBox({ children, type = 'info' }) {
  const bg = type === 'warning' ? '#FFF7ED' : 'var(--parchment)';
  const border = type === 'warning' ? '#FED7AA' : 'var(--parchment-dark)';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '14px 16px', fontSize: 13, lineHeight: 1.6, marginTop: 12 }}>
      {children}
    </div>
  );
}

function Table({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        {headers && (
          <thead>
            <tr>
              {headers.map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 12px', background: 'var(--parchment)', color: 'var(--ink)', fontWeight: 700, borderBottom: '2px solid var(--parchment-dark)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--parchment-dark)' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '10px 12px', color: j === 0 ? 'var(--ink)' : 'var(--ink-light)', fontWeight: j === 0 ? 600 : 400, verticalAlign: 'top' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function KvkkPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--parchment)', fontFamily: 'var(--font-sans)' }}>
      <Helmet>
        <title>KVKK Aydınlatma Metni | Lifeetics</title>
        <meta name="description" content="Lifeetics KVKK aydınlatma metni: kişisel verilerinizin hangi amaçla, nasıl işlendiği ve KVKK kapsamındaki haklarınız." />
        <link rel="canonical" href="https://lifeetics.com/kvkk" />
        <meta property="og:title" content="KVKK Aydınlatma Metni | Lifeetics" />
        <meta property="og:description" content="Lifeetics KVKK aydınlatma metni: kişisel verilerin işlenmesi ve haklarınız." />
        <meta property="og:url" content="https://lifeetics.com/kvkk" />
      </Helmet>
      {/* Header */}
      <div style={{ background: 'var(--forest)', padding: '48px 0 40px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
            ← Ana Sayfaya Dön
          </Link>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, color: 'var(--parchment)', marginBottom: 8 }}>
            KVKK Aydınlatma Metni
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>
            Son güncelleme: 10 Mayıs 2026 &nbsp;·&nbsp; Lifeetics
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px 80px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 40, alignItems: 'start' }}>

        {/* Sticky TOC */}
        <nav style={{ position: 'sticky', top: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ink-light)', marginBottom: 10 }}>İçindekiler</div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {SECTIONS.map(s => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{ fontSize: 13, color: 'var(--ink-light)', textDecoration: 'none', display: 'block', padding: '5px 8px', borderRadius: 6, lineHeight: 1.4 }}
                  onMouseEnter={e => e.target.style.color = 'var(--forest)'}
                  onMouseLeave={e => e.target.style.color = 'var(--ink-light)'}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: '16px 20px', fontSize: 13, lineHeight: 1.6, color: '#92400E' }}>
            Bu platform sağlık verisi dahil özel nitelikli kişisel verilerinizi işlemektedir. Lütfen bu metni
            dikkatlice okuyunuz. Sorularınız için <strong>kvkk@lifeetics.com</strong> adresine ulaşabilirsiniz.
          </div>

          {SECTIONS.map(s => (
            <section key={s.id} id={s.id}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, color: 'var(--forest)', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid var(--parchment-dark)' }}>
                {s.title}
              </h2>
              <div style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {s.content}
              </div>
            </section>
          ))}
        </main>
      </div>
    </div>
  );
}
