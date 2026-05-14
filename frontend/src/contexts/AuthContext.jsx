import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import userService from '../services/userService';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch { return null; }
}

function normalizeRole(role) {
  if (!role) return '';
  const lower = role.toLowerCase();
  if (lower === 'client') return 'Client';
  if (lower === 'dietician') return 'Dietician';
  return role;
}

function userFromPayload(payload, extra = {}) {
  return {
    id: extra.user_id || payload?.user_id,
    email: extra.email || payload?.email,
    fullName: extra.full_name || payload?.full_name,
    role: normalizeRole(extra.role || payload?.role),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');

      if (!token && !refresh) {
        setLoading(false);
        return;
      }

      if (token) {
        const payload = parseJwt(token);
        if (payload && payload.exp * 1000 > Date.now()) {
          setUser(userFromPayload(payload));
          setLoading(false);
          return;
        }
      }

      // Access token süresi dolmuş, refresh token ile yenile
      if (refresh) {
        try {
          const data = await authService.refreshToken(refresh);
          localStorage.setItem('access_token', data.access);
          const payload = parseJwt(data.access);
          setUser(userFromPayload(payload));
        } catch {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }

      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (email, password, role) => {
    const data = await authService.login(email, password, role);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const payload = parseJwt(data.access);
    const u = userFromPayload(payload, data);
    setUser(u);
    const pending = localStorage.getItem('pending_health_snapshot');
    if (pending && u.role === 'Client') {
      try {
        await userService.createHealthSnapshot(JSON.parse(pending));
      } catch (_) {}
      localStorage.removeItem('pending_health_snapshot');
    }
    return u;
  };

  const loginWithToken = (data) => {
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    const payload = parseJwt(data.access);
    const userObj = data.user || {};
    const u = userFromPayload(payload, {
      user_id:   data.user_id  ?? userObj.pk,
      email:     data.email    ?? userObj.email,
      full_name: data.full_name ?? [userObj.first_name, userObj.last_name].filter(Boolean).join(' '),
      role:      data.role     ?? userObj.role,
    });
    setUser(u);
    return u;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithToken, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
