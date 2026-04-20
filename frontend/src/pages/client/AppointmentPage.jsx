import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import appointmentService from '../../services/appointmentService';
import { useToast } from '../../components/useToast.js';
import { useAuth } from '../../contexts/useAuth.js';
import { HiOutlineCalendarDays, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi2';

export default function AppointmentPage() {
  const [searchParams] = useSearchParams();
  const dieticianId = searchParams.get('dietician') || '';
  const { user } = useAuth();
  const toast = useToast();

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
    } catch { toast.error('Slotlar yüklenemedi.'); }
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
      toast.success('Randevu oluşturuldu!');
      setBooked(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Randevu oluşturulamadı.');
    }
    setLoading(false);
  };

  if (booked) {
    return (
      <div className="animate-fade-in flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <HiOutlineCheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-xl font-semibold text-white mb-2">Randevunuz Oluşturuldu!</h2>
        <p className="text-slate-400">{dieticianName} ile {date} tarihinde {selectedSlot} saatinde.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineCalendarDays className="w-7 h-7 text-emerald-400" /> Randevu Al
        </h1>
        <p className="text-slate-400 mt-1">Uygun tarih ve saati seçin</p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Diyetisyen ID</label>
          <input type="text" value={dieticianId} readOnly className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white/60 cursor-not-allowed" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">Tarih</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white focus:border-emerald-500/50 transition-all [color-scheme:dark]" />
        </div>

        <button onClick={fetchSlots} disabled={slotsLoading} className="w-full py-3 glass glass-hover text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 border border-white/10">
          {slotsLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><HiOutlineClock className="w-5 h-5" /> Müsait Saatleri Getir</>}
        </button>
      </div>

      {slots.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-3">{dieticianName} - {date}</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => (
              <button key={slot.time} disabled={!slot.is_available} onClick={() => setSelectedSlot(slot.time)}
                className={`py-3 text-sm rounded-xl transition-all ${!slot.is_available ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed line-through' : selectedSlot === slot.time ? 'bg-emerald-500 text-white glow-green' : 'glass text-slate-300 hover:text-white hover:bg-white/10'}`}
              >{slot.time}</button>
            ))}
          </div>

          {selectedSlot && (
            <button onClick={bookAppointment} disabled={loading} className="w-full mt-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : `${selectedSlot} Randevuyu Onayla`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
