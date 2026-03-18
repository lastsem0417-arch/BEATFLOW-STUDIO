import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext'; 

export default function BeatExplorer() {
  const [allBeats, setAllBeats] = useState<any[]>([]);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  useEffect(() => {
    const fetchAllBeats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tracks/type/beat');
        setAllBeats(res.data);
      } catch (err) { 
        console.error("Explorer fetch error:", err); 
      }
    };
    fetchAllBeats();
  }, []);

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
    <div className="mt-16 space-y-10 pb-32">
      
      {/* 🎩 PREMIUM HEADER (Editorial Typography) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex flex-col">
          <span className="text-[9px] text-brand-muted uppercase tracking-[0.5em] font-black mb-2">
            The Global Market
          </span>
          <h3 className="text-4xl md:text-5xl font-serif italic text-brand-pearl tracking-tight">
            Discover <span className="text-producer">Architects.</span>
          </h3>
        </div>
        <button className="text-[10px] font-mono uppercase tracking-[0.2em] text-brand-muted hover:text-producer transition-colors border-b border-transparent hover:border-producer pb-1 flex items-center gap-2">
          View All Formats <span>→</span>
        </button>
      </div>

      {/* 🗂️ THE BEAT GRID (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allBeats.length > 0 ? allBeats.map((beat) => {
          const isThisPlaying = currentTrack?._id === beat._id;

          return (
            <div 
              key={beat._id} 
              className={`group relative bg-brand-dark border rounded-[2rem] p-8 transition-all duration-700 overflow-hidden shadow-2xl flex flex-col justify-between min-h-[280px] hover:-translate-y-1 ${isThisPlaying ? 'border-producer/50 shadow-[0_10px_40px_rgba(212,175,55,0.15)]' : 'border-white/5 hover:border-producer/30'}`}
            >
              {/* 🌟 SUBTLE BACKGROUND GLOW ON HOVER */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-producer/10 blur-[50px] rounded-full transition-opacity duration-700 pointer-events-none ${isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-60'}`}></div>

              {/* TOP SECTION: Visualizer & Play */}
              <div className="flex items-start justify-between relative z-10 w-full">
                  
                  {/* 🌊 SLEEK WAVEFORM VISUALIZER */}
                  <div className={`flex items-center gap-[2px] h-12 px-4 rounded-xl border transition-colors duration-500 ${isThisPlaying ? 'bg-producer/10 border-producer/20' : 'bg-[#010101] border-white/5 group-hover:border-white/10'}`}>
                      {[1, 2, 3, 4, 5].map(i => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full transition-all duration-300 ${isThisPlaying && isPlaying ? 'bg-producer animate-bounce' : 'bg-brand-muted h-1 group-hover:h-3'}`} 
                            style={{ 
                              animationDelay: `${i * 0.1}s`,
                              height: isThisPlaying && isPlaying ? `${Math.random() * 16 + 8}px` : ''
                            }}
                          ></div>
                      ))}
                  </div>

                  {/* ⏯️ PREMIUM SVG PLAY BUTTON */}
                  <button 
                    onClick={() => handlePlayClick(beat)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isThisPlaying && isPlaying ? 'bg-producer text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-110' : 'bg-white/5 text-brand-pearl border border-white/10 hover:border-producer hover:text-producer hover:scale-105'}`}
                  >
                      {isThisPlaying && isPlaying ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                      )}
                  </button>
              </div>

              {/* BOTTOM SECTION: Typography & Info */}
              <div className="space-y-4 relative z-10 mt-auto">
                  <div>
                    <h4 className={`text-xl font-serif italic truncate tracking-wide transition-colors duration-500 ${isThisPlaying ? 'text-producer' : 'text-brand-pearl group-hover:text-white'}`}>
                      {beat.title}
                    </h4>
                    <span className="text-[10px] text-brand-muted font-mono tracking-[0.2em] uppercase mt-1 block">
                      ID: {beat.creator?.slice(-5) || 'GUEST'}
                    </span>
                  </div>

                  {/* FOOTER METADATA */}
                  <div className="pt-5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isThisPlaying && isPlaying ? 'bg-producer animate-pulse shadow-[0_0_5px_#D4AF37]' : 'bg-brand-muted'}`}></div>
                        <span className={`text-[9px] font-mono uppercase tracking-widest ${isThisPlaying ? 'text-producer' : 'text-brand-muted'}`}>
                          {isThisPlaying && isPlaying ? 'Transmitting' : 'Archived'}
                        </span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-brand-muted group-hover:text-producer transition-colors">
                         Inspect
                      </span>
                  </div>
              </div>

            </div>
          );
        }) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[2rem] bg-brand-dark/50">
              <span className="text-4xl opacity-20 mb-4">🎛️</span>
              <span className="text-[10px] text-brand-muted font-mono uppercase tracking-[0.3em]">Vault is currently empty</span>
          </div>
        )}
      </div>
    </div>
  );
}