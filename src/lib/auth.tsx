import { createContext, useContext, useEffect, type ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/authService";
import posthog from 'posthog-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);

        if (currentUser) {
          posthog.identify(currentUser.id, { 
            email: currentUser.email, 
            name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name 
          });
        } else {
          posthog.reset(); 
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const signup = async (name: string, email: string, password: string) => {
    await authService.signup(email, password, name);
  };

  const logout = async () => {
    await authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
