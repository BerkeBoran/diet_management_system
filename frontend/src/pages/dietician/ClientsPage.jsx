import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineUsers, HiOutlineMagnifyingGlass } from 'react-icons/hi2';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await dietService.getDieticianClients();
        setClients(Array.isArray(data) ? data : data?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchClients();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineUsers className="w-7 h-7 text-blue-400" /> Danışanlarım
        </h1>
        <p className="text-slate-400 mt-1">Aktif ve geçmiş danışanlarınız</p>
      </div>

      <div className="relative">
        <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Danışan ara..." className="w-full pl-12 pr-4 py-3 glass rounded-xl text-white placeholder-slate-500 focus:border-emerald-500/50 transition-all border border-white/10" />
      </div>

      <div className="space-y-3">
        {clients.map((c) => (
          <div key={c.id} className="glass glass-hover rounded-xl p-5 transition-all hover:scale-[1.01]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                  {(c.client_name || c.name || '?')[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{c.client_name || c.name || `Danışan #${c.id}`}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Süre: {c.duration || '-'} • Durum: {c.status === 'InProgress' ? 'Devam ediyor' : c.status === 'Ended' ? 'Tamamlandı' : c.status}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/dietician/clients/${c.client || c.id}`} className="px-4 py-2 glass text-slate-300 text-sm rounded-lg hover:text-white transition-all border border-white/10">
                  Detay
                </Link>
                <Link to={`/chat`} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm rounded-lg hover:bg-emerald-500/30 transition-all">
                  Mesaj
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {clients.length === 0 && (
        <div className="text-center py-16">
          <HiOutlineUsers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Henüz danışanınız yok.</p>
        </div>
      )}
    </div>
  );
}
