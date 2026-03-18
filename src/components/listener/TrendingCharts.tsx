import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';

export default function TrendingCharts() {
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTrack, isPlaying, togglePlayPause, playTrack } = useAudio();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        // Sort by most likes, slice top 10
        const sorted = res.data.sort((a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10);
        setTrendingTracks(sorted);
      } catch (err) { 
        console.error("Error fetching trending:", err); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handlePlay = (track: any) => {
    if (currentTrack?._id === track._id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full opacity-40 select-none min-h-[500px]">
         <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#F97316] animate-spin mb-6"></div>
         <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#888888]">Calculating Heat Index...</span>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 h-full w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-700 custom-scrollbar pb-32" data-lenis-prevent="true">
      <div className="max-w-[1200px] mx-auto flex flex-col gap-6">
        
        {/* 🎩 Page Header: The Heatmap */}
        <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8 relative z-10">
            {/* Ambient Top Glow */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#F97316]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            
            <div>
                <h2 className="text-5xl md:text-6xl font-serif italic text-[#F0F0EB] drop-shadow-md tracking-tighter">Global Top 10</h2>
                <p className="text-[#F97316] uppercase tracking-[0.4em] text-[10px] font-black mt-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shadow-[0_0_15px_#F97316]"></span> 
                    Highest Frequency Signals
                </p>
            </div>
            
            {/* Premium Fire SVG */}
            <div className="w-16 h-16 rounded-full bg-[#F97316]/10 border border-[#F97316]/30 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.2)]">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#F97316]"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
            </div>
        </div>

        {/* Empty State */}
        {trendingTracks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-[2rem] bg-[#010101]/50">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888] mb-4"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              <p className="text-[#888888] text-center font-mono text-[10px] uppercase tracking-widest">No frequencies detected in the network.<br/>The charts are currently silent.</p>
           </div>
        ) : null}
        
        {/* 🏆 The Chart List */}
        <div className="flex flex-col gap-5 relative z-10">
          {trendingTracks.map((track, idx) => {
            const isThisPlaying = currentTrack?._id === track._id;
            
            return (
              <div 
                key={track._id} 
                onClick={() => handlePlay(track)} 
                className={`flex items-center gap-6 bg-[#010101] backdrop-blur-md border ${isThisPlaying ? 'border-[#F97316]/50 shadow-[0_10px_30px_rgba(249,115,22,0.15)] scale-[1.01]' : 'border-white/5 hover:border-[#F97316]/30 hover:bg-white/[0.02] hover:-translate-y-1 hover:shadow-xl'} p-5 pr-8 rounded-[2rem] cursor-pointer transition-all duration-500 group relative overflow-hidden`}
              >
                 {/* 🔥 MASSIVE RANK WATERMARK 🔥 */}
                 <span className={`absolute -left-2 top-1/2 -translate-y-1/2 text-[8rem] font-serif italic font-black transition-colors duration-700 pointer-events-none z-0 select-none ${isThisPlaying ? 'text-[#F97316]/10' : 'text-white/[0.02] group-hover:text-[#F97316]/5'}`}>
                     {idx + 1}
                 </span>
                 
                 {/* 💿 Cover Artwork */}
                 <div className="relative w-20 h-20 rounded-[1.2rem] overflow-hidden z-10 shrink-0 border border-white/5 bg-[#0A0A0C] shadow-lg">
                    <img 
                      src={track.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.creatorId || track.creatorName}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'}`} 
                      alt="Cover" 
                    />
                    
                    {/* Live Audio Visualizer (Frosted Glass) */}
                    {isThisPlaying && (
                        <div className="absolute inset-0 bg-[#030305]/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
                           <div className="w-12 h-12 rounded-full bg-[#F97316]/20 border border-[#F97316]/50 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                              {isPlaying ? (
                                  <div className="flex gap-1 h-4 items-end">
                                      <div className="w-1 bg-[#F0F0EB] h-full animate-[bounce_1s_infinite] rounded-full"></div>
                                      <div className="w-1 bg-[#F0F0EB] h-2/3 animate-[bounce_1s_infinite_0.1s] rounded-full"></div>
                                      <div className="w-1 bg-[#F0F0EB] h-4/5 animate-[bounce_1s_infinite_0.2s] rounded-full"></div>
                                  </div>
                              ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#F0F0EB] ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              )}
                           </div>
                        </div>
                    )}
                 </div>

                 {/* 📝 Track Info */}
                 <div className="flex-1 z-10 min-w-0 pl-2">
                   <h3 className={`font-serif italic text-2xl truncate transition-colors duration-500 ${isThisPlaying ? 'text-[#F97316]' : 'text-[#F0F0EB] group-hover:text-white'}`}>{track.title}</h3>
                   <div className="flex items-center gap-3 mt-2">
                      <p className="text-[9px] text-[#888888] uppercase tracking-[0.3em] font-black truncate">{track.creatorName}</p>
                      <span className="w-1 h-1 rounded-full bg-white/20"></span>
                      <p className="text-[8px] text-[#F97316] uppercase tracking-[0.2em] font-mono">{track.genre || 'Original'}</p>
                   </div>
                 </div>

                 {/* ❤️ Likes Badge (Premium SVG) */}
                 <div className={`z-10 border px-5 py-2.5 rounded-full flex items-center gap-2.5 transition-all duration-500 shrink-0 shadow-inner ${isThisPlaying ? 'bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]' : 'bg-white/5 border-white/10 text-[#888888] group-hover:bg-[#F97316]/5 group-hover:text-[#F97316] group-hover:border-[#F97316]/20'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={isThisPlaying ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isThisPlaying ? 'drop-shadow-[0_0_5px_#F97316]' : ''}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="font-mono text-[11px] font-bold">{track.likes?.length || 0}</span>
                 </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}