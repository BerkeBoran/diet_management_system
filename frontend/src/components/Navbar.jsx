import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import {
  HiOutlineHome, HiOutlineUserGroup, HiOutlineChatBubbleLeftRight,
  HiOutlineCalendarDays, HiOutlineSparkles, HiOutlineMagnifyingGlass,
  HiOutlineClipboardDocumentList, HiOutlineUserCircle, HiOutlineArrowRightOnRectangle,
  HiBars3, HiXMark, HiOutlineHeart, HiOutlineUsers, HiOutlineDocumentPlus
} from 'react-icons/hi2';

export default function Navbar() {
  const { user, logout, isAuthenticated, isClient, isDietician } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clientLinks = [
    { to: '/dashboard', icon: HiOutlineHome, label: 'Panel' },
    { to: '/dieticians', icon: HiOutlineUserGroup, label: 'Diyetisyenler' },
    { to: '/my-diet', icon: HiOutlineClipboardDocumentList, label: 'Diyet Planım' },
    { to: '/ai-diet', icon: HiOutlineSparkles, label: 'AI Diyet' },
    { to: '/foods', icon: HiOutlineMagnifyingGlass, label: 'Besin Ara' },
    { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Mesajlar' },
    { to: '/health-profile', icon: HiOutlineHeart, label: 'Sağlık' },
  ];

  const dieticianLinks = [
    { to: '/dietician/dashboard', icon: HiOutlineHome, label: 'Panel' },
    { to: '/dietician/clients', icon: HiOutlineUsers, label: 'Danışanlarım' },
    { to: '/dietician/create-plan', icon: HiOutlineDocumentPlus, label: 'Plan Oluştur' },
    { to: '/chat', icon: HiOutlineChatBubbleLeftRight, label: 'Mesajlar' },
    { to: '/foods', icon: HiOutlineMagnifyingGlass, label: 'Besin Ara' },
  ];

  const links = isClient ? clientLinks : isDietician ? dieticianLinks : [];

  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                <HiOutlineSparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">NutriAI</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Giriş Yap
              </Link>
              <Link to="/register" className="px-5 py-2 text-sm font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/25">
                Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col glass border-r border-white/5 z-40">
        <div className="p-6">
          <Link to={isClient ? '/dashboard' : '/dietician/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <HiOutlineSparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">NutriAI</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <HiOutlineUserCircle className="w-5 h-5" />
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium">{user?.full_name || user?.first_name}</p>
              <p className="text-xs text-slate-500">{isClient ? 'Danışan' : 'Diyetisyen'}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full transition-all mt-1"
          >
            <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4">
          <Link to={isClient ? '/dashboard' : '/dietician/dashboard'} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
              <HiOutlineSparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gradient">NutriAI</span>
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-400 hover:text-white p-2">
            {mobileOpen ? <HiXMark className="w-6 h-6" /> : <HiBars3 className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-14 left-0 right-0 glass border-b border-white/10 p-4 space-y-1 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}
            <hr className="border-white/5 my-2" />
            <Link to="/profile" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-white">
              <HiOutlineUserCircle className="w-5 h-5" />
              Profilim
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 w-full">
              <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
              Çıkış Yap
            </button>
          </div>
        </div>
      )}
    </>
  );
}
