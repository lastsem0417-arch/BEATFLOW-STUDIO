import React from 'react';
import { useNavigate } from 'react-router-dom';

interface TransportProps {
  isPlaying: boolean;
  isRecording: boolean;
  togglePlay: () => void;
  stopEngine: () => void;
  toggleRecord: () => void;
  onSaveProject: () => void;
  onNewProject: () => void;
  onExport: () => void;
  timeDisplayRef: React.RefObject<HTMLDivElement>;
  projectName?: string;
}

export default function TopTransportBar({ isPlaying, isRecording, togglePlay, stopEngine, toggleRecord, onSaveProject, onNewProject, onExport, timeDisplayRef, projectName }: TransportProps) {
  const navigate = useNavigate();

  return (
    // 🔥 HIGH-END ONYX GLASSMORPHISM BAR
    <div className="h-20 bg-[#030305]/85 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-8 z-50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] select-none shrink-0 relative">
      
      {/* Subtle Top Edge Highlight */}
      <div className={`absolute top-0 left-0 h-[1px] w-full transition-all duration-700 ${isRecording ? 'bg-red-500 shadow-[0_0_20px_#ef4444]' : 'bg-white/10'}`}></div>

      {/* 🎛️ LEFT: BRANDING & PROJECT CONTROLS */}
      <div className="flex items-center gap-8">
        
        {/* Logo & Status */}
        <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_15px_#ef4444]' : isPlaying ? 'bg-[#D4AF37] shadow-[0_0_15px_#D4AF37]' : 'bg-[#888888]'}`}></div>
            <div className="flex flex-col">
               <span className="text-[10px] tracking-[0.5em] font-black uppercase text-[#F0F0EB] leading-none">BeatFlow<span className="text-[#D4AF37]">.</span></span>
               <span className="text-[7px] text-[#888888] uppercase tracking-widest font-mono mt-1">Audio Engine</span>
            </div>
        </div>

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/10"></div>
        
        {/* Project Actions */}
        <div className="flex items-center gap-3">
            <button 
              onClick={onNewProject} 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-[#888888] hover:text-[#F0F0EB] border border-transparent hover:border-white/10 px-4 py-1.5 rounded-full transition-all duration-300"
            >
              New
            </button>
            <button 
              onClick={onSaveProject} 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F0F0EB] bg-white/5 border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              Save
            </button>
            <button 
              onClick={onExport} 
              className="text-[9px] font-black uppercase tracking-[0.2em] text-[#010101] bg-[#F0F0EB] border border-transparent px-5 py-1.5 rounded-full hover:bg-[#D4AF37] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 shadow-lg"
            >
              Export Master
            </button>
        </div>

        {/* Active Project Name */}
        <div className="hidden lg:flex flex-col ml-2">
            <span className="text-[7px] text-[#888888] uppercase tracking-[0.3em] font-black">Active Session</span>
            <span className="text-[10px] text-[#F0F0EB] uppercase tracking-widest font-mono mt-0.5 truncate max-w-[150px]">{projectName || "Untitled"}</span>
        </div>
      </div>
      
      {/* ⏱️ CENTER: MASTER TRANSPORT (The Core) */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-[#010101] rounded-full border border-white/5 shadow-inner p-1.5 gap-2">
        
        {/* Time Display Display */}
        <div 
          ref={timeDisplayRef} 
          className={`font-mono text-xl md:text-2xl font-light tracking-[0.15em] w-32 md:w-40 text-center transition-colors duration-300 ${isRecording ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : isPlaying ? 'text-[#D4AF37] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'text-[#F0F0EB]'}`}
        >
          00:00.00
        </div>
        
        {/* Controls Panel */}
        <div className="flex items-center gap-1 bg-[#050505] rounded-full px-2 py-1 border border-white/5">
            {/* Stop Button */}
            <button 
              onClick={stopEngine} 
              className="w-10 h-10 rounded-full text-[#888888] hover:text-[#F0F0EB] hover:bg-white/5 transition-all flex items-center justify-center active:scale-95"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
            </button>
            
            {/* Play/Pause Button */}
            <button 
              onClick={togglePlay} 
              className={`w-12 h-12 rounded-full transition-all duration-300 flex items-center justify-center active:scale-95 shadow-lg ${isPlaying && !isRecording ? 'text-[#010101] bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105' : 'text-[#F0F0EB] bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10'}`}
            >
              {isPlaying && !isRecording ? 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> : 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M7 4v16l14-8z"/></svg>
              }
            </button>
            
            {/* Record Button */}
            <button 
              onClick={toggleRecord} 
              className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center active:scale-95 relative ${isRecording ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105' : 'text-[#888888] hover:text-red-500 hover:bg-red-500/10 border border-transparent'}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              {isRecording && <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-50"></span>}
            </button>
        </div>
      </div>

      {/* 🚪 RIGHT: STUDIO EXIT */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => navigate('/roles')} 
          className="group flex items-center gap-4 text-[9px] text-[#888888] hover:text-[#F0F0EB] uppercase tracking-[0.3em] font-black transition-all"
        >
            <span>Disconnect</span>
            <div className="w-10 h-[1px] bg-white/20 group-hover:w-16 group-hover:bg-[#D4AF37] transition-all duration-500"></div>
        </button>
      </div>
      
    </div>
  );  
}