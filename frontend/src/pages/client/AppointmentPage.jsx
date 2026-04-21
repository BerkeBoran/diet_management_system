import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { useToast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const dieticianId = searchParams.get('dietician') || '';
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [booked, setBooked] = useState(false);
  const [dieticianName, setDieticianName] = useState('');

  const fetchSlots = async () => {
    if (!dieticianId || !date) { toast.warning('Diyetisyen ve tarih seçin.'); return; }
    setSlotsLoading(true);
    try {
      const data = await appointmentService.getDailySlots(dieticianId, date);
      setSlots(data.slots || []);
      setDieticianName(data.dietician || '');
      setSelectedSlot(null);
    } catch { toast.error('Randevu saatleri alınamadı.'); }
    setSlotsLoading(false);
  };

  const bookAppointment = async () => {
    if (!selectedSlot) { toast.warning('Bir saat seçin.'); return; }
    setLoading(true);
    try {
      await appointmentService.createAppointment({
        dietician: Number(dieticianId),
        client: user.id,
        date,
        start_time: selectedSlot,
      });
      toast.success('Randevunuz onaylandı.');
      setBooked(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Randevu oluşturulamadı.');
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="max-w-3xl mx-auto animate-fade-in py-20 text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-tertiary-container/30 flex items-center justify-center mx-auto mb-6 shadow-inner ghost-border">
          <span className="material-symbols-outlined text-5xl text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
        </div>
        <h2 className="font-headline text-4xl font-extrabold text-on-surface mb-3 tracking-tight">Randevunuz Onaylandı</h2>
        <p className="text-on-surface-variant text-lg max-w-lg mx-auto leading-relaxed mb-8">
          <span className="font-bold text-on-surface">{dieticianName}</span> ile <span className="font-bold text-on-surface">{date}</span> tarihinde saat <span className="font-bold text-primary px-2 py-1 bg-primary/10 rounded">{selectedSlot}</span> için seans oluşturuldu.
        </p>
        <button onClick={() => navigate('/dashboard')} className="px-8 py-4 gradient-primary text-white font-headline font-bold rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform">
          Panele Dön
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      
      {/* Header */}
      <header className="mb-10">
        <span className="text-primary font-headline text-xs font-bold tracking-widest uppercase mb-1 block">TAKVİM & PLANLAMA</span>
        <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-on-surface tracking-tight mb-4">
          Randevu Ayarla.
        </h1>
        <p className="text-lg text-on-surface-variant max-w-xl">
          Klinik durumunuzu değerlendirmek için uzman diyetisyeninizle görüşebileceğiniz size en uygun vakti seçin.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Step 1: Selection */}
        <section className="bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border self-start">
          <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary font-bold">1</div>
            <h2 className="font-headline text-xl font-bold text-on-surface">Tarih Seçimi</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Uzman ID (Test Seçimi)</label>
              <input 
                type="text" 
                value={dieticianId} 
                readOnly 
                className="w-full px-4 py-4 bg-surface-container-high border-none rounded-xl text-on-surface-variant font-medium cursor-not-allowed shadow-inner" 
                placeholder="Örn: 1"
              />
               <p className="text-outline text-xs mt-1 italic pl-1">ID parametresi URL'den '?dietician=X' olarak okunur.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider ml-1">Görüşme Tarihi</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">calendar_month</span>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  min={new Date().toISOString().split('T')[0]} 
                  className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest focus:bg-surface-container-lowest border-none rounded-xl text-on-surface font-headline font-bold focus:ring-2 focus:ring-primary shadow-[inset_0px_1px_2px_rgba(0,0,0,0.05)] transition-all cursor-pointer" 
                />
              </div>
            </div>

            <button 
              onClick={fetchSlots} 
              disabled={slotsLoading} 
              className="w-full py-4 bg-surface-container-low text-on-surface font-headline font-bold rounded-2xl hover:bg-surface-container-highest ghost-border transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {slotsLoading ? (
                 <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <><span className="material-symbols-outlined text-sm">manage_search</span> Müsaitlik Durumunu Sorgula</>
              )}
            </button>
          </div>
        </section>

        {/* Step 2: Time Slots */}
        <section className={`bg-surface-container-lowest rounded-[2.5rem] p-8 shadow-[0px_12px_32px_rgba(23,29,27,0.06)] ghost-border transition-all duration-500 ${slots.length > 0 ? 'opacity-100 translate-y-0' : 'opacity-50 blur-[2px] pointer-events-none translate-y-4'}`}>
           <div className="flex items-center gap-3 mb-6 border-b border-outline-variant/30 pb-4">
            <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary font-bold">2</div>
            <div>
              <h2 className="font-headline text-xl font-bold text-on-surface">Saat Seçimi</h2>
              {dieticianName && <p className="text-sm font-bold text-primary mt-0.5">{dieticianName}</p>}
            </div>
          </div>

          <div className="space-y-8">
            {slots.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                  <button 
                    key={slot.time} 
                    disabled={!slot.is_available} 
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`py-3 px-2 text-sm font-bold rounded-xl transition-all border-2 text-center
                      ${!slot.is_available 
                        ? 'bg-surface-container-highest cursor-not-allowed border-transparent text-outline line-through' 
                        : selectedSlot === slot.time 
                          ? 'bg-primary text-white border-primary shadow-md scale-105' 
                          : 'bg-surface-container-lowest border-surface-container-highest text-on-surface-variant hover:border-primary/50'
                      }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center text-center">
                 <span className="material-symbols-outlined text-4xl text-outline mb-3">event_busy</span>
                 <p className="text-on-surface-variant font-medium">Lütfen sol taraftan tarih seçerek uygunluk durumunu sorgulayın.</p>
              </div>
            )}

            {/* Confirmation Action */}
            <div className={`transition-all duration-300 ${selectedSlot ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              <div className="bg-primary/5 p-4 rounded-2xl mb-4 ghost-border">
                <p className="text-sm text-on-surface-variant mb-1">Seçilen Randevu</p>
                <div className="font-headline font-bold text-on-surface text-lg">{date} — {selectedSlot}</div>
              </div>

              <button 
                onClick={bookAppointment} 
                disabled={loading} 
                className="w-full py-4 gradient-primary text-white font-headline font-bold text-lg rounded-2xl shadow-[0px_8px_16px_rgba(0,104,86,0.2)] hover:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Randevuyu Onayla'}
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
