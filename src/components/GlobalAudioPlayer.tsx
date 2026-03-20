import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalAudioPlayer() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, progress, togglePlayPause, seek } = useAudio();
  const [isHoveringBar, setIsHoveringBar] = useState(false);

  // Hide player if no track is selected
  if (!currentTrack) return null;

  // 🔥 DYNAMIC PREMIUM THEME MAPPER (Based on Logged In User) 🔥
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userRole = currentUser.role?.toLowerCase() || 'listener';

  const getTheme = (role: string) => {
    if (role === 'rapper') return { hex: '#E63946', bg: 'bg-[#E63946]', shadow: 'rgba(230,57,70,0.4)' }; // Crimson
    if (role === 'lyricist') return { hex: '#10B981', bg: 'bg-[#10B981]', shadow: 'rgba(16,185,129,0.4)' }; // Emerald
    if (role === 'producer') return { hex: '#D4AF37', bg: 'bg-[#D4AF37]', shadow: 'rgba(212,175,55,0.4)' }; // Gold
    return { hex: '#2563EB', bg: 'bg-[#2563EB]', shadow: 'rgba(37,99,235,0.4)' }; // Listener Blue
  };

  const theme = getTheme(userRole);
  const coverImage = currentTrack.coverImage || currentTrack.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentTrack.creatorName || 'Beatflow'}`;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) seek(Number(e.target.value));
  };

  const formatTime = (percent: number) => {
    // Simplified format, just returning % for aesthetic, could be converted to MM:SS if track length is known
    return `${Math.floor(percent || 0)}%`; 
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 150, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 150, opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 30, stiffness: 250, mass: 1 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl z-[9999] pointer-events-none select-none font-sans"
      >
        
        {/* 🎛️ THE FLOATING GLASS PILL */}
        <div className="w-full bg-[#050505]/80 backdrop-blur-3xl border border-white/10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] pointer-events-auto relative overflow-hidden transition-all duration-500 hover:border-white/20 group/player">
          
          {/* Subtle Dynamic Top Glow */}
          <div 
             className="absolute top-[-50%] left-1/2 -translate-x-1/2 w-64 h-32 blur-[60px] rounded-full pointer-events-none opacity-20 transition-colors duration-1000"
             style={{ backgroundColor: theme.hex }}
          ></div>

          {/* 🔥 THE PREMIUM SCRUBBER 🔥 */}
          <div 
            className="absolute top-0 left-0 w-full z-10 cursor-pointer"
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
              
              {/* Glowing Progress Fill */}
              <div 
                className={`h-full transition-all duration-100 ease-linear relative rounded-r-full`} 
                style={{ width: `${progress}%`, backgroundColor: theme.hex, boxShadow: `0 0 15px ${theme.hex}` }}
              >
                {/* Glowing Thumb Handle */}
                <div 
                   className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_0_10px_white] transition-all duration-300 translate-x-1/2 pointer-events-none ${isHoveringBar ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                ></div>
              </div>
            </div>
          </div>

          {/* 🎛️ PLAYER CONTROLS & INFO */}
          <div className="px-6 md:px-8 py-4 flex items-center justify-between w-full h-[88px] relative z-10">
            
            {/* 🎵 LEFT: Track Identity */}
            <div 
              onClick={() => currentTrack.creatorId && navigate(`/profile/${currentTrack.creatorId}`)}
              className="flex items-center gap-4 w-[30%] md:w-[35%] cursor-pointer group/info transition-all duration-300 rounded-2xl p-1.5 -ml-1.5 hover:bg-white/[0.04]"
            >
              {/* Cover Art */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-sm bg-black">
                 <img 
                   src={coverImage} 
                   alt="Cover" 
                   className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-110 opacity-90' : 'scale-100 grayscale opacity-60 group-hover/info:grayscale-0 group-hover/info:opacity-100'}`} 
                 />
                 
                 {/* Live Audio Visualizer Overlay */}
                 {isPlaying && (
                   <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center gap-1">
                      <span className="w-1 h-3 rounded-full animate-[bounce_1s_infinite_0.1s]" style={{ backgroundColor: theme.hex }}></span>
                      <span className="w-1 h-5 rounded-full animate-[bounce_1s_infinite_0.3s]" style={{ backgroundColor: theme.hex }}></span>
                      <span className="w-1 h-2 rounded-full animate-[bounce_1s_infinite_0.5s]" style={{ backgroundColor: theme.hex }}></span>
                   </div>
                 )}
              </div>

              {/* Text Info */}
              <div className="flex flex-col min-w-0">
                <h4 className="text-white text-[15px] font-serif italic truncate tracking-tight transition-colors group-hover/info:text-white mb-0.5" style={{ color: isPlaying ? theme.hex : 'white' }}>
                  {currentTrack.title || 'Untitled Signal'}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-white/50 font-black font-mono truncate">
                    {currentTrack.creatorName || 'Unknown Entity'}
                  </p>
                  {currentTrack.isVerified && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill={theme.hex} className="shrink-0"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>
                  )}
                </div>
              </div>
            </div>

            {/* 🎛️ CENTER: Playback Mechanics */}
            <div className="flex items-center justify-center gap-8 w-[40%] md:w-[30%]">
              <button className="text-white/30 hover:text-white transition-colors active:scale-95 hidden sm:block">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
              </button>
              
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlayPause(); }} 
                className="w-14 h-14 flex items-center justify-center rounded-full border transition-all duration-500 active:scale-95 group/playbtn shrink-0"
                style={{ 
                  backgroundColor: isPlaying ? theme.hex : 'white',
                  borderColor: isPlaying ? theme.hex : 'white',
                  color: isPlaying ? 'white' : 'black',
                  boxShadow: isPlaying ? `0 10px 20px ${theme.shadow}` : '0 5px 15px rgba(255,255,255,0.1)'
                }}
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1 transition-transform group-hover/playbtn:scale-110"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                )}
              </button>
              
              <button className="text-white/30 hover:text-white transition-colors active:scale-95 hidden sm:block">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
              </button>
            </div>

            {/* 🔊 RIGHT: Meta & Actions */}
            <div className="flex items-center justify-end gap-6 w-[30%] md:w-[35%] pr-2">
              <div className="hidden lg:flex flex-col items-end">
                 <span className="text-[8px] uppercase tracking-[0.4em] font-black text-white/30 mb-1">Time</span>
                 <span className="text-[11px] font-mono font-bold text-white/70" style={{ color: isHoveringBar ? theme.hex : undefined, transition: 'color 0.3s' }}>
                   {formatTime(progress || 0)}
                 </span>
              </div>
              
              {/* Optional: Like/Heart Button */}
              <button 
                className="text-white/30 hover:text-white transition-colors active:scale-95 group/heart" 
                title="Save Asset"
              >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover/heart:fill-current" style={{ color: theme.hex }}>
                   <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                 </svg>
              </button>

              {/* Fullscreen / Zen Mode Toggle (Bonus Aesthetic feature) */}
              <button 
                onClick={() => navigate('/roles')} // Or point to ZenMode if globally available
                className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all active:scale-95 shadow-inner"
                title="Minimize/Exit"
              >
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              </button>
            </div>
          
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}