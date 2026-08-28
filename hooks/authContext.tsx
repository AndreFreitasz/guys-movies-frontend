import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { authFetch, clearAccessToken, setAccessToken } from "../utils/authFetch";

interface UserData {
  username: string;
  email: string;
  name: string;
  id: number;
}

interface AuthContextProps {
  isAuthenticated: boolean;
  user: UserData | null;
  loading: boolean;
  authLoading: boolean;
  dataUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const STORAGE_KEY = "user";

const readStoredUser = (): UserData | null => {
  if (typeof window === "undefined") return null;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as UserData) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    clearAccessToken();
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      return;
    }
  }, []);

  const persistUser = useCallback((data: UserData) => {
    setUser(data);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      return;
    }
  }, []);

  const dataUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `${process.env.NEXT_PUBLIC_URL_API}/auth/profile`,
        { method: "GET" },
      );

      if (!response.ok) {
        clearSession();
        return;
      }

      const data = await response.json();
      persistUser({
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name,
      });
    } catch {
      clearSession();
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  }, [clearSession, persistUser]);

  useEffect(() => {
    const stored = readStoredUser();
    if (stored) setUser(stored);

    dataUser();
  }, [dataUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_URL_API}/auth/login`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Erro ao realizar login.");
      }

      if (data.accessToken) setAccessToken(data.accessToken);

      await dataUser();
    },
    [dataUser],
  );

  const logout = useCallback(async () => {
    try {
      await authFetch(`${process.env.NEXT_PUBLIC_URL_API}/auth/logout`, {
        method: "POST",
      });
    } catch {
      return;
    } finally {
      clearSession();
      setLoading(false);
      setAuthLoading(false);
    }
  }, [clearSession]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(user),
      user,
      loading,
      authLoading,
      dataUser,
      login,
      logout,
    }),
    [authLoading, dataUser, loading, login, logout, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
