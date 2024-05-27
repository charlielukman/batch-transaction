import { createContext, ReactNode, useContext, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "./useLocalStorage";

type User = {
    token: string;
    userId: string;
    role: string;
    accountNo: string;
    userName: string;
    lastLoginAt: string;
}

const AuthContext = createContext<{
    user: User | null;
    login: (data: User) => Promise<void>;
    logout: () => void;
  } | null>(null);

type AuthProviderProps = {
    children: ReactNode;
};

export const AuthProvider = ({ children }:AuthProviderProps) => {
  const [user, setUser] = useLocalStorage("user", null);
  const navigate = useNavigate();

  const login = useCallback(async (data: User) => {
    setUser(data);
    navigate("/admin");
  }, [setUser, navigate]);

  const logout = useCallback(() => {
    setUser(null);
    navigate("/", { replace: true });
  }, [setUser, navigate]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
    }),
    [user, login, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};