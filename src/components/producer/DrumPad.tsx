import React, { useEffect, useCallback, useRef } from 'react';

const SAMPLES = [
  { key: '1', name: 'KICK', color: 'bg-blue-500', url: '/sounds/kick.mp3' },
  { key: '2', name: 'SNARE', color: 'bg-purple-500', url: '/sounds/snare.mp3' },
  { key: '3', name: 'HAT', color: 'bg-indigo-500', url: '/sounds/hat.mp3' },
  { key: '4', name: 'CLAP', color: 'bg-pink-500', url: '/sounds/clap.mp3' },
  { key: '5', name: '808', color: 'bg-red-500', url: '/sounds/808.mp3' },
  { key: '6', name: 'PERC', color: 'bg-cyan-500', url: '/sounds/perc.mp3' },
];

export default function DrumPad() {
  const audioContext = useRef<AudioContext | null>(null);
  const bufferCache = useRef<{ [key: string]: AudioBuffer }>({});

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = async (url: string, id: string) => {
    initAudio();
    if (!audioContext.current) return;

    // Visual animation logic
    const el = document.getElementById(`pad-${id}`);
    if (el) {
      el.classList.add('scale-90', 'brightness-150', 'z-10');
      setTimeout(() => el.classList.remove('scale-90', 'brightness-150', 'z-10'), 100);
    }

    try {
      if (audioContext.current.state === 'suspended') {
        await audioContext.current.resume();
      }

      let buffer = bufferCache.current[url];
      if (!buffer) {
        const response = await fetch(url);
        if (!response.ok) throw new Error("File not found in public/sounds/");
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioContext.current.decodeAudioData(arrayBuffer);
        bufferCache.current[url] = buffer;
      }

      const source = audioContext.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContext.current.destination);
      source.start(0);
    } catch (err) {
      console.error("Local Audio Error:", err);
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const sample = SAMPLES.find(s => s.key === e.key);
    if (sample) {
      e.preventDefault(); // Browser scroll rokne ke liye
      playSound(sample.url, sample.key);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl h-full flex flex-col select-none relative overflow-hidden group">
      <div className="flex justify-between items-center mb-8 relative z-10">
        <div className="flex flex-col">
          <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-indigo-500">Forge Pad</h3>
          <span className="text-[8px] text-neutral-600 uppercase tracking-widest mt-1">Local Sample Engine</span>
        </div>
        <div className="px-2 py-1 bg-white/5 rounded text-[7px] text-neutral-500 font-mono tracking-tighter border border-white/5">LATENCY: 2ms</div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
        {SAMPLES.map((sample) => (
          <button
            key={sample.key}
            id={`pad-${sample.key}`}
            onMouseDown={() => playSound(sample.url, sample.key)}
            className="relative group h-20 rounded-2xl bg-white/[0.03] border border-white/5 transition-all duration-75 flex flex-col items-center justify-center overflow-hidden hover:bg-white/[0.08] hover:border-white/10"
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${sample.color} opacity-40 group-hover:opacity-100 transition-all`}></div>
            <span className="text-[10px] font-black text-white/50 group-hover:text-white tracking-widest">{sample.name}</span>
            <span className="text-[7px] text-neutral-700 mt-1 font-mono group-hover:text-neutral-500">[{sample.key}]</span>
          </button>
        ))}
      </div>
      
      <p className="mt-4 text-[7px] text-center text-neutral-700 uppercase tracking-[0.3em] relative z-10">Ready to Forge / Low Latency Mode</p>
    </div>
  );
}