import React, { useEffect, useCallback, useRef } from 'react';

const SAMPLES = [
  { key: '1', name: 'KICK', url: '/sounds/kick.mp3' },
  { key: '2', name: 'SNARE', url: '/sounds/snare.mp3' },
  { key: '3', name: 'HAT', url: '/sounds/hat.mp3' },
  { key: '4', name: 'CLAP', url: '/sounds/clap.mp3' },
  { key: '5', name: '808', url: '/sounds/808.mp3' },
  { key: '6', name: 'PERC', url: '/sounds/perc.mp3' },
];

export default function DrumPad() {
  const audioContext = useRef<AudioContext | null>(null);
  const bufferCache = useRef<{ [key: string]: AudioBuffer }>({});

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // 🔥 THE FALLBACK SYNTH ENGINE (Agar MP3 missing ho toh ye aawaz nikalega)
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

    // 🔥 PREMIUM VISUAL ANIMATION (Gold Press Effect)
    const el = document.getElementById(`pad-${id}`);
    if (el) {
      // Scale down and add gold glow on press
      el.classList.add('scale-[0.92]', 'bg-producer/20', 'border-producer/80', 'shadow-[0_0_30px_rgba(212,175,55,0.4)]');
      setTimeout(() => el.classList.remove('scale-[0.92]', 'bg-producer/20', 'border-producer/80', 'shadow-[0_0_30px_rgba(212,175,55,0.4)]'), 150);
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
      // Agar gaana nahi mila, toh custom generator chalega!
      playFallbackSynth(name, audioContext.current);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const sample = SAMPLES.find(s => s.key === e.key);
    if (sample) {
      e.preventDefault(); // Rok browser scrolling
      playSound(sample.url, sample.key, sample.name);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-brand-dark border border-white/5 rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full flex flex-col select-none relative overflow-hidden group">
      
      {/* Ambient Inner Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-producer/5 blur-[50px] rounded-full pointer-events-none"></div>

      {/* 🎩 HEADER SECTION */}
      <div className="flex justify-between items-start mb-10 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-producer">MPC Forge</h3>
          <span className="text-[10px] text-brand-muted uppercase tracking-[0.2em] font-mono">Analog Synth Engine</span>
        </div>
        <div className="px-3 py-1.5 bg-[#010101] rounded-full flex items-center gap-2 text-[9px] text-producer font-mono tracking-widest border border-white/5 shadow-inner">
          <span className="w-1.5 h-1.5 bg-producer rounded-full animate-pulse shadow-[0_0_5px_#D4AF37]"></span>
          2MS
        </div>
      </div>

      {/* 🎛️ THE DRUM PADS (Breathing Room & Sleek Layout) */}
      {/* 3 Columns x 2 Rows for better spacing */}
      <div className="grid grid-cols-3 gap-5 flex-1 relative z-10">
        {SAMPLES.map((sample) => (
          <button
            key={sample.key}
            id={`pad-${sample.key}`}
            onMouseDown={() => playSound(sample.url, sample.key, sample.name)}
            className="relative group w-full h-full min-h-[90px] rounded-2xl bg-[#010101] border border-white/5 transition-all duration-100 flex flex-col items-center justify-center overflow-hidden hover:bg-white/[0.03] hover:border-white/20 active:border-producer shadow-inner"
          >
            {/* Top Indicator Line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[2px] bg-brand-muted opacity-20 group-hover:opacity-50 transition-opacity"></div>
            
            <span className="text-xs md:text-sm font-bold text-brand-pearl tracking-widest group-hover:text-white transition-colors">{sample.name}</span>
            <span className="text-[9px] text-brand-muted mt-2 font-mono tracking-[0.3em]">KEY: {sample.key}</span>
          </button>
        ))}
      </div>
      
      {/* FOOTER */}
      <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
         <p className="text-[9px] text-brand-muted uppercase tracking-[0.3em] font-black">Zero Latency Mode</p>
         <p className="text-[9px] text-brand-muted uppercase tracking-[0.3em] font-mono">Use Keys 1-6</p>
      </div>
    </div>
  );
}