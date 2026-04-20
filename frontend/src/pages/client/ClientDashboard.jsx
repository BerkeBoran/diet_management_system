import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/useAuth.js';
import dietService from '../../services/dietService';
import { HiOutlineClipboardDocumentList, HiOutlineSparkles, HiOutlineScale, HiOutlineCalendarDays, HiOutlineChatBubbleLeftRight, HiOutlineUserGroup, HiOutlineHeart, HiArrowRight } from 'react-icons/hi2';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ClientDashboard() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, assignRes] = await Promise.allSettled([
          dietService.getDietPlans(),
          dietService.getAssignments(),
        ]);
        if (plansRes.status === 'fulfilled') setPlans(Array.isArray(plansRes.value) ? plansRes.value : plansRes.value?.results || []);
        if (assignRes.status === 'fulfilled') setAssignments(Array.isArray(assignRes.value) ? assignRes.value : assignRes.value?.results || []);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchData();
  }, []);

  const activePlan = plans.find((p) => p.status === 'Active');
  const activeAssignment = assignments.find((a) => a.status === 'InProgress');

  const quickActions = [
    { to: '/dieticians', icon: HiOutlineUserGroup, label: 'Diyetisyen Bul', desc: 'Uzman diyetisyenler', color: 'from-blue-400 to-indigo-500' },
    { to: '/ai-diet', icon: HiOutlineSparkles, label: 'AI Diyet', desc: 'Yapay zeka ile plan', color: 'from-purple-400 to-pink-500' },
    { to: '/my-diet', icon: HiOutlineClipboardDocumentList, label: 'Diyet Planım', desc: 'Plan detayları', color: 'from-emerald-400 to-teal-500' },
    { to: '/health-profile', icon: HiOutlineHeart, label: 'Sağlık Profili', desc: 'Sağlık bilgilerim', color: 'from-rose-400 to-red-500' },
    { to: '/foods', icon: HiOutlineScale, label: 'Besin Ara', desc: 'Kalori hesapla', color: 'from-amber-400 to-orange-500' },
    { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Mesajlar', desc: 'Diyetisyenle sohbet', color: 'from-cyan-400 to-blue-500' },
  ];

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Welcome */}
      <div className="glass rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <h1 className="text-2xl font-bold text-white relative z-10">
          Merhaba, <span className="text-gradient">{user?.first_name || user?.full_name?.split(' ')[0] || 'Kullanıcı'}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1 relative z-10">Bugün sağlıklı bir gün geçirmeye hazır mısınız?</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <HiOutlineClipboardDocumentList className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Aktif Plan</p>
              <p className="text-lg font-bold text-white">{activePlan ? 'Var' : 'Yok'}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HiOutlineUserGroup className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Diyetisyen</p>
              <p className="text-lg font-bold text-white">{activeAssignment?.dietician_detail?.first_name || 'Atanmadı'}</p>
            </div>
          </div>
        </div>
        <div className="glass rounded-xl p-5 group hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <HiOutlineCalendarDays className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Toplam Plan</p>
              <p className="text-lg font-bold text-white">{plans.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Diet Summary */}
      {activePlan && (
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Aktif Diyet Planı</h2>
            <Link to={`/my-diet`} className="text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
              Detaylar <HiArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Kalori', value: `${activePlan.daily_calories || 0} kcal`, color: 'text-emerald-400' },
              { label: 'Protein', value: `${activePlan.daily_protein || 0}g`, color: 'text-blue-400' },
              { label: 'Karbonhidrat', value: `${activePlan.daily_carbs || 0}g`, color: 'text-amber-400' },
              { label: 'Yağ', value: `${activePlan.daily_fat || 0}g`, color: 'text-rose-400' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="group glass glass-hover rounded-xl p-5 transition-all duration-300 hover:scale-[1.02]"
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-white text-sm">{action.label}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
