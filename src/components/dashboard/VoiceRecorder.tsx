import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useRecordingStore } from "@/store/useRecordingStore";
import { Button } from "@/components/ui/button";

export function VoiceRecorder({ onComplete }: { onComplete: (blob: Blob, duration: number) => void }) {
  const { isRecording, startRecording, stopRecording, audioUrl, resetRecording } = useRecordingStore();
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stopRecording(blob, seconds);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      startRecording();
      setSeconds(0);
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Voice capture</p>
          <p className="font-display font-semibold mt-0.5">
            {isRecording ? "Listening…" : audioUrl ? "Recording complete" : "Ready when you are"}
          </p>
        </div>
        <p className="font-mono text-sm tabular-nums">{fmt(seconds)}</p>
      </div>

      {!audioUrl ? (
        <>
          <div className="flex items-end justify-center gap-1 h-16 mb-4">
            {Array.from({ length: 32 }).map((_, i) => (
              <motion.span
                key={i}
                className="w-1 rounded-full bg-gradient-to-t from-primary to-accent"
                animate={isRecording ? { height: [6, 24 + (i % 5) * 6, 10, 32, 8] } : { height: 6 }}
                transition={{ duration: 1.2, repeat: isRecording ? Infinity : 0, delay: i * 0.04, ease: "easeInOut" }}
                style={{ height: 6 }}
              />
            ))}
          </div>

          <button
            onClick={isRecording ? stop : start}
            className={`w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition ${
              isRecording
                ? "bg-destructive text-destructive-foreground"
                : "bg-gradient-primary text-primary-foreground shadow-glow hover:opacity-95"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="h-4 w-4" /> Stop recording
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" /> Start recording
              </>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <audio 
            ref={audioRef} 
            src={audioUrl} 
            onEnded={() => setIsPlaying(false)} 
            className="hidden" 
          />
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="flex-1" onClick={togglePlayback}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <span className="ml-2">{isPlaying ? "Pause" : "Preview"}</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => { resetRecording(); setSeconds(0); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            className="w-full bg-gradient-primary text-primary-foreground shadow-glow"
            onClick={() => {
              const { audioBlob, duration } = useRecordingStore.getState();
              if (audioBlob) onComplete(audioBlob, duration);
            }}
          >
            Upload & Transcribe
          </Button>
        </div>
      )}
    </div>
  );
}
