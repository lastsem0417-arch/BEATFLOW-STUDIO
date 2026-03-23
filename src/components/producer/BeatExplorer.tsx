import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioContext'; 

export default function BeatExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [allBeats, setAllBeats] = useState<any[]>([]);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  useEffect(() => {
    const fetchAllBeats = async () => {
      try {
        // 🚨 FIX: URL syntax fixed with template literals
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks/type/beat`);
        setAllBeats(res.data);
      } catch (err) { 
        console.error("Explorer fetch error:", err); 
      }
    };
    fetchAllBeats();
  }, []);

  // 🎬 PREMIUM EDITORIAL GSAP ANIMATION
  useLayoutEffect(() => {
    if (allBeats.length > 0) {
      let ctx = gsap.context(() => {
        gsap.fromTo('.explorer-card',
          { opacity: 0, y: 60, scale: 0.98 },
          { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.1, ease: 'expo.out' }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [allBeats]);

  const handlePlayClick = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Architect',
        creatorRole: 'producer',
        creatorId: beat.creator
      });
    }
  };

  return (
    <div ref={containerRef} className="mt-4 space-y-10 pb-20 w-full relative z-10 font-sans">
      
      {/* 🎩 PREMIUM EDITORIAL HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#001433]/10 pb-8">
        <div className="flex flex-col">
          <span className="text-[10px] md:text-[11px] uppercase tracking-[0.4em] font-black text-[#001433]/50 flex items-center gap-2 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
            The Global Market
          </span>
          <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#001433] leading-none m-0">
            DISCOVER <span className="font-serif italic font-light text-[#001433]/50">ARCHITECTS</span>
          </h3>
        </div>
        
        {/* Luxury Action Button */}
        <button className="px-8 py-3.5 bg-[#001433] text-white rounded-full hover:bg-[#D4AF37] shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.3)] active:-translate-y-0.5 transition-all duration-300 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3">
          VIEW ALL FORMATS <span className="text-lg leading-none font-light">→</span>
        </button>
      </div>

      {/* 🗂️ THE BEAT GRID (Clean Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full">
        {allBeats.length > 0 ? allBeats.map((beat) => {
          const isThisPlaying = currentTrack?._id === beat._id;

          return (
            <div 
              key={beat._id} 
              className={`explorer-card group relative bg-white border border-[#001433]/5 rounded-[1rem] p-8 transition-all duration-500 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col justify-between min-h-[320px] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-[#D4AF37]/30 ${isThisPlaying ? 'border-[#D4AF37] shadow-[0_15px_40px_rgba(212,175,55,0.1)]' : ''}`}
            >
              {/* Subtle hover glow inside card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* TOP SECTION: Visualizer & Play */}
              <div className="flex items-start justify-between relative z-10 w-full mb-10">
                  
                  {/* 🌊 MINIMALIST WAVEFORM VISUALIZER */}
                  <div className="flex items-end gap-1 h-10 px-3 py-2 bg-[#F4F3EF] rounded-full border border-[#001433]/5">
                      {[1, 2, 3, 4, 5].map(i => (
                          <div 
                            key={i} 
                            className={`w-1.5 rounded-full transition-all duration-150 ${isThisPlaying && isPlaying ? 'bg-[#D4AF37]' : 'bg-[#001433]/20 group-hover:bg-[#001433]/40'}`} 
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              height: isThisPlaying && isPlaying ? `${Math.random() * 20 + 8}px` : '8px',
                              transform: `scaleY(${isThisPlaying && isPlaying ? 1 : 1})`
                            }}
                          ></div>
                      ))}
                  </div>

                  {/* ⏯️ ELEGANT PLAY BUTTON */}
                  <button 
                    onClick={() => handlePlayClick(beat)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm border ${isThisPlaying && isPlaying ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_5px_15px_rgba(212,175,55,0.4)]' : 'bg-white text-[#001433] border-[#001433]/10 group-hover:bg-[#001433] group-hover:border-[#001433] group-hover:text-white'}`}
                  >
                      {isThisPlaying && isPlaying ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      )}
                  </button>
              </div>

              {/* BOTTOM SECTION: Typography & Info */}
              <div className="space-y-4 relative z-10 mt-auto">
                  <div>
                    <h4 className={`text-2xl font-serif italic tracking-tight transition-colors duration-300 leading-tight truncate ${isThisPlaying ? 'text-[#D4AF37]' : 'text-[#001433] group-hover:text-[#D4AF37]'}`}>
                      {beat.title}
                    </h4>
                    <span className="text-[10px] text-[#001433]/40 font-bold font-mono tracking-[0.3em] uppercase mt-2 block">
                      ID_{beat.creator?.slice(-5) || 'GUEST'}
                    </span>
                  </div>

                  {/* FOOTER METADATA */}
                  <div className="pt-5 border-t border-[#001433]/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isThisPlaying && isPlaying ? 'bg-[#D4AF37] animate-ping' : 'bg-transparent'}`}></div>
                        <span className={`text-[9px] font-black font-mono uppercase tracking-[0.2em] ${isThisPlaying ? 'text-[#D4AF37]' : 'text-[#001433]/40'}`}>
                          {isThisPlaying && isPlaying ? 'TRANSMITTING' : 'ARCHIVED'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#001433]/50 group-hover:text-[#001433] transition-colors cursor-pointer">
                          INSPECT
                      </span>
                  </div>
              </div>

            </div>
          );
        }) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-[#001433]/10 rounded-[1.5rem] bg-white">
              <span className="text-4xl opacity-20 mb-6 grayscale">🎛️</span>
              <span className="text-[10px] text-[#001433]/40 font-black font-mono uppercase tracking-[0.3em]">GLOBAL MARKET IS CURRENTLY EMPTY</span>
          </div>
        )}
      </div>
    </div>
  );
}