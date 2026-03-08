import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User, UserRole } from "@shared/schema";
import { apiRequest, getStoredToken } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, token?: string, refreshToken?: string) => void;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
  hasPermission: (permission: string) => boolean;
  token: string | null;
  refreshToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("lottery_user");
    const validToken = getStoredToken();
    const storedRefresh = localStorage.getItem("lottery_refresh_token");
    if (storedUser && validToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(validToken);
        setRefreshToken(storedRefresh);
      } catch {
        localStorage.removeItem("lottery_user");
        localStorage.removeItem("lottery_token");
        localStorage.removeItem("lottery_refresh_token");
      }
    } else if (storedUser && !validToken) {
      localStorage.removeItem("lottery_user");
      localStorage.removeItem("lottery_token");
      localStorage.removeItem("lottery_refresh_token");
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User, newToken?: string, newRefreshToken?: string) => {
    setUser(userData);
    localStorage.setItem("lottery_user", JSON.stringify(userData));
    if (newToken) {
      setToken(newToken);
      localStorage.setItem("lottery_token", newToken);
    }
    if (newRefreshToken) {
      setRefreshToken(newRefreshToken);
      localStorage.setItem("lottery_refresh_token", newRefreshToken);
    }
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await apiRequest("POST", "/api/Auth/revoke", { refreshToken });
      } catch (e) {
      }
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("lottery_user");
    localStorage.removeItem("lottery_token");
    localStorage.removeItem("lottery_refresh_token");
  };

  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role as UserRole);
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    const adminRoles: UserRole[] = ["admin", "system_admin"];
    if (adminRoles.includes(user.role as UserRole)) return true;
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        hasRole,
        hasPermission,
        token,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
