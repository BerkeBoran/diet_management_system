import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth.js';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock, HiArrowRight } from 'react-icons/hi2';

export default function DieticianDashboard() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [assignRes, clientsRes] = await Promise.allSettled([
          dietService.getAssignments(),
          dietService.getDieticianClients(),
        ]);
        if (assignRes.status === 'fulfilled') setAssignments(Array.isArray(assignRes.value) ? assignRes.value : assignRes.value?.results || []);
        if (clientsRes.status === 'fulfilled') setClients(Array.isArray(clientsRes.value) ? clientsRes.value : clientsRes.value?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const pendingAssignments = assignments.filter((a) => a.verification_status === 'Pending');
  const activeClients = clients.filter((c) => c.status === 'InProgress');

  const respondToAssignment = async (id, status) => {
    try {
      await dietService.respondAssignment(id, { verification_status: status });
      setAssignments((prev) => prev.map((a) => a.id === id ? { ...a, verification_status: status } : a));
    } catch { /* silent */ }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        <h1 className="text-2xl font-bold text-white relative z-10">
          Hoş geldiniz, <span className="text-gradient">{user?.first_name || user?.full_name?.split(' ')[0] || 'Diyetisyen'}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1 relative z-10">İşte bugünkü özet bilgileriniz</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HiOutlineUsers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Aktif Danışan</p>
              <p className="text-lg font-bold text-white">{activeClients.length}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <HiOutlineClock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Bekleyen Başvuru</p>
              <p className="text-lg font-bold text-white">{pendingAssignments.length}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <HiOutlineClipboardDocumentList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Toplam Atama</p>
              <p className="text-lg font-bold text-white">{assignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      {pendingAssignments.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Bekleyen Başvurular</h2>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">{pendingAssignments.length} adet</span>
          </div>
          <div className="space-y-3">
            {pendingAssignments.map((a) => (
              <div key={a.id} className="bg-slate-800/50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-white text-sm">Danışan #{a.client || a.id}</p>
                  {a.client_note && <p className="text-xs text-slate-400 mt-0.5">"{a.client_note}"</p>}
                  <p className="text-xs text-slate-500 mt-1">Süre: {a.duration}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respondToAssignment(a.id, 'Accepted')} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 text-sm rounded-lg hover:bg-emerald-500/30 transition-all flex items-center gap-1.5">
                    <HiOutlineCheckCircle className="w-4 h-4" /> Kabul
                  </button>
                  <button onClick={() => respondToAssignment(a.id, 'Rejected')} className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30 transition-all flex items-center gap-1.5">
                    <HiOutlineXCircle className="w-4 h-4" /> Reddet
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/dietician/clients" className="group glass glass-hover rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]">
          <HiOutlineUsers className="w-8 h-8 text-blue-400 mb-3" />
          <h3 className="font-semibold text-white text-sm">Danışanlarım</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">Tüm danışanları gör <HiArrowRight className="w-3 h-3" /></p>
        </Link>
        <Link to="/dietician/create-plan" className="group glass glass-hover rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]">
          <HiOutlineClipboardDocumentList className="w-8 h-8 text-emerald-400 mb-3" />
          <h3 className="font-semibold text-white text-sm">Plan Oluştur</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">Yeni diyet planı <HiArrowRight className="w-3 h-3" /></p>
        </Link>
      </div>
    </div>
  );
}
