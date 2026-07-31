import {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import type { AuthUser } from '../api/types/case';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('ccip_token'),
  );
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem('ccip_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem('ccip_token', newToken);
    localStorage.setItem('ccip_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('ccip_token');
    localStorage.removeItem('ccip_user');
    setToken(null);
    setUser(null);
  }

  function hasRole(...roles: string[]) {
    return user ? roles.includes(user.role) : false;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
