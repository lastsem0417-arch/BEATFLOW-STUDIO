import React, { useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

const SAMPLES = [
  { key: '1', name: 'KICK', url: '/sounds/kick.mp3' },
  { key: '2', name: 'SNARE', url: '/sounds/snare.mp3' },
  { key: '3', name: 'HAT', url: '/sounds/hat.mp3' },
  { key: '4', name: 'CLAP', url: '/sounds/clap.mp3' },
  { key: '5', name: '808', url: '/sounds/808.mp3' },
  { key: '6', name: 'PERC', url: '/sounds/perc.mp3' },
];

export default function DrumPad() {
  const containerRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const bufferCache = useRef<{ [key: string]: AudioBuffer }>({});

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // 🔥 THE FALLBACK SYNTH ENGINE
  const playFallbackSynth = (name: string, ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime;

    if (name === 'KICK' || name === '808') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(name === '808' ? 60 : 150, t);
      osc.frequency.exponentialRampToValueAtTime(0.01, t + (name === '808' ? 1.5 : 0.5));
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (name === '808' ? 1.5 : 0.5));
      osc.start(t); osc.stop(t + (name === '808' ? 1.5 : 0.5));
    } else if (name === 'SNARE' || name === 'CLAP') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(250, t);
      gain.gain.setValueAtTime(1, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    } else {
      // High Hat / Percussion
      osc.type = 'square';
      osc.frequency.setValueAtTime(8000, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
    }
  };

  const playSound = async (url: string, id: string, name: string) => {
    initAudio();
    if (!audioContext.current) return;

    // 🔥 PREMIUM TACTILE HARDWARE PHYSICS
    const el = document.getElementById(`pad-${id}`);
    if (el) {
      // Hardware button press effect: scale down, turn gold
      el.classList.add('scale-[0.92]', 'bg-[#D4AF37]', 'text-white', 'shadow-[0_0_20px_rgba(212,175,55,0.4)]');
      el.classList.remove('bg-[#F4F3EF]', 'hover:bg-[#001433]', 'hover:text-[#D4AF37]');
      
      setTimeout(() => {
        el.classList.remove('scale-[0.92]', 'bg-[#D4AF37]', 'text-white', 'shadow-[0_0_20px_rgba(212,175,55,0.4)]');
        el.classList.add('bg-[#F4F3EF]', 'hover:bg-[#001433]', 'hover:text-[#D4AF37]');
      }, 100); // Super snappy 100ms recoil
    }

    try {
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      let buffer = bufferCache.current[url];
      
      if (!buffer) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found");
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioContext.current.decodeAudioData(arrayBuffer);
        bufferCache.current[url] = buffer;
      }

      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.current.destination);
      source.start(0);
      
    } catch (err) {
      console.warn(`File missing for ${name}. Activating Fallback Synth.`);
      playFallbackSynth(name, audioContext.current);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const sample = SAMPLES.find(s => s.key === e.key);
    if (sample) {
      e.preventDefault(); 
      playSound(sample.url, sample.key, sample.name);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // 🎬 GSAP PREMIUM GRID REVEAL
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".drum-pad-btn", 
        { scale: 0.9, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: "back.out(1.5)" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    // 🔥 PREMIUM EDITORIAL CONTAINER
    <div ref={containerRef} className="bg-white rounded-[1rem] border border-[#001433]/5 p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] h-full flex flex-col select-none relative font-sans">
      
      {/* 🎩 EDITORIAL HEADER SECTION */}
      <div className="flex justify-between items-start border-b border-[#001433]/10 pb-6 mb-8 relative z-10">
        <div className="flex flex-col">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[#001433] leading-none">MPC FORGE</h3>
          <span className="text-[10px] text-[#001433]/50 font-bold uppercase tracking-[0.3em] font-mono mt-2">Analog Engine</span>
        </div>
        
        {/* Hardware Status Indicator */}
        <div className="px-4 py-2 bg-[#F4F3EF] rounded-full flex items-center gap-2 text-[9px] text-[#001433]/60 font-black uppercase tracking-widest shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_5px_#D4AF37]"></span>
          2MS
        </div>
      </div>

      {/* 🎛️ THE PREMIUM DRUM PADS */}
      {/* 3 Columns x 2 Rows */}
      <div className="grid grid-cols-3 gap-4 md:gap-5 flex-1 relative z-10">
        {SAMPLES.map((sample) => (
          <button
            key={sample.key}
            id={`pad-${sample.key}`}
            onMouseDown={() => playSound(sample.url, sample.key, sample.name)}
            className="drum-pad-btn relative group w-full h-full min-h-[80px] md:min-h-[90px] bg-[#F4F3EF] rounded-[1rem] border border-[#001433]/5 text-[#001433] shadow-sm transition-all duration-200 flex flex-col items-center justify-center cursor-pointer hover:bg-[#001433] hover:text-[#D4AF37] hover:shadow-[0_10px_30px_rgba(0,20,51,0.15)]"
          >
            <span className="text-sm md:text-base font-black tracking-tighter uppercase transition-colors pointer-events-none">{sample.name}</span>
            <span className="text-[9px] mt-1 font-mono font-bold tracking-[0.2em] text-[#001433]/40 group-hover:text-white/60 transition-colors pointer-events-none">K: {sample.key}</span>
            
            {/* Minimalist corner detail */}
            <div className="absolute top-2 left-2 w-1 h-1 rounded-full bg-[#001433]/10 group-hover:bg-[#D4AF37]/50"></div>
          </button>
        ))}
      </div>
      
      {/* ⚙️ EDITORIAL FOOTER */}
      <div className="mt-8 pt-4 flex justify-between items-center relative z-10">
         <p className="text-[9px] md:text-[10px] text-[#001433]/50 uppercase tracking-[0.3em] font-black">Zero Latency Mode</p>
         <p className="text-[9px] md:text-[10px] text-[#001433] bg-[#F4F3EF] px-3 py-1.5 rounded-full uppercase tracking-[0.2em] font-black border border-[#001433]/10">Use Keys 1-6</p>
      </div>

    </div>
  );
}