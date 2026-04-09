import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthActionResult {
  success: boolean;
  message: string;
}

interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string | null;
}

interface AuthSession {
  access_token: string;
}

interface AuthContextType {
  isConfigured: boolean;
  isEmailVerificationConfigured: boolean;
  isVercelDomainIntegrationConfigured: boolean;
  loading: boolean;
  session: AuthSession | null;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthActionResult>;
  resendVerification: (email: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
}

const AUTH_STORAGE_KEY = "portfolio-auth-token";
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(AUTH_STORAGE_KEY) ?? "";
}

function writeStoredToken(value: string) {
  if (typeof window === "undefined") {
    return;
  }

  if (!value) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, value);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const [isEmailVerificationConfigured, setIsEmailVerificationConfigured] =
    useState(false);
  const [isVercelDomainIntegrationConfigured, setIsVercelDomainIntegrationConfigured] =
    useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrapAuth = async () => {
      try {
        const statusResponse = await fetch("/api/auth/status");
        const statusPayload = (await statusResponse.json()) as {
          isConfigured?: boolean;
          isEmailVerificationConfigured?: boolean;
          isVercelDomainIntegrationConfigured?: boolean;
        };

        if (!cancelled) {
          setIsConfigured(Boolean(statusPayload.isConfigured));
          setIsEmailVerificationConfigured(
            Boolean(statusPayload.isEmailVerificationConfigured),
          );
          setIsVercelDomainIntegrationConfigured(
            Boolean(statusPayload.isVercelDomainIntegrationConfigured),
          );
        }
      } catch {
        if (!cancelled) {
          setIsConfigured(false);
          setIsEmailVerificationConfigured(false);
          setIsVercelDomainIntegrationConfigured(false);
        }
      }

      const token = readStoredToken();

      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const payload = (await response.json()) as {
          message?: string;
          user?: AuthUser;
        };

        if (!response.ok || !payload.user) {
          writeStoredToken("");
          if (!cancelled) {
            setSession(null);
            setUser(null);
          }
          return;
        }

        if (!cancelled) {
          setSession({ access_token: token });
          setUser(payload.user);
        }
      } catch {
        writeStoredToken("");
        if (!cancelled) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = (await response.json()) as {
        message?: string;
        token?: string;
        user?: AuthUser;
      };

      if (!response.ok || !payload.token || !payload.user) {
        return {
          success: false,
          message: payload.message || "Unable to sign in with those credentials.",
        };
      }

      writeStoredToken(payload.token);
      setSession({ access_token: payload.token });
      setUser(payload.user);

      return {
        success: true,
        message: "Signed in successfully.",
      };
    } catch {
      return {
        success: false,
        message:
          "Unable to reach the account service. Make sure the backend is running and JWT_SECRET is set.",
      };
    }
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        return {
          success: false,
          message: payload.message || "Unable to create your account.",
        };
      }

      return {
        success: true,
        message:
          payload.message ||
          "Account created successfully. Check your inbox and verify your email before signing in.",
      };
    } catch {
      return {
        success: false,
        message:
          "Unable to reach the account service. Make sure the backend is running and JWT_SECRET is set.",
      };
    }
  };

  const resendVerification = async (
    email: string,
  ): Promise<AuthActionResult> => {
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        return {
          success: false,
          message:
            payload.message || "Unable to resend the verification email.",
        };
      }

      return {
        success: true,
        message: payload.message || "A fresh verification email has been sent.",
      };
    } catch {
      return {
        success: false,
        message:
          "Unable to reach the account service. Make sure the backend is running and email delivery is configured.",
      };
    }
  };

  const signOut = async () => {
    writeStoredToken("");
    setSession(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isConfigured,
      isEmailVerificationConfigured,
      isVercelDomainIntegrationConfigured,
      loading,
      session,
      user,
      signIn,
      signUp,
      resendVerification,
      signOut,
    }),
    [
      isConfigured,
      isEmailVerificationConfigured,
      isVercelDomainIntegrationConfigured,
      loading,
      session,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
