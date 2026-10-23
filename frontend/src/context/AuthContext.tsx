import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../types/auth";
import { loginApi, registerApi, getCurrentUserApi } from "../api/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: User) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("lifeos_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem("lifeos_token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await getCurrentUserApi();
      setUser(currentUser);
      localStorage.setItem("lifeos_user", JSON.stringify(currentUser));
    } catch (err) {
      console.warn("Failed to refresh user:", err);
    }
  };

  useEffect(() => {
    async function verifyAuth() {
      const storedToken = localStorage.getItem("lifeos_token");
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUserApi();
        setUser(currentUser);
        localStorage.setItem("lifeos_user", JSON.stringify(currentUser));
      } catch (err) {
        console.warn("Session verification failed, signing out:", err);
        localStorage.removeItem("lifeos_token");
        localStorage.removeItem("lifeos_user");
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    verifyAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginApi(email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("lifeos_token", data.token);
    localStorage.setItem("lifeos_user", JSON.stringify(data.user));
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await registerApi(name, email, password);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("lifeos_token", data.token);
    localStorage.setItem("lifeos_user", JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem("lifeos_token");
    localStorage.removeItem("lifeos_user");
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem("lifeos_user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
