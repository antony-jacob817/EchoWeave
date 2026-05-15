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
    <section id="features" className="py-32 relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="max-w-2xl mb-16">
          <p className="text-sm uppercase tracking-widest text-accent mb-3">Features</p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold">
            Built for the way ideas <span className="text-gradient">actually arrive.</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Six tools that turn fleeting thoughts into a permanent thinking system.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glass rounded-2xl p-6 hover:border-primary/40 hover:shadow-glow transition-all group"
            >
              <div className="h-11 w-11 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 shadow-glow group-hover:scale-110 transition-transform">
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
