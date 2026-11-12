'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loginAction, logoutAction } from '@/app/login/actions';

interface User {
  id: string;
  username: string;
  email: string;
  nombre_completo: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function getTokenExpiration(token: string) {
  try {
    const payload = token.split('.')[1];
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload =
      normalizedPayload + '='.repeat((4 - (normalizedPayload.length % 4)) % 4);
    const claims = JSON.parse(window.atob(paddedPayload)) as { exp?: number };
    return claims.exp ? claims.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await logoutAction();
    window.localStorage.removeItem('access_token');
    window.localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = window.localStorage.getItem('user');
      if (stored) {
        try {
          setUser(JSON.parse(stored) as User);
        } catch {
          window.localStorage.removeItem('user');
        }
      }
      setLoading(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem('access_token');
    if (!token) return;

    const expiration = getTokenExpiration(token);
    if (!expiration) return;

    const timer = window.setTimeout(() => {
      void logout().then(() => window.location.replace('/login'));
    }, Math.max(0, expiration - Date.now()));
    return () => window.clearTimeout(timer);
  }, [logout, user]);

  const login = async (username: string, password: string) => {
    const result = await loginAction(username, password);
    if (!result.success) throw new Error(result.message);
    window.localStorage.setItem('access_token', result.accessToken);
    window.localStorage.setItem('user', JSON.stringify(result.user));
    setUser(result.user);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);