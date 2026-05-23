import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Mic, Sparkles, Network } from "lucide-react";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function AuthLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 overflow-hidden">
      {/* Left visual panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-10 overflow-hidden bg-gradient-to-br from-primary/30 via-background to-accent/20">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <Logo />
        <div className="relative space-y-6 max-w-md">
          <h2 className="font-display text-4xl font-bold leading-tight">
            Your voice. Your ideas.<br />
            <span className="text-gradient">Beautifully connected.</span>
          </h2>
          <p className="text-muted-foreground">Join 5,000+ creators turning conversations into structured thinking.</p>
          <div className="space-y-3 pt-4">
            {[
              { icon: Mic, label: "Capture ideas as they happen" },
              { icon: Sparkles, label: "AI transcription in seconds" },
              { icon: Network, label: "Editable, exportable mind maps" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                <div className="h-9 w-9 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">© {new Date().getFullYear()} EchoWeave</p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center px-4 sm:px-8 py-10 sm:py-12 md:py-16 relative overflow-hidden">
        {/* Subtle absolute blur blobs for mobile viewports */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 lg:hidden">
          <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md mx-auto relative z-10"
        >
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </motion.div>

        <p className="mt-10 text-center text-xs text-muted-foreground relative z-10">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

