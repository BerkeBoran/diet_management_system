import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import Icons from '../landing/LandingIcons';

const CRUMB = {
  '/client/dashboard':      ['Danışan Paneli', 'Genel Bakış'],
  '/client/diet-plans':     ['Danışan Paneli', 'Diyet Planım'],
  '/client/dietitians':     ['Danışan Paneli', 'Diyetisyenler'],
  '/client/ai-diet':        ['Danışan Paneli', 'Plan Oluştur'],
  '/client/meal-analysis':  ['Danışan Paneli', 'Yemek Analizi'],
  '/client/appointments':   ['Danışan Paneli', 'Randevular'],
  '/client/messages':       ['Danışan Paneli', 'Mesajlar'],
  '/client/profile':        ['Danışan Paneli', 'Profilim'],
  '/dietician/dashboard':   ['Diyetisyen Paneli', 'Genel Bakış'],
  '/dietician/clients':     ['Diyetisyen Paneli', 'Danışanlarım'],
  '/dietician/appointments':['Diyetisyen Paneli', 'Randevular'],
  '/dietician/diet-plan-create': ['Diyetisyen Paneli', 'Diyet Planı Oluştur'],
  '/dietician/availability':['Diyetisyen Paneli', 'Müsaitlik'],
  '/dietician/messages':    ['Diyetisyen Paneli', 'Mesajlar'],
  '/dietician/profile':     ['Diyetisyen Paneli', 'Profilim'],
};

const LAYOUT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

.dash-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #FBFAF5;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── SIDEBAR ─────────────────────────────── */
.dash-side {
  width: 260px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #E5E0D5;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: transform 0.3s;
}
.dash-side-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid #E5E0D5;
  flex-shrink: 0;
}
.dash-role-tag {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #65A30D;
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  border-radius: 4px;
  padding: 2px 7px;
  font-family: 'JetBrains Mono', monospace;
}
.dash-nav {
  flex: 1;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.dash-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: none;
  background: none;
  font-size: 13.5px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  text-align: left;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
.dash-nav-item:hover {
  background: #F9F6EF;
  color: #1A1A1A;
}
.dash-nav-item.active {
  background: #1A1A1A;
  color: #FBFAF5;
}
.dash-nav-item.active svg { stroke: #65A30D; }
.dash-side-cta {
  padding: 12px 12px 16px;
  border-top: 1px solid #E5E0D5;
  flex-shrink: 0;
}
.dash-side-cta-card {
  background: linear-gradient(135deg, #1A1A1A 0%, #2D4A1E 100%);
  border-radius: 12px;
  padding: 14px;
  margin-bottom: 12px;
}
.dash-side-cta-icon {
  width: 28px;
  height: 28px;
  background: rgba(101,163,13,0.2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  color: #65A30D;
}
.dash-side-cta-title {
  font-family: 'Instrument Serif', serif;
  font-size: 14px;
  color: #FBFAF5;
  margin: 0 0 4px;
}
.dash-side-cta-sub {
  font-size: 11px;
  color: rgba(251,250,245,0.55);
  line-height: 1.45;
  margin: 0 0 10px;
}
.dash-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 6px;
}
.dash-user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #1A1A1A;
  color: #FBFAF5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Instrument Serif', serif;
  font-size: 13px;
  flex-shrink: 0;
  user-select: none;
}
.dash-user-avatar-sm {
  width: 30px;
  height: 30px;
  font-size: 11px;
}
.dash-user-info { flex: 1; min-width: 0; }
.dash-user-name {
  font-size: 13px;
  font-weight: 600;
  color: #1A1A1A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-user-mail {
  font-size: 11px;
  color: #9CA3AF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dash-user-out {
  background: none;
  border: none;
  padding: 6px;
  color: #9CA3AF;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  flex-shrink: 0;
}
.dash-user-out:hover { color: #ef4444; }
.dash-help-link {
  display: flex; align-items: center; gap: 7px;
  font-size: 12px; color: #9CA3AF; text-decoration: none;
  padding: 7px 6px; border-radius: 8px;
  transition: color .2s, background .2s;
  margin-bottom: 4px;
}
.dash-help-link:hover { color: #1A1A1A; background: #F5F3EE; }

/* ── MAIN AREA ───────────────────────────── */
.dash-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.dash-topbar {
  height: 56px;
  background: white;
  border-bottom: 1px solid #E5E0D5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  flex-shrink: 0;
}
.dash-crumb {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #9CA3AF;
}
.dash-crumb strong { color: #1A1A1A; font-weight: 600; }
.dash-crumb .sep { color: #D1D5DB; }
.dash-topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dash-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: none;
  border: 1px solid #E5E0D5;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6B7280;
  position: relative;
  transition: background 0.15s, color 0.15s;
}
.dash-icon-btn:hover { background: #F9F6EF; color: #1A1A1A; }
.bell-dot {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 50%;
  border: 1.5px solid white;
}
.dash-menu-btn { display: none; }
.dash-plan-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 999px;
  background: #1A1A1A; color: #FBFAF5;
  font-size: 12px; font-weight: 600;
  border: none; cursor: pointer; text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  transition: background .2s;
}
.dash-plan-btn:hover { background: #4D7C0F; }
.dash-body {
  flex: 1;
  overflow-y: auto;
  padding: 28px;
}

/* ── BUTTONS (scoped) ────────────────────── */
.dash-shell .btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  line-height: 1;
}
.dash-shell .btn-sm { padding: 7px 14px; font-size: 12px; }
.dash-shell .btn-primary { background: #1A1A1A; color: #FBFAF5; }
.dash-shell .btn-primary:hover { background: #2D4A1E; }
.dash-shell .btn-accent { background: #65A30D; color: white; }
.dash-shell .btn-accent:hover { background: #4D7C0F; }
.dash-shell .btn-ghost { background: none; border: 1px solid #E5E0D5; color: #1A1A1A; }
.dash-shell .btn-ghost:hover { background: #F9F6EF; }

/* ── OVERLAY ─────────────────────────────── */
.dash-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  z-index: 40;
  backdrop-filter: blur(2px);
}

/* ── RESPONSIVE ──────────────────────────── */
@media (max-width: 768px) {
  .dash-side {
    position: fixed;
    left: 0;
    top: 0;
    transform: translateX(-100%);
    z-index: 50;
  }
  .dash-side.open { transform: translateX(0); }
  .dash-menu-btn { display: flex !important; }
  .dash-body { padding: 20px 16px; }
}
`;

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const [section, page] = CRUMB[location.pathname] || ['Panel', 'Sayfa'];

  return (
    <div className="dash-shell">
      <style>{LAYOUT_CSS}</style>

      {sidebarOpen && (
        <div className="dash-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dash-main">
        <header className="dash-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="dash-icon-btn dash-menu-btn"
              aria-label="Menü"
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'none' }}
            >
              <Icons.Menu size={18} />
            </button>
            <div className="dash-crumb">
              <span>{section}</span>
              <span className="sep">/</span>
              <strong>{page}</strong>
            </div>
          </div>

          <div className="dash-topbar-right">
            {user?.role !== 'Dietician' && (
              <Link to="/client/choose-plan" className="dash-plan-btn">
                <Icons.Sparkle size={13} />
                Plan Değiştir
              </Link>
            )}
          </div>
        </header>

        <div className="dash-body">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
