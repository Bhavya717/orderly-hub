import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@/lib/types";
import {
  getSession,
  login as doLogin,
  logout as doLogout,
  signup as doSignup,
} from "@/lib/store";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session via JWT on mount
  useEffect(() => {
    getSession()
      .then((u) => setUser(u))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        login: async (e, p) => {
          const u = await doLogin(e, p);
          setUser(u);
          return u;
        },
        signup: async (n, e, p) => {
          const u = await doSignup(n, e, p);
          setUser(u);
          return u;
        },
        logout: () => {
          doLogout();
          setUser(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
};
