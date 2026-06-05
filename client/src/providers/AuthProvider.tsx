import React, { createContext, useContext, useMemo, useState } from "react";

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    localStorage.getItem("autoflex-demo-user"),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(username),
      username,
      signIn: () => {
        const demoUser = "Demo Dealer";
        localStorage.setItem("autoflex-demo-user", demoUser);
        setUsername(demoUser);
      },
      signOut: () => {
        localStorage.removeItem("autoflex-demo-user");
        setUsername(null);
      },
    }),
    [username],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
