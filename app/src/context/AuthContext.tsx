import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api, { TOKEN_KEY } from "@/lib/api";

type User = { id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // On app start, restore the session if a token is saved
  useEffect(() => {
    const restore = async () => {
      try {
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          const { data } = await api.get("/auth/me");
          setUser(data.user);
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const saveSession = async (token: string, newUser: User) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    await saveSession(data.token, data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    await saveSession(data.token, data.user);
  };

  const logout = async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}