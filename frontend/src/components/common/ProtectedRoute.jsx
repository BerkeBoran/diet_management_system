import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRole && user?.role !== allowedRole) {
    const dest = user?.role === 'Dietician' ? '/dietician/dashboard' : '/client/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
