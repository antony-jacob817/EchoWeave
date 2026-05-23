import { motion } from "framer-motion";

const steps = [
  { n: "01", title: "Speak naturally", desc: "Open EchoWeave and tap the mic. Talk like you would to a friend — no scripts, no structure required." },
  { n: "02", title: "AI structures it", desc: "Our model transcribes your voice and identifies the core ideas, themes, and connections in real time." },
  { n: "03", title: "Visualize & refine", desc: "Watch your thoughts bloom into an editable mind map. Drag, rename, expand — it stays in sync." },
];

export function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-24 lg:py-32 relative w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <p className="text-sm uppercase tracking-widest text-accent mb-3 font-semibold">How it works</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            From a thought to a map in <span className="text-gradient">three breaths.</span>
          </h2>
        </div>
        
        {/* Step container: horizontal slider on mobile, grid on desktop */}
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible md:grid-cols-3 gap-6 pb-6 md:pb-0 snap-x snap-mandatory scroll-smooth px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
          {/* Horizontal timeline connector - visible only on desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent z-0" />
          
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="flex-shrink-0 w-[280px] xs:w-[300px] sm:w-[320px] md:w-auto snap-center relative glass rounded-2xl p-7 flex flex-col items-center text-center group hover:border-primary/30 transition-colors z-10"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center font-display font-bold text-lg shadow-glow mb-5 mx-auto shrink-0 text-white group-hover:scale-105 transition-transform duration-200">
                {s.n}
              </div>
              <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
