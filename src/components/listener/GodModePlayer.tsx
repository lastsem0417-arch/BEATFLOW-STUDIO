import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

interface GodModeProps {
  currentTrack: any | null;
  onTakeover: () => void;
}

export default function GodModePlayer({ currentTrack, onTakeover }: GodModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMode, setActiveMode] = useState<'pure' | 'drive' | 'concert' | '8d_mindmelt' | 'lofi_rain'>('pure');

  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  
  // Audio Nodes
  const bassRef = useRef<BiquadFilterNode | null>(null);
  const trebleRef = useRef<BiquadFilterNode | null>(null);
  const lowPassRef = useRef<BiquadFilterNode | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);
  const delayRef = useRef<DelayNode | null>(null);
  const feedbackRef = useRef<GainNode | null>(null);
  const wetGainRef = useRef<GainNode | null>(null);
  const pannerAnimRef = useRef<number | null>(null);

  // Smooth Reveal Animations
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.vault-reveal', 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // 1. INITIALIZE EXTREME AUDIO ENGINE
  useEffect(() => {
    if (!audioCtxRef.current) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      audioElRef.current.crossOrigin = "anonymous";
      audioElRef.current.loop = true;
    }

    if (!sourceNodeRef.current && audioElRef.current) {
      try {
        sourceNodeRef.current = ctx.createMediaElementSource(audioElRef.current);
        
        bassRef.current = ctx.createBiquadFilter(); bassRef.current.type = 'lowshelf'; bassRef.current.frequency.value = 80;
        trebleRef.current = ctx.createBiquadFilter(); trebleRef.current.type = 'highshelf'; trebleRef.current.frequency.value = 6000;
        lowPassRef.current = ctx.createBiquadFilter(); lowPassRef.current.type = 'lowpass'; lowPassRef.current.frequency.value = 22000;
        pannerRef.current = ctx.createStereoPanner();
        
        delayRef.current = ctx.createDelay(2.0); 
        feedbackRef.current = ctx.createGain(); 
        wetGainRef.current = ctx.createGain(); 

        sourceNodeRef.current.connect(bassRef.current);
        bassRef.current.connect(trebleRef.current);
        trebleRef.current.connect(lowPassRef.current);
        lowPassRef.current.connect(pannerRef.current);
        pannerRef.current.connect(ctx.destination);

        lowPassRef.current.connect(delayRef.current);
        delayRef.current.connect(feedbackRef.current);
        feedbackRef.current.connect(delayRef.current);
        delayRef.current.connect(wetGainRef.current);
        wetGainRef.current.connect(pannerRef.current);

      } catch (e) { console.error("DSP Routing Error:", e); }
    }
  }, []);

  // 2. LOAD TRACK & PLAY SEAMLESSLY
  useEffect(() => {
    if (!currentTrack || !audioElRef.current) return;
    
    const trackUrl = currentTrack.contentUrl || currentTrack.audioUrl;
    if (audioElRef.current.src !== trackUrl && trackUrl) {
      audioElRef.current.pause();
      setIsPlaying(false);
      audioElRef.current.src = trackUrl;
      audioElRef.current.load();
      
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audioElRef.current.play().then(() => {
        setIsPlaying(true);
        onTakeover(); 
      }).catch(e => console.log("Autoplay blocked by browser."));
    }
  }, [currentTrack]);

  // 3. APPLY DSP / VIBES LOGIC
  useEffect(() => {
    if (!bassRef.current || !trebleRef.current || !lowPassRef.current || !pannerRef.current || !wetGainRef.current || !delayRef.current || !feedbackRef.current) return;
    
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const now = ctx.currentTime; 
    const transition = 0.5; 

    if (pannerAnimRef.current) {
      cancelAnimationFrame(pannerAnimRef.current);
      pannerRef.current.pan.setTargetAtTime(0, now, transition);
    }

    wetGainRef.current.gain.setTargetAtTime(0, now, transition);
    lowPassRef.current.frequency.setTargetAtTime(22000, now, transition); 
    delayRef.current.delayTime.setTargetAtTime(0, now, transition);
    feedbackRef.current.gain.setTargetAtTime(0, now, transition);

    switch (activeMode) {
      case 'pure': 
        bassRef.current.gain.setTargetAtTime(0, now, transition); trebleRef.current.gain.setTargetAtTime(0, now, transition); break;
      case 'drive': 
        bassRef.current.gain.setTargetAtTime(25, now, transition); trebleRef.current.gain.setTargetAtTime(8, now, transition); break;
      case 'concert': 
        bassRef.current.gain.setTargetAtTime(12, now, transition); trebleRef.current.gain.setTargetAtTime(5, now, transition); delayRef.current.delayTime.setTargetAtTime(0.45, now, transition); feedbackRef.current.gain.setTargetAtTime(0.65, now, transition); wetGainRef.current.gain.setTargetAtTime(0.8, now, transition); lowPassRef.current.frequency.setTargetAtTime(8000, now, transition); break;
      case 'lofi_rain': 
        bassRef.current.gain.setTargetAtTime(15, now, transition); trebleRef.current.gain.setTargetAtTime(0, now, transition); lowPassRef.current.frequency.setTargetAtTime(400, now, transition); delayRef.current.delayTime.setTargetAtTime(0.1, now, transition); feedbackRef.current.gain.setTargetAtTime(0.3, now, transition); wetGainRef.current.gain.setTargetAtTime(0.4, now, transition); break;
      case '8d_mindmelt': 
        bassRef.current.gain.setTargetAtTime(8, now, transition); trebleRef.current.gain.setTargetAtTime(4, now, transition); delayRef.current.delayTime.setTargetAtTime(0.2, now, transition); feedbackRef.current.gain.setTargetAtTime(0.4, now, transition); wetGainRef.current.gain.setTargetAtTime(0.5, now, transition); 
        const animate8D = () => { if (pannerRef.current) { pannerRef.current.pan.value = Math.sin(Date.now() / 800); } pannerAnimRef.current = requestAnimationFrame(animate8D); };
        animate8D(); break;
    }
  }, [activeMode]);

  const togglePlay = (e: any) => {
    e.stopPropagation();
    if (!audioElRef.current || !currentTrack) return;
    if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();

    if (isPlaying) audioElRef.current.pause();
    else { onTakeover(); audioElRef.current.play(); }
    setIsPlaying(!isPlaying);
  };

  // 🔥 PREMIUM COLOR PALETTE FOR THE VIBES 🔥
  const vibes = [
    { id: 'pure', label: 'Pure HD', icon: '🎧', desc: 'Lossless Studio', color: '#0A1128', lightBg: '#F4F5F7' }, // Navy
    { id: 'drive', label: 'Night Drive', icon: '🏎️', desc: 'Subwoofer X', color: '#10B981', lightBg: '#ECFDF5' }, // Green
    { id: 'concert', label: 'Concert', icon: '🏟️', desc: 'Stadium Reverb', color: '#E63946', lightBg: '#FFF1F2' }, // Red
    { id: 'lofi_rain', label: 'Underwater', icon: '🌧️', desc: 'Muffled Trip', color: '#6B7AE5', lightBg: '#EEF2FF' }, // Premium Blue
    { id: '8d_mindmelt', label: '8D Spatial', icon: '🌀', desc: 'Mind-Melt Spin', color: '#D4AF37', lightBg: '#FFFBEB' } // Gold/Yellow
  ];

  const activeVibeData = vibes.find(v => v.id === activeMode);
  const coverSrc = currentTrack?.coverImage || currentTrack?.creatorProfileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${currentTrack?._id || 'blank'}`;

  return (
    // 🔥 PERFECT BLEND: Clean Light Theme, Natural Scrolling, No Black Overlays 🔥
    <div ref={containerRef} className="w-full font-sans select-none text-[#0A1128] pb-40 px-6 md:px-12 relative">
      
      {/* Soft Ambient Glow reacting to active mode */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] rounded-full blur-[150px] pointer-events-none transition-colors duration-[1.5s] -z-10"
        style={{ backgroundColor: activeVibeData?.color, opacity: activeMode === 'pure' ? 0.05 : 0.15 }}
      ></div>

      <div className="max-w-[1400px] mx-auto relative z-10 pt-12">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 vault-reveal">
           <div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#0A1128]">
                Sonic <span className="transition-colors duration-700 italic font-serif" style={{ color: activeVibeData?.color }}>Vault.</span>
              </h2>
              <p className="text-xs font-mono uppercase tracking-[0.4em] text-[#0A1128]/40 mt-2 font-black">DSP Engine Active</p>
           </div>
           
           <div className="bg-white border border-[#0A1128]/5 px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.02)] flex items-center gap-4">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeVibeData?.color }}></span>
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeVibeData?.color }}></span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold" style={{ color: activeVibeData?.color }}>
                 {currentTrack ? 'Audio Synced' : 'Awaiting Track'}
              </span>
           </div>
        </div>

        {/* 🎛️ MAIN CONSOLE (The Premium Player Card) */}
        <div className="bg-white border border-[#0A1128]/5 rounded-[3rem] p-8 md:p-12 shadow-[0_20px_80px_rgba(0,17,40,0.04)] mb-12 vault-reveal relative overflow-hidden flex flex-col md:flex-row items-center gap-10 md:gap-16">
           
           {/* Decorative Background lines in the card */}
           <div className="absolute right-0 top-0 w-[40%] h-full opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #0A1128 0, #0A1128 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}></div>

           {/* ARTWORK & PLAY BUTTON (Sleek Rounded Square) */}
           <div className="relative w-56 h-56 md:w-72 md:h-72 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] overflow-hidden shrink-0 group border border-white">
              {currentTrack ? (
                <img src={coverSrc} className={`w-full h-full object-cover transition-all duration-700 ${isPlaying ? 'scale-105 saturate-110' : 'grayscale opacity-80'}`} alt="Artwork" />
              ) : (
                <div className="w-full h-full bg-[#F4F5F7] flex items-center justify-center text-4xl opacity-30">💿</div>
              )}

              {/* Play Overlay */}
              <div className="absolute inset-0 bg-[#0A1128]/20 group-hover:bg-[#0A1128]/40 transition-colors duration-300 flex items-center justify-center backdrop-blur-[2px]">
                 <button onClick={togglePlay} disabled={!currentTrack} className="w-20 h-20 rounded-full bg-white/90 shadow-2xl flex items-center justify-center text-[#0A1128] hover:scale-105 active:scale-95 transition-all disabled:opacity-50">
                   {isPlaying ? (
                     <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"></rect><rect x="14" y="5" width="4" height="14" rx="1.5"></rect></svg>
                   ) : (
                     <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="ml-2"><path d="M5 3l14 9-14 9V3z"></path></svg>
                   )}
                 </button>
              </div>
           </div>

           {/* TRACK INFO & VISUALIZER */}
           <div className="flex-1 flex flex-col w-full text-center md:text-left relative z-10">
              <h3 className="text-3xl md:text-5xl font-black text-[#0A1128] mb-2 tracking-tight line-clamp-2">
                {currentTrack ? currentTrack.title : "No Active Signal"}
              </h3>
              <p className="text-base md:text-lg font-serif italic text-[#0A1128]/50 mb-8">
                {currentTrack ? currentTrack.creatorName || currentTrack.artist : "Select a track from the Global Feed"}
              </p>

              {/* Fake Audio Waveform reacting to play state */}
              <div className="flex items-end justify-center md:justify-start gap-1.5 h-16 w-full mb-4">
                 {[...Array(40)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 md:w-2 rounded-t-full transition-all duration-150"
                      style={{ 
                        height: isPlaying ? `${Math.random() * 80 + 20}%` : '10%',
                        backgroundColor: activeVibeData?.color,
                        opacity: isPlaying ? 0.8 : 0.2
                      }}
                    ></div>
                 ))}
              </div>
              <div className="w-full h-[1px] bg-[#0A1128]/10 relative">
                 <div className="absolute left-0 top-0 h-full bg-[#0A1128] transition-all" style={{ width: isPlaying ? '45%' : '0%' }}></div>
              </div>
           </div>
        </div>

        {/* 🎛️ VIBE CONTROLLERS (The Premium Button Row) */}
        <div className="flex items-center gap-4 md:gap-6 vault-reveal overflow-x-auto pb-6 custom-scrollbar" data-lenis-prevent="true">
           {vibes.map((vibe) => {
             const isActive = activeMode === vibe.id;
             return (
               <button 
                 key={vibe.id} 
                 onClick={() => setActiveMode(vibe.id as any)} 
                 className={`flex-1 min-w-[160px] flex flex-col items-center justify-center p-6 md:p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden`}
                 style={{
                   backgroundColor: isActive ? vibe.lightBg : '#FFFFFF',
                   borderColor: isActive ? vibe.color : 'rgba(10,17,40,0.05)',
                   boxShadow: isActive ? `0 15px 40px ${vibe.color}25` : '0 10px 20px rgba(0,0,0,0.02)',
                   transform: isActive ? 'translateY(-8px)' : 'none'
                 }}
               >
                 <span 
                   className={`text-4xl md:text-5xl mb-4 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-60 group-hover:opacity-100 group-hover:scale-110'}`}
                   style={{ filter: isActive ? `drop-shadow(0 5px 15px ${vibe.color}40)` : 'none' }}
                 >
                   {vibe.icon}
                 </span>
                 <span 
                   className="text-xs md:text-sm font-black uppercase tracking-widest transition-colors"
                   style={{ color: isActive ? vibe.color : 'rgba(10,17,40,0.5)' }}
                 >
                   {vibe.label}
                 </span>
                 <span className="text-[9px] font-mono uppercase tracking-[0.2em] mt-2 text-center" style={{ color: isActive ? `${vibe.color}80` : 'rgba(10,17,40,0.3)' }}>
                   {vibe.desc}
                 </span>
               </button>
             );
           })}
        </div>

      </div>
    </div>
  );
}