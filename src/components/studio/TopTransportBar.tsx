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
  onExport: () => void; // 🔥 NAYA PROP FOR EXPORT
  timeDisplayRef: React.RefObject<HTMLDivElement>;
  projectName?: string;
}

export default function TopTransportBar({ isPlaying, isRecording, togglePlay, stopEngine, toggleRecord, onSaveProject, onNewProject, onExport, timeDisplayRef, projectName }: TransportProps) {
  const navigate = useNavigate();

  return (
    <div className="h-20 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.5)] select-none">
      
      {/* Left: Branding & Project Status */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
           <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-ping' : 'bg-blue-500 shadow-[0_0_10px_#3b82f6]'}`}></div>
           <span className="text-[11px] tracking-[0.5em] font-black uppercase text-white/90">BeatFlow <span className="text-neutral-600 font-light italic">DAW</span></span>
        </div>
        <div className="w-[1px] h-8 bg-white/10 mx-2"></div>
        <div className="flex gap-2">
            <button onClick={onNewProject} className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 border border-white/5 px-5 py-2 rounded-full hover:bg-white hover:text-black transition-all duration-500">New</button>
            <button onClick={onSaveProject} className="text-[10px] font-bold uppercase tracking-widest text-white border border-green-500/30 bg-green-500/10 px-5 py-2 rounded-full hover:bg-green-500 transition-all duration-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">Save</button>
            {/* 🔥 EXPORT BUTTON ADDED WITH AWWWARDS UI STYLE */}
            <button onClick={onExport} className="text-[10px] font-bold uppercase tracking-widest text-white border border-blue-500/30 bg-blue-500/10 px-5 py-2 rounded-full hover:bg-blue-500 transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">Export</button>
        </div>
        <div className="hidden md:block">
            <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono ml-4 opacity-50">Active: {projectName || "Untitled_Session"}</span>
        </div>
      </div>
      
      {/* Center: Master Transport (The Neon Core) */}
      <div className="flex items-center gap-8 bg-black/40 px-10 py-2 rounded-2xl border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
        {/* Time Display */}
        <div ref={timeDisplayRef} className="font-mono text-2xl font-extralight tracking-[0.2em] text-white w-36 text-center drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">00:00.00</div>
        
        <div className="w-[1px] h-6 bg-white/10"></div>
        
        <div className="flex items-center gap-6">
            <button onClick={stopEngine} className="text-neutral-500 hover:text-white transition-all transform hover:scale-110 active:scale-95">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>
            </button>
            
            <button onClick={togglePlay} className={`p-3 rounded-full transition-all duration-500 transform hover:scale-110 ${isPlaying && !isRecording ? 'text-blue-400 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.3)]' : 'text-white bg-white/5 hover:bg-white/10'}`}>
              {isPlaying && !isRecording ? 
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg> : 
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M7 4v16l14-8z"/></svg>
              }
            </button>
            
            <button onClick={toggleRecord} className={`group relative p-3 rounded-full transition-all duration-500 ${isRecording ? 'bg-red-500 text-white shadow-[0_0_40px_rgba(239,68,68,0.5)]' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20'}`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              {isRecording && <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>}
            </button>
        </div>
      </div>

      {/* Right: Studio Exit */}
      <div className="flex items-center gap-6">
        <button onClick={() => navigate('/roles')} className="group flex items-center gap-3 text-[10px] text-neutral-500 hover:text-white uppercase tracking-[0.3em] transition-all">
            <span>Exit Studio</span>
            <div className="w-8 h-[1px] bg-neutral-800 group-hover:w-12 group-hover:bg-white transition-all"></div>
        </button>
      </div>
    </div>
  );  
}