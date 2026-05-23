import { motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const testimonials = [
  {
    quote: "EchoWeave is the first tool that keeps up with how I actually think. I record on walks and come back to a finished outline.",
    name: "Maya Okafor",
    role: "Podcast host · The Slow Build",
    bg: "linear-gradient(135deg,#a78bfa,#60a5fa)",
  },
  {
    quote: "It feels like a co-founder for my brain. Half my product roadmap was rambled into my phone and stitched together by EchoWeave.",
    name: "Lukas Reiner",
    role: "Founder · Tessera",
    bg: "linear-gradient(135deg,#f472b6,#a78bfa)",
  },
  {
    quote: "I write essays for a living. This is the only AI tool that helps without flattening my voice.",
    name: "Priya Raman",
    role: "Writer · Field Notes",
    bg: "linear-gradient(135deg,#34d399,#60a5fa)",
  },
  {
    quote: "I brainstorm complex coding architectures while preparing coffee. By the time I sit at my desk, EchoWeave has built a perfect hierarchy of tasks.",
    name: "David Chen",
    role: "Lead Architect · Synthetix",
    bg: "linear-gradient(135deg,#fbbf24,#f472b6)",
  },
  {
    quote: "My research papers are usually an unorganized mess of ideas. Dictating them into EchoWeave organizes my thoughts into highly structured visual paths.",
    name: "Dr. Elena Rostova",
    role: "AI Researcher · Cognitive Lab",
    bg: "linear-gradient(135deg,#60a5fa,#34d399)",
  },
];

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      // Scroll by one card's dynamic size including gap
      const cardWidth = window.innerWidth < 640 ? 300 : 420;
      const scrollTo = direction === "left" ? scrollLeft - cardWidth : scrollLeft + cardWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section id="testimonials" className="py-16 md:py-24 lg:py-32 relative w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-16 gap-6">
          <div className="max-w-2xl text-center sm:text-left mx-auto sm:mx-0">
            <p className="text-sm uppercase tracking-widest text-accent mb-3 font-semibold">Loved by thinkers</p>
            <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
              Trusted by people who <span className="text-gradient">make things.</span>
            </h2>
          </div>
          
          {/* Custom Slider Navigation Controls for Desktop/Tablet */}
          <div className="hidden sm:flex gap-3 justify-center shrink-0">
            <button
              onClick={() => scroll("left")}
              className="h-12 w-12 rounded-full border border-border/60 glass-strong flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-white/5 active:scale-95 transition-all text-foreground"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="h-12 w-12 rounded-full border border-border/60 glass-strong flex items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-white/5 active:scale-95 transition-all text-foreground"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Horizontal scroll slider - supports drag/swipe on mobile and horizontal scroll on desktop */}
        <div ref={scrollRef} className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-8 -mx-4 sm:-mx-6 lg:-mx-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex-shrink-0 w-[290px] xs:w-[320px] sm:w-[380px] md:w-[400px] snap-center glass rounded-2xl p-7 flex flex-col hover:border-primary/40 hover:shadow-glow transition-all group"
            >
              <Quote className="h-6 w-6 text-primary/60 mb-4 shrink-0 group-hover:text-accent transition-colors duration-350" />
              <p className="text-foreground/90 leading-relaxed mb-6 flex-1 text-sm sm:text-base">"{t.quote}"</p>
              <div className="flex items-center gap-3 mt-auto">
                <div className="h-10 w-10 rounded-full shrink-0 group-hover:scale-105 transition-transform duration-200" style={{ background: t.bg }} />
                <div className="text-left">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

