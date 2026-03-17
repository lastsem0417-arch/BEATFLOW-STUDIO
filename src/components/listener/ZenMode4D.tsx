import React, { useState, useEffect } from 'react';
import { useAudio } from '../../context/AudioContext';

interface ZenModeProps {
  onClose: () => void;
}

export default function ZenMode4D({ onClose }: ZenModeProps) {
  const { currentTrack, isPlaying, togglePlayPause, progress, seek } = useAudio();
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const role = currentTrack?.creatorRole?.toLowerCase() || 'producer';
  const glowHex = role === 'producer' ? '#3b82f6' : role === 'lyricist' ? '#10b981' : '#a855f7';
  const coverImage = currentTrack?.coverImage || currentTrack?.creatorProfileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${currentTrack?.creatorName || 'Beat'}`;

  // 🖱️ Smooth & Subtle 3D Tilt (Reduced range so it doesn't break the screen)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientY / innerHeight - 0.5) * 10; // Max 5 deg tilt
      const y = (clientX / innerWidth - 0.5) * -10; // Max 5 deg tilt
      setRotation({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      className="fixed inset-0 bg-[#020202] z-[99999] overflow-hidden flex flex-col items-center justify-center font-sans group select-none" 
      style={{ perspective: '1200px' }}
    >
      {/* 🌠 THE HOLOGRAPHIC BACKGROUND ENV */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen animate-[spin_240s_linear_infinite] opacity-60"></div>
      </div>

      {/* 🎆 Dynamic Synesthesia Core Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] transition-opacity duration-1000 pointer-events-none ${isPlaying ? 'animate-pulse opacity-100' : 'opacity-40'}`} style={{ background: `radial-gradient(circle at center, ${glowHex}20 0%, transparent 60%)` }}></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-[3s] ${isPlaying ? 'scale-110' : 'scale-90'}`} style={{ backgroundColor: `${glowHex}30` }}></div>
      
      {/* ✕ Escape Button */}
      <div onClick={onClose} className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-pointer flex justify-center pt-6">
          <div className="w-24 h-1.5 bg-white/30 rounded-full hover:bg-red-500 hover:shadow-[0_0_15px_red] transition-all"></div>
      </div>

      {currentTrack ? (
        <div 
          className="relative z-20 flex flex-col items-center justify-center w-full px-4 h-full transition-transform duration-200 ease-out gap-10"
          style={{ transformStyle: 'preserve-3d', transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
        >
          
          {/* 🔥 PROPORTIONAL 4D VINYL & COVER ART 🔥 */}
          <div 
            className="relative w-64 h-64 md:w-80 md:h-80 transition-transform duration-[1500ms] ease-out mt-10"
            style={{ 
              transformStyle: 'preserve-3d', 
              transform: isPlaying ? 'rotateX(10deg) rotateY(-15deg) scale(1)' : 'rotateX(0deg) rotateY(0deg) scale(0.95)' 
            }}
          >
             {/* 📡 Floating Tech Rings */}
             {[1,2].map(i => (
                <div 
                  key={i}
                  className={`absolute top-[-${i*5}%] -right-[${i*10}%] w-[110%] h-[110%] border rounded-full pointer-events-none transition-all duration-1000 ${isPlaying ? 'animate-spin-slow opacity-50' : 'opacity-10'}`}
                  style={{ borderColor: `${glowHex}40`, transform: `translateZ(-${i*40}px)`, animationDuration: `${10 + i*5}s` }}
                ></div>
             ))}

             {/* 💿 The Spinning Vinyl Record */}
             <div 
               className={`absolute top-[2%] -right-[25%] w-full h-full bg-[#030303] rounded-full border-[8px] border-[#080808] shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center transition-all duration-1000 ${isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}`}
               style={{ transform: 'translateZ(-40px)' }}
             >
                <div className="w-[95%] h-[95%] rounded-full border border-white/5 flex items-center justify-center p-3 shadow-inner">
                    <div className="w-[85%] h-[85%] rounded-full border border-white/10 flex items-center justify-center p-4">
                        <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-br from-neutral-800 to-black border-4 border-[#030303] flex items-center justify-center relative overflow-hidden" style={{ boxShadow: `inset 0 0 15px rgba(0,0,0,0.9), 0 0 20px ${glowHex}50` }}>
                           <img src={coverImage} alt="" className="w-full h-full object-cover scale-150 blur-sm opacity-60" />
                           <div className="w-3 h-3 bg-[#030303] rounded-full shadow-inner relative z-10"></div>
                        </div>
                    </div>
                </div>
             </div>

             {/* 🖼️ The Holographic Cover Art (Front) */}
             <div 
               className={`absolute inset-0 rounded-[2rem] bg-[#0a0a0a] overflow-hidden border transition-all duration-1000 ease-out group/cover ${isPlaying ? 'border-white/20' : 'border-white/10 shadow-2xl grayscale-[40%]'}`}
               style={{ transform: 'translateZ(20px)', boxShadow: isPlaying ? `0 40px 80px rgba(0,0,0,0.8), 0 0 60px ${glowHex}60` : 'none' }} 
             >
               <img src={coverImage} alt="Cover" className="w-full h-full object-cover scale-105" />
               <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-white/20 opacity-70 mix-blend-overlay pointer-events-none"></div>
             </div>
          </div>

          {/* 🔥 PERFECTLY SIZED HUD CONTROLS 🔥 */}
          <div className="w-full max-w-2xl text-center flex flex-col items-center opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out z-30">
             
             {/* Text with fixed line-height to prevent clipping */}
             <h1 
               className="text-4xl md:text-5xl font-serif italic text-white mb-2 leading-tight tracking-tight px-4"
               style={{ textShadow: `0 0 15px ${glowHex}80` }}
             >
               {currentTrack.title}
             </h1>
             <p className="text-[10px] md:text-xs uppercase tracking-[0.6em] font-black text-white/80 mb-8 font-mono" style={{ color: glowHex }}>
               {currentTrack.creatorName}
             </p>

             {/* 🔥 100% Working Tech Scrubber */}
             <div className="w-full flex items-center gap-4 mb-10 px-8 group/scrubber">
               <span className="text-[10px] font-mono text-white/50 w-10 text-right">0:00</span>
               <div className="flex-1 h-1.5 rounded-full relative cursor-pointer group-hover/scrubber:h-2.5 transition-all duration-300 shadow-inner bg-white/10 overflow-hidden">
                 <input type="range" min="0" max="100" value={progress || 0} onChange={(e) => seek?.(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                 
                 {/* Progress Fill with explicit color */}
                 <div className="absolute top-0 left-0 h-full rounded-full transition-all duration-100" style={{ width: `${progress || 0}%`, backgroundColor: glowHex, boxShadow: `0 0 15px ${glowHex}` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/scrubber:opacity-100 transition-all translate-x-1/2 shadow-[0_0_10px_white] pointer-events-none"></div>
                 </div>
               </div>
               <span className="text-[10px] font-mono text-white/50 w-10 text-left">{(progress || 0).toFixed(0)}%</span>
             </div>

             {/* Cinematic Floating Control Panel */}
             <div className="flex items-center gap-10 bg-black/40 border border-white/10 backdrop-blur-xl px-10 py-5 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
               <button className="text-white/40 hover:text-white hover:scale-110 transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 20L9 12l10-8v16zM5 19h2V5H5v14z"/></svg></button>
               
               <button 
                 onClick={togglePlayPause} 
                 className="w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-500 hover:scale-105 active:scale-95 group/play"
                 style={{
                   backgroundColor: isPlaying ? 'white' : 'rgba(0,0,0,0.5)',
                   borderColor: isPlaying ? 'white' : `${glowHex}50`,
                   color: isPlaying ? 'black' : glowHex,
                   boxShadow: isPlaying ? `0 0 40px rgba(255,255,255,0.6), 0 0 60px ${glowHex}40` : 'none'
                 }}
               >
                 {isPlaying ? <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg> : <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M8 5v14l11-7z"/></svg>}
               </button>
               
               <button className="text-white/40 hover:text-white hover:scale-110 transition-all"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 4l10 8-10 8V4zm14 1v14h-2V5h2z"/></svg></button>
             </div>
          </div>
        </div>
      ) : (
        <div className="text-center z-20 opacity-40 flex flex-col items-center">
             <div className="w-24 h-24 mb-8 border-[4px] border-white/10 rounded-full animate-spin" style={{ borderTopColor: glowHex, boxShadow: `0 0 50px ${glowHex}50` }}></div>
             <h2 className="text-3xl font-serif italic text-white tracking-tight">System Booting</h2>
             <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-white/50 mt-4">Select a transmission from the iconic network</p>
        </div>
      )}
    </div>
  );
}