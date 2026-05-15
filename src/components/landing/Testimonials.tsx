import { motion } from "framer-motion";
import { Quote } from "lucide-react";

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
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3">Loved by thinkers</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Trusted by people who <span className="text-gradient">make things.</span>
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 flex flex-col"
            >
              <Quote className="h-6 w-6 text-primary/60 mb-4" />
              <p className="text-foreground/90 leading-relaxed mb-6 flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full" style={{ background: t.bg }} />
                <div>
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
