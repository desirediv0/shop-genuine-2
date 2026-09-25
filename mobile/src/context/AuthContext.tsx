import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { auth as authApi } from '../api/services';
import { setSessionExpiredHandler } from '../api/client';
import { clearTokens, getAccessToken, setTokens } from '../api/tokenStore';
import type { AuthPayload, User } from '../types';
import { registerForPush, unregisterFromPush } from '../utils/pushRegistration';

interface AuthContextValue {
  user: User | null;
  /** True until the stored session has been checked on cold start. */
  initialising: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{ emailSent: boolean; debugOtp?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initialising, setInitialising] = useState(true);
  // Remembered so sign-out can unregister this exact device.
  const pushTokenRef = useRef<string | null>(null);

  const applySession = useCallback(async (payload: AuthPayload) => {
    await setTokens(payload.accessToken, payload.refreshToken);
    setUser(payload.user);

    // Fire and forget: a push-registration problem must not block sign-in.
    registerForPush().then((token) => {
      pushTokenRef.current = token;
    });
  }, []);

  const logout = useCallback(async () => {
    // Detach this device first — the endpoint needs the token we are about to clear.
    await unregisterFromPush(pushTokenRef.current);
    pushTokenRef.current = null;

    try {
      await authApi.logout();
    } catch {
      // Server-side logout is best-effort.
    }

    // Clear locally last, so the UI never shows a signed-in state we can't back up.
    setUser(null);
    await clearTokens();
  }, []);

  // Restore session on cold start.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = await getAccessToken();
      if (!token) {
        if (!cancelled) setInitialising(false);
        return;
      }
      try {
        const { user: me } = await authApi.me();
        if (!cancelled) {
          setUser(me);
          registerForPush().then((t) => {
            pushTokenRef.current = t;
          });
        }
      } catch {
        // Token invalid or expired beyond refresh — start signed out.
        await clearTokens();
      } finally {
        if (!cancelled) setInitialising(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // The HTTP layer calls this when a refresh fails.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const payload = await authApi.login({ email: email.trim().toLowerCase(), password });
      await applySession(payload);
    },
    [applySession],
  );

  const register = useCallback(
    async (body: { name: string; email: string; password: string; phone?: string }) => {
      const res = await authApi.register({
        ...body,
        email: body.email.trim().toLowerCase(),
      });
      return { emailSent: res.emailSent, debugOtp: res.debugOtp };
    },
    [],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string) => {
      // The backend signs the user in as part of verification.
      const payload = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });
      await applySession(payload);
    },
    [applySession],
  );

  const resendOtp = useCallback(async (email: string) => {
    await authApi.resendVerification({ email: email.trim().toLowerCase() });
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await authApi.forgotPassword({ email: email.trim().toLowerCase() });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { user: me } = await authApi.me();
      setUser(me);
    } catch {
      // leave current state
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initialising,
      isAuthenticated: !!user,
      login,
      register,
      verifyOtp,
      resendOtp,
      forgotPassword,
      logout,
      refreshUser,
    }),
    [user, initialising, login, register, verifyOtp, resendOtp, forgotPassword, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
