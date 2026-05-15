import { create } from "zustand";
import { voiceNoteService } from "@/services/voiceNoteService";

interface RecordingState {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
  startRecording: () => void;
  stopRecording: (blob: Blob, duration: number) => void;
  resetRecording: () => void;
  uploadRecording: (projectId: string) => Promise<any>;
}

export const useRecordingStore = create<RecordingState>((set, get) => ({
  isRecording: false,
  duration: 0,
  audioBlob: null,
  audioUrl: null,

  startRecording: () => set({ isRecording: true, duration: 0, audioBlob: null, audioUrl: null }),
  
  stopRecording: (blob: Blob, duration: number) => {
    const url = URL.createObjectURL(blob);
    set({ isRecording: false, audioBlob: blob, audioUrl: url, duration });
  },

  resetRecording: () => {
    const { audioUrl } = get();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    set({ isRecording: false, duration: 0, audioBlob: null, audioUrl: null });
  },

  uploadRecording: async (projectId: string) => {
    const { audioBlob, duration } = get();
    if (!audioBlob) throw new Error("No recording found");

    const fileName = `${Date.now()}.webm`;
    const publicUrl = await voiceNoteService.uploadAudio(audioBlob, fileName);
    const voiceNote = await voiceNoteService.saveVoiceNote(projectId, publicUrl, duration);
    
    return voiceNote;
  },
}));
