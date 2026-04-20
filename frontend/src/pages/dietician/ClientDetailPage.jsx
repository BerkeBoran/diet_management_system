import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import dietService from '../../services/dietService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { HiOutlineUser, HiOutlineScale, HiOutlineHeart } from 'react-icons/hi2';

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await dietService.getClientDetail(id);
        setClient(data);
      } catch { /* silent */ }
      setLoading(false);
    };
    fetchClient();
  }, [id]);

  const genderMap = { Male: 'Erkek', Female: 'Kadın', Other: 'Diğer' };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!client) return <div className="text-center py-20 text-slate-400">Danışan bulunamadı.</div>;

  return (
    <div className="animate-fade-in max-w-2xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="glass rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500" />
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
            <HiOutlineUser className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{client.name || `Danışan #${id}`}</h1>
            <p className="text-slate-400 mt-1">{genderMap[client.gender] || client.gender} • {client.age} yaş</p>
          </div>
        </div>
      </div>

      {/* Body Stats */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineScale className="w-5 h-5 text-emerald-400" /> Vücut Bilgileri
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500">Boy</p>
            <p className="text-2xl font-bold text-white">{client.height} <span className="text-sm text-slate-500">cm</span></p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500">Kilo</p>
            <p className="text-2xl font-bold text-white">{client.weight} <span className="text-sm text-slate-500">kg</span></p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500">BMI</p>
            <p className="text-2xl font-bold text-emerald-400">
              {client.height && client.weight ? (client.weight / ((client.height / 100) ** 2)).toFixed(1) : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Health Info */}
      <div className="glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineHeart className="w-5 h-5 text-rose-400" /> Sağlık Bilgileri
        </h2>
        <div className="space-y-3">
          {client.allergies && client.allergies.length > 0 && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Alerjiler</p>
              <div className="flex flex-wrap gap-2">
                {client.allergies.map((a, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded-full">{a}</span>
                ))}
              </div>
            </div>
          )}
          {client.chronic_conditions && client.chronic_conditions.length > 0 && (
            <div>
              <p className="text-sm text-slate-400 mb-1">Kronik Hastalıklar</p>
              <div className="flex flex-wrap gap-2">
                {client.chronic_conditions.map((c, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full">{c}</span>
                ))}
              </div>
            </div>
          )}
          {client.activity_level && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Aktivite Seviyesi</span>
              <span className="text-sm text-white">{client.activity_level}</span>
            </div>
          )}
          {client.sugar_intake && (
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-400">Şeker Tüketimi</span>
              <span className="text-sm text-white">{client.sugar_intake}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
