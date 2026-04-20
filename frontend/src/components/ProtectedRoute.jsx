import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth.js';
import { resolveUserRole } from '../contexts/role-utils';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated } = useAuth();
  const resolvedRole = resolveUserRole(user?.role);
  const normalizedRequiredRole = resolveUserRole(requiredRole);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (normalizedRequiredRole && resolvedRole !== normalizedRequiredRole) {
    const redirect = resolvedRole === 'Client' ? '/dashboard' : '/dietician/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
