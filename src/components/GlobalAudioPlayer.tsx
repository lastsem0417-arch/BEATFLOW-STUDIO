import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalAudioPlayer() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, progress, togglePlayPause, seek } = useAudio();
  const [isHoveringBar, setIsHoveringBar] = useState(false);

  // Agar koi gaana select nahi hua hai, toh player hide rakho
  if (!currentTrack) return null;

  // 🔥 THE FIX: Get CURRENT LOGGED-IN USER'S ROLE, NOT the track's role 🔥
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userRole = currentUser.role?.toLowerCase() || 'producer';

  // 🔥 DYNAMIC PREMIUM THEME MAPPER (Hardcoded Hex to prevent Tailwind issues) 🔥
  const getTheme = (role: string) => {
    if (role === 'rapper') return { bg: 'bg-[#E63946]', text: 'text-[#E63946]', glow: 'shadow-[0_0_15px_#E63946]', hex: '#E63946' }; // Carmine Red
    if (role === 'lyricist') return { bg: 'bg-[#52B788]', text: 'text-[#52B788]', glow: 'shadow-[0_0_15px_#52B788]', hex: '#52B788' }; // Sage Green
    return { bg: 'bg-[#D4AF37]', text: 'text-[#D4AF37]', glow: 'shadow-[0_0_15px_#D4AF37]', hex: '#D4AF37' }; // Champagne Gold (Default)
  };

  const theme = getTheme(userRole);
  const coverImage = currentTrack.coverImage || currentTrack.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.creatorName || 'Beat'}`;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) seek(Number(e.target.value));
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-5xl z-[9999] pointer-events-none select-none"
      >
        
        {/* Inner Player Pill */}
        <div className="w-full bg-[#0A0A0C]/90 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] flex flex-col shadow-[0_30px_60px_rgba(0,0,0,0.9)] pointer-events-auto relative group transition-colors duration-500 hover:border-white/20">
          
          {/* 🔥 THE PREMIUM SCRUBBER (Dynamic Color) 🔥 */}
          <div 
            className="absolute top-0 left-0 w-full z-10"
            onMouseEnter={() => setIsHoveringBar(true)}
            onMouseLeave={() => setIsHoveringBar(false)}
          >
            <div className={`w-full bg-white/5 transition-all duration-300 relative ${isHoveringBar ? 'h-2' : 'h-1'}`}>
              
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress || 0} 
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
              />
              
              {/* Visible Glowing Progress Fill */}
              <div 
                className={`h-full ${theme.bg} ${theme.glow} transition-all duration-100 ease-linear rounded-r-full relative`} 
                style={{ width: `${progress}%` }}
              >
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-opacity duration-300 translate-x-1/2 pointer-events-none ${isHoveringBar ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 flex items-center justify-between w-full mt-1">
            
            {/* 🎵 LEFT: Track Info */}
            <div 
              onClick={() => currentTrack.creatorId && navigate(`/profile/${currentTrack.creatorId}`)}
              className="flex items-center gap-4 w-1/3 cursor-pointer p-2 -ml-2 rounded-xl transition-colors group/info hover:bg-white/[0.02]"
            >
              <div className={`relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-[#010101] transition-colors ${isPlaying ? `border-[${theme.hex}]` : 'group-hover/info:border-white/30'}`}>
                 <img src={coverImage} alt="Cover" className={`w-full h-full object-cover grayscale opacity-80 group-hover/info:grayscale-0 group-hover/info:opacity-100 transition-all duration-500 scale-110`} />
                 
                 {/* Live Audio Visualizer Overlay */}
                 {isPlaying && (
                   <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-[2px] backdrop-blur-[1px]">
                      <span className={`w-1 h-3 ${theme.bg} animate-[bounce_1s_infinite_0.1s]`}></span>
                      <span className={`w-1 h-5 ${theme.bg} animate-[bounce_1s_infinite_0.3s]`}></span>
                      <span className={`w-1 h-2 ${theme.bg} animate-[bounce_1s_infinite_0.5s]`}></span>
                   </div>
                 )}
              </div>
              <div className="flex flex-col truncate">
                <h4 className="text-[#F0F0EB] text-sm font-bold truncate group-hover/info:text-white transition-colors">
                  {currentTrack.title || 'Untitled Drop'}
                </h4>
                <p className={`text-[9px] uppercase tracking-widest ${theme.text} font-black truncate mt-1 flex items-center gap-1`}>
                  {currentTrack.creatorName || 'Unknown Entity'} 
                  {currentTrack.isVerified && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 ml-1"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                  )}
                </p>
              </div>
            </div>

            {/* 🎛️ CENTER: Play Controls */}
            <div className="flex items-center justify-center gap-6 w-1/3">
              <button className="text-[#888888] hover:text-[#F0F0EB] transition-colors active:scale-95">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} 
                className={`w-12 h-12 flex items-center justify-center rounded-full text-[#010101] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 ${isPlaying ? `${theme.bg} hover:scale-105` : 'bg-[#F0F0EB] hover:scale-105'}`}
                style={{ boxShadow: isPlaying ? `0 0 30px ${theme.hex}60` : '' }}
              >
                {isPlaying ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </button>
              
              <button className="text-[#888888] hover:text-[#F0F0EB] transition-colors active:scale-95">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
              </button>
            </div>

            {/* 🔊 RIGHT: Extra Actions */}
            <div className="flex items-center justify-end gap-5 w-1/3 pr-2">
              <div className="hidden md:flex flex-col items-end">
                 <span className="text-[8px] uppercase tracking-[0.3em] font-black text-[#888888] mb-1">Time</span>
                 <span className="text-xs font-mono text-[#F0F0EB]">{(progress || 0).toFixed(0)}%</span>
              </div>
              <button className={`text-[#888888] hover:${theme.text} transition-colors active:scale-95`}>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </button>
            </div>
          
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}