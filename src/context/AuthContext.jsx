import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('tosudo_token');
    const savedUser  = localStorage.getItem('tosudo_user');
    if (savedToken && savedUser) {
      try { setToken(savedToken); setUser(JSON.parse(savedUser)); } catch {}
    }
    setLoading(false);
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    localStorage.setItem('tosudo_token',   accessToken);
    localStorage.setItem('tosudo_refresh', refreshToken);
    localStorage.setItem('tosudo_user',    JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('tosudo_token');
    localStorage.removeItem('tosudo_refresh');
    localStorage.removeItem('tosudo_user');
    setToken(null);
    setUser(null);
  };

  const getRole = () => {
    if (!user) return null;
    const roles = user.roles || [];
    if (!roles.length) return null;
    const r = roles[0];
    return typeof r === 'string' ? r : (r?.code || r?.roleCode || null);
  };

  const hasRole = (code) => {
    if (!user) return false;
    return (user.roles || []).some(r =>
      typeof r === 'string' ? r === code : r.code === code || r.roleCode === code
    );
  };

  const isAdmin = () => hasRole('admin') || hasRole('ceo');
  const needsPasswordChange = () => user?.forcePasswordChange === true;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, getRole, hasRole, isAdmin, needsPasswordChange }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
