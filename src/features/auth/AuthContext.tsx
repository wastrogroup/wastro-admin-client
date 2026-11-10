import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApiError, api } from "../../services/api";
import type { AuthUser } from "../../types/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthContextValue = {
  status: AuthStatus;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  const refresh = useCallback(async () => {
    try {
      await api.getCsrf();
      const nextUser = await api.me();
      setUser(nextUser);
      setStatus("authenticated");
    } catch (error) {
      setUser(null);
      setStatus("unauthenticated");
      if (!(error instanceof ApiError && error.status === 401)) {
        console.error(error);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await api.getCsrf();
        const nextUser = await api.me();
        if (!cancelled) {
          setUser(nextUser);
          setStatus("authenticated");
        }
      } catch (error) {
        if (!cancelled) {
          setUser(null);
          setStatus("unauthenticated");
          if (!(error instanceof ApiError && error.status === 401)) {
            console.error(error);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const nextUser = await api.login(email, password);
    setUser(nextUser);
    setStatus("authenticated");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setStatus("unauthenticated");
    }
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      login,
      logout,
      refresh,
    }),
    [status, user, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
