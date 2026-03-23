import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

export default function EnvironmentTester() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeEnv, setActiveEnv] = useState<'studio' | 'car' | 'phone' | 'club'>('studio');
  const [fileName, setFileName] = useState<string>("Load a beat to test...");
  const [tick, setTick] = useState(0); // Trigger visualizer re-renders

  // Web Audio API Refs
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // Filter Refs
  const highPassRef = useRef<BiquadFilterNode | null>(null);
  const lowPassRef = useRef<BiquadFilterNode | null>(null);
  const bassRef = useRef<BiquadFilterNode | null>(null);
  const trebleRef = useRef<BiquadFilterNode | null>(null);

  // GSAP Reveal
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.95, y: 20 }, 
        { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Handle File Upload for Testing
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      setFileName(file.name);
      setIsPlaying(false);
      
      // Stop current playback if uploading new file
      if (audioElRef.current) {
        audioElRef.current.pause();
      }
    }
  };

  // 🔥 Initialize Web Audio API - FIXED SOURCE ROUTING 🔥
  useEffect(() => {
    if (!audioUrl) return;

    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }

    const ctx = audioCtxRef.current;

    // Create Audio Element ONLY ONCE
    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      // 🔥 FIX: Removed crossOrigin="anonymous" for blob URLs to avoid CORS blocking 🔥
      audioElRef.current.loop = true; 
    }

    const audioEl = audioElRef.current;

    // 🔥 FIX: ACTUALLY SET THE SRC TO THE ELEMENT 🔥
    if (audioEl.src !== audioUrl) {
      audioEl.src = audioUrl;
      audioEl.load();
    }

    // Create Routing Path (only once)
    if (!sourceNodeRef.current) {
      try {
        sourceNodeRef.current = ctx.createMediaElementSource(audioEl);

        // Initialize Filters
        highPassRef.current = ctx.createBiquadFilter(); highPassRef.current.type = 'highpass';
        lowPassRef.current = ctx.createBiquadFilter(); lowPassRef.current.type = 'lowpass';
        bassRef.current = ctx.createBiquadFilter(); bassRef.current.type = 'lowshelf';
        trebleRef.current = ctx.createBiquadFilter(); trebleRef.current.type = 'highshelf';

        // Chain: Source -> HighPass -> LowPass -> Bass -> Treble -> Destination
        sourceNodeRef.current.connect(highPassRef.current);
        highPassRef.current.connect(lowPassRef.current);
        lowPassRef.current.connect(bassRef.current);
        bassRef.current.connect(trebleRef.current);
        trebleRef.current.connect(ctx.destination);
      } catch (e) { 
        console.error("Audio Routing setup error:", e); 
      }
    }
  }, [audioUrl]);

  // Apply Environment EQ Logic
  useEffect(() => {
    if (!highPassRef.current || !lowPassRef.current || !bassRef.current || !trebleRef.current) return;

    const hp = highPassRef.current;
    const lp = lowPassRef.current;
    const bass = bassRef.current;
    const treble = trebleRef.current;
    const now = audioCtxRef.current?.currentTime || 0;

    // Smooth transition between EQs
    const transitionTime = 0.3; 

    if (activeEnv === 'studio') {
      hp.frequency.setTargetAtTime(10, now, transitionTime);
      lp.frequency.setTargetAtTime(22000, now, transitionTime);
      bass.frequency.setTargetAtTime(100, now, transitionTime);
      bass.gain.setTargetAtTime(0, now, transitionTime);
      treble.frequency.setTargetAtTime(4000, now, transitionTime);
      treble.gain.setTargetAtTime(0, now, transitionTime);
    } 
    else if (activeEnv === 'car') {
      hp.frequency.setTargetAtTime(20, now, transitionTime);
      lp.frequency.setTargetAtTime(18000, now, transitionTime);
      bass.frequency.setTargetAtTime(80, now, transitionTime);
      bass.gain.setTargetAtTime(8, now, transitionTime);
      treble.frequency.setTargetAtTime(8000, now, transitionTime);
      treble.gain.setTargetAtTime(4, now, transitionTime);
    } 
    else if (activeEnv === 'phone') {
      hp.frequency.setTargetAtTime(600, now, transitionTime);
      lp.frequency.setTargetAtTime(10000, now, transitionTime);
      bass.frequency.setTargetAtTime(100, now, transitionTime);
      bass.gain.setTargetAtTime(-20, now, transitionTime);
      treble.frequency.setTargetAtTime(5000, now, transitionTime);
      treble.gain.setTargetAtTime(6, now, transitionTime);
    } 
    else if (activeEnv === 'club') {
      hp.frequency.setTargetAtTime(30, now, transitionTime);
      lp.frequency.setTargetAtTime(12000, now, transitionTime);
      bass.frequency.setTargetAtTime(60, now, transitionTime);
      bass.gain.setTargetAtTime(14, now, transitionTime);
      treble.frequency.setTargetAtTime(4000, now, transitionTime);
      treble.gain.setTargetAtTime(-2, now, transitionTime);
    }
  }, [activeEnv]);

  // 🔥 Visualizer Bounce Logic 🔥
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => setTick(prev => prev + 1), 150); // React re-render to make bars bounce
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (!audioElRef.current || !audioUrl) return;
    
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }

    if (isPlaying) {
      audioElRef.current.pause();
    } else {
      audioElRef.current.play().catch(e => console.error("Playback prevented:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const environments = [
    { id: 'studio', label: 'Flat Studio', icon: '🎧' },
    { id: 'car', label: 'Car Stereo', icon: '🚗' },
    { id: 'phone', label: 'Phone Spkr', icon: '📱' },
    { id: 'club', label: 'Club System', icon: '🪩' },
  ];

  return (
    // 🔥 THEME CHANGED: Clean White background with Deep Navy Text 🔥
    <div ref={containerRef} className="w-full max-w-4xl mx-auto bg-white border border-[#001433]/5 rounded-[2rem] p-8 md:p-12 shadow-[0_15px_40px_rgba(0,20,51,0.04)] relative overflow-hidden font-sans select-none text-[#001433]">
      
      {/* Premium Background Glow (Opacity reduced for Light Theme) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[100px] pointer-events-none transition-colors duration-1000 opacity-10 ${activeEnv === 'club' ? 'bg-[#9B2226]' : activeEnv === 'car' ? 'bg-[#0EA5E9]' : activeEnv === 'phone' ? 'bg-[#F59E0B]' : 'bg-[#D4AF37]'}`}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02] mix-blend-multiply pointer-events-none z-0"></div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 relative z-10">
         <div>
            <h2 className="text-4xl font-serif italic text-[#001433] tracking-tight">Sonic <span className="text-[#D4AF37]">Tester</span></h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#001433]/50 mt-2 font-black">Verify Mix Translation</p>
         </div>

         {/* File Uploader (Light Theme) */}
         <label className="cursor-pointer bg-[#F4F3EF] border border-[#001433]/10 text-[#001433] px-6 py-3 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-[#001433] hover:text-white transition-all shadow-sm active:scale-95">
            Load Local Beat
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
         </label>
      </div>

      {/* Track Info & Visualizer (Alabaster Background) */}
      <div className="bg-[#F4F3EF] border border-[#001433]/5 rounded-3xl p-6 md:p-8 mb-10 flex flex-col items-center justify-center relative z-10 shadow-inner">
         <p className="text-[11px] font-mono uppercase tracking-widest text-[#001433]/80 mb-6 truncate max-w-xs md:max-w-md font-bold">
            {fileName}
         </p>
         
         <div className="flex items-center gap-1 h-16 w-full justify-center">
            {/* CSS Visualizer (Now it actually bounces when playing!) */}
            {[...Array(30)].map((_, i) => (
               <div 
                 key={`${i}-${tick}`} // Force re-render to trigger new Math.random()
                 className="w-1.5 md:w-2 bg-[#D4AF37] rounded-full transition-all duration-150"
                 style={{ 
                   height: isPlaying ? `${Math.random() * 80 + 20}%` : '4px',
                   opacity: isPlaying ? 0.8 : 0.3
                 }}
               ></div>
            ))}
         </div>
         
         {/* BIG PLAY BUTTON (Deep Navy) */}
         <button 
           onClick={togglePlay} 
           disabled={!audioUrl}
           className="mt-8 w-16 h-16 rounded-full bg-[#001433] text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#001433] hover:scale-105 active:scale-95 transition-all shadow-[0_10px_20px_rgba(0,20,51,0.15)] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
         >
           {isPlaying ? (
             <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg>
           ) : (
             <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z"></path></svg>
           )}
         </button>
      </div>

      {/* ENVIRONMENT SWITCHERS (Light Theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
         {environments.map((env) => {
           const isActive = activeEnv === env.id;
           return (
             <button
               key={env.id}
               onClick={() => setActiveEnv(env.id as any)}
               className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 group ${isActive ? 'bg-white border-[#D4AF37] shadow-[0_10px_30px_rgba(212,175,55,0.15)] -translate-y-1' : 'bg-[#F4F3EF] border-[#001433]/5 hover:border-[#001433]/20 hover:bg-white'}`}
             >
               <span className={`text-4xl mb-3 transition-transform duration-500 ${isActive ? 'scale-110' : 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                 {env.icon}
               </span>
               <span className={`text-[10px] font-black uppercase tracking-widest font-mono ${isActive ? 'text-[#D4AF37]' : 'text-[#001433]/50 group-hover:text-[#001433]'}`}>
                 {env.label}
               </span>
               
               {/* Active Indicator dot */}
               <div className={`w-1.5 h-1.5 rounded-full mt-3 transition-all ${isActive ? 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]' : 'bg-transparent'}`}></div>
             </button>
           );
         })}
      </div>

    </div>
  );
}