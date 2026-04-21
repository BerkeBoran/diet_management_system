import { useState } from 'react';
import aiDietService from '../../services/aiDietService';
import { useToast } from '../../components/Toast';

export default function AIDietPage() {
  const [step, setStep] = useState('idle'); // idle, generating, viewing, revising, approved
  const [threadId, setThreadId] = useState(null);
  const [content, setContent] = useState('');
  const [revisionNote, setRevisionNote] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const startGeneration = async () => {
    setLoading(true);
    setStep('generating');
    try {
      const data = await aiDietService.startGeneration();
      setThreadId(data.thread_id);
      setContent(data.content || '');
      setStep('viewing');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Diyet oluşturulamadı.');
      setStep('idle');
    }
    setLoading(false);
  };

  const revise = async () => {
    if (!revisionNote.trim()) { toast.warning('Lütfen değişiklik talebinizi yazın.'); return; }
    setLoading(true);
    try {
      const data = await aiDietService.reviseDiet(threadId, revisionNote);
      setContent(data.content || '');
      setRevisionNote('');
      setStep('viewing');
      toast.success('Planda düzenlemeler yapıldı.');
    } catch { toast.error('Revizyon başarısız oldu.'); }
    setLoading(false);
  };

  const approve = async () => {
    setLoading(true);
    try {
      await aiDietService.approveDiet(threadId);
      setStep('approved');
      toast.success('Klinik programınız sisteme kaydedildi!');
    } catch { toast.error('Onay işlemi gerçekleştirilemedi.'); }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Editorial Header */}
      <header className="mb-12">
        <span className="text-secondary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">YAPAY ZEKA DESTEĞİ</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4 leading-tight">
          AI Asistanı ile<br /> <span className="text-primary italic">Hassas Beslenme.</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
          Klinik verileriniz ve hedefleriniz doğrultusunda, güncel diyetetik protokollerine uygun kişiselleştirilmiş programınızı saniyeler içinde oluşturun.
        </p>
      </header>

      {/* Idle State */}
      {step === 'idle' && (
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-10 text-center relative overflow-hidden shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          
          <div className="relative z-10 py-12 flex flex-col items-center">
            <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white mb-8 shadow-[0px_12px_32px_rgba(0,104,86,0.3)] animate-float">
              <span className="material-symbols-outlined text-5xl">auto_awesome</span>
            </div>
            <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-4">Profil Analizi Başlatılıyor</h2>
            <p className="text-on-surface-variant max-w-lg leading-relaxed mb-10 text-lg">
              Sağlık geçmişiniz, güncel testleriniz ve seçtiğiniz metabolik hedefler taranarak güvenli bir plan taslağı oluşturulacaktır.
            </p>
            <button 
              onClick={startGeneration} 
              disabled={loading} 
              className="px-10 py-5 gradient-primary text-white font-headline font-bold text-lg rounded-2xl shadow-[0px_8px_20px_rgba(0,104,86,0.25)] hover:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
            >
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span className="material-symbols-outlined shrink-0">vital_signs</span> Analizi Başlat ve Taslak Oluştur</>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Generating */}
      {step === 'generating' && (
        <section className="bg-surface-container-low rounded-[2.5rem] p-16 text-center shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border">
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-surface-container-highest rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary rounded-full border-t-transparent animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center material-symbols-outlined text-primary text-3xl animate-pulse">science</span>
            </div>
            <div>
              <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Metabolik Veriler İşleniyor...</h2>
              <p className="text-on-surface-variant">Optimal makro dağılımı ve mikronutrient dengesi hesaplanıyor.</p>
            </div>
          </div>
        </section>
      )}

      {/* Viewing */}
      {step === 'viewing' && (
        <section className="space-y-6 animate-slide-up">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border">
            <div className="flex justify-between items-center border-b border-outline-variant/30 pb-6 mb-6">
              <h3 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">medical_information</span>
                AI Klinik Raporu
              </h3>
              <span className="bg-primary/10 text-primary font-bold px-4 py-2 rounded-xl text-sm">Taslak Aşamasında</span>
            </div>
            
            <div className="prose prose-on-surface prose-emerald max-w-none text-on-surface-variant text-[15px] leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin">
              {content || 'Plan içeriği yükleniyor...'}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setStep('revising')} 
              className="flex-1 py-4 bg-surface-container-lowest text-on-surface font-headline font-bold rounded-2xl hover:bg-surface-container-highest ghost-border shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">draw</span> Revizyon İste
            </button>
            <button 
              onClick={approve} 
              disabled={loading} 
              className="flex-[2] py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_20px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span className="material-symbols-outlined text-sm">task_alt</span> Planı Onayla ve Sisteme Kaydet</>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Revising */}
      {step === 'revising' && (
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border animate-slide-up">
           <div className="flex items-center gap-3 mb-6">
             <div className="w-12 h-12 bg-secondary-container/20 text-secondary rounded-2xl flex items-center justify-center">
               <span className="material-symbols-outlined text-2xl">edit_note</span>
             </div>
             <div>
               <h3 className="font-headline text-xl font-bold text-on-surface">Yeni Klinik Yönerge</h3>
               <p className="text-sm text-on-surface-variant">Öğünler veya hedeflerle ilgili düzenlemeleri belirtin.</p>
             </div>
           </div>

          <textarea 
            value={revisionNote} 
            onChange={(e) => setRevisionNote(e.target.value)} 
            rows={5} 
            placeholder="Örn: Kahvaltıdaki alerjenik içeriği çıkar, öğle menüsünü daha yüksek proteinli yap..." 
            className="w-full px-6 py-5 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all resize-none text-[15px] mb-8" 
          />
          
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button 
              onClick={() => setStep('viewing')} 
              className="px-8 py-4 bg-transparent text-on-surface-variant font-headline font-bold rounded-2xl hover:bg-surface-container-highest transition-colors"
            >
              İptal Et
            </button>
            <button 
              onClick={revise} 
              disabled={loading} 
              className="px-8 py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_20px_rgba(0,104,86,0.2)] hover:scale-95 transition-transform disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><span className="material-symbols-outlined text-sm">sync</span> Yönergeyi Uygula</>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Approved */}
      {step === 'approved' && (
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-12 text-center shadow-[0px_16px_40px_rgba(23,29,27,0.06)] ghost-border animate-slide-up">
          <div className="w-24 h-24 rounded-full bg-tertiary-container/20 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-tertiary">check_circle</span>
          </div>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-3">Süreç Tamamlandı</h2>
          <p className="text-on-surface-variant max-w-md mx-auto text-lg mb-8 leading-relaxed">
            AI destekli klinik beslenme programınız başarıyla profilinize eklendi. Ana panelinizden takibine başlayabilirsiniz.
          </p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => { setStep('idle'); setContent(''); setThreadId(null); }} 
              className="px-6 py-3 bg-surface-container-low text-on-surface font-headline font-bold rounded-xl hover:bg-surface-container-high transition-colors"
            >
              Yeni Taslak Oluştur
            </button>
          </div>
        </section>
      )}

    </div>
  );
}
