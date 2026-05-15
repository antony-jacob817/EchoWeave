import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useProjectStore } from "@/store/useProjectStore";
import { useRecordingStore } from "@/store/useRecordingStore";
import { voiceNoteService } from "@/services/voiceNoteService";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MindMap, AiNode } from "@/components/dashboard/MindMap";
import { VoiceRecorder } from "@/components/dashboard/VoiceRecorder";
import { aiService } from "@/services/aiService";
import { mindmapService } from "@/services/mindmapService";
import {
  Search, Plus, Download, Trash2, Sun, Moon, LogOut,
  LayoutGrid, FolderOpen, Settings, Sparkles, Clock, Star,
  Mic, Loader2, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const { user, logout } = useAuth();
  const { projects, loading: projectsLoading, fetchProjects, addProject, removeProject, toggleFavorite } = useProjectStore();
  const { uploadRecording, resetRecording } = useRecordingStore();
  
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [dark, setDark] = useState(true);

  // The AI Memory State
  const [mapNodes, setMapNodes] = useState<AiNode[]>([]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  useEffect(() => {
    if (projects.length > 0 && !activeId) {
      setActiveId(projects[0].id);
    }
  }, [projects, activeId]);

  useEffect(() => {
    if (activeId) {
      const loadProjectData = async () => {
        setNotesLoading(true);
        try {
          const notes = await voiceNoteService.getVoiceNotes(activeId);
          setVoiceNotes(notes);
          const savedMap = await mindmapService.getMindMap(activeId);
          if (savedMap && savedMap.length > 0) {
            setMapNodes(savedMap);
          } else {
            setMapNodes([]); 
          }

        } catch (error) {
          console.error("Error fetching project data:", error);
        } finally {
          setNotesLoading(false);
        }
      };
      loadProjectData();
    }
  }, [activeId]);

  const filtered = useMemo(
    () => projects.filter((p) => p.title.toLowerCase().includes(query.toLowerCase())),
    [projects, query],
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeId),
    [projects, activeId]
  );

  const defaultNodes = useMemo(() => {
    if (!activeProject) return [];
    return [{ id: "root", label: activeProject.title, parent: null }];
  }, [activeProject?.id, activeProject?.title]);

  const handleNewProject = async () => {
    const title = prompt("Enter project title:");
    if (title) {
      try {
        await addProject(title);
        toast.success("Project created!");
      } catch (err) {
        toast.error("Failed to create project");
      }
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await removeProject(id);
        if (activeId === id) setActiveId(projects[0]?.id || null);
        toast.success("Project deleted");
      } catch (err) {
        toast.error("Failed to delete project");
      }
    }
  };

  const handleUpdateNode = async (id: string, newLabel: string) => {
    const updatedNodes = mapNodes.map(n => n.id === id ? { ...n, label: newLabel } : n);
    setMapNodes(updatedNodes);
    if (activeId) {
      await mindmapService.saveMindMap(activeId, activeProject?.title || "Untitled", updatedNodes);
    }
  };

  const handleDeleteNodes = async (ids: string[]) => {
    const updatedNodes = mapNodes.filter(n => !ids.includes(n.id));
    setMapNodes(updatedNodes);
    if (activeId) {
      await mindmapService.saveMindMap(activeId, activeProject?.title || "Untitled", updatedNodes);
    }
    toast.success("Node removed");
  };

  const onRecordingComplete = async (blob: Blob, duration: number) => {
    if (!activeId) {
      toast.error("Select a project first");
      return;
    }

    const toastId = toast.loading("Uploading and transcribing with AI...");
    
    try {
      const voiceNote = await uploadRecording(activeId);
      setVoiceNotes([voiceNote, ...voiceNotes]);
      
      toast.loading("Weaving your thoughts into a map...", { id: toastId });

      const { transcript, mindmap } = await aiService.generateMindMapFromAudio(blob);

      const taggedNodes = mindmap.map((node: AiNode) => ({
        ...node,
        sourceId: voiceNote.id 
      }));

      await voiceNoteService.updateTranscript(voiceNote.id, transcript);

      const updatedMap = [...mapNodes, ...taggedNodes];
      
      setMapNodes(updatedMap);
      await mindmapService.saveMindMap(activeId, activeProject?.title || "Untitled", updatedMap);

      resetRecording();
      toast.success("Mind map expanded!", { id: toastId });
      
    } catch (err) {
      console.error(err);
      toast.error("Generation failed. Try again.", { id: toastId });
    }
  };

  const deleteVoiceNote = async (id: string) => {
    try {
      await voiceNoteService.deleteVoiceNote(id);
      setVoiceNotes(voiceNotes.filter(n => n.id !== id));

      const cleanedMap = mapNodes.filter(node => node.sourceId !== id);
      
      setMapNodes(cleanedMap);
      await mindmapService.saveMindMap(activeId!, activeProject?.title || "Untitled", cleanedMap);

      toast.success("Recording and its map branches deleted");
    } catch (err) {
      toast.error("Failed to delete recording");
    }
  };

  const exportProject = () => {
    if (!activeProject) return;
    const content = `Project: ${activeProject.title}\n\nVoice Notes: ${voiceNotes.length}\n${voiceNotes.map(n => `- ${n.audio_url} (${n.duration_seconds}s)`).join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeProject.title.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    toast.success("Exported project details");
  };

  const userInitial = (user as any)?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  const userName = (user as any)?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!user?.email_confirmed_at && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-xs text-amber-500 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Please confirm your email address to unlock all features. Check your inbox!</span>
          <button className="font-semibold underline hover:opacity-80 ml-2">Resend Link</button>
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Full Restored Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar text-sidebar-foreground shrink-0">
          <div className="p-5 border-b border-sidebar-border">
            <Logo />
          </div>
          <nav className="p-3 space-y-1 text-sm">
            {[
              { icon: LayoutGrid, label: "Workspace", active: true },
              { icon: FolderOpen, label: "Projects" },
              { icon: Sparkles, label: "AI Insights" },
              { icon: Settings, label: "Settings" },
            ].map((i) => (
              <button
                key={i.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  i.active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
                }`}
              >
                <i.icon className="h-4 w-4" /> {i.label}
              </button>
            ))}
          </nav>

          <div className="px-3 mt-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Projects</p>
            <div className="space-y-1 max-h-72 overflow-auto">
              {projectsLoading ? (
                 <div className="px-3 py-2 space-y-2">
                   {[1,2,3].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
                 </div>
              ) : filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActiveId(p.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                    activeId === p.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="truncate font-medium">{p.title}</p>
                    {p.is_favorite && <Star className="h-3 w-3 fill-accent text-accent" />}
                  </div>
                  <p className="text-[10px] opacity-70 mt-0.5 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(p.created_at))} ago
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto p-3 border-t border-sidebar-border">
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="h-9 w-9 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-semibold text-primary-foreground">
                {userInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => { logout(); navigate({ to: "/" }); }}
                className="p-1.5 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Full Restored Header */}
          <header className="h-16 border-b border-border flex items-center gap-3 px-4 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="md:hidden"><Logo /></div>
            <div className="relative flex-1 max-w-md ml-auto md:ml-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects…"
                className="pl-9 bg-card/50"
              />
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setDark(!dark)} title="Toggle theme">
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="glass" size="sm" onClick={exportProject} disabled={!activeProject}>
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button variant="hero" size="sm" onClick={handleNewProject}>
                <Plus className="h-4 w-4" /> New Project
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 sm:p-6 grid gap-5 lg:grid-cols-[320px_1fr] overflow-auto">
            {/* Left column - Voice Recorder */}
            <div className="space-y-5">
              <VoiceRecorder onComplete={onRecordingComplete} />

              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Recent Recordings</p>
                  <span className="text-xs text-muted-foreground">{voiceNotes.length}</span>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
                  {notesLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                  ) : voiceNotes.map((n) => (
                    <div
                      key={n.id}
                      className="group rounded-xl p-3 transition border border-transparent hover:bg-muted/40"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Mic className="h-3 w-3 text-primary" />
                            <p className="text-sm font-medium truncate">Recording {n.id.slice(0, 4)}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(n.created_at))} ago · {n.duration_seconds}s
                          </p>
                        </div>
                        <button
                          onClick={() => deleteVoiceNote(n.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <audio src={n.audio_url} controls className="w-full h-8 mt-2" />
                    </div>
                  ))}
                  {!notesLoading && voiceNotes.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-xs text-muted-foreground">No recordings yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right column — Workspace */}
            <div className="flex flex-col gap-5 min-w-0">
              {activeProject ? (
                <div className="glass-strong rounded-2xl p-6 flex-1 flex flex-col min-h-[520px]">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-2xl font-bold font-display">{activeProject.title}</h2>
                        <button 
                          onClick={() => toggleFavorite(activeProject.id, !!activeProject.is_favorite)}
                          className="p-1 hover:bg-muted rounded-full transition"
                        >
                          <Star className={`h-5 w-5 ${activeProject.is_favorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Created {new Date(activeProject.created_at).toLocaleDateString()} · {voiceNotes.length} voice notes
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(activeProject.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-1" /> Delete Project
                      </Button>
                      <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs">
                        <Sparkles className="h-3 w-3 text-accent" /> AI Ready
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-h-[420px] relative">
                     <MindMap 
                       aiNodes={mapNodes.length > 0 ? mapNodes : defaultNodes} 
                       onUpdateNode={handleUpdateNode}
                       onDeleteNodes={handleDeleteNodes}
                     />
                  </div>
                  
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 glass-strong rounded-full px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-4 shadow-lg">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span><strong>Double-click</strong> to edit a node.</span>
                  </div>
                </div>
              ) : (
                <div className="glass-strong rounded-2xl p-6 flex-1 flex flex-col items-center justify-center text-center">
                  <LayoutGrid className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                  <h2 className="text-xl font-semibold">No project selected</h2>
                  <p className="text-muted-foreground mt-2 max-w-sm">
                    Create a new project or select one from the sidebar to start weaving your ideas.
                  </p>
                  <Button variant="hero" className="mt-6" onClick={handleNewProject}>
                    <Plus className="h-4 w-4 mr-2" /> Create Project
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Tip: Record voice notes on the left. They'll be automatically uploaded and linked to this project.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}