import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaLeaf, FaRobot, FaUserMd, FaBars, FaTimes } from 'react-icons/fa';

export default function PublicNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 w-full z-50">
      <div className="flex justify-between items-center px-6 md:px-12 h-20 max-w-[1440px] mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <span style={{
            fontFamily: '"Instrument Serif", serif',
            fontWeight: 700,
            fontSize: '40px',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
          }}>LIFEETICS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/register" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><FaRobot size={16} /><span>AI Diyetisyen</span></Link>
          <Link to="/register" className="text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"><FaUserMd size={16} /><span>Diyetisyenler</span></Link>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <Link to={user?.role === 'Dietician' ? '/dietician/dashboard' : '/client/dashboard'} className="btn btn-primary">
                Panele Git
              </Link>
              <button onClick={handleLogout} className="hidden md:block text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden md:block text-sm font-semibold text-on-surface-variant hover:text-primary transition-colors">Giriş Yap</Link>
              <Link to="/register" className="btn btn-primary">Kayıt Ol</Link>
            </>
          )}
          <button className="md:hidden text-on-surface-variant" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-surface-container-lowest border-b border-outline-variant/30 p-4 flex flex-col gap-4 z-40 shadow-level-1">
          <Link to="/register" className="text-sm font-semibold text-on-surface flex items-center gap-2" onClick={() => setMenuOpen(false)}><FaRobot /> AI Diyetisyen</Link>
          <Link to="/register" className="text-sm font-semibold text-on-surface flex items-center gap-2" onClick={() => setMenuOpen(false)}><FaUserMd /> Diyetisyenler</Link>
          {isAuthenticated ? (
            <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="text-sm font-semibold text-on-surface-variant text-left">
              Çıkış Yap
            </button>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-primary" onClick={() => setMenuOpen(false)}>Giriş Yap</Link>
          )}
        </div>
      )}
    </nav>
  );
}
