import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { motion, AnimatePresence, Variants } from "framer-motion";

const links = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Pricing", href: "#pricing" },
];

const drawerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    scale: 0.97,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 35,
      staggerChildren: 0.05,
      staggerDirection: -1,
      when: "afterChildren",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 24,
      delayChildren: 0.1,
      staggerChildren: 0.08,
    },
  },
};

const linkVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.15, ease: "easeOut" },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 22 },
  },
};

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();  
  const [dark, setDark] = useState(true);

  // Safely extract the user's name from Supabase metadata, fallback to email prefix, or "User"
  const userName = (user as any)?.user_metadata?.full_name 
    || user?.email?.split("@")[0] 
    || "User";

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
      navigate({ to: "/", replace: true });
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light") setDark(false);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  // Lock background scrolling when mobile nav is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 mt-3 relative">
        <div className="glass rounded-2xl px-3 sm:px-6 py-3 flex items-center justify-between z-50 relative">
          <Logo />
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="hover:text-foreground transition">
                {l.label}
              </a>
            ))}
          </nav>
          
          {/* DESKTOP CONTROLS */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </Button>
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

          {/* MOBILE CONTROLS (Theme Toggle + Interactive Morphing Hamburger) */}
          <div className="flex items-center gap-1 md:hidden">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
            </Button>
            <button
              className="flex flex-col justify-center items-center w-9 h-9 gap-[5px] focus:outline-none z-50 relative p-1.5 rounded-lg hover:bg-foreground/5 transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              <motion.span
                animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-5 h-[2px] bg-foreground rounded-full origin-center"
              />
              <motion.span
                animate={open ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
                transition={{ duration: 0.15 }}
                className="w-5 h-[2px] bg-foreground rounded-full"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-5 h-[2px] bg-foreground rounded-full origin-center"
              />
            </button>
          </div>
        </div>

        {/* MOBILE MENU DROPDOWN & OVERLAY */}
        <AnimatePresence>
          {open && (
            <>
              {/* Dimmed glass overlay that allows tapping outside to close */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 bg-background/60 backdrop-blur-md md:hidden"
              />

              {/* Slide down & spring-animated menu drawer */}
              <motion.div
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="absolute top-[calc(100%+8px)] inset-x-3 z-50 glass rounded-2xl p-5 space-y-4 shadow-2xl md:hidden overflow-hidden"
              >
                <div className="flex flex-col gap-2">
                  {links.map((l) => (
                    <motion.div key={l.href} variants={linkVariants}>
                      <a 
                        href={l.href} 
                        onClick={() => setOpen(false)} 
                        className="block px-4 py-3 rounded-xl text-base font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all active:scale-[0.98]"
                      >
                        {l.label}
                      </a>
                    </motion.div>
                  ))}
                </div>

                <motion.div variants={linkVariants} className="border-t border-border/50 pt-4">
                  {user ? (
                    // LOGGED IN VIEW (Mobile)
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground text-center">
                        Welcome, <strong className="text-foreground font-semibold">{userName}</strong>
                      </p>
                      <div className="flex gap-3">
                        <Button asChild variant="hero" size="default" className="flex-1 rounded-xl shadow-glow py-5">
                          <Link to="/dashboard" onClick={() => setOpen(false)}>Dashboard</Link>
                        </Button>
                        <Button variant="ghost" size="default" className="flex-1 rounded-xl py-5" onClick={handleLogout}>
                          <LogOut className="h-4 w-4 mr-2" /> Logout
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // LOGGED OUT VIEW (Mobile)
                    <div className="flex gap-3">
                      <Button asChild variant="ghost" size="default" className="flex-1 rounded-xl py-5">
                        <Link to="/login" onClick={() => setOpen(false)}>Sign in</Link>
                      </Button>
                      <Button asChild variant="hero" size="default" className="flex-1 rounded-xl shadow-glow py-5">
                        <Link to="/signup" onClick={() => setOpen(false)}>Start Free</Link>
                      </Button>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}