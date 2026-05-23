import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="pt-12 md:pt-16 lg:pt-20 pb-4 md:pb-6 relative w-full">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 sm:p-12 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-20" />
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight">
              Your next big idea is one breath away.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Join thousands of creators turning conversations into clarity.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center w-full max-w-xs sm:max-w-none mx-auto">
              <Button asChild variant="hero" size="xl" className="w-full sm:w-auto text-center justify-center">
                <Link to="/signup">
                  Start Free <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="glass" size="xl" className="w-full sm:w-auto text-center justify-center">
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

