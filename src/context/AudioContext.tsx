import React, { createContext, useState, useContext, useRef, useEffect } from 'react';

// 🔥 1. INTERFACE MEIN 'seek' ADD KIYA
interface AudioContextType {
  currentTrack: any;
  isPlaying: boolean;
  progress: number;
  playTrack: (track: any) => void;
  togglePlayPause: () => void;
  seek: (percent: number) => void; // Naya function
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
      if (audio.duration) { // Safe check taaki NaN error na aaye
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded); // Gaana khatam
    
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const playTrack = (track: any) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.error("Playback error:", err));
      }
    }, 50); // Thoda delay taaki audio source load ho jaye
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

  // 🔥 2. NAYA FUNCTION: Gaane ko scrub (aage-peeche) karne ke liye
  const seek = (percent: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (percent / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
      setProgress(percent);
    }
  };

  return (
    // 🔥 3. PROVIDER MEIN 'seek' EXPORT KIYA
    <AudioContext.Provider value={{ currentTrack, isPlaying, progress, playTrack, togglePlayPause, seek, audioRef }}>
      {/* Hidden Audio Element - Yehi asaliyat me bajega */}
      <audio ref={audioRef} src={currentTrack?.contentUrl} className="hidden" />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext)!;