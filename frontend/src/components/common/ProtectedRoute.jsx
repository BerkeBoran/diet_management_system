import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user, loading } = useAuth();

  // Auth state çözülene kadar bekle — aksi takdirde token taşıyan kullanıcı
  // refresh esnasında /login'e yanlış yönlenir.
  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--forest)',
        }}
      >
        <div className="spinner-gold" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    const dest = user?.role === 'Dietician' ? '/dietician/dashboard' : '/client/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
