'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '@/lib/api/auth';
import { ADMIN, JEFE_PRODUCCION, CALIDAD } from '@/lib/constants';

interface User {
  id: string;
  documento: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isJefeProduccion: boolean;
  isCalidad: boolean;
  loading: boolean;
  login: (documento: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'amonet_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const stored = localStorage.getItem(USER_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    try {
      setUser(JSON.parse(stored));
    } catch {
      localStorage.removeItem(USER_KEY);
    }

    authApi
      .getMe()
      .then((me) => {
        if (!active) return;
        const userData: User = { id: me.id, documento: me.documento, nombre: me.nombre, rol: me.rol };
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
        setUser(userData);
      })
      .catch(() => {
        if (!active) return;
        localStorage.removeItem(USER_KEY);
        setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (documento: string, password: string) => {
    const res = await authApi.login(documento, password);
    const userData: User = { id: res.id, documento: res.documento, nombre: res.nombre, rol: res.rol };
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => undefined);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.rol === ADMIN,
        isJefeProduccion: user?.rol === JEFE_PRODUCCION,
        isCalidad: user?.rol === CALIDAD,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
