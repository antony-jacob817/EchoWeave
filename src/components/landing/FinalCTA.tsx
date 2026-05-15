import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-32 relative">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-4xl sm:text-5xl font-bold max-w-2xl mx-auto leading-tight">
              Your next big idea is one breath away.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of creators turning conversations into clarity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button asChild variant="hero" size="xl">
                <Link to="/signup">Start Free <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="glass" size="xl">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
