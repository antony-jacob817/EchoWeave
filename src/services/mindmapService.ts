import { supabase } from "@/lib/supabase";
import { AiNode } from "@/components/dashboard/MindMap";

export const mindmapService = {
  async saveMindMap(projectId: string, projectTitle: string, nodes: AiNode[]) {
    const { data: existing } = await supabase
      .from("mindmaps")
      .select("id")
      .eq("project_id", projectId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from("mindmaps")
        // THE FIX: Changed 'nodes: nodes' to 'mindmap_json: nodes'
        .update({ mindmap_json: nodes, title: projectTitle }) 
        .eq("id", existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from("mindmaps")
        // THE FIX: Changed 'nodes: nodes' to 'mindmap_json: nodes'
        .insert([{ project_id: projectId, title: projectTitle, mindmap_json: nodes }]);
      if (error) throw error;
    }
  },

  async getMindMap(projectId: string): Promise<AiNode[] | null> {
    const { data, error } = await supabase
      .from("mindmaps")
      // THE FIX: Select the correct column
      .select("mindmap_json") 
      .eq("project_id", projectId)
      .maybeSingle();

    if (error) {
      console.error("Supabase getMindMap error:", error);
      return null;
    }
    
    return data?.mindmap_json || null; 
  }
};