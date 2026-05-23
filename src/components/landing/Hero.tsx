import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Play, Mic, Sparkles } from "lucide-react";
import heroImg from "@/assets/echoweave-hero.jpg";

const floatingNodes = [
  { label: "Audience", x: "8%", y: "20%", delay: 0 },
  { label: "Monetization", x: "78%", y: "12%", delay: 0.4 },
  { label: "Marketing", x: "5%", y: "70%", delay: 0.8 },
  { label: "Topics", x: "82%", y: "62%", delay: 1.2 },
];

export function Hero() {
  return (
    <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden w-full">
      {/* glow blobs enclosed in absolute overflow-hidden container to eliminate bleeding */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] max-w-full rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-40 right-0 h-[400px] w-[400px] max-w-full rounded-full bg-accent/20 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-7 flex flex-col items-center lg:items-start text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-muted-foreground">AI Mind Mapping · Now in beta</span>
          </div>
          
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05]">
            Speak freely.<br className="hidden sm:inline" />
            Watch ideas{" "}
            <span className="text-gradient">connect.</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
            EchoWeave transforms scattered thoughts into structured AI mind maps.
            Capture ideas while walking, driving, or brainstorming — instantly organized.
          </p>
          
          {/* CTA Button Row — Forced side-by-side layout with fluid size adjustments */}
          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 w-full sm:w-auto">
            <Button asChild variant="hero" size="lg" className="sm:size-xl flex-1 sm:flex-none text-center justify-center whitespace-nowrap text-sm sm:text-base px-4 sm:px-8">
              <Link to="/signup">
                Start Free <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="glass" size="lg" className="sm:size-xl flex-1 sm:flex-none text-center justify-center whitespace-nowrap text-sm sm:text-base px-4 sm:px-8">
              <Link to="/demo">
                <Play className="h-4 w-4 mr-2" /> View Demo
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-4 text-center sm:text-left justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {[
                "linear-gradient(135deg,#a78bfa,#60a5fa)",
                "linear-gradient(135deg,#f472b6,#a78bfa)",
                "linear-gradient(135deg,#34d399,#60a5fa)",
                "linear-gradient(135deg,#fbbf24,#f472b6)",
              ].map((bg, i) => (
                <div key={i} className="h-9 w-9 rounded-full border-2 border-background" style={{ background: bg }} />
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold">Trusted by 5,000+ creators</p>
              <p className="text-xs text-muted-foreground">from podcasts, YouTube, and beyond</p>
            </div>
          </div>
        </motion.div>

        {/* hero visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative w-full max-w-xl lg:max-w-none mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden glass-strong shadow-elegant">
            <img src={heroImg} alt="EchoWeave AI mind map preview" className="w-full h-auto opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-tr from-background/60 via-transparent to-transparent" />
          </div>

          {/* floating glass cards */}
          {floatingNodes.map((n) => (
            <motion.div
              key={n.label}
              className="absolute glass-strong rounded-xl px-2 py-1 sm:px-3 sm:py-2 text-[10px] sm:text-xs font-medium shadow-card block"
              style={{ left: n.x, top: n.y }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: n.delay, ease: "easeInOut" }}
            >
              {n.label}
            </motion.div>
          ))}

          {/* bottom mic widget */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 glass-strong rounded-2xl px-5 py-3 flex items-center gap-3 shadow-glow w-[230px] sm:w-auto"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-glow shrink-0">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold">Listening…</p>
              <p className="text-[10px] text-muted-foreground">Tap anywhere to start</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}