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
import { authService } from "@/services/authService";
import { mindmapService } from "@/services/mindmapService";
import {
  Search, Plus, Download, Trash2, Sun, Moon, LogOut,
  LayoutGrid, FolderOpen, Settings, Sparkles, Clock, Star,
  Mic, Loader2, AlertCircle, Menu, X, Check,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { usePostHog } from 'posthog-js/react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/dashboard")({ component: DashboardPage });

function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}

function Dashboard() {
  const posthog = usePostHog();
  const { user, logout } = useAuth();
  const { projects, loading: projectsLoading, fetchProjects, addProject, removeProject, toggleFavorite } = useProjectStore();
  const { uploadRecording, resetRecording } = useRecordingStore();

  // Echo AI State
  const [insightProjectId, setInsightProjectId] = useState<string | null>(null);
  const [insightData, setInsightData] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<"Workspace" | "Projects" | "Editor" | "AI Insights" | "Settings">("Workspace");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState("");
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Settings State
  const [editName, setEditName] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

  // The AI Memory State
  const [mapNodes, setMapNodes] = useState<AiNode[]>([]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, fetchProjects]);

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

  const handleNewProjectClick = () => {
    setNewProjectTitle("");
    setIsCreateModalOpen(true);
  };

  const submitNewProject = async () => {
    if (!newProjectTitle.trim()) return;
    try {
      await addProject(newProjectTitle);
      toast.success("Project created!");
      setIsCreateModalOpen(false);
      setNewProjectTitle("");
    } catch (err) {
      toast.error("Failed to create project");
    }
  };

  const handleDeleteProjectClick = (id: string) => {
    setProjectToDelete(id);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await removeProject(projectToDelete);
      if (activeId === projectToDelete) setActiveId(projects[0]?.id || null);
      toast.success("Project deleted");
    } catch (err) {
      toast.error("Failed to delete project");
    } finally {
      setProjectToDelete(null);
    }
  };

  // --- SETTINGS HANDLERS ---
  const handleUpdateName = async () => {
    if (!editName.trim()) return;
    setIsUpdatingAccount(true);
    try {
      await authService.updateName(editName);
      toast.success("Name updated successfully! (Refresh to see changes everywhere)");
      setEditName("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update name");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) return toast.error("Please fill in both password fields.");
    if (oldPassword === newPassword) return toast.error("New password must be different.");
    if (newPassword.length < 6) return toast.error("New password must be at least 6 characters.");
    
    setIsUpdatingAccount(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      toast.success("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setIsUpdatingAccount(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("DANGER: Are you absolutely sure you want to delete your account? All data will be lost forever.")) {
      try {
        await authService.deleteAccount();
        navigate({ to: "/" });
        toast.success("Account deleted successfully.");
      } catch (error: any) {
        toast.error("Failed to delete account.");
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
      posthog.capture('voice_note_recorded', {
        projectId: activeId,
        duration: duration
      });
      setVoiceNotes([voiceNote, ...voiceNotes]);
      
      toast.loading("Weaving your thoughts into a map...", { id: toastId });

      const { transcript, mindmap } = await aiService.generateMindMapFromAudio(blob);
      
      const taggedNodes = mindmap.map((node: AiNode) => ({
        ...node,
        sourceId: voiceNote.id 
      }));

      await voiceNoteService.updateTranscript(voiceNote.id, transcript);

      setVoiceNotes(prevNotes => prevNotes.map(n => 
        n.id === voiceNote.id ? { ...n, transcript: transcript } : n
      ));

      const updatedMap = [...mapNodes, ...taggedNodes];
      
      setMapNodes(updatedMap);
      await mindmapService.saveMindMap(activeId, activeProject?.title || "Untitled", updatedMap);

      posthog.capture('mindmap_generated', {
        projectId: activeId,
        nodeCount: mindmap.length
      });

      resetRecording();
      toast.success("Mind map expanded!", { id: toastId });
      
    } catch (err: any) {
      console.error(err);
      posthog.capture('generation_error', {
        errorMessage: err.message || "Unknown error"
      });
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
    } catch (err: any) {
      toast.error("Failed to delete recording");
    }
  };

  // --- ECHO AI HANDLER ---
  // --- ECHO AI HANDLER ---
  const handleAnalyzeProject = async (projectId: string) => {
    setInsightProjectId(projectId);
    setIsAnalyzing(true);
    setInsightData(null);

    try {
      const nodes = await mindmapService.getMindMap(projectId);
      const project = projects.find(p => p.id === projectId);

      if (!nodes || nodes.length <= 1) {
        setInsightData("Echo AI needs more context. Try recording a voice note and building a mind map for this project first!");
      } else {
        // CALL THE NEW AI SERVICE!
        const aiResponseText = await aiService.generateProjectInsight(project?.title || "Untitled", nodes);
        setInsightData(aiResponseText);
      }
    } catch (error) {
      setInsightData("Echo AI encountered an error analyzing your map. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filterUI = (node: HTMLElement) => {
    if (node?.classList) {
      return (
        !node.classList.contains('react-flow__minimap') &&
        !node.classList.contains('react-flow__controls') &&
        !node.classList.contains('react-flow__panel')
      );
    }
    return true;
  };

  const formatInsightText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*-\s*(.*)$/gm, '<li class="ml-4 list-none relative before:content-[\'•\'] before:absolute before:-left-4 before:text-accent">$1</li>');
  };

  const exportAsImage = async () => {
    const element = document.getElementById('react-flow-canvas-container');
    if (!element) return;

    const toastId = toast.loading("Taking a snapshot of your map...");
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0B0F19', 
        quality: 1.0,
        filter: filterUI
      });

      const link = document.createElement('a');
      link.download = `${activeProject?.title || 'mindmap'}.png`;
      link.href = dataUrl;
      link.click();
      
      toast.success("Exported successfully as PNG!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate image", { id: toastId });
    }
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('react-flow-canvas-container');
    if (!element) return;

    const toastId = toast.loading("Formatting PDF...");
    try {
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#0B0F19',
        quality: 0.95,
        filter: filterUI
      });

      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (element.offsetHeight * imgWidth) / element.offsetWidth;

      pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${activeProject?.title || 'mindmap'}.pdf`);

      toast.success("Exported successfully as PDF!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate PDF", { id: toastId });
    }
  };

  const userInitial = (user as any)?.user_metadata?.full_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U";
  const userName = (user as any)?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
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
              { icon: LayoutGrid, label: "Workspace" },
              { icon: FolderOpen, label: "Projects" },
              { icon: Sparkles, label: "AI Insights" },
              { icon: Settings, label: "Settings" },
            ].map((i) => (
              <button
                key={i.label}
                onClick={() => setActiveTab(i.label as any)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                  activeTab === i.label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
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
              ) : projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { 
                    setActiveId(p.id);
                    setActiveTab("Editor");
                    setIsMobileMenuOpen(false); 
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      activeId === p.id && activeTab === "Editor" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
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
          <header className="h-16 border-b border-border flex items-center justify-between px-4 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3 min-w-0">
              <div className="md:hidden flex items-center shrink-0">
                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
              {/* Shrunk the logo slightly on mobile to ensure it fits */}
              <div className="md:hidden shrink-0"><Logo className="h-6 sm:h-8" /></div>
            </div>
              
            {/* Reduced gaps on mobile, hidden text labels on small screens */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">              
              {activeTab === "Editor" && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" size="sm" disabled={!activeProject} className="px-3">
                      <Download className="h-4 w-4 sm:mr-2" /> 
                      <span className="hidden sm:inline">Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={exportAsImage} className="cursor-pointer">
                      Export as PNG
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer">
                      Export as PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              <Button variant="hero" size="sm" onClick={handleNewProjectClick} className="px-2.5 sm:px-3">
                <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">New Project</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto bg-background/50">
            {/* VIEW 1: WORKSPACE OVERVIEW */}
            {activeTab === "Workspace" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">Welcome back, {userName}</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Here is an overview of your creative space.</p>
                </div>
                
                <div className="grid sm:grid-cols-3 gap-5">
                  <div className="glass-strong rounded-2xl p-6 border-primary/20">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><FolderOpen className="h-4 w-4"/> Total Projects</h3>
                    <p className="text-4xl font-display font-bold mt-3 text-gradient">{projects.length}</p>
                  </div>
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Star className="h-4 w-4"/> Favorited</h3>
                    <p className="text-4xl font-display font-bold mt-3">{projects.filter(p => p.is_favorite).length}</p>
                  </div>
                  <div className="glass rounded-2xl p-6 flex flex-col justify-center items-center text-center hover:bg-primary/5 cursor-pointer transition" onClick={handleNewProjectClick}>
                    <Plus className="h-8 w-8 text-primary mb-2" />
                    <span className="font-medium">New Project</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Recent Projects</h2>
                  {projects.length === 0 ? (
                     <div className="text-center py-12 glass rounded-2xl text-muted-foreground">No projects yet. Start capturing your thoughts!</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {projects.slice(0, 6).map(p => (
                        <div 
                          key={p.id} 
                          onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }} 
                          className="glass rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{p.title}</p>
                            {p.is_favorite && <Star className="h-4 w-4 fill-accent text-accent shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                            <Clock className="h-3.5 w-3.5" /> {formatDistanceToNow(new Date(p.created_at))} ago
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 1.5: THE PROJECTS LIBRARY */}
            {activeTab === "Projects" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold">Project Library</h1>
                    <p className="text-muted-foreground mt-2 text-lg">All your woven thoughts, organized.</p>
                  </div>
                  
                  {/* THE NEW SEARCH BAR */}
                  <div className="relative w-full sm:w-72 shrink-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search projects..."
                      className="pl-9 bg-background/50 border-primary/20 focus-visible:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Category: Favorites (Now uses 'filtered') */}
                {filtered.filter(p => p.is_favorite).length > 0 && (
                  <div>
                    <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                      <Star className="h-5 w-5 text-accent fill-accent"/> Favorites
                    </h2>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filtered.filter(p => p.is_favorite).map(p => (
                        <div key={p.id} className="glass rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors pr-6">{p.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                            <Clock className="h-3.5 w-3.5" /> {new Date(p.created_at).toLocaleDateString()}
                          </p>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteProjectClick(p.id); }} className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Category: All Projects (Now uses 'filtered') */}
                <div>
                  <h2 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-muted-foreground"/> All Projects
                  </h2>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12 glass rounded-2xl text-muted-foreground">
                      {query ? "No projects found matching your search." : "Your library is empty."}
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {filtered.map(p => (
                        <div key={p.id} className="glass rounded-xl p-5 cursor-pointer hover:border-primary/50 hover:shadow-glow transition group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-semibold text-lg truncate group-hover:text-primary transition-colors pr-6">{p.title}</p>
                            {p.is_favorite && <Star className="h-4 w-4 fill-accent text-accent shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-4">
                            <Clock className="h-3.5 w-3.5" /> {new Date(p.created_at).toLocaleDateString()}
                          </p>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteProjectClick(p.id); }} className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 2: PROJECTS (Mind Map & Voice Recorder) */}
            {activeTab === "Editor" && (
              <div className="h-[calc(100vh-6rem)] p-4 sm:p-6 grid gap-5 lg:grid-cols-[320px_1fr] animate-in fade-in">
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
                          {n.transcript && (
                            <div className="mt-3 bg-slate-900/40 rounded-lg p-3 text-xs leading-relaxed text-slate-300 border border-slate-800/50">
                              <p className="whitespace-pre-wrap">{n.transcript}</p>
                            </div>
                          )}
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
                    <div className="glass-strong rounded-2xl p-6 flex-1 flex flex-col min-h-0">
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
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteProjectClick(activeProject.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                            <Trash2 className="h-4 w-4 mr-1" /> Delete Project
                          </Button>
                          <span className="inline-flex items-center gap-1.5 glass rounded-full px-3 py-1 text-xs">
                            <Sparkles className="h-3 w-3 text-accent" /> AI Ready
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-h-0 relative">
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
                      <Button variant="hero" className="mt-6" onClick={handleNewProjectClick}>
                        <Plus className="h-4 w-4 mr-2" /> Create Project
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* VIEW 3: ECHO AI INSIGHTS */}
            {activeTab === "AI Insights" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 animate-in fade-in h-full flex flex-col">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold flex items-center gap-3">
                    <Sparkles className="h-8 w-8 text-accent" /> Echo AI
                  </h1>
                  <p className="text-muted-foreground mt-2 text-lg">Select a project to get an intelligent analysis of your thought patterns.</p>
                </div>

                <div className="grid md:grid-cols-[300px_1fr] gap-6 flex-1 min-h-0">
                  {/* Left Column: Project List */}
                  <div className="glass-strong rounded-2xl p-5 overflow-y-auto">
                    <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-4">Select Project</h3>
                    <div className="space-y-2">
                      {projects.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No projects available.</p>
                      ) : projects.map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleAnalyzeProject(p.id)}
                          className={`w-full text-left px-4 py-3 rounded-xl transition border ${
                            insightProjectId === p.id 
                              ? "bg-primary/20 border-primary/50 text-foreground shadow-glow" 
                              : "bg-background/50 border-transparent hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <p className="font-medium truncate">{p.title}</p>
                          <p className="text-xs opacity-70 mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: AI Analysis */}
                  <div className="glass rounded-2xl p-6 md:p-8 flex flex-col relative overflow-hidden">
                    {!insightProjectId ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
                        <Sparkles className="h-12 w-12 mb-4" />
                        <p>Echo AI is standing by.</p>
                      </div>
                    ) : isAnalyzing ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-primary font-medium animate-pulse">Echo AI is analyzing your map...</p>
                      </div>
                    ) : insightData ? (
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
                          dangerouslySetInnerHTML={{ __html: formatInsightText(insightData) }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: SETTINGS & PRICING */}
            {activeTab === "Settings" && (
              <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10 animate-in fade-in">
                <div>
                  <h1 className="text-3xl md:text-4xl font-display font-bold">Settings</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Manage your account and subscription.</p>
                </div>

                {/* Account Profile & Security */}
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Account Profile</h2>
                  <div className="grid md:grid-cols-2 gap-5">
                    
                    {/* Profile Card */}
                    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                      <div className="flex items-center gap-5 mb-6">
                        <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow shrink-0">
                          {userInitial}
                        </div>
                        <div>
                          <p className="text-xl font-bold text-foreground">{userName}</p>
                          <p className="text-sm text-muted-foreground">{user?.email}</p>
                          <div className="mt-2 inline-flex items-center gap-1.5 glass-strong rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-primary border border-primary/20">
                            <Sparkles className="h-3 w-3" /> Spark Plan
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <p className="text-sm font-medium">Rename Account</p>
                        <div className="flex gap-2">
                          <Input 
                            placeholder="New full name" 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)} 
                            className="bg-background/50"
                          />
                          <Button variant="secondary" onClick={handleUpdateName} disabled={isUpdatingAccount || !editName.trim()}>
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Security Card */}
                    <div className="glass rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-display font-semibold mb-1">Security</h3>
                        <p className="text-sm text-muted-foreground mb-4">Update your password here.</p>
                        <div className="space-y-3">
                          <Input 
                            type="password" 
                            placeholder="Current Password" 
                            value={oldPassword} 
                            onChange={(e) => setOldPassword(e.target.value)} 
                            className="bg-background/50"
                          />
                          <Input 
                            type="password" 
                            placeholder="New Password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            className="bg-background/50"
                          />
                        </div>
                      </div>
                      <Button variant="secondary" className="mt-4 w-full" onClick={handleChangePassword} disabled={isUpdatingAccount || !oldPassword || !newPassword}>
                        Change Password
                      </Button>
                    </div>

                  </div>
                </div>

                {/* Pricing & Subscription */}
                <div>
                  <h2 className="text-xl font-display font-bold mb-4">Subscription Plan</h2>
                  <div className="grid md:grid-cols-3 gap-5">
                    
                    {/* Spark (Current) */}
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

                    {/* Flow */}
                    <div className="glass-strong rounded-2xl p-6 flex flex-col border border-primary/40 shadow-glow relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-[10px] font-semibold px-3 py-1 rounded-full text-white uppercase tracking-wider whitespace-nowrap">
                        Most Popular
                      </div>
                      <h3 className="font-display text-xl font-semibold">Flow</h3>
                      <p className="text-sm text-muted-foreground mt-1">For makers shipping ideas weekly.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">$12</span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                      <ul className="mt-6 space-y-3 flex-1 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Unlimited voice notes</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Advanced AI mind maps</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Export to image & text</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Smart search</li>
                      </ul>
                      <Button variant="hero" className="mt-6 w-full" onClick={() => toast.info("Billing integration coming soon!")}>Upgrade to Flow</Button>
                    </div>

                    {/* Studio */}
                    <div className="glass rounded-2xl p-6 flex flex-col">
                      <h3 className="font-display text-xl font-semibold">Studio</h3>
                      <p className="text-sm text-muted-foreground mt-1">For teams building together.</p>
                      <div className="mt-4 flex items-baseline gap-1">
                        <span className="font-display text-4xl font-bold">$29</span>
                        <span className="text-xs text-muted-foreground">/ month</span>
                      </div>
                      <ul className="mt-6 space-y-3 flex-1 text-sm">
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Everything in Flow</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Team workspaces</li>
                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Shared mind maps</li>
                      </ul>
                      <Button variant="outline" className="mt-6 w-full" onClick={() => toast.info("Enterprise sales coming soon!")}>Talk to Sales</Button>
                    </div>

                  </div>
                </div>
                {/* Danger Zone */}
                <div className="pt-10">
                  <h2 className="text-xl font-display font-bold mb-4 text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" /> Danger Zone
                  </h2>
                  <div className="glass rounded-2xl p-6 border-destructive/20 bg-destructive/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-foreground">Delete Account</h3>
                      <p className="text-sm text-muted-foreground mt-1">Permanently delete your account, projects, and all voice notes. This cannot be undone.</p>
                    </div>
                    <Button variant="destructive" onClick={handleDeleteAccount} className="shrink-0">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        {/* --- CREATE PROJECT MODAL --- */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative glass-strong bg-background/80 border border-border p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-display font-semibold mb-2">Create New Project</h3>
            <p className="text-sm text-muted-foreground mb-4">Give your new creative space a name.</p>
            <Input 
              autoFocus
              placeholder="e.g., Marketing Campaign" 
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitNewProject()}
              className="mb-6 bg-background"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button variant="hero" onClick={submitNewProject} disabled={!newProjectTitle.trim()}>Create</Button>
            </div>
          </div>
        </div>
      )}
      {/* --- DELETE CONFIRMATION MODAL --- */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setProjectToDelete(null)} />
          <div className="relative glass-strong bg-background/80 border border-destructive/20 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-xl font-display font-semibold">Delete Project?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 mt-2">
              Are you sure you want to delete this project? This action cannot be undone, and all associated voice notes and mind maps will be permanently destroyed.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setProjectToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeleteProject}>Yes, Delete</Button>
            </div>
          </div>
        </div>
      )}
      </div>
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Dark background blur */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          
          {/* Sliding Drawer */}
          {/* Sliding Drawer */}
          <div className="relative w-72 max-w-[80%] bg-sidebar h-full flex flex-col border-r border-border shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="p-5 border-b border-sidebar-border flex justify-between items-center">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="p-3 space-y-1 text-sm">
              {[
                { icon: LayoutGrid, label: "Workspace" },
                { icon: FolderOpen, label: "Projects" },
                { icon: Sparkles, label: "AI Insights" },
                { icon: Settings, label: "Settings" },
              ].map((i) => (
                <button
                  key={i.label}
                  onClick={() => {
                    setActiveTab(i.label as any);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                    activeTab === i.label ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
                  }`}
                >
                  <i.icon className="h-4 w-4" /> {i.label}
                </button>
              ))}
            </nav>
            
            <div className="px-3 mt-4">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2">Projects</p>
              <div className="space-y-1 max-h-[60vh] overflow-auto">
                {projectsLoading ? (
                  <div className="px-3 py-2 space-y-2">
                    {[1,2,3].map(i => <div key={i} className="h-4 bg-muted animate-pulse rounded" />)}
                  </div>
                ) : projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setActiveId(p.id);
                      setActiveTab("Editor"); // Switch to projects when clicking in mobile menu!
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                      activeId === p.id && activeTab === "Editor" ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium">{p.title}</p>
                      {p.is_favorite && <Star className="h-3 w-3 fill-accent text-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-5 border-t border-sidebar-border flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-semibold text-primary-foreground">
                    {userInitial}
                  </div>
                  <p className="text-sm font-medium truncate">{userName}</p>
               </div>
               <button
                  onClick={() => { logout(); navigate({ to: "/" }); }}
                  className="p-2 rounded-md hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}