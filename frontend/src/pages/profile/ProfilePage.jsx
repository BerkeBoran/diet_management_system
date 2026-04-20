import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/useAuth.js';
import authService from '../../services/authService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineUserCircle, HiOutlineEnvelope, HiOutlinePhone } from 'react-icons/hi2';

export default function ProfilePage() {
  const { user, isClient, isDietician } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await authService.getProfile();
        setProfile(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const titleMap = { DIETICIAN: 'Diyetisyen', EXPERT_DIETICIAN: 'Uzman Diyetisyen', INTERN_DIETICIAN: 'Stajyer Diyetisyen' };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <HiOutlineUserCircle className="w-7 h-7 text-emerald-400" /> Profilim
        </h1>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500" />
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
            {profile?.first_name?.[0] || user?.full_name?.[0] || '?'}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile?.first_name} {profile?.last_name}</h2>
            <p className="text-emerald-400 font-medium">
              {isClient ? 'Danışan' : isDietician ? (titleMap[profile?.title] || 'Diyetisyen') : 'Kullanıcı'}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-white mb-4">İletişim Bilgileri</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <HiOutlineEnvelope className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">E-posta</p>
              <p className="text-white">{profile?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <HiOutlinePhone className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Telefon</p>
              <p className="text-white">{profile?.phone_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client Body Info */}
      {isClient && profile && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Vücut Bilgileri</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Yaş', value: profile.age || '-' },
              { label: 'Boy', value: profile.height ? `${profile.height} cm` : '-' },
              { label: 'Kilo', value: profile.weight ? `${profile.weight} kg` : '-' },
              { label: 'BMI', value: profile.height && profile.weight ? (profile.weight / ((profile.height / 100) ** 2)).toFixed(1) : '-' },
            ].map((item) => (
              <div key={item.label} className="bg-slate-800/50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500">{item.label}</p>
                <p className="text-xl font-bold text-white mt-1">{item.value}</p>
              </div>
            ))}
          </div>

          {profile.allergies?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-400 mb-2">Alerjiler</p>
              <div className="flex flex-wrap gap-2">
                {profile.allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dietician Info */}
      {isDietician && profile && (
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4">Diyetisyen Bilgileri</h3>
          <div className="space-y-3">
            {profile.appointment_duration && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-400">Randevu Süresi</span>
                <span className="text-sm text-white">{profile.appointment_duration} dakika</span>
              </div>
            )}
            {profile.work_time_start && (
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-slate-400">Çalışma Saatleri</span>
                <span className="text-sm text-white">{profile.work_time_start} - {profile.work_time_end}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
