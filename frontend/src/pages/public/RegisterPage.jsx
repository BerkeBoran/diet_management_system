import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import api from '../../services/api';
import userService from '../../services/userService';
import Icons from '../../components/landing/LandingIcons';

/* ─── tiny helpers ─── */
const REG_SERIF = { fontFamily: '"Instrument Serif", Georgia, serif', fontWeight: 700 };
const REG_MONO  = { fontFamily: '"JetBrains Mono", monospace' };

function pwLevel(pw) {
  if (pw.length >= 12) return 3;
  if (pw.length >= 8)  return 2;
  if (pw.length >= 4)  return 1;
  return 0;
}
function pwLabel(lvl) {
  return ['—', 'Zayıf', 'Orta', 'Güçlü'][lvl];
}

/* ─── file drop zone (for dietician) ─── */
function FileDropZone({ accept, file, onFile, hint, icon }) {
  return (
    <label className="reg-file-zone" data-filled={!!file}>
      <input type="file" accept={accept} style={{ display: 'none' }} onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      {file ? (
        <>
          <span style={{ fontSize: 22 }}>✅</span>
          <span className="reg-file-name">{file.name}</span>
          <span className="reg-file-hint">{(file.size / 1024 / 1024).toFixed(2)} MB — değiştirmek için tıkla</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 26 }}>{icon}</span>
          <span className="reg-file-name">Dosya yüklemek için tıkla</span>
          <span className="reg-file-hint">{hint}</span>
        </>
      )}
    </label>
  );
}

/* ─── success screen ─── */
function SuccessScreen({ role }) {
  return (
    <div className="reg-success-wrap">
      <div className="reg-success-card">
        <div style={{ fontSize: 56, marginBottom: 12 }}>{role === 'danisan' ? '🎉' : '🎓'}</div>
        <h2 style={{ ...REG_SERIF, fontSize: 32, color: 'var(--ink)', letterSpacing: '-0.02em', marginBottom: 12 }}>
          {role === 'danisan' ? 'Kayıt tamamlandı!' : 'Başvurunuz alındı!'}
        </h2>
        <p style={{ fontSize: 15, color: 'var(--ink-mute)', lineHeight: 1.65, maxWidth: 380, marginBottom: 28 }}>
          {role === 'danisan'
            ? 'E-posta adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.'
            : 'Başvurunuz lisans belgeniz doğrulandıktan sonra 1–3 iş günü içinde sonuçlandırılacaktır.'}
        </p>
        <Link to="/login" className="reg-btn-submit" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          Giriş yap <Icons.ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}

/* ─── role choice ─── */
function RoleChoice({ onPick }) {
  return (
    <main className="reg-choice">
      <div className="reg-choice-head">
        <span className="reg-eyebrow"><span className="reg-eyebrow-dot" />Hesap oluştur</span>
        <h1 style={{ ...REG_SERIF, fontSize: 'clamp(40px,5.5vw,76px)', lineHeight: 1.04, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
          Kim olarak <em style={{ fontStyle: 'italic', color: 'var(--accent-deep)' }}>katılıyorsun?</em>
        </h1>
        <p className="reg-choice-sub">
          Rolüne göre sana özel bir deneyim sunuyoruz. Sonra her zaman değiştirebilirsin.
        </p>
      </div>

      <div className="reg-role-cards">
        {/* DANIŞAN */}
        <button className="reg-role-card reg-role-card-danisan" onClick={() => onPick('danisan')}>
          <div className="reg-role-card-hero" aria-hidden>
            <div className="reg-role-card-pic" />
            <span className="reg-role-card-tag">En popüler</span>
          </div>
          <div className="reg-role-card-body">
            <div className="reg-role-card-icon"><Icons.Heart size={20} /></div>
            <h3 style={{ ...REG_SERIF, fontSize: 28, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Danışan</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
              Uzman diyetisyenlerle çalış, kişisel diyet planı al ve sağlık hedeflerine ulaş.
            </p>
            <ul className="reg-role-card-feats">
              <li><Icons.Check size={13} /> Kişiye özel diyet planı</li>
              <li><Icons.Check size={13} /> AI destekli analiz ve takip</li>
              <li><Icons.Check size={13} /> Randevu yönetimi</li>
              <li><Icons.Check size={13} /> 7/24 mesajlaşma</li>
            </ul>
            <span className="reg-role-card-cta reg-btn reg-btn-primary">
              Danışan olarak devam et <Icons.ArrowRight size={14} />
            </span>
          </div>
        </button>

        {/* DİYETİSYEN */}
        <button className="reg-role-card reg-role-card-uzman" onClick={() => onPick('diyetisyen')}>
          <div className="reg-role-card-hero" aria-hidden>
            <div className="reg-role-card-pic reg-role-card-pic-uz" />
            <span className="reg-role-card-tag reg-role-card-tag-uz">Profesyoneller için</span>
          </div>
          <div className="reg-role-card-body">
            <div className="reg-role-card-icon reg-role-card-icon-uz"><Icons.Stethoscope size={20} /></div>
            <h3 style={{ ...REG_SERIF, fontSize: 28, letterSpacing: '-0.01em', color: 'var(--ink)' }}>Diyetisyen</h3>
            <p style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>
              Profesyonel profilini oluştur, danışanlarını yönet ve pratiğini büyüt.
            </p>
            <ul className="reg-role-card-feats reg-role-card-feats-uz">
              <li><Icons.Check size={13} /> Profesyonel profil sayfası</li>
              <li><Icons.Check size={13} /> Danışan yönetimi paneli</li>
              <li><Icons.Check size={13} /> Diyet planı oluşturma araçları</li>
              <li><Icons.Check size={13} /> Akıllı takvim ve faturalama</li>
            </ul>
            <span className="reg-role-card-cta reg-btn reg-btn-accent">
              Diyetisyen olarak devam et <Icons.ArrowRight size={14} />
            </span>
          </div>
        </button>
      </div>
    </main>
  );
}

/* ─── multi-step form ─── */
const STEP_TITLES = {
  danisan: [
    ['Seni biraz tanıyalım', 'Temel bilgilerle başlayalım. Bunları sonradan değiştirebilirsin.'],
    ['Vücut bilgilerin', 'Kişiselleştirilmiş plan için ihtiyacımız var.'],
    ['Sağlık profili', 'Sana en uygun beslenme planını önerebilmemiz için.'],
    ['Hesabını koru', 'Güvenli bir şifre seç ve kaydı tamamla.'],
  ],
  diyetisyen: [
    ['Seni biraz tanıyalım', 'Temel bilgilerle başlayalım. Bunları sonradan değiştirebilirsin.'],
    ['Mesleki bilgilerin', 'Profilinde gösterilecek bilgiler. Belge doğrulama 24 saat içinde yapılır.'],
    ['Çalışma saatlerin', 'Randevu sistemi için müsaitlik bilgilerini gir. Sonradan değiştirebilirsin.'],
    ['Hesabını koru', 'Güvenli bir şifre seç ve kaydı tamamla.'],
  ],
};

const GOOGLE_STEP_TITLES = [
  ['Google hesabınla kayıt ol', 'Ad, soyad ve e-posta Google\'dan alındı. Sadece telefon numaranı ekle.'],
  ['Vücut bilgilerin', 'Kişiselleştirilmiş plan için ihtiyacımız var.'],
  ['Sağlık profili', 'Sana en uygun beslenme planını önerebilmemiz için.'],
  ['Neredeyse bitti!', 'Kullanım şartlarını onaylayarak kaydı tamamla.'],
];

const HEALTH_GOALS = [
  { v: 'Lose',     l: 'Kilo ver',     icon: 'Bolt' },
  { v: 'Gain',     l: 'Kilo al',      icon: 'Heart' },
  { v: 'Maintain', l: 'Formumu koru', icon: 'Sparkle' },
];

const TITLES_DYT = [
  { value: 'DIETICIAN',        label: 'Dyt.' },
  { value: 'EXPERT_DIETICIAN', label: 'Uzm. Dyt.' },
  { value: 'INTERN_DIETICIAN', label: 'Stj. Dyt.' },
];

function RegForm({ role, onBack, googleData = null }) {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const isGoogleFlow = !!googleData;
  const TOTAL_STEPS = isGoogleFlow ? 4 : 4;

  const [step, setStep]       = useState(1);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [legalModal, setLegalModal] = useState(null);
  const [dieticianCount, setDieticianCount] = useState(null);

  useEffect(() => {
    api.get('/users/stats/')
      .then(res => setDieticianCount(res.data.dietician_count))
      .catch(() => setDieticianCount(0));
  }, []);

  const [data, setData] = useState({
    firstName: googleData?.firstName || '',
    lastName:  googleData?.lastName  || '',
    email:     googleData?.email     || '',
    phone: '', age: '', gender: '', height: '', weight: '', goal: '',
    activityLevel: 'NONE', dietaryPreference: 'NORMAL', sugarIntake: 'NONE', budget: 'MEDIUM',
    isPregnant: false, isBreastfeeding: false, alcoholUse: false, smokingUse: false,
    medications: [], dislikeFoods: [], medicationInput: '', dislikeFoodInput: '',
    title: 'DIETICIAN', licenseNumber: '', biography: '',
    licenseDoc: null, profilePhoto: null,
    workStart: '09:00', workEnd: '17:00',
    weekendWork: false, weekendStart: '10:00', weekendEnd: '14:00',
    appointmentDuration: 30, monthlyPrice: '',
    password: '', confirm: '', accept: false, acceptKvkk: false,
  });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));

  const handleGoogleInForm = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const info = await res.json();
        navigate('/register', {
          replace: true,
          state: {
            googleFlow: true,
            accessToken: tokenResponse.access_token,
            firstName: info.given_name || '',
            lastName:  info.family_name || '',
            email:     info.email || '',
          },
        });
      } catch {
        setError('Google bilgileri alınamadı.');
      }
    },
    onError: () => setError('Google girişi başarısız.'),
    scope: 'email profile',
  });

  const validate = () => {
    if (isGoogleFlow) {
      if (step === 1 && !data.phone) return 'Telefon numarası zorunludur.';
      if (step === 2 && (!data.age || !data.gender || !data.height || !data.weight)) return 'Tüm sağlık bilgileri zorunludur.';
      if (step === 3 && !data.goal) return 'Lütfen bir hedef seçin.';
      if (step === 4 && !data.acceptKvkk) return 'KVKK Aydınlatma Metni\'ni onaylayın.';
      if (step === 4 && !data.accept) return 'Kullanım Şartları ve Gizlilik Politikası\'nı onaylayın.';
      return null;
    }
    if (step === 1) {
      if (!data.firstName || !data.lastName || !data.email || !data.phone) return 'Tüm alanları doldurun.';
      if (role === 'diyetisyen' && !data.age) return 'Yaş alanı zorunludur.';
    }
    if (step === 2 && role === 'danisan') {
      if (!data.age || !data.gender || !data.height || !data.weight) return 'Tüm alanları doldurun.';
    }
    if (step === 2 && role === 'diyetisyen') {
      if (!data.licenseNumber) return 'Lisans numarası zorunludur.';
      if (!data.licenseDoc) return 'Lisans belgesi yükleyin.';
      if (!data.profilePhoto) return 'Profil fotoğrafı yükleyin.';
    }
    if (step === 3 && role === 'danisan') {
      if (!data.goal) return 'Lütfen bir hedef seçin.';
    }
    // step 3 diyetisyen: schedule (tümü isteğe bağlı, geçebilir)
    if (!isGoogleFlow && step === TOTAL_STEPS) {
      if (!data.password || !data.confirm) return 'Şifre alanlarını doldurun.';
      if (data.password.length < 8) return 'Şifre en az 8 karakter olmalı.';
      if (data.password !== data.confirm) return 'Şifreler eşleşmiyor.';
      if (!data.acceptKvkk) return 'KVKK Aydınlatma Metni\'ni onaylayın.';
      if (!data.accept) return 'Kullanım Şartları ve Gizlilik Politikası\'nı onaylayın.';
    }
    return null;
  };

  const next = (e) => {
    e?.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    if (step < TOTAL_STEPS) { setStep(s => s + 1); return; }
    isGoogleFlow ? submitGoogleFlow() : submit();
  };

  const prev = () => {
    setError('');
    if (step === 1) { isGoogleFlow ? navigate(-1) : onBack(); }
    else setStep(s => s - 1);
  };

  const submitGoogleFlow = async () => {
    setLoading(true);
    setError('');
    try {
      const authData = await authService.googleLogin(googleData.accessToken);
      loginWithToken(authData);
      await userService.updateProfile({
        phone_number: data.phone,
        age:    parseInt(data.age),
        gender: data.gender,
        height: parseFloat(data.height),
        weight: parseFloat(data.weight),
      });
      await userService.createHealthSnapshot({
        goal:               data.goal,
        activity_level:     data.activityLevel,
        dietary_preference: data.dietaryPreference,
        sugar_intake:       data.sugarIntake,
        budget:             data.budget,
        is_pregnant:        data.isPregnant,
        is_breastfeeding:   data.isBreastfeeding,
        alcohol_use:        data.alcoholUse,
        smoking_use:        data.smokingUse,
        medications:        data.medications,
        dislike_foods:      data.dislikeFoods,
      });
      navigate('/client/dashboard', { replace: true });
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === 'object') {
        const msgs = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`);
        setError(msgs.join(' · '));
      } else {
        setError('Kayıt başarısız. Lütfen tekrar deneyin.');
      }
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      if (role === 'danisan') {
        await authService.registerClient({
          first_name: data.firstName, last_name: data.lastName,
          email: data.email, phone_number: data.phone,
          password: data.password, password_confirm: data.confirm,
          age: parseInt(data.age), gender: data.gender,
          height: parseFloat(data.height), weight: parseFloat(data.weight),
          allergies: [], chronic_conditions: [],
        });
        localStorage.setItem('pending_health_snapshot', JSON.stringify({
          goal: data.goal,
          activity_level: data.activityLevel,
          dietary_preference: data.dietaryPreference,
          sugar_intake: data.sugarIntake,
          budget: data.budget,
          is_pregnant: data.isPregnant,
          is_breastfeeding: data.isBreastfeeding,
          alcohol_use: data.alcoholUse,
          smoking_use: data.smokingUse,
          medications: data.medications,
          dislike_foods: data.dislikeFoods,
        }));
      } else {
        const fd = new FormData();
        fd.append('first_name', data.firstName);
        fd.append('last_name', data.lastName);
        fd.append('email', data.email);
        fd.append('phone_number', data.phone);
        fd.append('age', data.age);
        fd.append('password', data.password);
        fd.append('password_confirm', data.confirm);
        fd.append('license_number', data.licenseNumber);
        fd.append('title', data.title);
        fd.append('biography', data.biography);
        fd.append('license_document', data.licenseDoc);
        fd.append('profile_photo', data.profilePhoto);
        fd.append('schedule.work_time_start', data.workStart);
        fd.append('schedule.work_time_end', data.workEnd);
        fd.append('schedule.weekend_workings', data.weekendWork);
        fd.append('schedule.appointment_duration', data.appointmentDuration);
        fd.append('schedule.weekend_work_time_start', data.weekendWork ? data.weekendStart : '');
        fd.append('schedule.weekend_work_time_end', data.weekendWork ? data.weekendEnd : '');
        if (data.monthlyPrice) fd.append('schedule.monthly_price', data.monthlyPrice);
        await authService.registerDietician(fd);
      }
      setSuccess(true);
    } catch (err) {
      const d = err.response?.data;
      if (d && typeof d === 'object') {
        const msgs = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`);
        setError(msgs.join(' · '));
      } else {
        setError('Kayıt başarısız. Bilgilerinizi kontrol edin.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) return <SuccessScreen role={role} />;

  const Section = ({ title, children }) => (
    <div>
      <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4, fontSize: 13 }}>{title}</div>
      <div>{children}</div>
    </div>
  );

  const MODAL_TITLES = {
    kvkk:    'Kişisel Verilerin Korunması Politikası ve Aydınlatma Metni',
    terms:   'Üyelik Sözleşmesi',
    privacy: 'Gizlilik Politikası',
    cookies: 'Çerez Politikası',
  };

  const LegalModal = () => {
    if (!legalModal) return null;
    return (
      <div onClick={() => setLegalModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(14,31,14,0.55)', backdropFilter: 'blur(4px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 680, maxHeight: '84vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px -20px rgba(26,37,22,.25)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 20, color: 'var(--ink)' }}>{MODAL_TITLES[legalModal]}</div>
            <button onClick={() => setLegalModal(null)} style={{ background: 'var(--bg-warm)', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 14, color: 'var(--ink-mute)' }}>✕ Kapat</button>
          </div>
          <div style={{ overflowY: 'auto', padding: '24px 28px', fontSize: 13, lineHeight: 1.75, color: 'var(--ink-soft)', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {legalModal === 'kvkk' && (
              <>
                <p>İşbu Kişisel Verilerin Korunması Politikası ve Aydınlatma Metni ile Lifeetics platformunun kullanımı sırasında elde edilen kişisel verilerin işlenmesine dair, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) gereği aydınlatma yükümlülüğünün yerine getirilmesi amaçlanmıştır.</p>
                <Section title="Veri Sorumlusu">Lifeetics — kvkk@lifeetics.com</Section>
                <Section title="Toplanan Kişisel Veriler">Ad, soyad, e-posta, telefon numarası, yaş, cinsiyet (tüm kullanıcılar). Danışanlar için ayrıca: boy, kilo, alerjiler, kronik hastalıklar, ilaç kullanımı, hamilelik/emzirme durumu, sigara/alkol kullanımı, beslenme tercihleri ve yemek fotoğrafları. Diyetisyenler için: lisans belgesi, profil fotoğrafı.</Section>
                <Section title="İşleme Amaçları">Hesap oluşturma ve kimlik doğrulama; kişiselleştirilmiş diyet planı oluşturma; AI destekli öğün analizi; randevu ve mesajlaşma hizmetleri; ödeme işlemleri; yasal yükümlülüklerin yerine getirilmesi; pazarlama ve analiz faaliyetleri.</Section>
                <Section title="Özel Nitelikli Kişisel Veriler">Sağlık verileriniz (alerjiler, kronik hastalıklar, ilaçlar, hamilelik/emzirme durumu) KVKK Madde 6 kapsamında açık rızanıza dayanılarak işlenmektedir.</Section>
                <Section title="Üçüncü Taraf Aktarımlar">Ödeme altyapısı için ödeme kuruluşları, AI analiz hizmetleri için ilgili teknoloji sağlayıcıları ve yasal zorunluluk kapsamında yetkili kamu kuruluşlarına aktarım yapılabilir.</Section>
                <Section title="Veri Güvenliği">Kişisel verilerinizin gizliliğini korumak için gerekli tüm teknik ve idari güvenlik önlemleri alınmaktadır. Verileriniz hiçbir surette izinsiz üçüncü kişilerle paylaşılmaz veya satılmaz.</Section>
                <Section title="İlgili Kişi Hakları (KVKK Md. 11)">Kişisel verilerinize erişme, düzeltme, silme, işlemenin kısıtlanmasını isteme, itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Bu haklarınızı kvkk@lifeetics.com adresine yazılı başvuru ile kullanabilirsiniz.</Section>
              </>
            )}
            {legalModal === 'terms' && (
              <>
                <p>Bu sözleşme, Lifeetics platformunun kullanımını, sunulan hizmetleri ve tarafların yükümlülüklerini düzenler. Kayıt işleminin tamamlanmasıyla sözleşme yürürlüğe girer.</p>
                <Section title="1. Hizmetin Kapsamı">Lifeetics, kullanıcılarına AI destekli diyet planlaması ve lisanslı diyetisyenlerle danışmanlık hizmeti sunar. Platform yalnızca bilgilendirme amaçlıdır; tıbbi teşhis veya tedavi niteliği taşımaz.</Section>
                <Section title="2. Kullanım Koşulları">Platforma doğru ve güncel bilgi sağlamak kullanıcının sorumluluğundadır. Kullanıcı 18 yaşından büyük olmalıdır. Hesap bilgilerinin gizliliğini korumak kullanıcı yükümlülüğüdür.</Section>
                <Section title="3. Diyetisyen Hesapları">Diyetisyen olarak kayıt olmak için geçerli bir lisans belgesine sahip olmak zorunludur. Sahte belge yüklenmesi hesabın kalıcı olarak kapatılmasına ve hukuki işlem başlatılmasına yol açar.</Section>
                <Section title="4. Hizmet Onay Süreci">Danışan, ödemeyi tamamladığı anda hizmet onaylanmış olur. Diyetisyen danışanı kabul etmezse Lifeetics alternatif diyetisyen önerir; kabul edilmezse iade yapılır.</Section>
                <Section title="5. Ödemeler">Ödeme işlemleri entegre ödeme altyapısıyla gerçekleştirilir. Abonelik iptali, yeni dönem başlamadan en az 24 saat önce yapılmalıdır.</Section>
                <Section title="6. İptal ve İade">Hizmet başlamadan önce 14 günlük yasal cayma hakkı kullanılabilir. Hizmet başladıktan sonra kullanılmayan süreye ait ücret iade edilmez.</Section>
                <Section title="7. Sorumluluk Sınırı">Lifeetics, platform içerik hatalarından, hizmet kesintilerinden, diyetisyen tavsiyelerinin sonuçlarından veya üçüncü taraf servis aksaklıklarından kaynaklanan zararlardan sorumlu tutulamaz.</Section>
                <Section title="8. Fikri Mülkiyet">Platform üzerindeki tüm içerik, tasarım, yazılım ve marka hakları Lifeetics'e aittir. İzinsiz kopyalanması ve kullanılması yasaktır.</Section>
                <Section title="9. Uygulanacak Hukuk">Bu sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklar İstanbul mahkemelerinde çözüme kavuşturulur.</Section>
              </>
            )}
            {legalModal === 'privacy' && (
              <>
                <p>Lifeetics kullanıcıların gizliliğine büyük önem vermektedir. Platformu kullandığınızda bazı bilgiler toplanır ve bu bilgiler tarafımızca gizli tutulur. Hizmetlerimizden faydalanmakla bu politikayı kabul etmiş sayılırsınız.</p>
                <Section title="Toplanan Bilgiler">Hesap kaydı sırasında: ad, soyad, e-posta, telefon, cinsiyet, doğum tarihi. Profil oluşturma aşamasında: konum, ilgi alanları, yaşam tarzı, alışkanlıklar, fotoğraf. Sistem tarafından: oturum bilgileri, kullanılan özellikler, IP adresi, cihaz bilgileri.</Section>
                <Section title="Bilgilerin Kullanımı">Toplanan veriler; hizmetlerin sunulması, kişiselleştirme, ödeme ve muhasebe işlemleri, güvenlik, analiz ve pazarlama amaçlarıyla kullanılır. Kişisel veriler hiçbir şekilde izinsiz üçüncü kişilerle paylaşılmaz veya satılmaz.</Section>
                <Section title="Google Kullanıcı Verileri">Lifeetics, Google üzerinden giriş yapan kullanıcılardan yalnızca e-posta adresi ve ad/soyad bilgisi toplar. Bu veriler yalnızca kimlik doğrulama ve hesap oluşturma amacıyla kullanılır; hiçbir üçüncü tarafla paylaşılmaz.</Section>
                <Section title="İstisnai Haller">Yasal zorunluluklar, yetkili adli/idari makam talepleri ve kullanıcı güvenliğinin korunması gereken durumlarda gizlilik hükümleri dışına çıkılabilir.</Section>
                <Section title="Güvenlik">Lifeetics, gizli bilgileri özel ve gizli tutmayı, güvenliğini ve bütünlüğünü sağlamayı KVKK ve yürürlükteki mevzuat gereği taahhüt eder. Güvenlik açığı bildirimi: destek@lifeetics.com</Section>
                <Section title="Değişiklikler">Lifeetics bu politikayı önceden bildirmeksizin güncelleme hakkını saklı tutar. Güncel politika her zaman platform üzerinden erişilebilir olacaktır.</Section>
              </>
            )}
            {legalModal === 'cookies' && (
              <>
                <p>Lifeetics, ziyaretçileri için belirli çerezler kullanmaktadır. Aşağıda kullanılan çerez türleri, amaçları ve yönetim yöntemleri hakkında detaylı bilgi bulabilirsiniz.</p>
                <Section title="Çerez Nedir?">Çerezler, sunucular tarafından oluşturulan ve tarayıcınız aracılığıyla cihazınızda saklanan küçük metin dosyalarıdır. Ad, cinsiyet gibi kişisel bilgiler içermezler.</Section>
                <Section title="Kullanılan Çerez Türleri">
                  <strong>Zorunlu Çerezler:</strong> Platformun düzgün çalışması için gereklidir.<br/>
                  <strong>İşlevsel Çerezler:</strong> Kullanıcı tercihlerini hatırlamaya yardımcı olur.<br/>
                  <strong>Analitik Çerezler:</strong> Ziyaretçi sayısı, görüntülenen sayfalar gibi analitik veriler sağlar.<br/>
                  <strong>Hedefleme/Reklam Çerezleri:</strong> Kullanıcılara gösterilen reklamları kişiselleştirir.
                </Section>
                <Section title="Çerez Kullanım Amaçları">Platformun temel işlevlerini etkinleştirmek; performans analizleri yapmak; kullanım kolaylığını artırmak; kişiselleştirme ve hedefleme faaliyetleri yürütmek.</Section>
                <Section title="Çerez Tercihlerini Yönetme">Tarayıcı ayarlarınızdan çerez tercihlerinizi değiştirebilirsiniz. Zorunlu çerezler tercih değişikliğine tabi değildir. Çerezleri devre dışı bırakmak bazı platform özelliklerinin çalışmamasına yol açabilir.</Section>
                <Section title="İletişim">Çerezlerle ilgili kişisel verilerinize dair taleplerinizi kvkk@lifeetics.com adresine iletebilirsiniz.</Section>
              </>
            )}
          </div>
          <div style={{ padding: '16px 28px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setLegalModal(null)} style={{ padding: '10px 24px', background: 'var(--ink)', color: '#fff', border: 'none', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Anladım</button>
          </div>
        </div>
      </div>
    );
  };

  const [title, subtitle] = isGoogleFlow
    ? GOOGLE_STEP_TITLES[step - 1]
    : STEP_TITLES[role][step - 1];
  const lvl = pwLevel(data.password);

  return (
    <main className="reg-form-shell">
      <div className="reg-form-card">
        {/* top bar */}
        <div className="reg-form-top">
          <button className="reg-back" type="button" onClick={prev}>
            <Icons.ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
            {step === 1 ? 'Rol değiştir' : 'Geri'}
          </button>
          <div className="reg-step-pill" style={REG_MONO}>
            <span>Adım {step}</span>
            <span style={{ opacity: 0.5 }}>/ {TOTAL_STEPS}</span>
          </div>
        </div>

        {/* progress bar */}
        <div className="reg-progress">
          <div className="reg-progress-bar" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>

        {/* form head */}
        <div className="reg-form-head">
          <span className={`reg-role-pill${role === 'diyetisyen' ? ' reg-role-pill-uz' : ''}`}>
            {role === 'danisan' ? <Icons.Heart size={12} /> : <Icons.Stethoscope size={12} />}
            {role === 'danisan' ? 'Danışan' : 'Diyetisyen'}
          </span>
          <h2 style={{ ...REG_SERIF, fontSize: 'clamp(28px,3vw,38px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            {title}
          </h2>
          <p style={{ fontSize: 14, color: 'var(--ink-mute)', lineHeight: 1.55 }}>{subtitle}</p>
        </div>

        {!isGoogleFlow && role === 'danisan' && step === 1 && (
          <>
            <div className="reg-social">
              <button type="button" className="reg-social-btn" onClick={() => handleGoogleInForm()}>
                <svg width="16" height="16" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/>
                  <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4l3-2.3z"/>
                  <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.5 0 2.4 2.1.9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6z"/>
                </svg>
                Google ile devam et
              </button>
              <button type="button" className="reg-social-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.6 12.5c0-2.7 2.2-4 2.3-4-1.3-1.8-3.2-2.1-3.9-2.1-1.7-.2-3.3 1-4.1 1-.9 0-2.2-1-3.6-1-1.8.1-3.6 1-4.5 2.7-1.9 3.4-.5 8.3 1.4 11 .9 1.3 2 2.8 3.4 2.7 1.4-.1 1.9-.9 3.5-.9s2.1.9 3.6.9c1.5 0 2.4-1.3 3.3-2.7 1.1-1.5 1.5-3 1.5-3.1-.1 0-2.9-1.1-2.9-4.5zM15 4.5c.7-.9 1.2-2.1 1.1-3.3-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.2 1.2.1 2.3-.6 3-1.4z"/>
                </svg>
                Apple ile devam et
              </button>
            </div>
            <div className="reg-divider">veya e-posta ile</div>
          </>
        )}

        {error && <div className="reg-error">{error}</div>}

        <form className="reg-form" onSubmit={next}>

          {/* ── GOOGLE FLOW STEP 1 ── */}
          {isGoogleFlow && step === 1 && (
            <>
              <div style={{ background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.2)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
                  <path fill="#4285F4" d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"/>
                  <path fill="#34A853" d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3C2.4 15.9 5.5 18 9 18z"/>
                  <path fill="#FBBC05" d="M3.9 10.7c-.2-.5-.3-1.1-.3-1.7s.1-1.2.3-1.7V5H.9C.3 6.2 0 7.5 0 9s.3 2.8.9 4l3-2.3z"/>
                  <path fill="#EA4335" d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6C13.5.9 11.4 0 9 0 5.5 0 2.4 2.1.9 5l3 2.3C4.6 5.1 6.6 3.6 9 3.6z"/>
                </svg>
                <span style={{ fontSize: 13, color: 'var(--ink-mute)', lineHeight: 1.4 }}>
                  Ad, soyad ve e-posta Google hesabından alındı. Sadece telefon numaranı gir.
                </span>
              </div>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Ad</span>
                  <div className="reg-input-wrap" style={{ opacity: 0.55 }}>
                    <input disabled value={googleData.firstName} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Soyad</span>
                  <div className="reg-input-wrap" style={{ opacity: 0.55 }}>
                    <input disabled value={googleData.lastName} />
                  </div>
                </label>
              </div>
              <label className="reg-field">
                <span className="reg-field-label">E-posta</span>
                <div className="reg-input-wrap" style={{ opacity: 0.55 }}>
                  <input disabled value={googleData.email} />
                </div>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Telefon</span>
                <div className="reg-input-wrap">
                  <input type="tel" required placeholder="+90 5__ ___ __ __" value={data.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </label>
            </>
          )}

          {/* ── GOOGLE FLOW STEP 2 ── */}
          {isGoogleFlow && step === 2 && (
            <>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Yaş</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="14" max="100" placeholder="28" value={data.age} onChange={e => set('age', e.target.value)} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Cinsiyet</span>
                  <div className="reg-input-wrap">
                    <select required value={data.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Seç</option>
                      <option value="Female">Kadın</option>
                      <option value="Male">Erkek</option>
                      <option value="Other">Belirtmek istemiyorum</option>
                    </select>
                  </div>
                </label>
              </div>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Boy (cm)</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="50" max="250" placeholder="168" value={data.height} onChange={e => set('height', e.target.value)} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Kilo (kg)</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="1" step="0.1" placeholder="65" value={data.weight} onChange={e => set('weight', e.target.value)} />
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ── GOOGLE FLOW STEP 3 — SAĞLIK PROFİLİ ── */}
          {isGoogleFlow && step === 3 && (
            <>
              <div className="reg-field">
                <span className="reg-field-label">Birincil hedef</span>
                <div className="reg-goal-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  {HEALTH_GOALS.map(g => {
                    const Ic = Icons[g.icon];
                    return (
                      <button key={g.v} type="button" className={`reg-goal-pill${data.goal === g.v ? ' active' : ''}`} onClick={() => set('goal', g.v)}>
                        <Ic size={16} /> {g.l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Aktivite düzeyi</span>
                  <div className="reg-input-wrap">
                    <select value={data.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                      <option value="NONE">Hiç</option>
                      <option value="LOW">Haftada 1–2 kez</option>
                      <option value="MEDIUM">Haftada 3–4 kez</option>
                      <option value="HIGH">Haftada 4–5 kez</option>
                      <option value="VERY_HIGH">Her gün</option>
                    </select>
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Beslenme tercihi</span>
                  <div className="reg-input-wrap">
                    <select value={data.dietaryPreference} onChange={e => set('dietaryPreference', e.target.value)}>
                      <option value="NORMAL">Normal</option>
                      <option value="VEGETARIAN">Vejetaryen</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>
                </label>
              </div>
              <label className="reg-field">
                <span className="reg-field-label">Şeker tüketimi</span>
                <div className="reg-input-wrap">
                  <select value={data.sugarIntake} onChange={e => set('sugarIntake', e.target.value)}>
                    <option value="NONE">Hiç</option>
                    <option value="LOW">Haftada 1–2 kez</option>
                    <option value="MEDIUM">Haftada 3–4 kez</option>
                    <option value="HIGH">Her gün</option>
                    <option value="CRAVINGS">Anlık tatlı krizlerim var</option>
                  </select>
                </div>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Diyet bütçesi</span>
                <div className="reg-input-wrap">
                  <select value={data.budget} onChange={e => set('budget', e.target.value)}>
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>
              </label>
              <div className="reg-field">
                <span className="reg-field-label">Sağlık durumu</span>
                <div className="reg-health-toggles">
                  {[
                    { key: 'isPregnant',      label: 'Hamilelik' },
                    { key: 'isBreastfeeding', label: 'Emzirme' },
                    { key: 'alcoholUse',      label: 'Alkol kullanımı' },
                    { key: 'smokingUse',      label: 'Sigara kullanımı' },
                  ].filter(({ key }) => data.gender === 'Male' ? !['isPregnant', 'isBreastfeeding'].includes(key) : true)
                  .map(({ key, label }) => (
                    <div key={key} className="reg-schedule-row">
                      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
                      <button type="button" className={`reg-toggle${data[key] ? ' on' : ''}`} onClick={() => set(key, !data[key])}>
                        <span className="reg-toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reg-field">
                <span className="reg-field-label">İlaç kullanımı <span style={{ fontWeight: 700, opacity: 0.6 }}>(isteğe bağlı)</span></span>
                <div className="reg-input-wrap">
                  <input
                    placeholder="İlaç adı yaz, Enter'a bas"
                    value={data.medicationInput}
                    onChange={e => set('medicationInput', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = data.medicationInput.trim();
                        if (val && !data.medications.includes(val)) {
                          set('medications', [...data.medications, val]);
                          set('medicationInput', '');
                        }
                      }
                    }}
                  />
                </div>
                {data.medications.length > 0 && (
                  <div className="reg-tags">
                    {data.medications.map(m => (
                      <span key={m} className="reg-tag">
                        {m}
                        <button type="button" onClick={() => set('medications', data.medications.filter(x => x !== m))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="reg-field">
                <span className="reg-field-label">Sevmediğin yiyecekler <span style={{ fontWeight: 700, opacity: 0.6 }}>(isteğe bağlı)</span></span>
                <div className="reg-input-wrap">
                  <input
                    placeholder="Yiyecek adı yaz, Enter'a bas"
                    value={data.dislikeFoodInput}
                    onChange={e => set('dislikeFoodInput', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = data.dislikeFoodInput.trim();
                        if (val && !data.dislikeFoods.includes(val)) {
                          set('dislikeFoods', [...data.dislikeFoods, val]);
                          set('dislikeFoodInput', '');
                        }
                      }
                    }}
                  />
                </div>
                {data.dislikeFoods.length > 0 && (
                  <div className="reg-tags">
                    {data.dislikeFoods.map(f => (
                      <span key={f} className="reg-tag">
                        {f}
                        <button type="button" onClick={() => set('dislikeFoods', data.dislikeFoods.filter(x => x !== f))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── GOOGLE FLOW STEP 4 — ONAY ── */}
          {isGoogleFlow && step === 4 && (
            <>
              <label className="reg-checkbox reg-checkbox-block">
                <input type="checkbox" checked={data.acceptKvkk} onChange={e => set('acceptKvkk', e.target.checked)} />
                <span className="reg-check-box">{data.acceptKvkk && <Icons.Check size={11} />}</span>
                <span><button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('kvkk'); }}>KVKK Aydınlatma Metni</button>'ni okudum, kabul ediyorum.</span>
              </label>
              <label className="reg-checkbox reg-checkbox-block">
                <input type="checkbox" checked={data.accept} onChange={e => set('accept', e.target.checked)} />
                <span className="reg-check-box">{data.accept && <Icons.Check size={11} />}</span>
                <span>
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('terms'); }}>Üyelik Sözleşmesi</button>,{' '}
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('cookies'); }}>Çerez Politikası</button>'nı ve{' '}
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('privacy'); }}>Gizlilik Politikası</button>'nı okudum, kabul ediyorum.
                </span>
              </label>
            </>
          )}

          {/* ── STEP 1 (both roles, normal flow) ── */}
          {!isGoogleFlow && step === 1 && (
            <>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Ad</span>
                  <div className="reg-input-wrap">
                    <input required placeholder="Zeynep" value={data.firstName} onChange={e => set('firstName', e.target.value)} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Soyad</span>
                  <div className="reg-input-wrap">
                    <input required placeholder="Kaya" value={data.lastName} onChange={e => set('lastName', e.target.value)} />
                  </div>
                </label>
              </div>
              <label className="reg-field">
                <span className="reg-field-label">E-posta</span>
                <div className="reg-input-wrap">
                  <input type="email" required placeholder="ornek@email.com" value={data.email} onChange={e => set('email', e.target.value)} />
                </div>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Telefon</span>
                <div className="reg-input-wrap">
                  <input type="tel" required placeholder="+90 5__ ___ __ __" value={data.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </label>
              {role === 'diyetisyen' && (
                <label className="reg-field">
                  <span className="reg-field-label">Yaş</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="18" max="100" placeholder="30" value={data.age} onChange={e => set('age', e.target.value)} />
                  </div>
                </label>
              )}
            </>
          )}

          {/* ── STEP 2 — DANIŞAN ── */}
          {!isGoogleFlow && step === 2 && role === 'danisan' && (
            <>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Yaş</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="14" max="100" placeholder="28" value={data.age} onChange={e => set('age', e.target.value)} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Cinsiyet</span>
                  <div className="reg-input-wrap">
                    <select required value={data.gender} onChange={e => set('gender', e.target.value)}>
                      <option value="">Seç</option>
                      <option value="Female">Kadın</option>
                      <option value="Male">Erkek</option>
                      <option value="Other">Belirtmek istemiyorum</option>
                    </select>
                  </div>
                </label>
              </div>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Boy (cm)</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="50" max="250" placeholder="168" value={data.height} onChange={e => set('height', e.target.value)} />
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Kilo (kg)</span>
                  <div className="reg-input-wrap">
                    <input type="number" required min="1" step="0.1" placeholder="65" value={data.weight} onChange={e => set('weight', e.target.value)} />
                  </div>
                </label>
              </div>
            </>
          )}

          {/* ── STEP 3 — DANIŞAN SAĞLIK PROFİLİ ── */}
          {!isGoogleFlow && step === 3 && role === 'danisan' && (
            <>
              <div className="reg-field">
                <span className="reg-field-label">Birincil hedef</span>
                <div className="reg-goal-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
                  {HEALTH_GOALS.map(g => {
                    const Ic = Icons[g.icon];
                    return (
                      <button key={g.v} type="button" className={`reg-goal-pill${data.goal === g.v ? ' active' : ''}`} onClick={() => set('goal', g.v)}>
                        <Ic size={16} /> {g.l}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Aktivite düzeyi</span>
                  <div className="reg-input-wrap">
                    <select value={data.activityLevel} onChange={e => set('activityLevel', e.target.value)}>
                      <option value="NONE">Hiç</option>
                      <option value="LOW">Haftada 1–2 kez</option>
                      <option value="MEDIUM">Haftada 3–4 kez</option>
                      <option value="HIGH">Haftada 4–5 kez</option>
                      <option value="VERY_HIGH">Her gün</option>
                    </select>
                  </div>
                </label>
                <label className="reg-field">
                  <span className="reg-field-label">Beslenme tercihi</span>
                  <div className="reg-input-wrap">
                    <select value={data.dietaryPreference} onChange={e => set('dietaryPreference', e.target.value)}>
                      <option value="NORMAL">Normal</option>
                      <option value="VEGETARIAN">Vejetaryen</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>
                </label>
              </div>
              <label className="reg-field">
                <span className="reg-field-label">Şeker tüketimi</span>
                <div className="reg-input-wrap">
                  <select value={data.sugarIntake} onChange={e => set('sugarIntake', e.target.value)}>
                    <option value="NONE">Hiç</option>
                    <option value="LOW">Haftada 1–2 kez</option>
                    <option value="MEDIUM">Haftada 3–4 kez</option>
                    <option value="HIGH">Her gün</option>
                    <option value="CRAVINGS">Anlık tatlı krizlerim var</option>
                  </select>
                </div>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Diyet bütçesi</span>
                <div className="reg-input-wrap">
                  <select value={data.budget} onChange={e => set('budget', e.target.value)}>
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>
              </label>
              <div className="reg-field">
                <span className="reg-field-label">Sağlık durumu</span>
                <div className="reg-health-toggles">
                  {[
                    { key: 'isPregnant',      label: 'Hamilelik' },
                    { key: 'isBreastfeeding', label: 'Emzirme' },
                    { key: 'alcoholUse',      label: 'Alkol kullanımı' },
                    { key: 'smokingUse',      label: 'Sigara kullanımı' },
                  ].filter(({ key }) => data.gender === 'Male' ? !['isPregnant', 'isBreastfeeding'].includes(key) : true)
                  .map(({ key, label }) => (
                    <div key={key} className="reg-schedule-row">
                      <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</span>
                      <button type="button" className={`reg-toggle${data[key] ? ' on' : ''}`} onClick={() => set(key, !data[key])}>
                        <span className="reg-toggle-thumb" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reg-field">
                <span className="reg-field-label">İlaç kullanımı <span style={{ fontWeight: 700, opacity: 0.6 }}>(isteğe bağlı)</span></span>
                <div className="reg-input-wrap">
                  <input
                    placeholder="İlaç adı yaz, Enter'a bas"
                    value={data.medicationInput}
                    onChange={e => set('medicationInput', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = data.medicationInput.trim();
                        if (val && !data.medications.includes(val)) {
                          set('medications', [...data.medications, val]);
                          set('medicationInput', '');
                        }
                      }
                    }}
                  />
                </div>
                {data.medications.length > 0 && (
                  <div className="reg-tags">
                    {data.medications.map(m => (
                      <span key={m} className="reg-tag">
                        {m}
                        <button type="button" onClick={() => set('medications', data.medications.filter(x => x !== m))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="reg-field">
                <span className="reg-field-label">Sevmediğin yiyecekler <span style={{ fontWeight: 700, opacity: 0.6 }}>(isteğe bağlı)</span></span>
                <div className="reg-input-wrap">
                  <input
                    placeholder="Yiyecek adı yaz, Enter'a bas"
                    value={data.dislikeFoodInput}
                    onChange={e => set('dislikeFoodInput', e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = data.dislikeFoodInput.trim();
                        if (val && !data.dislikeFoods.includes(val)) {
                          set('dislikeFoods', [...data.dislikeFoods, val]);
                          set('dislikeFoodInput', '');
                        }
                      }
                    }}
                  />
                </div>
                {data.dislikeFoods.length > 0 && (
                  <div className="reg-tags">
                    {data.dislikeFoods.map(f => (
                      <span key={f} className="reg-tag">
                        {f}
                        <button type="button" onClick={() => set('dislikeFoods', data.dislikeFoods.filter(x => x !== f))}>×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── STEP 2 — DİYETİSYEN ── */}
          {!isGoogleFlow && step === 2 && role === 'diyetisyen' && (
            <>
              <div className="reg-field-row">
                <label className="reg-field">
                  <span className="reg-field-label">Ünvan</span>
                  <div className="reg-input-wrap">
                    <select required value={data.title} onChange={e => set('title', e.target.value)}>
                      {TITLES_DYT.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                </label>
              </div>
              <label className="reg-field">
                <span className="reg-field-label">Diploma / Lisans Numarası</span>
                <div className="reg-input-wrap">
                  <input required placeholder="Lisans numaranız" value={data.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
                </div>
                <span className="reg-field-hint">Bilgileriniz yalnızca doğrulama için kullanılır.</span>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Biyografi</span>
                <div className="reg-input-wrap">
                  <textarea
                    placeholder="Kendinizi kısaca tanıtın…"
                    rows={3}
                    value={data.biography}
                    onChange={e => set('biography', e.target.value)}
                    style={{ resize: 'vertical', padding: '14px 16px' }}
                  />
                </div>
              </label>
              <div className="reg-field">
                <span className="reg-field-label">Profil Fotoğrafı</span>
                <FileDropZone accept="image/*" file={data.profilePhoto} onFile={f => set('profilePhoto', f)} hint="JPG veya PNG — maks 5MB" icon="📷" />
              </div>
              <div className="reg-field">
                <span className="reg-field-label">Lisans Belgesi</span>
                <FileDropZone accept=".pdf,image/*" file={data.licenseDoc} onFile={f => set('licenseDoc', f)} hint="PDF, JPG veya PNG — maks 5MB" icon="📄" />
              </div>
            </>
          )}

          {/* ── STEP 3 — DİYETİSYEN ÇALIŞMA SAATLERİ ── */}
          {!isGoogleFlow && step === 3 && role === 'diyetisyen' && (
            <>
              <div className="reg-schedule-block">
                <div className="reg-schedule-title">Hafta içi çalışma saatleri</div>
                <div className="reg-field-row">
                  <label className="reg-field">
                    <span className="reg-field-label">Başlangıç</span>
                    <div className="reg-input-wrap"><input type="time" value={data.workStart} onChange={e => set('workStart', e.target.value)} /></div>
                  </label>
                  <label className="reg-field">
                    <span className="reg-field-label">Bitiş</span>
                    <div className="reg-input-wrap"><input type="time" value={data.workEnd} onChange={e => set('workEnd', e.target.value)} /></div>
                  </label>
                </div>
                <div className="reg-schedule-row">
                  <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Hafta sonu çalışıyor musunuz?</span>
                  <button type="button" className={`reg-toggle${data.weekendWork ? ' on' : ''}`} onClick={() => set('weekendWork', !data.weekendWork)}>
                    <span className="reg-toggle-thumb" />
                  </button>
                </div>
                {data.weekendWork && (
                  <div className="reg-field-row">
                    <label className="reg-field">
                      <span className="reg-field-label">Başlangıç</span>
                      <div className="reg-input-wrap"><input type="time" value={data.weekendStart} onChange={e => set('weekendStart', e.target.value)} /></div>
                    </label>
                    <label className="reg-field">
                      <span className="reg-field-label">Bitiş</span>
                      <div className="reg-input-wrap"><input type="time" value={data.weekendEnd} onChange={e => set('weekendEnd', e.target.value)} /></div>
                    </label>
                  </div>
                )}
                <div className="reg-field">
                  <span className="reg-field-label">Randevu süresi</span>
                  <div className="reg-duration-grid">
                    {[30, 45, 60, 90].map(d => (
                      <button key={d} type="button" className={`reg-duration-btn${data.appointmentDuration === d ? ' active' : ''}`} onClick={() => set('appointmentDuration', d)}>
                        {d}<small>dk</small>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="reg-field">
                  <span className="reg-field-label">Aylık Danışmanlık Ücreti (₺) <span style={{ fontWeight: 700, opacity: 0.6 }}>(isteğe bağlı)</span></span>
                  <div className="reg-input-wrap">
                    <input type="number" min="0" step="1" placeholder="örn. 1500" value={data.monthlyPrice} onChange={e => set('monthlyPrice', e.target.value)} />
                  </div>
                  <span className="reg-field-hint">Danışanlar profilinizde bu ücreti görecektir. Sonradan değiştirebilirsiniz.</span>
                </label>
              </div>
            </>
          )}

          {/* ── STEP 4 — ŞİFRE + KVKK ── */}
          {!isGoogleFlow && step === TOTAL_STEPS && (
            <>
              <label className="reg-field">
                <span className="reg-field-label">Şifre</span>
                <div className="reg-input-wrap">
                  <input type="password" required minLength={8} placeholder="En az 8 karakter" value={data.password} onChange={e => set('password', e.target.value)} />
                </div>
                <div className="reg-pw-strength" data-level={lvl}>
                  <span /><span /><span />
                  <em style={REG_MONO}>{pwLabel(lvl)}</em>
                </div>
              </label>
              <label className="reg-field">
                <span className="reg-field-label">Şifre (tekrar)</span>
                <div className="reg-input-wrap">
                  <input type="password" required placeholder="••••••••" value={data.confirm} onChange={e => set('confirm', e.target.value)} />
                </div>
              </label>

              <label className="reg-checkbox reg-checkbox-block">
                <input type="checkbox" checked={data.acceptKvkk} onChange={e => set('acceptKvkk', e.target.checked)} />
                <span className="reg-check-box">{data.acceptKvkk && <Icons.Check size={11} />}</span>
                <span><button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('kvkk'); }}>KVKK Aydınlatma Metni</button>'ni okudum, kabul ediyorum.</span>
              </label>
              <label className="reg-checkbox reg-checkbox-block">
                <input type="checkbox" checked={data.accept} onChange={e => set('accept', e.target.checked)} />
                <span className="reg-check-box">{data.accept && <Icons.Check size={11} />}</span>
                <span>
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('terms'); }}>Üyelik Sözleşmesi</button>,{' '}
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('cookies'); }}>Çerez Politikası</button>'nı ve{' '}
                  <button type="button" className="reg-link" onClick={e => { e.preventDefault(); setLegalModal('privacy'); }}>Gizlilik Politikası</button>'nı okudum, kabul ediyorum.
                </span>
              </label>
            </>
          )}

          <button type="submit" className="reg-btn-submit" disabled={loading}>
            {loading
              ? <span className="reg-spinner" />
              : <><span>{step === TOTAL_STEPS ? (isGoogleFlow ? 'Kaydı tamamla' : 'Hesabı oluştur') : 'Devam et'}</span><Icons.ArrowRight size={16} /></>
            }
          </button>

          <div className="reg-signup-row">
            Zaten hesabın var mı? <Link to="/login" className="reg-link">Giriş yap</Link>
          </div>
        </form>
      </div>

      {/* Side preview */}
      <aside className="reg-side">
        <div className="reg-side-photo" aria-hidden>
          <span className="reg-photo-label">Fotoğraf · Sıcak mutfak ışığı</span>
        </div>
        <div className="reg-side-card">
          <div className="reg-side-card-head">
            <span className="reg-dot-live" />
          </div>
          <p style={{ ...REG_SERIF, fontSize: 22, lineHeight: 1.25, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
            <em style={{ fontStyle: 'italic', color: 'var(--accent-deep)' }}>1.000+</em> kişi şu an Lifeetics ile beslenme yolculuğunda.
          </p>
          <div className="reg-side-stats">
            <div><strong style={REG_SERIF}>96%</strong><span>Memnuniyet</span></div>
            <div><strong style={REG_SERIF}>{dieticianCount ?? '—'}</strong><span>Diyetisyen</span></div>
            <div><strong style={REG_SERIF}>4<small> ton</small></strong><span>Kilo verildi</span></div>
          </div>
        </div>
      </aside>
      <LegalModal />
    </main>
  );
}

/* ─── root page ─── */
export default function RegisterPage() {
  const location = useLocation();
  const googleData = location.state?.googleFlow ? location.state : null;
  const [role, setRole] = useState(googleData ? 'danisan' : null);

  return (
    <>
      <style>{`
        .reg-shell {
          --r-sm: 8px; --r-md: 12px; --r-lg: 24px; --r-pill: 999px;
          --ease-out: cubic-bezier(0.22,1,0.36,1);
          --reg-shadow-md: 0 4px 16px rgba(26,37,22,0.1);
          --reg-shadow-lg: 0 24px 60px -20px rgba(26,37,22,0.18), 0 8px 24px rgba(26,37,22,0.08);
          min-height: 100vh;
          background: var(--bg-warm);
          display: flex; flex-direction: column;
        }

        /* topbar */
        .reg-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 48px;
          border-bottom: 1px solid var(--line-soft);
          background: rgba(251,250,245,0.92); backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 10;
        }
        .reg-logo {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: "Plus Jakarta Sans", sans-serif; font-weight: 700; font-size: 20px;
          letter-spacing: -0.02em; color: var(--ink); text-decoration: none;
        }
        .reg-topbar-right { display: inline-flex; align-items: center; gap: 14px; }
        .reg-topbar-text { font-size: 13px; color: var(--ink-mute); }
        .reg-btn-sm {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 8px 16px; border-radius: 999px; border: 1px solid var(--line);
          font-size: 13px; font-weight: 600; color: var(--ink);
          background: rgba(255,255,255,0.9); text-decoration: none; transition: all .2s;
        }
        .reg-btn-sm:hover { border-color: var(--ink); background: #fff; }

        /* footer */
        .reg-foot {
          display: flex; justify-content: space-between; align-items: center;
          padding: 24px 48px; font-size: 12px; color: var(--ink-mute);
          border-top: 1px solid var(--line-soft);
          font-family: "JetBrains Mono", monospace;
        }
        .reg-foot-links { display: flex; gap: 16px; }
        .reg-foot-links a { color: inherit; text-decoration: none; transition: color .2s; }
        .reg-foot-links a:hover { color: var(--ink); }

        /* eyebrow */
        .reg-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: "JetBrains Mono", monospace; font-size: 11px;
          text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent-deep);
        }
        .reg-eyebrow-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

        /* ── ROLE CHOICE ── */
        .reg-choice {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          padding: 60px 32px 80px;
        }
        .reg-choice-head {
          text-align: center; max-width: 720px;
          display: flex; flex-direction: column; align-items: center; gap: 16px;
          margin-bottom: 56px;
        }
        .reg-choice-sub { font-size: 17px; color: var(--ink-soft); max-width: 520px; line-height: 1.55; }

        .reg-role-cards {
          display: grid; grid-template-columns: repeat(2, minmax(0, 380px));
          gap: 24px; width: 100%; max-width: 820px;
        }
        .reg-role-card {
          background: #fff; border: 1px solid var(--line);
          border-radius: var(--r-lg);
          text-align: left; cursor: pointer;
          transition: transform .4s var(--ease-out), box-shadow .4s, border-color .3s;
          display: flex; flex-direction: column;
        }
        .reg-role-card:hover { transform: translateY(-6px); box-shadow: var(--reg-shadow-lg); border-color: var(--ink-soft); }
        .reg-role-card-hero {
          position: relative; aspect-ratio: 16/8; overflow: hidden;
          border-radius: var(--r-lg) var(--r-lg) 0 0;
          background: linear-gradient(135deg, #E8DFC9, #D4A574);
        }
        .reg-role-card-pic {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 30% 40%, rgba(255,255,255,0.4), transparent),
            radial-gradient(ellipse 80% 70% at 80% 80%, rgba(101,163,13,0.3), transparent),
            linear-gradient(135deg, #E8DFC9 0%, #C4A982 50%, #8FA876 100%);
        }
        .reg-role-card-pic-uz {
          background:
            radial-gradient(ellipse 70% 60% at 70% 30%, rgba(255,255,255,0.35), transparent),
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(201,123,92,0.4), transparent),
            linear-gradient(135deg, #B8927D 0%, #8E6A55 50%, #5C4738 100%);
        }
        .reg-role-card-tag {
          position: absolute; top: 14px; left: 14px;
          background: rgba(255,255,255,0.92); color: var(--accent-deep);
          font-family: "JetBrains Mono", monospace; font-size: 10px;
          text-transform: uppercase; letter-spacing: 0.1em;
          padding: 5px 10px; border-radius: 999px;
        }
        .reg-role-card-tag-uz { color: var(--terracotta); }
        .reg-role-card-body { padding: 28px; display: flex; flex-direction: column; gap: 14px; flex: 1; position: relative; z-index: 1; }
        .reg-role-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: var(--accent); color: #fff;
          display: flex; align-items: center; justify-content: center;
          margin-top: -50px; border: 4px solid #fff;
          box-shadow: var(--reg-shadow-md);
          position: relative; z-index: 2;
        }
        .reg-role-card-icon-uz { background: var(--terracotta); }
        .reg-role-card-feats {
          list-style: none; display: flex; flex-direction: column; gap: 8px;
          padding-top: 8px; border-top: 1px solid var(--line-soft);
        }
        .reg-role-card-feats li { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--ink-soft); }
        .reg-role-card-feats svg { color: var(--accent); flex-shrink: 0; }
        .reg-role-card-feats-uz svg { color: var(--terracotta); }
        .reg-role-card-cta { margin-top: auto; justify-content: center; pointer-events: none; }

        /* shared btn */
        .reg-btn {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 22px; border-radius: 999px;
          font-weight: 600; font-size: 15px; letter-spacing: -0.005em; border: none;
          transition: transform .35s var(--ease-out), background .25s, box-shadow .25s;
          cursor: pointer; font-family: "Plus Jakarta Sans", sans-serif;
        }
        .reg-btn-primary { background: var(--ink); color: #FBFAF5; }
        .reg-btn-primary:hover { background: var(--accent-deep); transform: translateY(-1px); box-shadow: 0 12px 28px -10px rgba(77,124,15,0.55); }
        .reg-btn-accent { background: var(--accent); color: #fff; }
        .reg-btn-accent:hover { background: var(--accent-deep); transform: translateY(-1px); }

        /* ── FORM SHELL ── */
        .reg-form-shell {
          flex: 1; display: grid; grid-template-columns: 1fr 380px;
          gap: 40px; padding: 48px; max-width: 1280px; margin: 0 auto; width: 100%;
        }
        .reg-form-card {
          background: #fff; border: 1px solid var(--line);
          border-radius: var(--r-lg); padding: 36px 44px;
        }
        .reg-form-top {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        }
        .reg-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: var(--ink-mute);
          background: none; border: none; cursor: pointer; transition: color .2s;
          font-family: "Plus Jakarta Sans", sans-serif; padding: 0;
        }
        .reg-back:hover { color: var(--ink); }
        .reg-step-pill {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; padding: 4px 12px;
          border: 1px solid var(--line); border-radius: 999px; background: var(--bg-warm);
        }
        .reg-progress {
          height: 3px; background: var(--line-soft); border-radius: 2px; overflow: hidden; margin-bottom: 28px;
        }
        .reg-progress-bar {
          height: 100%; background: var(--accent); transition: width .5s var(--ease-out);
        }
        .reg-form-head { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .reg-role-pill {
          display: inline-flex; align-items: center; gap: 6px; align-self: flex-start;
          background: var(--accent-tint); color: var(--accent-deep);
          font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px;
          font-family: "JetBrains Mono", monospace; text-transform: uppercase; letter-spacing: 0.06em;
        }
        .reg-role-pill-uz { background: rgba(201,123,92,0.12); color: var(--terracotta); }

        /* form elements */
        .reg-form { display: flex; flex-direction: column; gap: 18px; }
        .reg-field { display: flex; flex-direction: column; gap: 7px; }
        .reg-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .reg-field-label { font-size: 12px; font-weight: 600; color: var(--ink-soft); letter-spacing: 0.01em; }
        .reg-field-hint { font-size: 11px; color: var(--ink-mute); margin-top: 4px; display: block; }
        .reg-input-wrap {
          background: #fff; border: 1px solid var(--line); border-radius: 12px;
          transition: border-color .2s, box-shadow .2s;
        }
        .reg-input-wrap:focus-within {
          border-color: var(--accent); box-shadow: 0 0 0 4px rgba(101,163,13,0.12);
        }
        .reg-input-wrap input,
        .reg-input-wrap select,
        .reg-input-wrap textarea {
          width: 100%; padding: 14px 16px; background: transparent; border: 0; outline: 0;
          font-family: "Plus Jakarta Sans", sans-serif; font-size: 15px; color: var(--ink);
        }
        .reg-input-wrap input::placeholder,
        .reg-input-wrap textarea::placeholder { color: var(--ink-mute); }
        .reg-input-wrap select { cursor: pointer; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236B7363' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 14px center; background-size: 16px;
          padding-right: 40px;
        }

        /* goal pills */
        .reg-goal-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 10px; }
        .reg-goal-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 16px; border-radius: 10px;
          background: var(--bg-warm); border: 1px solid var(--line);
          font-size: 14px; font-weight: 500; color: var(--ink);
          cursor: pointer; transition: all .25s; font-family: "Plus Jakarta Sans", sans-serif;
        }
        .reg-goal-pill:hover { border-color: var(--accent); background: var(--accent-tint); }
        .reg-goal-pill.active { background: var(--ink); color: #FBFAF5; border-color: var(--ink); }
        .reg-goal-pill.active svg { color: var(--accent); }

        /* password strength */
        .reg-pw-strength { display: flex; align-items: center; gap: 4px; margin-top: 10px; }
        .reg-pw-strength span { height: 4px; flex: 1; max-width: 60px; background: var(--line); border-radius: 2px; transition: background .3s; }
        .reg-pw-strength em { margin-left: auto; font-size: 11px; font-style: normal; color: var(--ink-mute); }
        .reg-pw-strength[data-level="1"] span:nth-child(1) { background: #E07B5C; }
        .reg-pw-strength[data-level="2"] span:nth-child(1),
        .reg-pw-strength[data-level="2"] span:nth-child(2) { background: #D4A574; }
        .reg-pw-strength[data-level="3"] span { background: var(--accent); }

        /* schedule block (dietician step 3) */
        .reg-schedule-block {
          background: var(--bg-warm); border: 1px solid var(--line-soft); border-radius: 12px;
          padding: 20px; display: flex; flex-direction: column; gap: 14px;
        }
        .reg-schedule-title { font-size: 13px; font-weight: 600; color: var(--ink-soft); }
        .reg-schedule-row { display: flex; justify-content: space-between; align-items: center; }
        .reg-toggle {
          width: 44px; height: 24px; border-radius: 999px; border: none; cursor: pointer;
          background: var(--line); position: relative; transition: background .2s; flex-shrink: 0;
        }
        .reg-toggle.on { background: var(--accent); }
        .reg-toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; border-radius: 50%; background: #fff;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          transition: left .2s;
        }
        .reg-toggle.on .reg-toggle-thumb { left: 23px; }
        .reg-duration-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 8px; }
        .reg-duration-btn {
          padding: 10px 0; border-radius: 10px;
          border: 1.5px solid var(--line); background: #fff;
          color: var(--ink-mute); font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all .2s; font-family: "Plus Jakarta Sans", sans-serif;
        }
        .reg-duration-btn small { font-size: 11px; opacity: 0.7; margin-left: 2px; font-weight: 400; }
        .reg-duration-btn.active { border-color: var(--ink); background: var(--ink); color: #FBFAF5; }

        /* checkbox */
        .reg-checkbox { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: var(--ink-soft); }
        .reg-checkbox input { display: none; }
        .reg-check-box {
          width: 18px; height: 18px; border-radius: 5px;
          border: 1.5px solid var(--line); flex-shrink: 0;
          display: inline-flex; align-items: center; justify-content: center;
          background: #fff; color: #fff; transition: all .2s;
        }
        .reg-checkbox input:checked + .reg-check-box { background: var(--accent); border-color: var(--accent); }
        .reg-checkbox-block { align-items: flex-start; }
        .reg-checkbox-block .reg-check-box { margin-top: 2px; }
        .reg-link { color: var(--accent-deep); font-weight: 600; border-bottom: 1px solid currentColor; text-decoration: none; }

        /* file zone */
        .reg-file-zone {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          border: 2px dashed var(--line); border-radius: 12px; padding: 20px 16px;
          text-align: center; cursor: pointer; background: #fff; transition: all .2s;
        }
        .reg-file-zone[data-filled="true"] { border-color: var(--accent); background: rgba(101,163,13,0.04); }
        .reg-file-name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .reg-file-hint { font-size: 12px; color: var(--ink-mute); }

        /* submit */
        .reg-btn-submit {
          margin-top: 6px; padding: 16px 22px; width: 100%;
          background: var(--ink); color: #FBFAF5; border: none; border-radius: 999px;
          font-size: 15px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          transition: background .25s, transform .25s, box-shadow .25s;
          font-family: "Plus Jakarta Sans", sans-serif;
        }
        .reg-btn-submit:hover:not(:disabled) {
          background: var(--accent-deep); transform: translateY(-1px);
          box-shadow: 0 12px 28px -10px rgba(77,124,15,0.55);
        }
        .reg-btn-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .reg-spinner {
          width: 18px; height: 18px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          animation: regSpin .8s linear infinite;
        }
        @keyframes regSpin { to { transform: rotate(360deg); } }
        .reg-signup-row { text-align: center; font-size: 14px; color: var(--ink-soft); margin-top: 6px; }

        /* social */
        .reg-social { display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px; }
        .reg-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 13px 20px; border-radius: 12px; border: 1px solid var(--line);
          background: #fff; font-size: 14px; font-weight: 600; color: var(--ink);
          cursor: pointer; transition: border-color .2s, box-shadow .2s;
          font-family: "Plus Jakarta Sans", sans-serif; width: 100%;
        }
        .reg-social-btn:hover { border-color: var(--ink-soft); box-shadow: 0 2px 8px rgba(26,37,22,0.08); }
        .reg-divider {
          display: flex; align-items: center; gap: 12px;
          font-size: 12px; color: var(--ink-mute); margin: 4px 0;
        }
        .reg-divider::before, .reg-divider::after { content: ''; flex: 1; height: 1px; background: var(--line); }

        /* error */
        .reg-error {
          padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500;
          background: #fadbd8; color: #c0392b; border: 1px solid #e8a9a4; margin-bottom: 4px;
        }

        /* side panel */
        .reg-side { display: flex; flex-direction: column; gap: 16px; }
        .reg-side-photo {
          flex: 1; min-height: 280px; border-radius: var(--r-lg);
          background:
            radial-gradient(ellipse 70% 50% at 30% 40%, rgba(255,255,255,0.3), transparent),
            radial-gradient(ellipse 60% 60% at 80% 70%, rgba(101,163,13,0.4), transparent),
            linear-gradient(160deg, #C4A982 0%, #8FA876 60%, #5C7A4F 100%);
          display: flex; align-items: flex-end; padding: 16px;
        }
        .reg-photo-label {
          font-family: "JetBrains Mono", monospace; font-size: 10px;
          background: rgba(255,255,255,0.85); color: var(--ink-mute);
          padding: 4px 10px; border-radius: 999px; text-transform: uppercase; letter-spacing: 0.1em;
        }
        .reg-side-card {
          background: #fff; border: 1px solid var(--line);
          border-radius: var(--r-lg); padding: 24px;
          display: flex; flex-direction: column; gap: 16px;
        }
        .reg-side-card-head { display: inline-flex; align-items: center; gap: 8px; }
        .reg-dot-live {
          width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
          animation: regPulse 1.8s ease-out infinite;
        }
        @keyframes regPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(101,163,13,0.5); } 50% { box-shadow: 0 0 0 6px rgba(101,163,13,0); } }
        .reg-side-stats {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 12px;
          border-top: 1px solid var(--line-soft); padding-top: 16px;
        }
        .reg-side-stats > div { display: flex; flex-direction: column; gap: 2px; }
        .reg-side-stats strong { font-size: 22px; color: var(--ink); letter-spacing: -0.02em; line-height: 1; font-family: "Instrument Serif", serif; }
        .reg-side-stats small { font-size: 11px; opacity: 0.6; font-weight: 400; }
        .reg-side-stats span { font-size: 11px; color: var(--ink-mute); }

        /* health toggles block */
        .reg-health-toggles {
          background: var(--bg-warm); border: 1px solid var(--line-soft); border-radius: 12px;
          padding: 16px; display: flex; flex-direction: column; gap: 12px;
        }

        /* tag input */
        .reg-tags {
          display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;
        }
        .reg-tag {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--accent-tint); color: var(--accent-deep);
          border: 1px solid rgba(101,163,13,0.3); border-radius: 999px;
          font-size: 13px; font-weight: 500; padding: 4px 10px 4px 12px;
        }
        .reg-tag button {
          background: none; border: none; cursor: pointer; color: inherit;
          font-size: 15px; line-height: 1; padding: 0; opacity: 0.7; transition: opacity .15s;
        }
        .reg-tag button:hover { opacity: 1; }

        /* success */
        .reg-success-wrap {
          flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 24px;
        }
        .reg-success-card {
          background: #fff; border: 1px solid var(--line); border-radius: var(--r-lg);
          padding: 52px 48px; max-width: 460px; width: 100%; text-align: center;
          box-shadow: var(--reg-shadow-lg);
        }

        /* responsive */
        @media (max-width: 980px) {
          .reg-role-cards { grid-template-columns: 1fr; }
          .reg-form-shell { grid-template-columns: 1fr; padding: 24px; }
          .reg-side { display: none; }
          .reg-topbar { padding: 16px 24px; }
          .reg-foot { padding: 20px 24px; flex-direction: column; gap: 10px; }
          .reg-form-card { padding: 28px 24px; }
          .reg-field-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reg-shell">
        <header className="reg-topbar">
          <Link to="/" className="reg-logo">
            <span style={{
                fontFamily: '"Instrument Serif", serif',
                fontWeight: 700,
                fontSize: '38px',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                color: '#1A1A1A',
              }}>LIFEETICS</span>
          </Link>
          <div className="reg-topbar-right">
            <span className="reg-topbar-text">Zaten hesabın var mı?</span>
            <Link to="/login" className="reg-btn-sm">Giriş yap</Link>
          </div>
        </header>

        {role === null
          ? <RoleChoice onPick={setRole} />
          : <RegForm role={role} onBack={() => setRole(null)} googleData={googleData} />
        }

        <footer className="reg-foot">
          <span>© 2026 Lifeetics</span>
          <div className="reg-foot-links">
            <a href="#">Gizlilik</a>
            <a href="#">Şartlar</a>
            <a href="#">KVKK</a>
          </div>
        </footer>
      </div>
    </>
  );
}
