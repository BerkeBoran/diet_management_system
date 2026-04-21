import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import userService from '../../services/userService';
import dietService from '../../services/dietService';
import { useToast } from '../../components/Toast';
import LoadingSpinner from '../../components/LoadingSpinner';
import chatService from '../../services/chatService';

export default function DieticianDetailPage() {
  const { id } = useParams();
  const [dietician, setDietician] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applyLoading, setApplyLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({ duration: '1M', client_note: '' });
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await userService.getDieticianDetail(id);
        setDietician(data);
      } catch { toast.error('Uzman bilgileri alınamadı.'); }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleApply = async () => {
    setApplyLoading(true);
    try {
      await dietService.createAssignment({
        dietician: Number(id),
        duration: applyForm.duration,
        client_note: applyForm.client_note,
        assignment_type: 'Dietician',
      });
      toast.success('Başvurunuz başarıyla gönderildi.');
      setShowApplyModal(false);
    } catch (err) {
      const msg = err.response?.data?.[0] || err.response?.data?.non_field_errors?.[0] || 'Başvuru gönderilemedi.';
      toast.error(msg);
    }
    setApplyLoading(false);
  };

  const handleChat = async () => {
    try {
      const room = await chatService.getOrCreateRoom(id);
      navigate(`/chat?room=${room.id}`);
    } catch { toast.error('Sohbet başlatılamadı.'); }
  };

  const titleMap = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };
  const getInitials = (first, last) => `${first?.[0] || '?'}${last?.[0] || ''}`.toUpperCase();

  if (loading) return <LoadingSpinner size="lg" className="min-h-[50vh]" />;
  if (!dietician) return (
    <div className="text-center py-24 bg-surface-container-lowest rounded-[2rem] mt-8 ghost-border max-w-4xl mx-auto">
      <span className="material-symbols-outlined text-4xl text-outline mb-4">person_off</span>
      <p className="text-on-surface-variant font-headline font-semibold text-lg">Uzman bulunamadı.</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-fade-in pb-12">
      
      {/* Back Button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-headline font-bold text-sm mb-8 transition-colors">
        <span className="material-symbols-outlined text-sm">arrow_back</span> Geri Dön
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Profile Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border sticky top-24">
            
            <div className="flex flex-col items-center text-center">
              <div className="relative w-32 h-32 rounded-[2rem] bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white font-headline text-4xl font-bold shadow-xl mb-6">
                {getInitials(dietician.first_name, dietician.last_name)}
                <div className="absolute -bottom-2 -right-2 bg-surface text-primary p-1.5 rounded-xl shadow-sm">
                  <span className="material-symbols-outlined text-lg">verified</span>
                </div>
              </div>
              
              <h1 className="font-headline text-2xl font-bold text-on-surface mb-1">
                {dietician.first_name} {dietician.last_name}
              </h1>
              <p className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
                {titleMap[dietician.title] || 'Klinik Uzman'}
              </p>

              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-2xl w-full justify-center mb-8">
                <div className="text-center">
                  <div className="flex items-center text-tertiary">
                    <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-headline font-bold text-lg ml-1">{dietician.average_rating ? Number(dietician.average_rating).toFixed(1) : '5.0'}</span>
                  </div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Puan</span>
                </div>
                <div className="w-px h-8 bg-outline-variant/30"></div>
                <div className="text-center">
                  <div className="font-headline font-bold text-lg text-on-surface">{dietician.review_count || 0}</div>
                  <span className="text-[10px] text-outline font-bold uppercase tracking-widest">Danışan</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-3">
                <button onClick={() => setShowApplyModal(true)} className="w-full py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform flex justify-center items-center gap-2">
                   Program Oluştur
                </button>
                <button onClick={() => navigate(`/appointments?dietician=${id}`)} className="w-full py-4 bg-primary-container/10 text-primary font-headline font-bold rounded-2xl hover:bg-primary-container/20 transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-sm">calendar_today</span> Randevu Al
                </button>
                <button onClick={handleChat} className="w-full py-4 bg-surface-container-low text-on-surface-variant font-headline font-bold rounded-2xl hover:bg-surface-container-high transition-colors flex justify-center items-center gap-2">
                  <span className="material-symbols-outlined text-sm">chat</span> Mesaj Gönder
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Details & Reviews */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Biography */}
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
            <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary bg-primary-container/10 p-1.5 rounded-lg">history_edu</span> Klinik Özgeçmiş
            </h2>
            <div className="text-on-surface-variant leading-relaxed space-y-4">
              {dietician.biography ? (
                <p>{dietician.biography}</p>
              ) : (
                <p className="italic text-outline">Bu uzmanımız henüz detaylı klinik özgeçmiş eklememiş. Beslenme programları ve klinik hedefleriniz için doğrudan iletişime geçebilirsiniz.</p>
              )}
            </div>
            
            {/* Mocked Specializations since they omit from API for now */}
            <div className="mt-8 pt-8 border-t border-outline-variant/20">
               <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-4">Odak Alanları</h3>
               <div className="flex flex-wrap gap-2">
                 {['Metabolik Sağlık', 'Kilo Yönetimi', 'Klinik Beslenme'].map(tag => (
                   <span key={tag} className="px-4 py-2 bg-surface-container-highest text-on-surface-variant rounded-xl text-sm font-medium">
                     {tag}
                   </span>
                 ))}
               </div>
            </div>
          </div>

          {/* Reviews List */}
          {dietician.reviews && dietician.reviews.length > 0 && (
             <div className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border">
                <h2 className="font-headline text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-tertiary bg-tertiary-container/10 p-1.5 rounded-lg">forum</span> Danışan Yorumları
                </h2>
                
                <div className="space-y-6">
                  {dietician.reviews.map((review, i) => (
                    <div key={review.id} className={`pb-6 ${i !== dietician.reviews.length -1 ? 'border-b border-outline-variant/20' : ''}`}>
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-on-surface-variant">
                               {review.client_name?.[0] || 'D'}
                             </div>
                             <div>
                               <p className="font-headline font-bold text-sm text-on-surface">{review.client_name}</p>
                               <p className="text-[10px] text-outline uppercase tracking-widest font-bold">Doğrulanmış Süreç</p>
                             </div>
                          </div>
                          
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className={`material-symbols-outlined text-sm ${s <= Math.round(review.raiting || 0) ? 'text-tertiary' : 'text-outline-variant'}`} style={s <= Math.round(review.raiting || 0) ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                star
                              </span>
                            ))}
                          </div>
                       </div>
                       {review.comment && (
                         <p className="text-on-surface-variant text-sm leading-relaxed mt-2 pl-13">{review.comment}</p>
                       )}
                    </div>
                  ))}
                </div>
             </div>
          )}

        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowApplyModal(false)}>
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" />
          <div className="relative bg-surface rounded-[2rem] p-8 w-full max-w-md z-10 animate-slide-up shadow-2xl ghost-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-primary-container" />
            
            <div className="flex justify-between items-start mb-6 pt-2">
              <h3 className="font-headline text-2xl font-bold text-on-surface tracking-tight">Klinik Süreç</h3>
              <button onClick={() => setShowApplyModal(false)} className="material-symbols-outlined text-outline hover:text-on-surface transition-colors">close</button>
            </div>
            
            <p className="text-sm text-on-surface-variant mb-8 leading-relaxed">
              Diyetisyeniniz ile başlayacağınız sürecin detaylarını aşağıda belirleyebilirsiniz.
            </p>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 block mb-3">Danışmanlık Süresi</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ v: '1M', l: '1 Ay' }, { v: '3M', l: '3 Ay' }, { v: '6M', l: '6 Ay' }, { v: '12M', l: '12 Ay' }].map((d) => (
                    <button 
                      key={d.v} 
                      type="button" 
                      onClick={() => setApplyForm((prev) => ({ ...prev, duration: d.v }))}
                      className={`py-3 px-4 text-sm font-bold rounded-xl transition-all border-2 
                        ${applyForm.duration === d.v 
                          ? 'border-primary bg-primary-container/10 text-primary' 
                          : 'border-transparent bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-highest'}`}
                    >
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1 block mb-3">Klinik Notlar & Hedef</label>
                <textarea 
                  value={applyForm.client_note} 
                  onChange={(e) => setApplyForm((prev) => ({ ...prev, client_note: e.target.value }))} 
                  rows={4} 
                  placeholder="Uzmanınıza iletmek istediğiniz hedefleriniz veya mevcut klinik durumunuz..." 
                  className="w-full px-4 py-4 bg-surface-container-lowest border-none rounded-2xl text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all resize-none" 
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-outline-variant/20 flex justify-end gap-3">
              <button onClick={() => setShowApplyModal(false)} className="px-6 py-3 text-on-surface-variant font-headline font-bold rounded-xl hover:bg-surface-container-highest transition-colors">
                İptal
              </button>
              <button onClick={handleApply} disabled={applyLoading} className="px-8 py-3 gradient-primary text-white font-headline font-bold rounded-xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                {applyLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Başvuruyu İlet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
