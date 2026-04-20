import { useState } from 'react';
import aiDietService from '../../services/aiDietService';
import { useToast } from '../../components/useToast.js';
import { HiOutlineSparkles, HiOutlineCheckCircle, HiOutlinePencilSquare, HiOutlineArrowPath } from 'react-icons/hi2';

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
    if (!revisionNote.trim()) { toast.warning('Lütfen değişiklik notunuzu yazın.'); return; }
    setLoading(true);
    try {
      const data = await aiDietService.reviseDiet(threadId, revisionNote);
      setContent(data.content || '');
      setRevisionNote('');
      setStep('viewing');
      toast.success('Plan güncellendi!');
    } catch { toast.error('Revizyon başarısız.'); }
    setLoading(false);
  };

  const approve = async () => {
    setLoading(true);
    try {
      await aiDietService.approveDiet(threadId);
      setStep('approved');
      toast.success('Diyet planı kaydedildi!');
    } catch { toast.error('Onay başarısız.'); }
    setLoading(false);
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineSparkles className="w-7 h-7 text-emerald-400" /> AI Diyet Planı
        </h1>
        <p className="text-slate-400 mt-1">Yapay zeka ile kişisel diyet planınızı oluşturun</p>
      </div>

      {/* Idle State */}
      {step === 'idle' && (
        <div className="glass rounded-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-emerald-500 to-purple-500" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center mx-auto mb-6">
            <HiOutlineSparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">AI Diyet Oluşturucu</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Sağlık profilinize ve hedeflerinize göre yapay zeka size özel bir diyet planı oluşturacak.
          </p>
          <button onClick={startGeneration} disabled={loading} className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-2xl transition-all hover:shadow-xl hover:shadow-emerald-500/25 hover:scale-105 disabled:opacity-50 flex items-center gap-2 mx-auto">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiOutlineSparkles className="w-5 h-5" /> Diyet Planı Oluştur</>}
          </button>
        </div>
      )}

      {/* Generating */}
      {step === 'generating' && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-bold text-white mb-2">Plan Oluşturuluyor...</h2>
          <p className="text-slate-400">Yapay zeka sizin için en uygun planı hazırlıyor.</p>
        </div>
      )}

      {/* Viewing */}
      {step === 'viewing' && (
        <>
          <div className="glass rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Oluşturulan Plan</h3>
            <div className="bg-slate-800/50 rounded-xl p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
              {content || 'Plan içeriği yükleniyor...'}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep('revising')} className="flex-1 py-3 glass glass-hover text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2">
              <HiOutlinePencilSquare className="w-5 h-5" /> Değişiklik İste
            </button>
            <button onClick={approve} disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiOutlineCheckCircle className="w-5 h-5" /> Onayla ve Kaydet</>}
            </button>
          </div>
        </>
      )}

      {/* Revising */}
      {step === 'revising' && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Değişiklik Talebi</h3>
          <textarea value={revisionNote} onChange={(e) => setRevisionNote(e.target.value)} rows={4} placeholder="Neyi değiştirmek istiyorsunuz? Örn: Kahvaltıda yumurta olmasın, daha az karbonhidrat..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 transition-all resize-none" />
          <div className="flex gap-3">
            <button onClick={() => setStep('viewing')} className="flex-1 py-3 glass text-slate-300 rounded-xl transition-all">Geri</button>
            <button onClick={revise} disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiOutlineArrowPath className="w-5 h-5" /> Güncelle</>}
            </button>
          </div>
        </div>
      )}

      {/* Approved */}
      {step === 'approved' && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Diyet Planınız Kaydedildi!</h2>
          <p className="text-slate-400">AI tarafından oluşturulan diyet planınız profilinize kaydedildi.</p>
          <button onClick={() => { setStep('idle'); setContent(''); setThreadId(null); }} className="mt-6 px-6 py-2.5 glass glass-hover text-white rounded-xl transition-all">
            Yeni Plan Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
