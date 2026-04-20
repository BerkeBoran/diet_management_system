import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import dietService from '../../services/dietService';
import { useToast } from '../../components/useToast.js';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiStar, HiOutlineStar, HiOutlineChatBubbleLeftRight, HiOutlineCalendarDays, HiOutlinePaperAirplane } from 'react-icons/hi2';
import chatService from '../../services/chatService';

export default function DieticianDetailPage() {
  const { id } = useParams();
  const [dietician, setDietician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ duration: '1M', client_note: '' });
  const { error: showError, success: showSuccess } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userService.getDieticianDetail(id);
        setDietician(data);
      } catch { showError('Diyetisyen bilgileri alınamadı.'); }
      setLoading(false);
    };
    fetchData();
  }, [id, showError]);

  const handleApply = async () => {
    setApplyLoading(true);
    try {
      await dietService.createAssignment({
        dietician: Number(id),
        duration: applyForm.duration,
        client_note: applyForm.client_note,
        assignment_type: 'Dietician',
      });
      showSuccess('Başvurunuz gönderildi!');
      setShowApplyModal(false);
    } catch (err) {
      const msg = err.response?.data?.[0] || err.response?.data?.non_field_errors?.[0] || 'Başvuru gönderilemedi.';
      showError(msg);
    }
    setApplyLoading(false);
  };

  const handleChat = async () => {
    try {
      const room = await chatService.getOrCreateRoom(id);
      navigate(`/chat?room=${room.id}`);
    } catch { showError('Sohbet başlatılamadı.'); }
  };

  const titleMap = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!dietician) return <div className="text-center py-20 text-slate-400">Diyetisyen bulunamadı.</div>;

  return (
    <div className="animate-fade-in space-y-6 max-w-3xl mx-auto">
      {/* Profile Card */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {dietician.first_name?.[0]}{dietician.last_name?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{dietician.first_name} {dietician.last_name}</h1>
            <p className="text-emerald-400 font-medium mt-0.5">{titleMap[dietician.title] || 'Diyetisyen'}</p>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  star <= Math.round(dietician.average_rating || 0)
                    ? <HiStar key={star} className="w-5 h-5 text-amber-400" />
                    : <HiOutlineStar key={star} className="w-5 h-5 text-slate-600" />
                ))}
              </div>
              <span className="text-sm text-slate-400">{dietician.average_rating || 0} ({dietician.review_count || 0} değerlendirme)</span>
            </div>

            {dietician.biography && (
              <p className="text-slate-300 mt-4 text-sm leading-relaxed">{dietician.biography}</p>
            )}

            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={() => setShowApplyModal(true)} className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-sm font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/25 flex items-center gap-2">
                <HiOutlinePaperAirplane className="w-4 h-4" /> Başvur
              </button>
              <button onClick={handleChat} className="px-5 py-2.5 glass glass-hover text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2">
                <HiOutlineChatBubbleLeftRight className="w-4 h-4" /> Mesaj Gönder
              </button>
              <button onClick={() => navigate(`/appointments?dietician=${id}`)} className="px-5 py-2.5 glass glass-hover text-white text-sm font-medium rounded-xl transition-all flex items-center gap-2">
                <HiOutlineCalendarDays className="w-4 h-4" /> Randevu Al
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {dietician.reviews && dietician.reviews.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Değerlendirmeler</h2>
          <div className="space-y-4">
            {dietician.reviews.map((review) => (
              <div key={review.id} className="bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-white text-sm">{review.client_name}</p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      s <= Math.round(review.raiting || 0)
                        ? <HiStar key={s} className="w-4 h-4 text-amber-400" />
                        : <HiOutlineStar key={s} className="w-4 h-4 text-slate-600" />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-slate-400">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowApplyModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative glass rounded-2xl p-8 w-full max-w-md z-10 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-white mb-4">Diyetisyene Başvur</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Süre</label>
                <div className="grid grid-cols-4 gap-2">
                  {[{ v: '1M', l: '1 Ay' }, { v: '3M', l: '3 Ay' }, { v: '6M', l: '6 Ay' }, { v: '12M', l: '1 Yıl' }].map((d) => (
                    <button key={d.v} type="button" onClick={() => setApplyForm((prev) => ({ ...prev, duration: d.v }))}
                      className={`py-2 text-sm rounded-lg transition-all ${applyForm.duration === d.v ? 'bg-emerald-500 text-white' : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-white'}`}
                    >{d.l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Not (opsiyonel)</label>
                <textarea value={applyForm.client_note} onChange={(e) => setApplyForm((prev) => ({ ...prev, client_note: e.target.value }))} rows={3} placeholder="Diyetisyenize iletmek istediğiniz notlar..." className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 transition-all resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowApplyModal(false)} className="flex-1 py-2.5 glass text-slate-300 rounded-xl hover:text-white transition-all">İptal</button>
              <button onClick={handleApply} disabled={applyLoading} className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl disabled:opacity-50 transition-all flex items-center justify-center">
                {applyLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Gönder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
