import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icons from '../landing/LandingIcons';

const dieticianMenu = [
  { to: '/dietician/dashboard',         label: 'Genel Bakış',         icon: 'Bolt'          },
  { to: '/dietician/clients',           label: 'Danışanlarım',        icon: 'Users'         },
  { to: '/dietician/diet-plan-create',  label: 'Diyet Planı Oluştur', icon: 'ClipboardList' },
  { to: '/dietician/appointments',      label: 'Randevular',          icon: 'Calendar'      },
  { to: '/dietician/availability',      label: 'Müsaitlik',           icon: 'Check'         },
  { to: '/dietician/messages',          label: 'Mesajlar',            icon: 'Chat'          },
  { to: '/dietician/profile',           label: 'Profilim',            icon: 'Heart'         },
];

const aiClientMenu = [
  { to: '/client/ai-dashboard',      label: 'Genel Bakış',       icon: 'Bolt'          },
  { to: '/client/active-diet-plan',  label: 'Aktif Diyet Planım', icon: 'ClipboardList' },
  { to: '/client/diet-plans',        label: 'Diyet Planlarım',   icon: 'ClipboardList' },
  { to: '/client/ai-diet',           label: 'Plan Oluştur',      icon: 'Sparkle'       },
  { to: '/client/meal-analysis',    label: 'Yemek Analizi',     icon: 'Search'        },
  { to: '/client/profile',           label: 'Profilim',          icon: 'Heart'         },
];

const dieticianClientMenu = [
  { to: '/client/dietician-dashboard', label: 'Genel Bakış',       icon: 'Bolt'          },
  { to: '/client/active-diet-plan',    label: 'Aktif Diyet Planım', icon: 'ClipboardList' },
  { to: '/client/diet-plans',          label: 'Diyet Planlarım',   icon: 'ClipboardList' },
  { to: '/client/dietitians',          label: 'Diyetisyenler',     icon: 'Users'         },
  { to: '/client/appointments',        label: 'Randevular',        icon: 'Calendar'      },
  { to: '/client/messages',            label: 'Mesajlar',          icon: 'Chat'          },
  { to: '/client/profile',             label: 'Profilim',          icon: 'Heart'         },
];

const freeClientMenu = [
  { to: '/client/diet-plans', label: 'Diyet Planlarım', icon: 'ClipboardList' },
  { to: '/client/messages',   label: 'Mesajlar',        icon: 'Chat'          },
  { to: '/client/profile',    label: 'Profilim',        icon: 'Heart'         },
];

function getClientMenu() {
  const mode = localStorage.getItem('clientMode') || 'free';
  if (mode === 'ai') return aiClientMenu;
  if (mode === 'dietician') return dieticianClientMenu;
  return freeClientMenu;
}

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useLocation(); // re-render on route changes so menu stays in sync

  const isClient = user?.role !== 'Dietician';
  const clientMode = localStorage.getItem('clientMode') || 'free';
  const menu = user?.role === 'Dietician' ? dieticianMenu : getClientMenu();
  const initials = (user?.fullName?.split(' ') ?? []).map(n => n[0] || '').join('').toUpperCase().slice(0, 2) || '?';

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('clientMode');
    navigate('/');
  };

  return (
    <aside className={`dash-side${isOpen ? ' open' : ''}`}>
      {/* Logo + role */}
      <div className="dash-side-top">
        <NavLink to="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <span style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 700,
            fontSize: '34px',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
          }}>LIFEETICS</span>
        </NavLink>
        <span className="dash-role-tag">
          {!isClient ? 'DİYETİSYEN' : clientMode === 'ai' ? 'AI DANIŞAN' : clientMode === 'dietician' ? 'DANIŞAN' : 'ÜYE'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="dash-nav">
        {menu.map(({ to, label, icon }) => {
          const Ic = Icons[icon];
          return (
            <NavLink
              key={to}
              to={to}
              end={to.endsWith('/dashboard')}
              onClick={onClose}
              className={({ isActive }) => `dash-nav-item${isActive ? ' active' : ''}`}
            >
              <Ic size={16} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom CTA + user */}
      <div className="dash-side-cta">
        <NavLink to="/support" className="dash-help-link" onClick={onClose}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Yardım & Destek
        </NavLink>

        <div className="dash-user">
          <span className="dash-user-avatar">{initials}</span>
          <div className="dash-user-info">
            <div className="dash-user-name">{user?.fullName || '—'}</div>
            <div className="dash-user-mail">{user?.email || ''}</div>
          </div>
          <button className="dash-user-out" aria-label="Çıkış" onClick={handleLogout}>
            <Icons.LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
