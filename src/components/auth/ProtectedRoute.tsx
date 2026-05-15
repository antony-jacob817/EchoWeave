import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth"; 
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // If your useAuth hook uses 'isLoading' instead of 'loading', adjust this!
  const { user, loading } = useAuth(); 
  const navigate = useNavigate();

  useEffect(() => {
    // If we finish loading and there is NO user, kick them to login
    if (!loading && !user) {
      navigate({ to: "/login", replace: true });
    }
  }, [user, loading, navigate]);

  // Show a spinner while Supabase checks the session
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // If there's no user, return null (the useEffect will redirect them instantly)
  if (!user) {
    return null; 
  }

  // If they are logged in, render the Dashboard!
  return <>{children}</>;
}