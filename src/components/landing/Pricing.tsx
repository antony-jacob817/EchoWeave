import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

const tiers = [
  {
    name: "Spark",
    price: "$0",
    period: "forever",
    desc: "For exploring the voice-first workflow.",
    features: ["10 voice notes / month", "AI transcription", "Basic mind maps", "1 workspace"],
    cta: "Start Free",
    variant: "glass" as const,
  },
  {
    name: "Flow",
    price: "$12",
    period: "per month",
    desc: "For makers shipping ideas weekly.",
    features: ["Unlimited voice notes", "Advanced AI mind maps", "Export to image & text", "Smart search", "Priority transcription"],
    cta: "Start 14-day trial",
    variant: "hero" as const,
    featured: true,
  },
  {
    name: "Studio",
    price: "$29",
    period: "per month",
    desc: "For teams building together.",
    features: ["Everything in Flow", "Team workspaces", "Shared mind maps", "Roles & permissions", "Priority support"],
    cta: "Talk to sales",
    variant: "glass" as const,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 relative w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3 font-semibold">Pricing</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
             Simple plans for <span className="text-gradient">every stage.</span>
          </h2>
        </div>
        
        {/* Pricing card grid: horizontal slider on mobile, 3 columns on desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible md:grid-cols-3 gap-6 md:gap-5 pt-4 md:pt-0 pb-8 md:pb-0 snap-x snap-mandatory scroll-smooth px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[360px] md:w-auto snap-center relative rounded-2xl p-7 flex flex-col transition-all duration-300 ${
                t.featured 
                  ? "glass-strong shadow-glow border-primary/40 md:scale-105 z-10" 
                  : "glass hover:border-primary/20"
              }`}
            >
              {t.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-primary text-xs font-semibold px-4.5 py-1 rounded-full text-primary-foreground shadow-glow whitespace-nowrap">
                  Most popular
                </div>
              )}
              <h3 className="font-display text-xl font-semibold">{t.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold">{t.price}</span>
                <span className="text-sm text-muted-foreground">/ {t.period}</span>
              </div>
              <ul className="mt-6 space-y-3 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-left">
                    <Check className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <span className="text-foreground/85">{f}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant={t.variant} size="lg" className="mt-7 w-full rounded-xl py-6 shrink-0 shadow-sm active:scale-[0.98] transition-transform">
                <Link to="/signup">{t.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
