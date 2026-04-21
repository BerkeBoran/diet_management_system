import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { inferRoleFromProfile, resolveUserRole } from '../contexts/role-utils';

export default function Navbar() {
  const { user, logout, isAuthenticated, isClient, isDietician } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const resolvedRole = resolveUserRole(user?.role, inferRoleFromProfile(user));
  const showClientNav = isClient || resolvedRole === 'Client';
  const showDieticianNav = isDietician || resolvedRole === 'Dietician';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const clientLinks = [
    { to: '/dashboard', icon: 'dashboard', label: 'Panel' },
    { to: '/dieticians', icon: 'person_search', label: 'Diyetisyenler' },
    { to: '/my-diet', icon: 'restaurant_menu', label: 'Diyet Planım' },
    { to: '/ai-diet', icon: 'auto_awesome', label: 'AI Diyet' },
    { to: '/foods', icon: 'search_insights', label: 'Besin Ara' },
    { to: '/chat', icon: 'chat', label: 'Mesajlar' },
    { to: '/health-profile', icon: 'health_metrics', label: 'Sağlık' },
    { to: '/appointments', icon: 'calendar_today', label: 'Randevular' },
  ];

  const dieticianLinks = [
    { to: '/dietician/dashboard', icon: 'dashboard', label: 'Panel' },
    { to: '/dietician/clients', icon: 'group', label: 'Danışanlarım' },
    { to: '/dietician/create-plan', icon: 'restaurant_menu', label: 'Plan Oluştur' },
    { to: '/foods', icon: 'search_insights', label: 'Besin Ara' },
    { to: '/chat', icon: 'chat', label: 'Mesajlar' },
    { to: '/appointments', icon: 'calendar_today', label: 'Randevular' },
  ];

  const links = showClientNav ? clientLinks : showDieticianNav ? dieticianLinks : [];

  // Mobile bottom nav — subset of links
  const mobileBottomLinks = showClientNav
    ? [
        { to: '/dashboard', icon: 'event_note', label: 'Bugün' },
        { to: '/my-diet', icon: 'nutrition', label: 'Planlar' },
        { to: '/chat', icon: 'forum', label: 'Chat' },
        { to: '/profile', icon: 'person', label: 'Profil' },
      ]
    : [
        { to: '/dietician/dashboard', icon: 'dashboard', label: 'Bugün' },
        { to: '/dietician/clients', icon: 'group', label: 'Danışanlar' },
        { to: '/chat', icon: 'forum', label: 'Chat' },
        { to: '/profile', icon: 'person', label: 'Profil' },
      ];

  // Public navbar (not authenticated)
  if (!isAuthenticated) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary tracking-tighter font-headline">NutriConnect</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors font-headline">
              Giriş Yap
            </Link>
            <Link to="/register" className="px-6 py-2.5 text-sm font-bold gradient-primary text-white rounded-3xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/10 font-headline">
              Kayıt Ol
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Desktop Sidebar — surface-dim background */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 flex-col bg-surface-dim z-40">
        {/* Brand + Profile */}
        <div className="px-8 py-8">
          <Link to={showClientNav ? '/dashboard' : '/dietician/dashboard'} className="block">
            <div className="text-lg font-black text-primary tracking-tighter font-headline">NutriConnect</div>
          </Link>
        </div>

        <div className="flex items-center px-8 mb-8">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm">
            {user?.full_name?.[0] || user?.first_name?.[0] || 'U'}
          </div>
          <div className="ml-3">
            <p className="font-headline font-bold text-sm text-on-surface truncate max-w-[140px]">
              {user?.full_name || user?.first_name || 'Kullanıcı'}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">
              {showClientNav ? 'Danışan' : 'Diyetisyen'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 py-3 transition-all duration-200 text-sm font-medium
                  ${isActive
                    ? 'bg-surface-container-low text-primary rounded-l-full ml-4 pl-4'
                    : 'text-on-surface-variant/70 px-8 hover:text-primary'
                  }`}
              >
                <span className={`material-symbols-outlined text-xl ${isActive ? '' : ''}`} style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {link.icon}
                </span>
                <span className="font-headline font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* New Diet Plan button (Dietician only) */}
        {showDieticianNav && (
          <div className="px-6 py-4">
            <Link
              to="/dietician/create-plan"
              className="block w-full py-3 rounded-xl gradient-primary text-white font-bold text-sm text-center shadow-lg active:scale-[0.98] transition-transform"
            >
              Yeni Diyet Planı
            </Link>
          </div>
        )}

        {/* Bottom section */}
        <div className="px-8 py-6 space-y-1 border-t border-outline-variant/10">
          <Link
            to="/profile"
            className="flex items-center gap-3 py-2 text-on-surface-variant/70 hover:text-primary transition-all text-sm"
          >
            <span className="material-symbols-outlined text-lg">settings</span>
            <span className="font-headline font-medium">Ayarlar</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 py-2 text-on-surface-variant/70 hover:text-error transition-all text-sm w-full"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span className="font-headline font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-surface px-6 py-4 flex justify-between items-center">
        <Link to={showClientNav ? '/dashboard' : '/dietician/dashboard'}>
          <span className="text-xl font-bold text-primary tracking-tighter font-headline">NutriConnect</span>
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-surface-container-highest transition-colors">
            <span className="material-symbols-outlined text-primary">notifications</span>
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-full hover:bg-surface-container-highest transition-colors"
          >
            <span className="material-symbols-outlined text-primary">
              {mobileOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 animate-fade-in" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-sm" />
          <div
            className="absolute top-16 left-0 right-0 bg-surface-container-lowest rounded-b-3xl p-4 space-y-1 ambient-shadow animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {links.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive
                      ? 'bg-surface-container-low text-primary'
                      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                    }`}
                >
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span className="font-headline">{link.label}</span>
                </Link>
              );
            })}
            <div className="h-px bg-outline-variant/20 my-2" />
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-on-surface-variant hover:text-primary"
            >
              <span className="material-symbols-outlined">person</span>
              <span className="font-headline">Profilim</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-error hover:bg-error-container/20 w-full"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="font-headline">Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 glass-panel flex justify-around items-center px-4 pb-6 pt-2 rounded-t-3xl"
        style={{ boxShadow: '0px -12px 32px rgba(23, 29, 27, 0.06)' }}
      >
        {mobileBottomLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex flex-col items-center justify-center p-3 transition-all duration-200
                ${isActive
                  ? 'bg-primary text-white rounded-2xl scale-95'
                  : 'text-on-surface-variant/50 hover:bg-surface-container-low'
                }`}
            >
              <span
                className="material-symbols-outlined mb-0.5"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {link.icon}
              </span>
              <span className="text-[10px] uppercase tracking-wider font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
