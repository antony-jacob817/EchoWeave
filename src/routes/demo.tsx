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
  Mic, AlertCircle, Menu, X, Check, Loader2, RefreshCw
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insightData, setInsightData] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light") setDark(false);
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
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

  const handleAnalyzeProject = async (projectId: string, force: boolean = false) => {
    setInsightProjectId(projectId);
    if (!force && insightData) return;
    setIsAnalyzing(true);
    setInsightData(null);
    await new Promise(r => setTimeout(r, 1500));
    setInsightData(getMockInsight(sampleSessions.find(p => p.id === projectId)?.title || ""));
    setIsAnalyzing(false);
    if (force) toast.success("Insight recalculated successfully!");
  };

  const userInitial = "D";
  const userName = "Demo User";

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-transparent text-foreground overflow-hidden relative md:p-4 md:gap-4">
      
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-[600px] w-[800px] rounded-full bg-primary/20 blur-[120px] -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[130px] -z-10" />

      {/* Demo Banner */}
      <div className="absolute top-0 inset-x-0 bg-primary/20 border-b border-primary/30 px-4 py-2 flex items-center justify-center gap-3 text-xs text-primary-foreground animate-in fade-in z-50">
        <Sparkles className="h-4 w-4 shrink-0" />
        <span>You are viewing an interactive read-only demo. Start capturing your own ideas!</span>
        <Button asChild variant="hero" size="sm" className="h-7 text-[10px] ml-2">
          <Link to="/signup">Create Free Account</Link>
        </Button>
      </div>

      {/* HOVER-EXPANDING SIDEBAR */}
      <div className="hidden md:block w-[88px] shrink-0 h-full relative z-40 mt-8 md:mt-0">
        <aside className="absolute top-0 left-0 h-full w-[88px] hover:w-[260px] flex flex-col group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[8px_0_32px_-12px_rgba(0,0,0,0.5)] text-sidebar-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
          <div className="flex flex-col h-full w-[260px]">
            <div className="h-20 flex items-center pl-5 border-b border-white/5 relative z-10">
              <Logo className="h-7 shrink-0 pr-1" />
            </div>
            
            <nav className="p-4 space-y-2 text-sm relative z-10">
              {[
                { icon: LayoutGrid, label: "Workspace" },
                { icon: FolderOpen, label: "Projects" },
                { icon: Sparkles, label: "AI Insights" },
                { icon: Settings, label: "Settings" },
              ].map((i) => (
                <button
                  key={i.label}
                  onClick={() => setActiveTab(i.label as any)}
                  className={`w-full flex items-center pl-4 py-3 rounded-2xl transition-all duration-300 ${
                    activeTab === i.label 
                      ? "bg-primary/15 text-primary font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" 
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <i.icon className="h-5 w-5 shrink-0" />
                  <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {i.label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="px-4 mt-2 flex-1 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 mb-3 font-semibold">Demo Projects</p>
              <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-2 scrollbar-thin">
                {sampleSessions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all ${
                      activeId === p.id && activeTab === "Editor" 
                        ? "bg-white/10 text-foreground font-medium" 
                        : "hover:bg-white/5 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate pr-2">{p.title}</p>
                      <Star className="h-3 w-3 fill-accent text-accent shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-4 relative z-10">
              <div className="flex items-center pl-2 py-2 cursor-pointer hover:bg-white/5 rounded-2xl transition border border-transparent hover:border-white/5" onClick={() => window.location.href = "/signup"}>
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-white shadow-glow shrink-0">
                  {userInitial}
                </div>
                <div className="ml-3 min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">demo@echoweave.ai</p>
                </div>
                <button
                  className="mr-2 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300 shrink-0"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:rounded-3xl border-0 md:border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden relative z-10 mt-8 md:mt-0">
        
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 sm:px-8 bg-transparent sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden flex items-center shrink-0">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="md:hidden shrink-0"><Logo className="h-6 sm:h-8" /></div>
            <div className="hidden md:block">
              <h2 className="text-lg font-display font-semibold text-foreground/90">{activeTab}</h2>
            </div>
          </div>
            
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10" onClick={() => setDark(!dark)}>
              {dark ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </Button>
            
            {activeTab === "Editor" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="glass" size="sm" className="rounded-full px-4 border-white/10" onClick={showReadOnlyToast}>
                    <Download className="h-4 w-4 sm:mr-2 text-muted-foreground" /> 
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
              </DropdownMenu>
            )}

            <Button variant="hero" size="sm" onClick={showReadOnlyToast} className="rounded-full px-5 shadow-glow ml-2">
              <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline font-semibold">New Project</span>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent relative z-0 p-4 sm:p-6 lg:p-8 scrollbar-thin">
          
          {/* VIEW 1: WORKSPACE OVERVIEW */}
          {activeTab === "Workspace" && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 h-full flex flex-col">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Welcome to the Demo</h1>
                <p className="text-muted-foreground mt-3 text-lg">Click a project in the sidebar to see how EchoWeave turns voice notes into mind maps.</p>
              </div>
              
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="relative overflow-hidden glass rounded-3xl p-7 border-white/5 hover:border-primary/30 transition-all duration-300 group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Projects</p>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                      <FolderOpen className="h-5 w-5"/>
                    </div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground">{sampleSessions.length}</p>
                </div>

                <div className="relative overflow-hidden glass rounded-3xl p-7 border-white/5 hover:border-accent/30 transition-all duration-300 group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Favorited</p>
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                      <Star className="h-5 w-5"/>
                    </div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground">{sampleSessions.length}</p>
                </div>

                <div className="relative overflow-hidden glass rounded-3xl p-7 flex flex-col justify-center items-center text-center border-dashed border-2 border-white/10 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 group" onClick={showReadOnlyToast}>
                  <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="font-semibold text-lg">Create New Project</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Demo Activity</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 mb-12 gap-5">
                  {sampleSessions.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }} 
                      className="glass rounded-3xl p-6 cursor-pointer border border-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                          <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      </div>
                      <p className="font-semibold text-xl truncate mb-1 relative z-10">{p.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 relative z-10">
                        <Clock className="h-3.5 w-3.5" /> {p.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 1.5: PROJECTS LIBRARY */}
          {activeTab === "Projects" && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-display font-bold tracking-tight">Project Library</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Search and manage your woven thoughts.</p>
                </div>
                <div className="relative w-full sm:w-80 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search demo projects..." className="pl-11 h-12 rounded-full bg-white/5 border-white/10 focus-visible:ring-primary/50 text-base" />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground"/> Demo Projects
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 mb-12 gap-5">
                  {filtered.map(p => (
                    <div key={p.id} className="glass rounded-3xl p-6 cursor-pointer border border-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                      <div className="flex justify-between items-start mb-4">
                          <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); showReadOnlyToast(); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-xl transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                      </div>
                      <p className="font-semibold text-xl truncate mb-1">{p.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> {p.createdAt}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: EDITOR */}
          {activeTab === "Editor" && activeProject && (
            <div className="h-[calc(100vh-8rem)] grid gap-6 lg:grid-cols-[340px_1fr] animate-in fade-in zoom-in-[0.99] duration-300">
              <div className="space-y-6 overflow-y-auto pr-2 scrollbar-thin">
                <div className="glass rounded-3xl p-6 border-white/5" onClick={showReadOnlyToast}>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5">Voice capture</p>
                  <Button variant="hero" className="w-full h-12 rounded-xl">
                    <Mic className="h-4 w-4 mr-2" /> Start recording
                  </Button>
                </div>
                <div className="glass rounded-3xl p-6 border-white/5">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Demo Recordings</p>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">1</span>
                  </div>
                  <div className="space-y-3">
                    <div className="group rounded-2xl p-4 transition border border-white/5 bg-white/[0.02] hover:bg-white/5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                              <Mic className="h-3 w-3 text-primary" />
                            </div>
                            <p className="text-sm font-semibold truncate">Session Audio</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 ml-8">{activeProject.createdAt} · {activeProject.duration}</p>
                        </div>
                        <button onClick={showReadOnlyToast} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-4 bg-black/40 rounded-xl p-4 text-xs leading-relaxed text-slate-300 border border-white/5">
                        <p className="whitespace-pre-wrap">{activeProject.transcript}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="glass-strong rounded-3xl p-2 flex-1 flex flex-col min-h-0 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="flex items-start justify-between gap-4 p-5 pb-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold font-display">{activeProject.title}</h2>
                        <button onClick={showReadOnlyToast} className="p-1.5 hover:bg-white/10 rounded-full transition">
                          <Star className="h-5 w-5 fill-accent text-accent" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Created {activeProject.createdAt} · 1 voice notes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="sm" onClick={showReadOnlyToast} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex rounded-full">
                        <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                      </Button>
                      <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full px-4 py-1.5 text-xs font-semibold">
                        <Sparkles className="h-3 w-3" /> AI Ready
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-0 relative mt-2 rounded-2xl overflow-hidden border border-white/5 mx-2 mb-2 bg-[#0b0f19] opacity-90" onClick={showReadOnlyToast}>
                    <MindMap aiNodes={activeProject.nodes as any} />
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 shadow-lg cursor-pointer">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                      <span><strong>Double-click</strong> to edit a node (disabled in demo).</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: AI INSIGHTS */}
          {activeTab === "AI Insights" && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 h-full flex flex-col">
              <div>
                <h1 className="text-4xl font-display font-bold tracking-tight flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                    <Sparkles className="h-6 w-6 text-accent" />
                  </div>
                  Echo AI
                </h1>
                <p className="text-muted-foreground mt-3 text-lg">Select a project to get an intelligent analysis of your thought patterns.</p>
              </div>

              <div className="grid md:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
                <div className="glass rounded-3xl p-6 overflow-y-auto border-white/5 scrollbar-thin">
                  <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-5 font-semibold">Select Project</h3>
                  <div className="space-y-3">
                    {sampleSessions.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handleAnalyzeProject(p.id, true)}
                        className={`w-full text-left px-5 py-4 rounded-2xl transition-all border ${
                          insightProjectId === p.id 
                            ? "bg-primary/20 border-primary/40 text-foreground shadow-glow scale-[1.02]" 
                            : "bg-white/5 border-transparent hover:bg-white/10 text-muted-foreground"
                        }`}
                      >
                        <p className="font-medium truncate">{p.title}</p>
                        <p className="text-xs opacity-70 mt-1">{p.createdAt}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="glass-strong rounded-3xl p-8 flex flex-col relative overflow-hidden border-white/10">
                  {!insightProjectId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                      <Sparkles className="h-16 w-16 mb-6" />
                      <p className="text-xl font-display">Echo AI is standing by.</p>
                    </div>
                  ) : isAnalyzing ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-primary mb-5" />
                      <p className="text-primary font-medium animate-pulse text-lg">Echo AI is analyzing your map...</p>
                    </div>
                  ) : insightData ? (
                    <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500 min-h-0">
                      <div className="flex items-center justify-between mb-6 pb-6 border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                            <Sparkles className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-2xl font-display">Echo AI</p>
                            <p className="text-sm text-accent font-medium mt-1">Analysis Complete</p>
                          </div>
                        </div>
                        <Button 
                          variant="glass" 
                          size="sm" 
                          disabled={isAnalyzing}
                          className="rounded-full px-4 border-white/10 hover:bg-white/10 flex items-center gap-2"
                          onClick={() => handleAnalyzeProject(insightProjectId!, true)}
                        >
                          <RefreshCw className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                          <span>Recalculate</span>
                        </Button>
                      </div>
                      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
                        <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base space-y-4" dangerouslySetInnerHTML={{ __html: formatInsightText(insightData) }} />
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: SETTINGS */}
          {activeTab === "Settings" && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
              <div>
                <h1 className="text-4xl font-display font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-2 text-lg">Manage your account and subscription.</p>
              </div>

              <div>
                <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                  <Settings className="h-5 w-5 text-muted-foreground"/> Account Profile
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-3xl p-8 flex flex-col justify-between border-white/5">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="h-20 w-20 rounded-full bg-gradient-primary flex items-center justify-center text-3xl font-bold text-white shadow-glow shrink-0">
                        {userInitial}
                      </div>
                      <div>
                        <p className="text-2xl font-bold font-display text-foreground">{userName}</p>
                        <p className="text-sm text-muted-foreground mt-1">demo@echoweave.ai</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 glass-strong rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-primary border border-primary/20">
                          <Sparkles className="h-3 w-3" /> Spark Plan
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <p className="text-sm font-medium">Rename Account</p>
                      <div className="flex gap-3">
                        <Input placeholder="New full name" disabled className="bg-white/5 border-white/10 rounded-xl h-11" />
                        <Button variant="secondary" className="rounded-xl h-11 px-6" onClick={showReadOnlyToast}>Save</Button>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-3xl p-8 flex flex-col justify-between border-white/5">
                    <div>
                      <h3 className="text-lg font-display font-semibold mb-2">Security</h3>
                      <p className="text-sm text-muted-foreground mb-6">Update your password here.</p>
                      <div className="space-y-4">
                        <Input type="password" placeholder="Current Password" disabled className="bg-white/5 border-white/10 rounded-xl h-11" />
                        <Input type="password" placeholder="New Password" disabled className="bg-white/5 border-white/10 rounded-xl h-11" />
                      </div>
                    </div>
                    <Button variant="secondary" className="mt-6 w-full rounded-xl h-11" onClick={showReadOnlyToast}>Change Password</Button>
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
                      <span className="font-display text-4xl font-bold">$0</span><span className="text-xs text-muted-foreground">/ forever</span>
                    </div>
                    <ul className="mt-6 space-y-3 flex-1 text-sm">
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> 10 voice notes / month</li>
                      <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> AI transcription</li>
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
                    </ul>
                    <Button variant="outline" className="mt-6 w-full" onClick={showReadOnlyToast}>Talk to Sales</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="relative w-72 max-w-[85%] bg-[#0B0F19]/95 backdrop-blur-3xl h-full flex flex-col border-r border-white/10 shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <Logo />
              <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full" onClick={() => setIsMobileMenuOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <nav className="p-4 space-y-2 text-sm">
              {[
                { icon: LayoutGrid, label: "Workspace" },
                { icon: FolderOpen, label: "Projects" },
                { icon: Sparkles, label: "AI Insights" },
                { icon: Settings, label: "Settings" },
              ].map((i) => (
                <button
                  key={i.label}
                  onClick={() => { setActiveTab(i.label as any); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition ${activeTab === i.label ? "bg-primary/20 text-primary font-medium" : "hover:bg-white/5 text-muted-foreground"}`}
                >
                  <i.icon className="h-5 w-5" /> {i.label}
                </button>
              ))}
            </nav>
            <div className="mt-auto p-4 border-t border-white/5 flex justify-between items-center bg-black/20" onClick={() => window.location.href = "/signup"}>
               <div className="flex items-center gap-3 cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow">{userInitial}</div>
                  <div className="min-w-0"><p className="text-sm font-semibold truncate text-foreground">{userName}</p></div>
               </div>
               <button className="p-3 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition"><LogOut className="h-5 w-5" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}