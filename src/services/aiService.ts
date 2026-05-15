import { supabase } from "@/lib/supabase";

// 1. Turned off Mock Mode for production
const MOCK_MODE = false; 

export const aiService = {
    async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (typeof reader.result === "string") {
                    const base64Data = reader.result.split(",")[1];
                    resolve(base64Data);
                } else {
                    reject(new Error("Failed to convert blob to base64"));
                }
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    },

    async generateMindMapFromAudio(audioBlob: Blob) {
        if (MOCK_MODE) {
            console.log("MOCK MODE ON: Skipping backend API call.");
            await new Promise(resolve => setTimeout(resolve, 2000));
            return {
                transcript: "This is a secure mock transcript to test the UI.",
                mindmap: [
                    { id: "root", label: "Secure App", parent: "" },
                    { id: "n1", label: "Frontend", parent: "root" },
                    { id: "n2", label: "Backend", parent: "root" }
                ]
            };
        }

        // SECURE PRODUCTION MODE: Route through your Backend
        const base64Audio = await this.blobToBase64(audioBlob);

        const response = await fetch('/api/generateMindmap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                audioData: base64Audio,
                mimeType: audioBlob.type || "audio/webm"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate mind map");
        }

        const data = await response.json();
        return data;
    },

    async generateProjectInsight(title: string, nodes: any[]) {
        if (MOCK_MODE) {
            console.log("MOCK MODE ON: Skipping real Gemini API call.");
            await new Promise(resolve => setTimeout(resolve, 1800));
            const topics = nodes.filter(n => n.id !== "root").slice(0, 4).map(n => n.label);
            return `**Echo AI Analysis for "${title}"**\n\n🎯 **Core Theme**\nYou are building a comprehensive strategy focused around ${topics.join(", ")}.\n\n🧠 **Structural Analysis**\n- Your main branches are well-defined and cover distinct channels.\n- The connection between ${topics[0]} and your end goal is very strong.\n\n⚡ **Actionable Next Step**\nRecord a quick 30-second voice note breaking down **${topics[1] || 'your next milestone'}** into three smaller, daily tasks.`;
        }

        // SECURE PRODUCTION MODE: Route through your Backend
        const response = await fetch('/api/generateInsight', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, nodes })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate insight");
        }

        const data = await response.json();
        return data.text;
    },

    // --- DATABASE PERSISTENCE FOR INSIGHTS ---
    async getSavedProjectInsight(projectId: string): Promise<string | null> {
      const { data, error } = await supabase
        .from("ai_generations")
        .select("output_text") 
        .eq("project_id", projectId)
        .eq("generation_type", "insight")
        .maybeSingle();

      if (error) return null;
      return data?.output_text || null; 
    },

    async saveProjectInsight(projectId: string, insightText: string) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("ai_generations")
        .upsert(
          {
            project_id: projectId,
            user_id: user.id,
            generation_type: "insight",
            output_text: insightText, 
          },
          { onConflict: "project_id,generation_type" }
        );

      if (error) throw error;
    }
};