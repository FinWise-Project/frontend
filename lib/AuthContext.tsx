'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

const BASE_URL = 'https://finwise-api-beta.vercel.app';

interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  plan?: string;
  initials?: string;
  avatar_initials?: string;
  balance?: number;
  income?: number;
  expense?: number;
  savings?: number;
  transactions?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function buildUser(userData: User): User {
  return {
    ...userData,
    initials:
      userData.avatar_initials ||
      userData.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
    plan: userData.plan || 'Free Plan',
    balance: userData.balance || 0,
    income: userData.income || 0,
    expense: userData.expense || 0,
    savings: userData.savings || 0,
    transactions: userData.transactions || [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const storedUser = localStorage.getItem('finwise_user');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        setLoading(false);
        return;
      }

      if (accessToken) {
        const profileOk = await fetchProfile(accessToken);
        if (profileOk) {
          setLoading(false);
          return;
        }
      }

      const newToken = await tryRefresh(refreshToken);
      if (newToken) {
        await fetchProfile(newToken);
      } else {
        clearStorage();
      }
    } catch {
      clearStorage();
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(token: string): Promise<boolean> {
    try {
      const res = await fetch(`${BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return false;

      const json = await res.json();
      const userData = buildUser(json.data.profile);
      setUser(userData);
      localStorage.setItem('finwise_user', JSON.stringify(userData));
      return true;
    } catch {
      return false;
    }
  }

  async function tryRefresh(refreshToken: string): Promise<string | null> {
    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return null;

      const json = await res.json();
      const newAccessToken = json.data.accessToken;

      localStorage.setItem('accessToken', newAccessToken);

      return newAccessToken;
    } catch {
      return null;
    }
  }

  function clearStorage() {
    setUser(null);
    localStorage.removeItem('finwise_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  const login = (userData: User, accessToken: string, refreshToken: string) => {
    const formattedUser = buildUser(userData);
    setUser(formattedUser);
    localStorage.setItem('finwise_user', JSON.stringify(formattedUser));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  };

  const logout = () => {
    clearStorage();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
