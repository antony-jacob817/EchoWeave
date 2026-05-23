import { Mic, Brain, Network, FolderKanban, Download, Search } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Mic, title: "Voice-first capture", desc: "Record ideas the moment they hit. One tap, natural speech, zero friction." },
  { icon: Brain, title: "AI transcription", desc: "Crisp, editable transcripts in seconds — accurate even with rambling." },
  { icon: Network, title: "Instant mind maps", desc: "Spoken thoughts become connected node graphs you can edit live." },
  { icon: FolderKanban, title: "Workspace sessions", desc: "Every brainstorm saved, organized, searchable across your library." },
  { icon: Search, title: "Smart search", desc: "Find any idea by topic, keyword, or vibe — not by exact wording." },
  { icon: Download, title: "Export anywhere", desc: "Ship to text, image, or your favorite tool. Your ideas, your formats." },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 lg:py-32 relative w-full overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16 text-center md:text-left mx-auto md:mx-0">
          <p className="text-sm uppercase tracking-widest text-accent mb-3 font-semibold">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight">
            Built for the way ideas <span className="text-gradient">actually arrive.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            Six tools that turn fleeting thoughts into a permanent thinking system.
          </p>
        </div>
        <div className="flex md:grid overflow-x-auto md:overflow-x-visible md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-5 pb-6 md:pb-0 snap-x snap-mandatory scroll-smooth px-4 md:px-0 -mx-4 md:mx-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex-shrink-0 w-[280px] xs:w-[300px] sm:w-[320px] md:w-auto snap-center glass rounded-2xl p-6 hover:border-primary/40 hover:shadow-glow transition-all group flex flex-col items-center md:items-start text-center md:text-left"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform shrink-0">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
