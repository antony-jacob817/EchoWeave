import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Safely extract the user's name from Supabase metadata, fallback to email prefix, or "User"
  const userName = (user as any)?.user_metadata?.full_name 
    || user?.email?.split("@")[0] 
    || "User";

  const handleLogout = async () => {
    try {
      await logout();
      navigate({ to: "/", replace: true });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-3">
        <div className="glass rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition">
                {l.label}
              </a>
            ))}
          </nav>
          
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              // LOGGED IN VIEW (Desktop)
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, <strong className="text-foreground font-medium">{userName}</strong>
                </span>
                <Button asChild variant="hero" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              // LOGGED OUT VIEW (Desktop)
              <>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild variant="hero" size="sm">
                  <Link to="/signup">Start Free</Link>
                </Button>
              </>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {open && (
          <div className="md:hidden glass mt-2 rounded-2xl p-4 space-y-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm text-muted-foreground hover:text-foreground">
                {l.label}
              </a>
            ))}
            
            <div className="border-t border-border/50 pt-3 mt-3">
              {user ? (
                 // LOGGED IN VIEW (Mobile)
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    Welcome, <strong className="text-foreground">{userName}</strong>
                  </p>
                  <div className="flex gap-2">
                    <Button asChild variant="hero" size="sm" className="flex-1">
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex-1" onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </Button>
                  </div>
                </div>
              ) : (
                // LOGGED OUT VIEW (Mobile)
                <div className="flex gap-2">
                  <Button asChild variant="ghost" size="sm" className="flex-1">
                    <Link to="/login">Sign in</Link>
                  </Button>
                  <Button asChild variant="hero" size="sm" className="flex-1">
                    <Link to="/signup">Start Free</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}