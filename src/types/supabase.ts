export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_favorite: boolean;
  created_at: string;
}

export interface VoiceNote {
  id: string;
  project_id: string;
  user_id: string;
  audio_url: string;
  duration_seconds: number;
  transcription_status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  plan: string;
  created_at: string;
}
