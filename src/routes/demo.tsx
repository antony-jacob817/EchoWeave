import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MindMap } from "@/components/dashboard/MindMap";
import { sampleSessions } from "@/data/sessions";
import {
  Search, Plus, Download, Trash2, Sun, Moon, LogOut,
  LayoutGrid, FolderOpen, Settings, Sparkles, Clock, Star,
  Mic, AlertCircle, Menu, X, Check
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/demo")({ component: DemoPage });

function DemoPage() {
  const [activeTab, setActiveTab] = useState<"Workspace" | "Projects" | "Editor" | "AI Insights" | "Settings">("Workspace");
  const [activeId, setActiveId] = useState<string | null>(sampleSessions[0].id);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [insightProjectId, setInsightProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  const filtered = useMemo(
    () => sampleSessions.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const activeProject = useMemo(
    () => sampleSessions.find((p) => p.id === activeId),
    [activeId]
  );

  const showReadOnlyToast = () => {
    toast("This is a read-only demo.", {
      description: "Create a free account to unlock this feature and save your work!",
      action: { label: "Sign Up", onClick: () => window.location.href = "/signup" }
    });
  };

  const formatInsightText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*-\s*(.*)$/gm, '<li class="ml-4 list-none relative before:content-[\'•\'] before:absolute before:-left-4 before:text-accent">$1</li>');
  };

  const getMockInsight = (title: string) => {
    return `🎯 **Core Theme**\nYou are building a comprehensive strategy focused around this concept.\n\n🧠 **Structural Analysis**\n- Your main branches are well-defined and cover distinct channels.\n- The connection between your core idea and your end goal is very strong.\n\n⚡ **Actionable Next Step**\nRecord a quick 30-second voice note breaking down your next milestone into three smaller, daily tasks.`;
  };

  const userInitial = "D";
  const userName = "Demo User";

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden relative">
      <div className="pointer-events-none absolute -top-40 -left-20 h-[600px] w-[800px] rounded-full bg-primary/10 blur-[120px] -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] -z-10" />

      <div className="bg-primary/20 border-b border-primary/30 px-4 py-2 flex items-center justify-center gap-3 text-xs text-primary-foreground animate-in fade-in slide-in-from-top-1 z-20">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>You are viewing an interactive read-only demo. Start capturing your own ideas!</span>
        <Button asChild variant="hero" size="sm" className="h-7 text-[10px] ml-2">
          <Link to="/signup">Create Free Account</Link>
        </Button>
      </div>

      <div className="flex-1 flex overflow-hidden z-10">
        {/* SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-background/40 backdrop-blur-2xl text-sidebar-foreground shrink-0">
          <div className="p-5 border-b border-white/5"><Logo /></div>
          <nav className="p-3 space-y-1 text-sm">
            {[
              { icon: LayoutGrid, label: "Workspace" },
              { icon: FolderOpen, label: "Projects" },
              { icon: Sparkles, label: "AI Insights" },
              { icon: Settings, label: "Settings" },
            ].map((i) => (
              <button
                key={i.label}
                onClick={() => setActiveTab(i.label as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${activeTab === i.label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"}`}
              >
                <i.icon className="h-4 w-4" /> {i.label}
              </button>
            ))}
          </nav>
          <div className="px-3 mt-4 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Projects</p>
            <div className="space-y-1 max-h-72 overflow-auto">
              {sampleSessions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setActiveId(p.id); setActiveTab("Editor"); setIsMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${activeId === p.id && activeTab === "Editor" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"}`}
                >
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{p.title}</p>
                    <Star className="h-3 w-3 fill-accent text-accent" />
                  </div>
                  <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {p.createdAt}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="mt-auto p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 py-2 cursor-pointer hover:bg-white/5 rounded-lg" onClick={() => window.location.href = "/signup"}>
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">{userInitial}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">demo@echoweave.ai</p>
              </div>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-background/40 backdrop-blur-2xl sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden flex items-center shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              <div className="md:hidden shrink-0"><Logo className="h-6 sm:h-8" /></div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} title="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              {activeTab === "Editor" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" size="sm" className="px-3" onClick={showReadOnlyToast}>
                      <Download className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                </DropdownMenu>
              )}
              <Button variant="hero" size="sm" onClick={showReadOnlyToast} className="px-2.5 sm:px-3">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-transparent">
            {activeTab === "Workspace" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">Welcome back, {userName}</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Here is an overview of your creative space.</p>
                </div>
                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="glass-strong rounded-2xl p-6 border-primary/20">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FolderOpen className="h-4 w-4"/> Total Projects</h3>
                    <p className="text-4xl font-display font-bold mt-3 text-gradient">{sampleSessions.length}</p>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4"/> Favorited</h3>
                    <p className="text-4xl font-display font-bold mt-3">{sampleSessions.length}</p>
                  </div>
                  <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:bg-primary/5 cursor-pointer transition" onClick={showReadOnlyToast}>
                    <Plus className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">New Project</span>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Recent Projects</h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {sampleSessions.map(p => (
                      <div key={p.id} onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }} className="glass rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition group">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{p.title}</p>
                          <Star className="h-4 w-4 fill-accent text-accent shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                          <Clock className="h-3.5 w-3.5" /> {p.createdAt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Projects" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold">Project Library</h1>
                    <p className="text-muted-foreground mt-2 text-lg">All your woven thoughts, organized.</p>
                  </div>
                  <div className="relative w-full sm:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects..." className="pl-9 bg-background/50 border-primary/20 focus-visible:ring-primary/50" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-muted-foreground"/> All Projects
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filtered.map(p => (
                      <div key={p.id} className="glass rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors pr-6">{p.title}</p>
                          <Star className="h-4 w-4 fill-accent text-accent shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                          <Clock className="h-3.5 w-3.5" /> {p.createdAt}
                        </p>
                        <button onClick={(e) => { e.stopPropagation(); showReadOnlyToast(); }} className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Editor" && activeProject && (
              <div className="h-full p-4 sm:p-6 grid gap-5 lg:grid-cols-[320px_1fr] animate-in fade-in">
                <div className="space-y-5">
                  <div className="glass rounded-2xl p-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">Voice capture</p>
                    <Button variant="hero" className="w-full" onClick={showReadOnlyToast}>
                      <Mic className="h-4 w-4 mr-2" /> Start recording
                    </Button>
                  </div>
                  <div className="glass rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent Recordings</p>
                      <span className="text-xs text-muted-foreground">1</span>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                      <div className="group rounded-xl p-3 transition border border-transparent hover:bg-muted/40">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Mic className="h-3 w-3 text-primary" />
                              <p className="text-sm font-medium truncate">Demo Recording</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">{activeProject.createdAt} · {activeProject.duration}</p>
                          </div>
                          <button onClick={showReadOnlyToast} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-3 bg-slate-900/40 rounded-lg p-3 text-xs leading-relaxed text-slate-300 border border-slate-800/50">
                          <p className="whitespace-pre-wrap">{activeProject.transcript}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-5 min-w-0">
                  <div className="glass-strong rounded-2xl p-6 flex-1 flex flex-col min-h-[520px]">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-2xl font-bold font-display">{activeProject.title}</h2>
                          <button onClick={showReadOnlyToast} className="p-1 hover:bg-muted rounded-full transition">
                            <Star className="h-5 w-5 fill-accent text-accent" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Created {activeProject.createdAt} · 1 voice notes</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={showReadOnlyToast} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex">
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                        <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs">
                          <Sparkles className="h-3 w-3 text-accent" /> AI Ready
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-h-[420px] relative pointer-events-none opacity-95">
                      <MindMap aiNodes={activeProject.nodes as any} />
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 shadow-lg cursor-pointer" onClick={showReadOnlyToast}>
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span><strong>Double-click</strong> to edit a node (disabled in demo).</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "AI Insights" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in h-full flex flex-col">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-accent" /> Echo AI
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">Select a project to get an intelligent analysis of your thought patterns.</p>
                </div>
                <div className="grid md:grid-cols-[300px_1fr] gap-6 flex-1 min-h-0">
                  <div className="glass-strong rounded-2xl p-5 overflow-y-auto">
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Select Project</h3>
                    <div className="space-y-2">
                      {sampleSessions.map(p => (
                        <button
                          key={p.id}
                          onClick={() => setInsightProjectId(p.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition border ${insightProjectId === p.id ? "bg-primary/20 border-primary/50 text-foreground shadow-glow" : "bg-background/50 border-transparent hover:bg-muted/50 text-muted-foreground"}`}
                        >
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs opacity-70 mt-1">{p.createdAt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="glass rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden">
                    {!insightProjectId ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <Sparkles className="h-12 w-12 mb-4" />
                        <p>Echo AI is standing by.</p>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
                          <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                            <Sparkles className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-lg">Echo AI</p>
                            <p className="text-xs text-accent">Analysis Complete</p>
                          </div>
                        </div>
                        <div 
                          className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-sm md:text-base space-y-2"
                          dangerouslySetInnerHTML={{ __html: formatInsightText(getMockInsight(sampleSessions.find(p => p.id === insightProjectId)?.title || "")) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Settings" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in h-full">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">Settings</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Manage your account and subscription.</p>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Account Profile</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow shrink-0">{userInitial}</div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{userName}</p>
                          <p className="text-sm text-muted-foreground">demo@echoweave.ai</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 glass-strong rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-primary border border-primary/20">
                            <Sparkles className="h-3 w-3" /> Spark Plan
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <p className="text-sm font-medium">Rename Account</p>
                        <div className="flex gap-2">
                          <Input placeholder="New full name" className="bg-background/50" disabled />
                          <Button variant="secondary" onClick={showReadOnlyToast}>Save</Button>
                        </div>
                      </div>
                    </div>
                    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-display font-semibold mb-1">Security</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update your password here.</p>
                        <div className="space-y-3">
                          <Input type="password" placeholder="Current Password" disabled className="bg-background/50" />
                          <Input type="password" placeholder="New Password" disabled className="bg-background/50" />
                        </div>
                      </div>
                      <Button variant="secondary" className="mt-4 w-full" onClick={showReadOnlyToast}>Change Password</Button>
                    </div>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Subscription Plan</h2>
                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="glass rounded-2xl p-6 flex flex-col border border-primary/50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
                      <h3 className="font-display text-xl font-semibold">Spark</h3>
                      <p className="text-sm text-muted-foreground mt-1">For exploring the voice-first workflow.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">$0</span>
                        <span className="text-xs text-muted-foreground">/ forever</span>
                      </div>
                      <ul className="mt-6 space-y-3 flex-1 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> 10 voice notes / month</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> AI transcription</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Basic mind maps</li>
                      </ul>
                      <Button disabled variant="secondary" className="mt-6 w-full opacity-50 cursor-default">Current Plan</Button>
                    </div>
                    <div className="glass-strong rounded-2xl p-6 flex flex-col border border-primary/40 shadow-glow relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-[10px] font-semibold px-3 py-1 rounded-full text-white uppercase tracking-wider whitespace-nowrap">Most Popular</div>
                      <h3 className="font-display text-xl font-semibold">Flow</h3>
                      <p className="text-sm text-muted-foreground mt-1">For makers shipping ideas weekly.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">$12</span><span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                      <ul className="mt-6 space-y-3 flex-1 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Unlimited voice notes</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Advanced AI mind maps</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Export to image & text</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Smart search</li>
                      </ul>
                      <Button variant="hero" className="mt-6 w-full" onClick={showReadOnlyToast}>Upgrade to Flow</Button>
                    </div>
                    <div className="glass rounded-2xl p-6 flex flex-col">
                      <h3 className="font-display text-xl font-semibold">Studio</h3>
                      <p className="text-sm text-muted-foreground mt-1">For teams building together.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">$29</span><span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                      <ul className="mt-6 space-y-3 flex-1 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Everything in Flow</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Team workspaces</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Shared mind maps</li>
                      </ul>
                      <Button variant="outline" className="mt-6 w-full" onClick={showReadOnlyToast}>Talk to Sales</Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* MOBILE DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[80%] bg-sidebar h-full flex flex-col border-r border-border shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="p-5 border-b border-sidebar-border flex justify-between items-center">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="p-3 space-y-1 text-sm">
              {[
                { icon: LayoutGrid, label: "Workspace" },
                { icon: FolderOpen, label: "Projects" },
                { icon: Sparkles, label: "AI Insights" },
                { icon: Settings, label: "Settings" },
              ].map((i) => (
                <button key={i.label} onClick={() => { setActiveTab(i.label as any); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${activeTab === i.label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"}`}>
                  <i.icon className="h-4 w-4" /> {i.label}
                </button>
              ))}
            </nav>
            <div className="px-3 mt-4 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Projects</p>
              <div className="space-y-1 max-h-[60vh] overflow-auto">
                {sampleSessions.map((p) => (
                  <button key={p.id} onClick={() => { setActiveId(p.id); setActiveTab("Editor"); setIsMobileMenuOpen(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeId === p.id && activeTab === "Editor" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"}`}>
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium">{p.title}</p>
                      <Star className="h-3 w-3 fill-accent text-accent" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-auto p-5 border-t border-sidebar-border flex justify-between items-center cursor-pointer hover:bg-white/5" onClick={() => window.location.href = "/signup"}>
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">{userInitial}</div>
                  <p className="text-sm font-medium truncate">{userName}</p>
               </div>
               <LogOut className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}