import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
  });

  useEffect(() => {
    const token = localStorage.getItem('omnia_token');
    const userStr = localStorage.getItem('omnia_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        setState({ user, token, isLoading: false });
      } catch {
        localStorage.removeItem('omnia_token');
        localStorage.removeItem('omnia_user');
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  const login = useCallback((token: string, user: User) => {
    localStorage.setItem('omnia_token', token);
    localStorage.setItem('omnia_user', JSON.stringify(user));
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('omnia_token');
    localStorage.removeItem('omnia_user');
    setState({ user: null, token: null, isLoading: false });
  }, []);

  const isAuthenticated = !!state.token;

  const hasRole = useCallback(
    (roles: string[]) => {
      if (!state.user) return false;
      return roles.includes(state.user.role);
    },
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        isAuthenticated,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
