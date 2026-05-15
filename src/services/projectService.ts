import { supabase } from "@/lib/supabase";

export const projectService = {
  async getProjects() {
    // 1. Explicitly verify session before fetching
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth Error in getProjects:", authError);
      throw new Error("User not authenticated");
    }

    // 2. Explicitly filter by user_id (safety net for RLS)
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Supabase getProjects error:", error);
      throw error;
    }
    
    // Always return an array to prevent .map() crashes in the UI
    return data || []; 
  },

  async createProject(title: string, description: string = "") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("Creating project for user:", user.id); // Debug log

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id: user.id,
          title,
          description,
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase createProject error:", error);
      throw error;
    }
    return data;
  },

  async deleteProject(id: string) {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Supabase deleteProject error:", error);
      throw error;
    }
  },

  async toggleFavorite(id: string, isFavorite: boolean) {
    const { error } = await supabase
      .from("projects")
      .update({ is_favorite: isFavorite })
      .eq("id", id);
    
    if (error) {
      console.error("Supabase toggleFavorite error:", error);
      throw error;
    }
  }
};