import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';

interface Stem {
  id: string;
  name: string;
  color: string;
  gain: number;
  muted: boolean;
  solo: boolean;
}

export default function AIStemMixer() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio Refs
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainNodesRef = useRef<{ [key: string]: GainNode }>({});
  
  const [stems, setStems] = useState<Stem[]>([
    { id: 'vocals', name: 'Vocals (Mid)', color: '#D4AF37', gain: 1.0, muted: false, solo: false },
    { id: 'bass', name: '808 / Bass', color: '#10B981', gain: 1.0, muted: false, solo: false },
    { id: 'drums', name: 'Drums (High)', color: '#0EA5E9', gain: 1.0, muted: false, solo: false },
    { id: 'melody', name: 'Melody / Inst', color: '#E63946', gain: 1.0, muted: false, solo: false }
  ]);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 30 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Cleanup on unmount taaki background mein gaana na baje
  useEffect(() => {
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.src = "";
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Purana local URL clean karo agar naya track upload kiya hai
    if (audioUrl) URL.revokeObjectURL(audioUrl);

    const newAudioUrl = URL.createObjectURL(file);
    setFileName(file.name);
    setAudioUrl(newAudioUrl);
    setIsReady(false);
    setIsProcessing(true);
    setProgress(0);
    setIsPlaying(false);

    if (audioElRef.current) {
      audioElRef.current.pause();
    }

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 15) + 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setTimeout(() => {
          setIsProcessing(false);
          setIsReady(true);
          initAudioEngine(newAudioUrl);
        }, 500);
      }
      setProgress(currentProgress);
    }, 400);
  };

  const initAudioEngine = (url: string) => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    if (!audioElRef.current) {
      audioElRef.current = new Audio();
      // 🔥 FIX: Removed crossOrigin="anonymous" which was muting Local Blob URLs! 🔥
      audioElRef.current.loop = true;
    }
    
    // Hamesha naya URL assign karo
    audioElRef.current.src = url;

    // Source Node sirf ek baar banta hai ek HTMLAudioElement ke liye
    if (!sourceNodeRef.current) {
      sourceNodeRef.current = ctx.createMediaElementSource(audioElRef.current);
      
      // 🔥 AGGRESSIVE CASCADING FILTERS FOR BETTER ISOLATION 🔥

      // 1. BASS (Double Lowpass for steep 24dB/oct cutoff)
      const bassLp1 = ctx.createBiquadFilter(); bassLp1.type = 'lowpass'; bassLp1.frequency.value = 150;
      const bassLp2 = ctx.createBiquadFilter(); bassLp2.type = 'lowpass'; bassLp2.frequency.value = 150;
      const bassGain = ctx.createGain();
      sourceNodeRef.current.connect(bassLp1); bassLp1.connect(bassLp2); bassLp2.connect(bassGain); bassGain.connect(ctx.destination);
      gainNodesRef.current['bass'] = bassGain;

      // 2. VOCALS (Highpass + Lowpass sandwich)
      const vocHp = ctx.createBiquadFilter(); vocHp.type = 'highpass'; vocHp.frequency.value = 250;
      const vocLp = ctx.createBiquadFilter(); vocLp.type = 'lowpass'; vocLp.frequency.value = 3500;
      const vocGain = ctx.createGain();
      sourceNodeRef.current.connect(vocHp); vocHp.connect(vocLp); vocLp.connect(vocGain); vocGain.connect(ctx.destination);
      gainNodesRef.current['vocals'] = vocGain;

      // 3. DRUMS/HIGHS (Double Highpass)
      const drumHp1 = ctx.createBiquadFilter(); drumHp1.type = 'highpass'; drumHp1.frequency.value = 4000;
      const drumHp2 = ctx.createBiquadFilter(); drumHp2.type = 'highpass'; drumHp2.frequency.value = 4000;
      const drumGain = ctx.createGain();
      sourceNodeRef.current.connect(drumHp1); drumHp1.connect(drumHp2); drumHp2.connect(drumGain); drumGain.connect(ctx.destination);
      gainNodesRef.current['drums'] = drumGain;

      // 4. MELODY (Notch out the vocals and heavy bass)
      const melHp = ctx.createBiquadFilter(); melHp.type = 'highpass'; melHp.frequency.value = 200;
      const melNotch = ctx.createBiquadFilter(); melNotch.type = 'notch'; melNotch.frequency.value = 1500; melNotch.Q.value = 0.5;
      const melGain = ctx.createGain();
      sourceNodeRef.current.connect(melHp); melHp.connect(melNotch); melNotch.connect(melGain); melGain.connect(ctx.destination);
      gainNodesRef.current['melody'] = melGain;
    }
  };

  useEffect(() => {
    const isAnySolo = stems.some(s => s.solo);
    stems.forEach(stem => {
      const gainNode = gainNodesRef.current[stem.id];
      if (gainNode) {
        if (stem.muted || (isAnySolo && !stem.solo)) {
          gainNode.gain.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.05);
        } else {
          gainNode.gain.setTargetAtTime(stem.gain, audioCtxRef.current?.currentTime || 0, 0.05);
        }
      }
    });
  }, [stems]);

  const togglePlay = async () => {
    if (!audioElRef.current) return;
    
    // Browser auto-suspends AudioContext sometimes until user clicks a button
    if (audioCtxRef.current?.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    
    if (isPlaying) {
      audioElRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Audio playback failed:", err);
      });
    }
  };

  const updateStem = (id: string, key: keyof Stem, value: any) => {
    setStems(prev => prev.map(s => {
      if (s.id !== id) return s;
      const updated = { ...s, [key]: value };
      if (key === 'solo' && value === true) updated.muted = false;
      if (key === 'muted' && value === true) updated.solo = false;
      return updated;
    }));
  };

  const handleExport = () => {
    alert("System Alert: You are using the Frontend Demo Engine.\n\nTo achieve flawless Moises.ai quality exports, connect the Python Spleeter/Demucs API on your backend. Currently saving mixdown state...");
  };

  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto bg-white border border-[#001433]/10 rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,20,51,0.05)] relative overflow-hidden font-sans select-none text-[#001433]">
      
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10 relative z-10">
         <div>
            <h2 className="text-4xl font-serif italic text-[#001433] tracking-tight">AI Neural <span className="text-[#D4AF37]">Extractor</span></h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#001433]/50 mt-2 font-black flex items-center gap-2">
              Isolate. Mute. Remix. <span className="px-2 py-0.5 bg-[#E63946]/10 text-[#E63946] rounded-full text-[8px]">BETA</span>
            </p>
         </div>

         {!isReady && !isProcessing && (
           <label className="cursor-pointer bg-[#001433] border border-transparent text-white px-8 py-4 rounded-full text-[10px] uppercase font-black tracking-widest hover:bg-[#D4AF37] hover:text-[#001433] hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all active:scale-95 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Upload Track to Split
              <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
           </label>
         )}
      </div>

      {isProcessing && (
        <div className="bg-[#F4F3EF] border border-[#001433]/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center relative z-10 shadow-inner min-h-[300px]">
           <div className="w-16 h-16 border-4 border-[#001433]/10 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
           <h3 className="text-xl font-bold mb-2">Analyzing Frequencies</h3>
           <p className="text-[10px] font-mono uppercase tracking-widest text-[#001433]/50 mb-8">Applying Cascaded Phase Isolation...</p>
           
           <div className="w-full max-w-md h-2 bg-[#001433]/5 rounded-full overflow-hidden">
             <div className="h-full bg-[#D4AF37] transition-all duration-300" style={{ width: `${progress}%` }}></div>
           </div>
           <p className="text-[10px] font-mono font-bold mt-4">{progress}% Extracted</p>
        </div>
      )}

      {isReady && (
        <div className="flex flex-col gap-8 relative z-10 animate-in fade-in duration-700">
           
           <div className="flex items-center justify-between bg-[#F4F3EF] p-4 pr-8 rounded-full border border-[#001433]/5 shadow-sm">
             <div className="flex items-center gap-4">
                <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-[#001433] text-white flex items-center justify-center hover:bg-[#D4AF37] hover:text-[#001433] transition-all shadow-md active:scale-95">
                  {isPlaying ? <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"></rect><rect x="14" y="5" width="4" height="14" rx="1"></rect></svg> : <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z"></path></svg>}
                </button>
                <div>
                  <p className="text-sm font-bold truncate max-w-[200px] md:max-w-xs">{fileName}</p>
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[#001433]/50 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-[#10B981] animate-pulse' : 'bg-[#E63946]'}`}></span> DSP Engine {isPlaying ? 'Active' : 'Standby'}
                  </p>
                </div>
             </div>
             <button onClick={handleExport} className="px-6 py-2.5 border-2 border-[#D4AF37] text-[#D4AF37] font-black uppercase tracking-widest text-[9px] rounded-full hover:bg-[#D4AF37] hover:text-[#001433] transition-all shadow-sm">
                Bounce & Export
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stems.map((stem) => (
                <div key={stem.id} className="bg-white border border-[#001433]/10 rounded-[1.5rem] p-6 shadow-[0_5px_20px_rgba(0,20,51,0.03)] flex flex-col items-center group hover:border-[#D4AF37]/50 transition-colors">
                   
                   <div className="flex flex-col items-center mb-6">
                     <span className="text-[10px] font-mono font-black uppercase tracking-widest text-[#001433]/60 mb-1">{stem.name}</span>
                     <div className="w-8 h-1 rounded-full transition-opacity" style={{ backgroundColor: stem.color, opacity: stem.muted ? 0.2 : 1 }}></div>
                   </div>

                   <div className="relative w-12 h-40 bg-[#F4F3EF] rounded-full border border-[#001433]/5 shadow-inner flex items-center justify-center mb-6 overflow-hidden">
                     <input 
                       type="range" 
                       min="0" max="1.5" step="0.01" 
                       value={stem.gain}
                       onChange={(e) => updateStem(stem.id, 'gain', parseFloat(e.target.value))}
                       className={`absolute w-32 h-2 appearance-none bg-transparent outline-none -rotate-90 cursor-pointer slider-thumb ${stem.muted ? 'opacity-50' : ''}`}
                     />
                     <div className="absolute bottom-0 w-full rounded-full pointer-events-none transition-all duration-100" style={{ height: `${(stem.gain / 1.5) * 100}%`, backgroundColor: stem.color, opacity: stem.muted ? 0.1 : 0.4 }}></div>
                   </div>

                   <div className="flex gap-2 w-full justify-center">
                     <button 
                       onClick={() => updateStem(stem.id, 'muted', !stem.muted)}
                       className={`w-10 h-10 rounded-xl font-black text-xs transition-all shadow-sm ${stem.muted ? 'bg-[#E63946] text-white shadow-[#E63946]/30' : 'bg-[#F4F3EF] text-[#001433]/40 border border-[#001433]/5 hover:text-[#001433]'}`}
                     >
                       M
                     </button>
                     <button 
                       onClick={() => updateStem(stem.id, 'solo', !stem.solo)}
                       className={`w-10 h-10 rounded-xl font-black text-xs transition-all shadow-sm ${stem.solo ? 'bg-[#D4AF37] text-[#001433] shadow-[#D4AF37]/30' : 'bg-[#F4F3EF] text-[#001433]/40 border border-[#001433]/5 hover:text-[#001433]'}`}
                     >
                       S
                     </button>
                   </div>
                </div>
              ))}
           </div>

           <div className="text-center mt-4">
             <button onClick={() => { setIsReady(false); setAudioUrl(null); if(audioElRef.current) audioElRef.current.pause(); }} className="text-[10px] font-mono text-[#001433]/40 hover:text-[#E63946] uppercase tracking-widest underline decoration-dashed underline-offset-4 transition-colors">
               Load Different Track
             </button>
           </div>
        </div>
      )}

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #001433;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,20,51,0.3);
          border: 2px solid #D4AF37;
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #001433;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(0,20,51,0.3);
          border: 2px solid #D4AF37;
        }
      `}</style>
    </div>
  );
}