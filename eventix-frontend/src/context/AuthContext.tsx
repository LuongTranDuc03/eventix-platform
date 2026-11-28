import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, LoginDto, RegisterDto, UserRole } from '../types/auth';
import { authApi } from '../api/authApi';

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<AuthUser>;
  register: (data: RegisterDto) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (role: UserRole) => boolean;
  getPrimaryRole: () => UserRole;
  getDefaultRedirectForRole: (role?: UserRole) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session from localStorage on app boot
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('eventix_token');
      const storedUser = localStorage.getItem('eventix_user');

      if (storedToken && storedUser) {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      localStorage.removeItem('eventix_token');
      localStorage.removeItem('eventix_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginDto): Promise<AuthUser> => {
    const res = await authApi.login(credentials);
    const authData = res.data;

    const authUser: AuthUser = {
      userId: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    };

    setAccessToken(authData.accessToken);
    setUser(authUser);
    localStorage.setItem('eventix_token', authData.accessToken);
    localStorage.setItem('eventix_user', JSON.stringify(authUser));

    return authUser;
  };

  const register = async (data: RegisterDto): Promise<AuthUser> => {
    const res = await authApi.register(data);
    const authData = res.data;

    const authUser: AuthUser = {
      userId: authData.userId,
      email: authData.email,
      fullName: authData.fullName,
      roles: authData.roles,
    };

    setAccessToken(authData.accessToken);
    setUser(authUser);
    localStorage.setItem('eventix_token', authData.accessToken);
    localStorage.setItem('eventix_user', JSON.stringify(authUser));

    return authUser;
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    localStorage.removeItem('eventix_token');
    localStorage.removeItem('eventix_user');
    window.location.href = '/login';
  };

  const hasRole = (role: UserRole): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  };

  const getPrimaryRole = (): UserRole => {
    if (!user || !user.roles || user.roles.length === 0) return 'ROLE_ATTENDEE';
    if (user.roles.includes('ROLE_ADMIN')) return 'ROLE_ADMIN';
    if (user.roles.includes('ROLE_ORGANIZER')) return 'ROLE_ORGANIZER';
    if (user.roles.includes('ROLE_STAFF')) return 'ROLE_STAFF';
    if (user.roles.includes('ROLE_ATTENDEE')) return 'ROLE_ATTENDEE';
    return 'ROLE_USER';
  };

  const getDefaultRedirectForRole = (role?: UserRole): string => {
    const targetRole = role || getPrimaryRole();
    switch (targetRole) {
      case 'ROLE_ADMIN':
        return '/admin/dashboard';
      case 'ROLE_ORGANIZER':
        return '/organizer/dashboard';
      case 'ROLE_STAFF':
        return '/staff/scanner';
      case 'ROLE_ATTENDEE':
      case 'ROLE_USER':
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        isLoading,
        login,
        register,
        logout,
        hasRole,
        getPrimaryRole,
        getDefaultRedirectForRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
