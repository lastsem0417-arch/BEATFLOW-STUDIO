import React, { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';

const SAMPLES = [
  { key: 'K', name: 'KICK', url: 'https://www.soundjay.com/button/sounds/button-16.mp3' },
  { key: 'S', name: 'SNARE', url: 'https://www.soundjay.com/button/sounds/button-11.mp3' },
  { key: 'H', name: 'HI-HAT', url: 'https://www.soundjay.com/button/sounds/button-09.mp3' },
  { key: 'P', name: 'PERC', url: 'https://www.soundjay.com/button/sounds/button-37.mp3' },
  { key: 'B', name: 'BASS', url: 'https://www.soundjay.com/button/sounds/button-12.mp3' },
  { key: 'R', name: 'REVERB', url: 'https://www.soundjay.com/button/sounds/button-14.mp3' },
];

export default function DrumPad() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activePad, setActivePad] = useState<string | null>(null);

  const playSound = (url: string, key: string, name: string) => {
    const audio = new Audio(url);
    audio.play().catch(() => {});
    
    // 🎬 ULTRA QUICK Pad press feedback (Just scale, no overshoot)
    const padEl = document.getElementById(`pad-${key}`);
    if (padEl) {
      gsap.fromTo(padEl, 
        { scale: 1 }, 
        { scale: 0.95, duration: 0.1, ease: "power1.inOut", yoyo: true, repeat: 1 }
      );
    }
    
    setActivePad(key);
    setTimeout(() => setActivePad(null), 100);
  };

  // 🎬 REFACTORED: Entrance animation (Tight, unified wave)
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(".drum-pad-btn", 
        { scale: 0.95, opacity: 0, y: 12 }, // Reduced from y: 20, scale: 0.9
        { scale: 1, opacity: 1, y: 0, duration: 0.5, stagger: 0.04, ease: "power3.out" } // Changed from back.out(1.5), stagger 0.05
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="bg-white rounded-[1rem] border border-[#001433]/5 p-6 lg:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] h-full flex flex-col select-none relative font-sans will-change-transform">
      
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-[#001433]/10 pb-6 mb-8 relative z-10">
        <div className="flex flex-col">
          <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[#001433] leading-none">MPC FORGE</h3>
          <span className="text-[10px] text-[#001433]/50 font-bold uppercase tracking-[0.3em] font-mono mt-2">Analog Engine</span>
        </div>
        
        {/* Status Indicator */}
        <div className="px-4 py-2 bg-[#F4F3EF] rounded-full flex items-center gap-2 text-[9px] text-[#001433]/60 font-black uppercase tracking-widest shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_5px_#D4AF37]"></span>
          2MS
        </div>
      </div>

      {/* DRUM PADS GRID (3x2) */}
      <div className="grid grid-cols-3 gap-4 md:gap-5 flex-1 relative z-10">
        {SAMPLES.map((sample) => (
          <button
            key={sample.key}
            id={`pad-${sample.key}`}
            onMouseDown={() => playSound(sample.url, sample.key, sample.name)}
            className={`drum-pad-btn relative group w-full h-full min-h-[80px] md:min-h-[90px] bg-[#F4F3EF] rounded-[1rem] border border-[#001433]/5 text-[#001433] shadow-sm transition-all duration-200 flex flex-col items-center justify-center cursor-pointer will-change-transform ${
              activePad === sample.key 
                ? 'scale-95 bg-[#D4AF37] text-white' 
                : 'hover:bg-[#001433] hover:text-[#D4AF37] hover:shadow-[0_8px_20px_rgba(0,20,51,0.1)]'
            }`}
          >
            <span className="text-sm md:text-base font-black tracking-tighter uppercase transition-colors pointer-events-none">{sample.name}</span>
            <span className="text-[9px] mt-1 font-mono font-bold tracking-[0.2em] text-[#001433]/40 group-hover:text-white/60 transition-colors pointer-events-none">K: {sample.key}</span>
          </button>
        ))}
      </div>

      {/* FOOTER STATUS */}
      <div className="mt-8 pt-6 border-t border-[#001433]/10 relative z-10">
        <p className="text-[9px] uppercase tracking-[0.3em] text-[#001433]/40 font-mono font-black">
          {activePad ? `[${activePad}] ACTIVE` : 'READY'}
        </p>
      </div>
    </div>
  );
}
