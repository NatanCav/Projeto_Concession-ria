import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type LoginValues } from "@/services/authService";
import { AUTH_TOKEN_STORAGE_KEY, registerUnauthorizedHandler } from "@/services/apiClient";
import type { User, UserRole } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (values: LoginValues) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
      setUser(null);
    });
  }, []);

  const login = async (values: LoginValues) => {
    const response = await authService.login(values);
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, response.token);
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]) => !!user && roles.includes(user.role);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout, hasRole }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
