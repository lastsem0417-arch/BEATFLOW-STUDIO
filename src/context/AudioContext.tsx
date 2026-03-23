import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

// 🔥 VITE ENV API URL FETCH 🔥
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface AudioContextType {
  currentTrack: any;
  isPlaying: boolean;
  progress: number;
  playTrack: (track: any) => void;
  togglePlayPause: () => void;
  seek: (percent: number) => void;
  audioRef: React.RefObject<HTMLAudioElement>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const AudioProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Update progress bar
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) { 
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => setIsPlaying(false);
    
    // 🚨 ROBUST ERROR HANDLING 🚨
    const handleError = (e: any) => {
      console.error("🚨 CRITICAL AUDIO ERROR 🚨");
      console.error("Failed URL:", audio.src);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded); 
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [currentTrack]);

  const playTrack = (track: any) => {
    let rawUrl = track.contentUrl || track.audioUrl || track.file || track.audio;

    if (!rawUrl || typeof rawUrl !== 'string' || rawUrl.trim() === '') {
        alert("System Alert: No valid audio asset found in this post. It might be text-only.");
        return; 
    }

    let safeUrl = rawUrl;

    // 🔥 1. WINDOWS BACKSLASH FIX 🔥
    safeUrl = safeUrl.replace(/\\/g, '/');

    // 🔥 2. THE ULTIMATE ROUTING FIX 🔥
    if (safeUrl.includes('cloudinary.com')) {
       // Cloudinary URL Logic
       if (/\.(mkv|webm|avi|mov|flv|ogg)$/i.test(safeUrl)) {
           safeUrl = safeUrl.replace(/\.(mkv|webm|avi|mov|flv|ogg)$/i, '.mp4');
       } else if (!/\.(mp4|mp3|wav|m4a|aac)$/i.test(safeUrl)) {
           safeUrl += '.mp4';
       }
    } else if (safeUrl.includes('uploads/')) {
       // 🔥 EXTRACT PURE PATH (Ignores all DB Garbage like localhost:5000 or import.meta) 🔥
       const uploadIndex = safeUrl.indexOf('uploads/');
       let purePath = safeUrl.substring(uploadIndex);
       
       // Encode spaces so songs like "For youuuu" or "Kora Kagaz" work perfectly
       purePath = encodeURI(purePath);
       
       const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
       safeUrl = `${baseUrl}/${purePath}`;
    } else {
       // Fallback space encoding
       safeUrl = encodeURI(safeUrl);
    }

    console.log("🔊 FINAL PLAY URL:", safeUrl);

    const safeTrack = { ...track, contentUrl: safeUrl };

    if (currentTrack?._id === safeTrack._id) {
      togglePlayPause();
      return;
    }

    setCurrentTrack(safeTrack);
    setIsPlaying(true);
    
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => {
            console.error("Playback error:", err);
            setIsPlaying(false);
        });
      }
    }, 50); 
  };

  const togglePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const seek = (percent: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (percent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(percent);
    }
  };

  return (
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, playTrack, togglePlayPause, seek, audioRef }}>
      <audio ref={audioRef} src={currentTrack?.contentUrl} className="hidden" />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext)!;