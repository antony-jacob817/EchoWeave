import { supabase } from "@/lib/supabase";

export const voiceNoteService = {
  async uploadAudio(blob: Blob, fileName: string) {
    const { data, error } = await supabase.storage
      .from("audio-recordings")
      .upload(fileName, blob, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("audio-recordings")
      .getPublicUrl(fileName);

    return publicUrl;
  },

  async updateTranscript(noteId: string, transcriptText: string) {
    const { error } = await supabase
      .from("voice_notes")
      .update({ transcript: transcriptText })
      .eq("id", noteId);
      
    if (error) {
      console.error("Error saving transcript:", error);
      throw error;
    }
  },

  async saveVoiceNote(projectId: string, audioUrl: string, durationSeconds: number) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("voice_notes")
      .insert([
        {
          project_id: projectId,
          user_id: user.id,
          audio_url: audioUrl,
          duration_seconds: durationSeconds,
          transcription_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getVoiceNotes(projectId: string) {
    const { data, error } = await supabase
      .from("voice_notes")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteVoiceNote(id: string) {
    const { error } = await supabase
      .from("voice_notes")
      .delete()
      .eq("id", id);
    
    if (error) throw error;
  }
};
