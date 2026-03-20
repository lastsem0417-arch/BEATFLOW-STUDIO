import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';

interface ZenModeProps {
  onClose: () => void;
}

export default function ZenMode4D({ onClose }: ZenModeProps) {
  const { currentTrack, isPlaying, togglePlayPause, progress, seek } = useAudio();
  const [mousePos, setMousePos] = useState({ normX: 0, normY: 0 });

  const role = (currentTrack?.creatorRole || 'producer').toLowerCase();
  
  const getGlow = () => {
    if (role === 'rapper') return '#E63946'; 
    if (role === 'lyricist') return '#10B981'; 
    if (role === 'producer') return '#D4AF37'; 
    return '#6B7AE5'; 
  };
  
  const glowHex = getGlow();
  const coverImage = currentTrack?.coverImage || currentTrack?.creatorProfileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${currentTrack?.creatorName || 'Beatflow'}`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const normX = (clientX / innerWidth - 0.5) * 2; 
      const normY = (clientY / innerHeight - 0.5) * 2; 
      
      setMousePos({ normX, normY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatTime = (percent: number) => {
      return `${Math.floor(percent || 0)}%`;
  };

  return (
    <div className="fixed inset-0 bg-[#030305] z-[99999] flex flex-col items-center justify-center font-sans select-none overflow-hidden" style={{ perspective: '1200px' }}>
        
        {/* 🌌 LAYER 1: THE LIQUID AURA */}
        <div 
          className="absolute w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] rounded-full pointer-events-none transition-transform duration-[1000ms] ease-out mix-blend-screen opacity-20"
          style={{ 
            background: `radial-gradient(circle, ${glowHex} 0%, transparent 70%)`,
            transform: `translate(${mousePos.normX * 50}px, ${mousePos.normY * 50}px)`,
            top: '50%', left: '50%', marginTop: '-35vw', marginLeft: '-35vw',
            filter: 'blur(100px)'
          }}
        ></div>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] mix-blend-screen pointer-events-none"></div>

        {/* ✕ ALWAYS VISIBLE EXIT BUTTON */}
        <button 
          onClick={onClose} 
          className="absolute top-8 left-8 md:top-10 md:left-10 z-50 flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded-full transition-all duration-300 text-white/70 hover:text-white shadow-lg active:scale-95"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] font-mono">Exit Zen</span>
        </button>

        {/* 📴 FALLBACK STATE (If opened without playing a track) */}
        {!currentTrack ? (
            <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 mb-8 border border-white/10 rounded-full flex items-center justify-center relative bg-[#010101] shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                   <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/30"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight drop-shadow-lg mb-4">Astral Silence.</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-white/40">Select a track to initiate 5D experience</p>
            </div>
        ) : (
            // 🌠 5D EXPERIENCE WRAPPER
            <div 
              className="relative w-full h-full flex flex-col items-center justify-center z-20 transition-transform duration-[500ms] ease-out"
              style={{ transformStyle: 'preserve-3d', transform: `rotateX(${mousePos.normY * -15}deg) rotateY(${mousePos.normX * 15}deg)` }}
            >
              
              {/* 🏔️ LAYER 2: MASSIVE KINETIC TYPOGRAPHY */}
              <div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] text-center pointer-events-none"
                style={{ transform: `translateZ(-150px)` }}
              >
                <h1 
                  className="text-[20vw] leading-none font-black uppercase tracking-tighter text-transparent whitespace-nowrap opacity-10 select-none"
                  style={{ WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}
                >
                  {currentTrack.title} {currentTrack.title}
                </h1>
              </div>

              {/* 🔮 LAYER 3: THE GYROSCOPIC CORE */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center mt-[-10vh]" style={{ transformStyle: 'preserve-3d' }}>
                 
                 {/* Ring 1 (Outer - Clockwise) */}
                 <div 
                   className={`absolute w-[120%] h-[120%] rounded-full border border-white/5 pointer-events-none transition-all duration-1000 ${isPlaying ? 'animate-[spin_10s_linear_infinite] opacity-60' : 'opacity-20'}`}
                   style={{ transform: 'translateZ(-30px)', borderTopColor: glowHex, borderBottomColor: glowHex, boxShadow: isPlaying ? `0 0 30px ${glowHex}40` : 'none' }}
                 ></div>
                 
                 {/* Ring 2 (Inner - Anti-Clockwise) */}
                 <div 
                   className={`absolute w-[105%] h-[105%] rounded-full border border-dashed border-white/20 pointer-events-none transition-all duration-1000 ${isPlaying ? 'animate-[spin_15s_linear_infinite_reverse] opacity-50' : 'opacity-10'}`}
                   style={{ transform: 'translateZ(20px)' }}
                 ></div>

                 {/* The Core (Cover Art) */}
                 <div 
                   className={`relative w-full h-full rounded-full bg-black overflow-hidden border transition-all duration-1000 ease-out ${isPlaying ? 'border-white/20' : 'border-white/5 grayscale-[50%]'}`}
                   style={{ 
                     transform: 'translateZ(40px)', 
                     boxShadow: isPlaying ? `0 0 80px ${glowHex}50, inset 0 0 30px rgba(0,0,0,0.8)` : 'inset 0 0 30px rgba(0,0,0,0.8)' 
                   }} 
                 >
                   <img 
                     src={coverImage} 
                     alt="Cover" 
                     className={`w-full h-full object-cover transition-all duration-[10s] ease-linear ${isPlaying ? 'scale-125 animate-[spin_20s_linear_infinite]' : 'scale-100'}`} 
                   />
                   
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-white/20 mix-blend-overlay"></div>
                   
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-[#020202] rounded-full border-[3px] border-[#080808] shadow-[0_0_15px_black] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                   </div>
                 </div>
              </div>

              {/* 🎛️ LAYER 4: THE FLOATING HUD */}
              <div 
                className="absolute bottom-12 md:bottom-20 w-full px-6 flex flex-col items-center z-40"
                style={{ transform: 'translateZ(60px)' }}
              >
                <div className="text-center mb-8 flex flex-col items-center">
                  <h2 className="text-3xl md:text-5xl font-serif italic text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] tracking-tight leading-none mb-3">
                    {currentTrack.title}
                  </h2>
                  <div className="flex items-center gap-3">
                     <span className="w-2 h-2 rounded-full" style={{ backgroundColor: glowHex, boxShadow: `0 0 10px ${glowHex}` }}></span>
                     <p className="text-[10px] uppercase tracking-[0.4em] font-black font-mono text-white/60">
                       {currentTrack.creatorName}
                     </p>
                  </div>
                </div>

                <div className="w-full max-w-lg bg-[#050505]/60 backdrop-blur-2xl border border-white/10 p-6 md:p-8 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] flex flex-col gap-6">
                   
                   <div className="w-full flex items-center gap-4 group/scrubber">
                     <span className="text-[9px] font-mono text-white/40 w-8 text-right">{formatTime(progress || 0)}</span>
                     <div className="flex-1 h-1.5 bg-white/5 rounded-full relative cursor-pointer group-hover/scrubber:h-2 transition-all duration-300 overflow-hidden">
                       <input 
                         type="range" min="0" max="100" 
                         value={progress || 0} 
                         onChange={(e) => seek?.(Number(e.target.value))} 
                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                       />
                       <div 
                         className="absolute top-0 left-0 h-full rounded-full transition-all duration-100 ease-linear" 
                         style={{ width: `${progress || 0}%`, backgroundColor: glowHex, boxShadow: `0 0 15px ${glowHex}` }}
                       ></div>
                     </div>
                     <span className="text-[9px] font-mono text-white/40 w-8 text-left">100%</span>
                   </div>

                   <div className="flex items-center justify-center gap-10">
                     <button className="text-white/30 hover:text-white transition-colors active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/></svg></button>
                     
                     <button 
                       onClick={togglePlayPause} 
                       className="w-16 h-16 rounded-full flex items-center justify-center border transition-all duration-500 hover:scale-105 active:scale-95"
                       style={{
                         backgroundColor: isPlaying ? 'white' : 'rgba(255,255,255,0.05)',
                         borderColor: isPlaying ? 'white' : 'rgba(255,255,255,0.1)',
                         color: isPlaying ? 'black' : 'white',
                         boxShadow: isPlaying ? `0 0 30px rgba(255,255,255,0.4), 0 0 50px ${glowHex}50` : 'none'
                       }}
                     >
                       {isPlaying ? (
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                       ) : (
                         <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1.5"><path d="M8 5v14l11-7z"/></svg>
                       )}
                     </button>
                     
                     <button className="text-white/30 hover:text-white transition-colors active:scale-95"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/></svg></button>
                   </div>
                </div>
              </div>
            </div>
        )}
    </div>
  );
}