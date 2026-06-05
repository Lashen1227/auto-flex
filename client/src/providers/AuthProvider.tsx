import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import {
  AuthProvider as AsgardeoAuthProvider,
  useAuthContext,
  type AuthReactConfig,
} from "@asgardeo/auth-react";

interface AuthContextValue {
  isAuthenticated: boolean;
  username: string | null;
  signIn: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_INTENT_KEY = "autoflex-auth-intent";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const config = useMemo<AuthReactConfig>(
    () => ({
      clientID: import.meta.env.VITE_ASGARDEO_CLIENT_ID,
      baseUrl: import.meta.env.VITE_ASGARDEO_BASE_URL,
      signInRedirectURL:
        import.meta.env.VITE_ASGARDEO_REDIRECT_URL || "http://localhost:3000",
      signOutRedirectURL:
        import.meta.env.VITE_ASGARDEO_REDIRECT_URL || "http://localhost:3000",
      scope:
        (import.meta.env.VITE_ASGARDEO_SCOPE || "openid profile")
          .split(" ")
          .map((scope: string) => scope.trim())
          .filter(Boolean),
      skipRedirectCallback: false,
      disableTrySignInSilently: true,
      disableAutoSignIn: false,
    }),
    [],
  );

  return (
    <AsgardeoAuthProvider config={config}>
      <AuthBridge>{children}</AuthBridge>
    </AsgardeoAuthProvider>
  );
}

function AuthBridge({ children }: { children: React.ReactNode }) {
  const auth = useAuthContext();
  const lastSyncedSub = useRef<string | null>(null);
  const backendBaseUrl = import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (!auth.state.isAuthenticated || auth.state.isLoading) {
      return;
    }

    const currentSub = auth.state.sub || null;

    if (currentSub && lastSyncedSub.current === currentSub) {
      return;
    }

    let active = true;

    const syncAccount = async () => {
      const idToken = await auth.getIDToken();
      const response = await fetch(`${backendBaseUrl}/api/users/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "X-AutoFlex-Auth-Intent":
            sessionStorage.getItem(AUTH_INTENT_KEY) || "signin",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || "Failed to sync user profile");
      }

      if (active) {
        lastSyncedSub.current = currentSub;
        sessionStorage.removeItem(AUTH_INTENT_KEY);
      }
    };

    void syncAccount().catch((error) => {
      console.error("Failed to sync authenticated user to MongoDB:", error);
    });

    return () => {
      active = false;
    };
  }, [auth, backendBaseUrl]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: auth.state.isAuthenticated,
      username: auth.state.displayName || auth.state.username || null,
      signIn: () => {
        sessionStorage.setItem(AUTH_INTENT_KEY, "signin");
        void auth.signIn();
      },
      signOut: () => {
        sessionStorage.removeItem(AUTH_INTENT_KEY);
        void auth.signOut();
      },
    }),
    [auth],
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
