import { create } from "zustand";
import { projectService } from "@/services/projectService";

interface Project {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_favorite?: boolean;
}

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: () => Promise<void>;
  addProject: (title: string, description?: string) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  toggleFavorite: (id: string, currentStatus: boolean) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  fetchProjects: async () => {
    set({ loading: true });
    try {
      const projects = await projectService.getProjects();
      set({ projects, loading: false });
    } catch (error) {
      console.error("Error fetching projects:", error);
      set({ loading: false });
    }
  },
  addProject: async (title: string, description?: string) => {
    try {
      const newProject = await projectService.createProject(title, description);
      set((state) => ({ projects: [newProject, ...state.projects] }));
      return newProject;
    } catch (error) {
      console.error("Error adding project in store:", error);
      throw error;
    }
  },
  removeProject: async (id: string) => {
    // Optimistic update
    const previousProjects = get().projects;
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
    }));
    try {
      await projectService.deleteProject(id);
    } catch (error) {
      console.error("Error deleting project:", error);
      set({ projects: previousProjects });
      throw error;
    }
  },
  toggleFavorite: async (id: string, currentStatus: boolean) => {
    // Optimistic update
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, is_favorite: !currentStatus } : p
      ),
    }));
    try {
      await projectService.toggleFavorite(id, !currentStatus);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert on error
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? { ...p, is_favorite: currentStatus } : p
        ),
      }));
    }
  },
}));
