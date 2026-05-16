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
  const [dark, setDark] = useState(true);
  
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

  // Account Deletion Modal State
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const [deleteAccountConfirmInput, setDeleteAccountConfirmInput] = useState("");

  // The AI Memory State
  const [mapNodes, setMapNodes] = useState<AiNode[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  useEffect(() => {
    if (activeTab === "AI Insights" && activeId && insightProjectId !== activeId) {
      handleAnalyzeProject(activeId, false);
    }
  }, [activeTab, activeId]);

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

  const handleDeleteAccountClick = () => {
    setDeleteAccountConfirmInput("");
    setIsDeleteAccountModalOpen(true);
  };

  const confirmDeleteAccount = async () => {
    if (deleteAccountConfirmInput !== "DELETE") return;
    
    try {
      await authService.deleteAccount();
      navigate({ to: "/" });
      toast.success("Account deleted successfully.");
    } catch (error: any) {
      toast.error("Failed to delete account.");
    } finally {
      setIsDeleteAccountModalOpen(false);
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
  const handleAnalyzeProject = async (projectId: string, forceRefresh: boolean = false) => {
    setInsightProjectId(projectId);
    setIsAnalyzing(true);
    
    // Clear the screen if we are forcing a new generation
    if (forceRefresh) {
      setInsightData(null);
    }

    try {
      // 1. Only check the database if we are NOT forcing a refresh
      if (!forceRefresh) {
        const savedInsight = await aiService.getSavedProjectInsight(projectId);
        if (savedInsight) {
          setInsightData(savedInsight);
          setIsAnalyzing(false);
          return;
        }
      }

      // 2. Fallback or Forced: Generate a fresh analysis via Gemini
      const nodes = await mindmapService.getMindMap(projectId);
      const project = projects.find(p => p.id === projectId);

      if (!nodes || nodes.length <= 1) {
        setInsightData("Echo AI needs more context. Try recording a voice note and building a mind map for this project first!");
        setIsAnalyzing(false);
        return;
      }

      const aiResponseText = await aiService.generateProjectInsight(project?.title || "Untitled", nodes);
      
      // 3. Persist to database (This automatically OVERWRITES the old one!)
      await aiService.saveProjectInsight(projectId, aiResponseText);
      
      setInsightData(aiResponseText);
      
      // Give the user a nice success message if they forced the refresh
      if (forceRefresh) toast.success("New insight generated and saved!");
      
    } catch (error) {
      console.error("AI Insights optimization failed:", error);
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
    // 1. RESTORED LANDING PAGE BACKGROUND: Changed to bg-transparent
    <div className="h-screen w-full flex flex-col md:flex-row bg-transparent text-foreground overflow-hidden relative md:p-4 md:gap-4">
      
      {/* Ambient Glows to enhance the background */}
      <div className="pointer-events-none absolute -top-40 -left-20 h-[600px] w-[800px] rounded-full bg-primary/20 blur-[120px] -z-10" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-[600px] w-[600px] rounded-full bg-accent/15 blur-[130px] -z-10" />

      {!user?.email_confirmed_at && (
        <div className="absolute top-0 inset-x-0 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-3 text-xs text-amber-500 animate-in fade-in z-50">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Please confirm your email address to unlock all features. Check your inbox!</span>
          <button className="font-semibold underline hover:opacity-80 ml-2">Resend Link</button>
        </div>
      )}
      
      {/* 2. THE HOVER-EXPANDING SIDEBAR */}
      {/* Outer Wrapper: Locks the space to 88px so expanding doesn't push the main content */}
      <div className="hidden md:block w-[88px] shrink-0 h-full relative z-50">
        <aside className="absolute top-0 left-0 h-full w-[88px] hover:w-[260px] flex flex-col group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-3xl shadow-[8px_0_32px_-12px_rgba(0,0,0,0.5)] text-sidebar-foreground transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden">
          
          {/* Inner Wrapper: Locked to 260px so text never wraps or squishes during the animation */}
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
                  {/* Text fades in on hover */}
                  <span className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    {i.label}
                  </span>
                </button>
              ))}
            </nav>

            {/* Projects list only appears when expanded */}
            <div className="px-4 mt-2 flex-1 relative z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 mb-3 font-semibold">Your Projects</p>
              <div className="space-y-1 max-h-[35vh] overflow-y-auto pr-2 scrollbar-thin">
                {projectsLoading ? (
                   <div className="px-3 py-2 space-y-3">
                     {[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 animate-pulse rounded-xl" />)}
                   </div>
                ) : projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { 
                      setActiveId(p.id);
                      setActiveTab("Editor");
                      setIsMobileMenuOpen(false); 
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs transition-all ${
                      activeId === p.id && activeTab === "Editor" 
                        ? "bg-white/10 text-foreground font-medium" 
                        : "hover:bg-white/5 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate pr-2">{p.title}</p>
                      {p.is_favorite && <Star className="h-3 w-3 fill-accent text-accent shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-4 relative z-10">
              <div className="flex items-center pl-2 py-2 cursor-pointer hover:bg-white/5 rounded-2xl transition border border-transparent hover:border-white/5">
                <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-white shadow-glow shrink-0">
                  {userInitial}
                </div>
                {/* Profile text fades in on hover */}
                <div className="ml-3 min-w-0 flex-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); logout(); navigate({ to: "/" }); }}
                  className="mr-2 p-2 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all duration-300 shrink-0"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* 3. MAIN CONTENT CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0 md:rounded-3xl border-0 md:border border-white/10 bg-white/[0.02] backdrop-blur-xl shadow-2xl overflow-hidden relative z-10">
        
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
                  <Button variant="glass" size="sm" disabled={!activeProject} className="rounded-full px-4 border-white/10">
                    <Download className="h-4 w-4 sm:mr-2 text-muted-foreground" /> 
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem onClick={exportAsImage} className="cursor-pointer rounded-lg">Export as PNG</DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer rounded-lg">Export as PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="hero" size="sm" onClick={handleNewProjectClick} className="rounded-full px-5 shadow-glow ml-2">
              <Plus className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline font-semibold">New Project</span>
            </Button>
          </div>
        </header>

        {/* 4. RESTORED SCROLLBARS: Added overflow-y-auto here */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent relative z-0 p-4 sm:p-6 lg:p-8">
          
          {/* VIEW 1: WORKSPACE OVERVIEW */}
          {activeTab === "Workspace" && (
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 h-full flex flex-col">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">Welcome back, {userName}</h1>
                <p className="text-muted-foreground mt-3 text-lg">Here is a snapshot of your creative environment.</p>
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
                  <p className="text-5xl font-display font-bold text-foreground">{projects.length}</p>
                </div>

                <div className="relative overflow-hidden glass rounded-3xl p-7 border-white/5 hover:border-accent/30 transition-all duration-300 group">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-500"></div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-medium text-muted-foreground">Favorited</p>
                    <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center text-accent border border-accent/20">
                      <Star className="h-5 w-5"/>
                    </div>
                  </div>
                  <p className="text-5xl font-display font-bold text-foreground">{projects.filter(p => p.is_favorite).length}</p>
                </div>

                <div className="relative overflow-hidden glass rounded-3xl p-7 flex flex-col justify-center items-center text-center border-dashed border-2 border-white/10 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all duration-300 group" onClick={handleNewProjectClick}>
                  <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="font-semibold text-lg">Create New Project</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-display font-bold mb-6">Recent Activity</h2>
                {projects.length === 0 ? (
                   <div className="text-center py-16 glass rounded-3xl text-muted-foreground border-dashed border-white/10">No projects yet. Start capturing your thoughts!</div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 mb-12 gap-5">
                    {projects.slice(0, 6).map(p => (
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
                          {p.is_favorite && <Star className="h-4 w-4 fill-accent text-accent" />}
                        </div>
                        <p className="font-semibold text-xl truncate mb-1 relative z-10">{p.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 relative z-10">
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
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10 h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl font-display font-bold tracking-tight">Project Library</h1>
                  <p className="text-muted-foreground mt-2 text-lg">Search and manage your woven thoughts.</p>
                </div>
                
                <div className="relative w-full sm:w-80 shrink-0">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search all projects..."
                    className="pl-11 h-12 rounded-full bg-white/5 border-white/10 focus-visible:ring-primary/50 text-base"
                  />
                </div>
              </div>

              {filtered.filter(p => p.is_favorite).length > 0 && (
                <div>
                  <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                    <Star className="h-5 w-5 text-accent fill-accent"/> Favorites
                  </h2>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {filtered.filter(p => p.is_favorite).map(p => (
                      <div key={p.id} className="glass rounded-3xl p-6 cursor-pointer border border-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <Star className="h-4 w-4 text-accent fill-accent" />
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProjectClick(p.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-xl transition">
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                        <p className="font-semibold text-xl truncate mb-1">{p.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h2 className="text-xl font-display font-bold mb-5 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-muted-foreground"/> All Projects
                </h2>
                {filtered.length === 0 ? (
                  <div className="text-center py-16 glass rounded-3xl text-muted-foreground border-dashed border-white/10">
                    {query ? "No projects found matching your search." : "Your library is empty."}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 mb-12 gap-5">
                    {filtered.map(p => (
                      <div key={p.id} className="glass rounded-3xl p-6 cursor-pointer border border-white/5 hover:border-primary/40 hover:-translate-y-1 hover:shadow-glow transition-all duration-300 group relative" onClick={() => { setActiveId(p.id); setActiveTab("Editor"); }}>
                        <div className="flex justify-between items-start mb-4">
                           <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                              <FolderOpen className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                           </div>
                           <button onClick={(e) => { e.stopPropagation(); handleDeleteProjectClick(p.id); }} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-xl transition">
                             <Trash2 className="h-4 w-4" />
                           </button>
                        </div>
                        <p className="font-semibold text-xl truncate mb-1">{p.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {new Date(p.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 2: PROJECTS (Mind Map & Voice Recorder) */}
          {activeTab === "Editor" && (
            <div className="flex flex-col lg:grid gap-6 lg:grid-cols-[340px_1fr] lg:h-full animate-in fade-in zoom-in-[0.99] duration-300">
              {/* Left column - Voice Recorder */}
              <div className="space-y-6 shrink-0 lg:overflow-y-auto lg:pr-2 scrollbar-thin">
                <VoiceRecorder onComplete={onRecordingComplete} />
                <div className="glass rounded-3xl p-6 border-white/5">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Recent Recordings</p>
                    <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{voiceNotes.length}</span>
                  </div>
                  <div className="space-y-3">
                    {notesLoading ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
                    ) : voiceNotes.map((n) => (
                      <div key={n.id} className="group rounded-2xl p-4 transition border border-white/5 bg-white/[0.02] hover:bg-white/5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                                <Mic className="h-3 w-3 text-primary" />
                              </div>
                              <p className="text-sm font-semibold truncate">Recording {n.id.slice(0, 4)}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 ml-8">
                              {formatDistanceToNow(new Date(n.created_at))} ago · {n.duration_seconds}s
                            </p>
                          </div>
                          <button onClick={() => deleteVoiceNote(n.id)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <audio src={n.audio_url} controls className="w-full h-8 mt-4 rounded-full opacity-80" />
                        {n.transcript && (
                          <div className="mt-4 bg-black/40 rounded-xl p-4 text-xs leading-relaxed text-slate-300 border border-white/5">
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
              <div className="flex flex-col min-w-0 h-[600px] lg:h-auto">
                {activeProject ? (
                  <div className="glass-strong rounded-3xl p-2 flex-1 flex flex-col min-h-0 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    <div className="flex items-start justify-between gap-4 p-5 pb-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <h2 className="text-2xl font-bold font-display">{activeProject.title}</h2>
                          <button onClick={() => toggleFavorite(activeProject.id, !!activeProject.is_favorite)} className="p-1.5 hover:bg-white/10 rounded-full transition">
                            <Star className={`h-5 w-5 ${activeProject.is_favorite ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {new Date(activeProject.created_at).toLocaleDateString()} · {voiceNotes.length} voice notes
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProjectClick(activeProject.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10 hidden sm:flex rounded-full">
                          <Trash2 className="h-4 w-4 mr-1.5" /> Delete
                        </Button>
                        <span className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent rounded-full px-4 py-1.5 text-xs font-semibold">
                          <Sparkles className="h-3 w-3" /> AI Ready
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-h-0 relative mt-2 rounded-2xl overflow-hidden border border-white/5 mx-2 mb-2 bg-[#0b0f19]">
                      <MindMap 
                        aiNodes={mapNodes.length > 0 ? mapNodes : defaultNodes} 
                        onUpdateNode={handleUpdateNode}
                        onDeleteNodes={handleDeleteNodes}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="glass-strong rounded-3xl p-6 flex-1 flex flex-col items-center justify-center text-center border-white/10">
                    <LayoutGrid className="h-16 w-16 text-muted-foreground mb-6 opacity-20" />
                    <h2 className="text-2xl font-semibold font-display">No project selected</h2>
                    <p className="text-muted-foreground mt-3 max-w-sm text-lg">
                      Create a new project or select one from the library to start weaving your ideas.
                    </p>
                    <Button variant="hero" size="lg" className="mt-8 rounded-full px-8 shadow-glow" onClick={handleNewProjectClick}>
                      <Plus className="h-5 w-5 mr-2" /> Create Project
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: ECHO AI INSIGHTS */}
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
                    {projects.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No projects available.</p>
                    ) : projects.map(p => (
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
                        <p className="text-xs opacity-70 mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
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
                    <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500 overflow-y-auto pr-2 scrollbar-thin">
                      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                        <div className="h-14 w-14 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                          <Sparkles className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-2xl font-display">Echo AI</p>
                          <p className="text-sm text-accent font-medium mt-1">Analysis Complete</p>
                        </div>
                      </div>
                      <div
                        className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-base space-y-4"
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
                        <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
                        <div className="mt-3 inline-flex items-center gap-1.5 glass-strong rounded-full px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-primary border border-primary/20">
                          <Sparkles className="h-3 w-3" /> Spark Plan
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <p className="text-sm font-medium">Rename Account</p>
                      <div className="flex gap-3">
                        <Input 
                          placeholder="New full name" 
                          value={editName} 
                          onChange={(e) => setEditName(e.target.value)} 
                          className="bg-white/5 border-white/10 rounded-xl h-11"
                        />
                        <Button variant="secondary" className="rounded-xl h-11 px-6" onClick={handleUpdateName} disabled={isUpdatingAccount || !editName.trim()}>
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="glass rounded-3xl p-8 flex flex-col justify-between border-white/5">
                    <div>
                      <h3 className="text-lg font-display font-semibold mb-2">Security</h3>
                      <p className="text-sm text-muted-foreground mb-6">Update your password here.</p>
                      <div className="space-y-4">
                        <Input type="password" placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-white/5 border-white/10 rounded-xl h-11" />
                        <Input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 rounded-xl h-11" />
                      </div>
                    </div>
                    <Button variant="secondary" className="mt-6 w-full rounded-xl h-11" onClick={handleChangePassword} disabled={isUpdatingAccount || !oldPassword || !newPassword}>
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
              <div className="pt-6">
                <div className="glass rounded-3xl p-8 border-destructive/30 bg-destructive/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-display font-bold text-destructive flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5" /> Danger Zone
                    </h2>
                    <p className="text-sm text-muted-foreground max-w-md">Permanently delete your account, projects, and all voice notes. This action cannot be reversed.</p>
                  </div>
                  <Button variant="destructive" size="lg" onClick={handleDeleteAccountClick} className="shrink-0 rounded-xl">
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
      {/* --- FULLY CUSTOM ACCOUNT DELETION CONFIRMATION MODAL --- */}
      {isDeleteAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" onClick={() => setIsDeleteAccountModalOpen(false)} />
          <div className="relative glass-strong bg-background/80 border border-destructive/20 p-6 rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 z-50">
            <div className="flex items-center gap-3 mb-2 text-destructive">
              <AlertCircle className="h-6 w-6" />
              <h3 className="text-xl font-display font-semibold">Delete Account?</h3>
            </div>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              DANGER: Are you absolutely sure you want to delete your account? All maps, notes, and profile spaces will be lost forever.
            </p>
            <p className="text-sm text-muted-foreground mt-4 mb-2">
              Please type <strong className="text-destructive font-bold">DELETE</strong> to authorize this operation:
            </p>
            <Input 
              placeholder="DELETE" 
              value={deleteAccountConfirmInput}
              onChange={(e) => setDeleteAccountConfirmInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && deleteAccountConfirmInput === 'DELETE' && confirmDeleteAccount()}
              className="mb-6 bg-white/5 border-white/10 rounded-xl h-11 text-center font-mono uppercase tracking-widest text-white focus-visible:ring-destructive/50"
            />
            <div className="flex justify-end gap-3">
              <Button variant="ghost" className="rounded-xl" onClick={() => setIsDeleteAccountModalOpen(false)}>Cancel</Button>
              <Button 
                variant="destructive" 
                className="rounded-xl px-6 font-medium shadow-glow shadow-destructive/20" 
                onClick={confirmDeleteAccount} 
                disabled={deleteAccountConfirmInput !== "DELETE"}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 5. UPDATED MOBILE MENU (Deep frosted glass) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative w-72 max-w-[85%] bg-[#0B0F19]/95 backdrop-blur-3xl h-full flex flex-col border-r border-white/10 shadow-2xl animate-in slide-in-from-left-full duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <Logo />
              <Button variant="ghost" size="icon" className="hover:bg-white/10 rounded-full" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
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
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition ${
                    activeTab === i.label ? "bg-primary/20 text-primary font-medium" : "hover:bg-white/5 text-muted-foreground"
                  }`}
                >
                  <i.icon className="h-5 w-5" /> {i.label}
                </button>
              ))}
            </nav>
            
            <div className="px-4 mt-2 flex-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-4 mb-3 font-semibold">Projects</p>
              <div className="space-y-1 max-h-[50vh] overflow-y-auto scrollbar-thin">
                {projectsLoading ? (
                  <div className="px-4 py-2 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 animate-pulse rounded-xl" />)}
                  </div>
                ) : projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setActiveId(p.id); setActiveTab("Editor"); setIsMobileMenuOpen(false); }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition ${
                      activeId === p.id && activeTab === "Editor" ? "bg-white/10 text-foreground font-medium" : "hover:bg-white/5 text-muted-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="truncate font-medium">{p.title}</p>
                      {p.is_favorite && <Star className="h-4 w-4 fill-accent text-accent" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto p-4 border-t border-white/5 flex justify-between items-center bg-black/20">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold text-primary-foreground shadow-glow">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{userName}</p>
                  </div>
               </div>
               <button
                  onClick={() => { logout(); navigate({ to: "/" }); }}
                  className="p-3 rounded-xl hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition"
                >
                  <LogOut className="h-5 w-5" />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}