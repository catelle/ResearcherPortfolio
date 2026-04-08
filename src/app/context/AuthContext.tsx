import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";

interface AuthActionResult {
  success: boolean;
  message: string;
}

interface AuthContextType {
  isConfigured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const client = getSupabaseClient();
  const isConfigured = isSupabaseConfigured();

  useEffect(() => {
    if (!client) {
      setLoading(false);
      return;
    }

    let mounted = true;

    client.auth.getSession().then(({ data }) => {
      if (mounted) {
        setSession(data.session ?? null);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    if (!client) {
      return {
        success: false,
        message: "Supabase is not configured for admin authentication.",
      };
    }

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      return {
        success: false,
        message: error.message || "Unable to sign in with those credentials.",
      };
    }

    return {
      success: true,
      message: "Signed in successfully.",
    };
  };

  const signOut = async () => {
    if (!client) {
      return;
    }

    await client.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        isConfigured,
        loading,
        session,
        user: session?.user ?? null,
        signIn,
        signOut,
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
