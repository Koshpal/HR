import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/auth.types';
import { AuthService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // Fast path: restore from localStorage (same-portal login)
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          setUser(JSON.parse(raw));
          setLoading(false);
          return;
        } catch {
          localStorage.removeItem('user');
        }
      }

      // Slow path: check the shared .koshpal.com cookie.
      // Fires when the user was redirected from the landing page after logging in there.
      try {
        const me = await AuthService.getCurrentUser();
        if (me && me.role === 'HR') {
          setUser(me as any);
          localStorage.setItem('user', JSON.stringify(me));
        }
      } catch {
        // Not authenticated — ProtectedRoute will redirect to /login
      } finally {
        setLoading(false);
      }
    };

    void initAuth();
  }, []);

  const login = async (credentials: any) => {
    const response = await AuthService.login(credentials);
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
