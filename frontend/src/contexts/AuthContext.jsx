import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService';
import AuthContext from './auth-context';
import { inferRoleFromProfile, resolveUserRole } from './role-utils';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      const role = resolveUserRole(
        localStorage.getItem('user_role'),
        profile?.role,
        inferRoleFromProfile(profile),
      );
      const userId = localStorage.getItem('user_id');
      if (role) {
        localStorage.setItem('user_role', role);
      }
      if (userId || profile?.id) {
        localStorage.setItem('user_id', userId || profile.id);
      }
      setUser({ ...profile, role, id: userId || profile.id });
    } catch {
      localStorage.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password, role) => {
    const data = await authService.login(email, password, role);
    const resolvedRole = resolveUserRole(data.role, role);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    if (resolvedRole) {
      localStorage.setItem('user_role', resolvedRole);
    }
    if (data.user_id) {
      localStorage.setItem('user_id', data.user_id);
    }
    setUser({
      id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      role: resolvedRole,
    });
    return { ...data, role: resolvedRole };
  };

  const registerClient = async (formData) => {
    const data = await authService.registerClient(formData);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    localStorage.setItem('user_role', resolveUserRole(data.user.role));
    localStorage.setItem('user_id', data.user.id);
    setUser({
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name,
      role: resolveUserRole(data.user.role),
    });
    return data;
  };

  const registerDietician = async (formData) => {
    const data = await authService.registerDietician(formData);
    return data;
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    registerClient,
    registerDietician,
    logout,
    loadUser,
    isAuthenticated: !!user,
    isClient: resolveUserRole(user?.role) === 'Client',
    isDietician: resolveUserRole(user?.role) === 'Dietician',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
