/**
 * Auth state for the mobile app — mirrors the web `AuthContext`, but also owns
 * login/register API calls so screens stay declarative. On success it persists
 * the session (token + user) via `storage`; a 401 anywhere logs the user out.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  loginUser,
  persistSession,
  registerUser,
  setUnauthorizedHandler,
} from '../lib/api';
import { initNotifications, stopNotifications } from '../lib/notifications';
import { getItem, multiRemove, setItem, StorageKeys } from '../lib/storage';

export type SessionUser = { id: string; name: string; role: string } | null;

type AuthState = {
  user: SessionUser;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: {
    nickname: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  setUserName: (name: string) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SessionUser>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await multiRemove([
      StorageKeys.accessToken,
      StorageKeys.refreshToken,
      StorageKeys.userId,
      StorageKeys.userName,
      StorageKeys.userRole,
      StorageKeys.traumaType,
    ]);
    stopNotifications();
    setUser(null);
  }, []);

  // Restore any existing session (in-memory store => effectively same session).
  useEffect(() => {
    (async () => {
      const token = await getItem(StorageKeys.accessToken);
      const id = await getItem(StorageKeys.userId);
      if (token && id) {
        setUser({
          id,
          name: (await getItem(StorageKeys.userName)) || '',
          role: (await getItem(StorageKeys.userRole)) || '',
        });
        initNotifications();
      }
      setLoading(false);
    })();
  }, []);

  // Wire API 401s to a logout.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const res = await loginUser(phone, password);
    if (!res?.tokens?.access_token) {
      throw new Error('اطلاعات ورود نادرست است');
    }
    await persistSession(res);
    setUser({
      id: String(res.user?.id ?? ''),
      name: res.user?.nickname ?? '',
      role: res.user?.role ?? '',
    });
    initNotifications();
  }, []);

  const register = useCallback(
    async (data: { nickname: string; phone: string; password: string }) => {
      await registerUser({ ...data, role: 'user' });
      // Auto sign-in so the user lands straight in the app (web sends to /login).
      await login(data.phone, data.password);
    },
    [login],
  );

  const setUserName = useCallback(
    async (name: string) => {
      await setItem(StorageKeys.userName, name);
      setUser(u => (u ? { ...u, name } : u));
    },
    [],
  );

  const value = useMemo<AuthState>(
    () => ({ user, loading, login, register, logout, setUserName }),
    [user, loading, login, register, logout, setUserName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
