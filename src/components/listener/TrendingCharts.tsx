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

  // ⏳ PREMIUM LOADER
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px] select-none bg-white rounded-[2.5rem] border border-[#0A1128]/5 shadow-sm m-8 lg:m-16">
         <div className="w-16 h-16 rounded-full border-[3px] border-[#0A1128]/10 border-t-[#F97316] animate-spin mb-6"></div>
         <span className="text-[10px] uppercase font-mono tracking-[0.4em] font-black text-[#0A1128]/50">Calculating Heat Index...</span>
      </div>
    );
  }

  return (
    // 🔥 SCROLL FIX: Let the page scroll naturally 🔥
    <div className="w-full flex flex-col font-sans">
      <div className="max-w-[1200px] mx-auto w-full flex flex-col gap-6">
        
        {/* 🎩 Page Header: The Heatmap */}
        <div className="mb-12 flex items-end justify-between border-b border-[#0A1128]/5 pb-8 relative z-10 pt-4">
            {/* Ambient Top Glow (Orange/Heat) */}
            <div className="absolute top-[-50%] left-0 w-80 h-80 bg-[#F97316]/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
            
            <div>
                <h2 className="text-5xl md:text-7xl font-serif italic text-[#0A1128] tracking-tighter leading-none mb-2">Global Top 10<span className="text-[#F97316]">.</span></h2>
                <p className="text-[#F97316] uppercase tracking-[0.4em] text-[10px] font-black mt-6 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse shadow-[0_0_10px_#F97316]"></span> 
                    Highest Frequency Signals
                </p>
            </div>
            
            {/* Premium Fire SVG */}
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border border-[#0A1128]/10 flex items-center justify-center shadow-[0_15px_30px_rgba(249,115,22,0.15)] group hover:scale-105 hover:border-[#F97316]/50 transition-all duration-500 cursor-default hidden sm:flex">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#F97316] group-hover:scale-110 transition-transform"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
            </div>
        </div>

        {/* Empty State */}
        {trendingTracks.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#0A1128]/20 rounded-[2.5rem] bg-white shadow-sm">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1128]/20 mb-6"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              <p className="text-[#0A1128]/50 text-center font-mono text-[10px] uppercase tracking-[0.3em] font-black leading-loose">No frequencies detected in the network.<br/>The charts are currently silent.</p>
           </div>
        ) : null}
        
        {/* 🏆 The Chart List */}
        <div className="flex flex-col gap-6 relative z-10 w-full">
          {trendingTracks.map((track, idx) => {
            const isThisPlaying = currentTrack?._id === track._id;
            
            return (
              <div 
                key={track._id} 
                onClick={() => handlePlay(track)} 
                // 🔥 PREMIUM LIGHT ROW 🔥
                className={`flex flex-col sm:flex-row sm:items-center gap-6 lg:gap-8 bg-white border ${isThisPlaying ? 'border-[#F97316]/50 shadow-[0_15px_40px_rgba(249,115,22,0.15)] scale-[1.01]' : 'border-[#0A1128]/5 hover:border-[#F97316]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-1'} p-6 lg:p-8 pr-10 rounded-[2.5rem] cursor-pointer transition-all duration-500 group relative overflow-hidden`}
              >
                 {/* 🔥 MASSIVE RANK WATERMARK 🔥 */}
                 <span className={`absolute -right-4 sm:-left-4 top-1/2 -translate-y-1/2 text-[8rem] lg:text-[12rem] font-serif italic font-black transition-colors duration-700 pointer-events-none z-0 select-none ${isThisPlaying ? 'text-[#F97316]/5' : 'text-[#0A1128]/[0.02] group-hover:text-[#F97316]/[0.03]'}`}>
                     {idx + 1}
                 </span>
                 
                 {/* 💿 Cover Artwork */}
                 <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-[1.5rem] overflow-hidden z-10 shrink-0 border border-[#0A1128]/10 bg-[#F4F5F7] shadow-md">
                    <img 
                      src={track.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.creatorId || track.creatorName}`} 
                      className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`} 
                      alt="Cover" 
                    />
                    
                    {/* Live Audio Visualizer (Frosted Glass) */}
                    {isThisPlaying && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
                           <div className="w-14 h-14 rounded-full bg-[#F97316] flex items-center justify-center shadow-[0_10px_20px_rgba(249,115,22,0.4)]">
                              {isPlaying ? (
                                  <div className="flex gap-1 h-5 items-end">
                                      <div className="w-1.5 bg-white h-full animate-[bounce_1s_infinite] rounded-full"></div>
                                      <div className="w-1.5 bg-white h-2/3 animate-[bounce_1s_infinite_0.1s] rounded-full"></div>
                                      <div className="w-1.5 bg-white h-4/5 animate-[bounce_1s_infinite_0.2s] rounded-full"></div>
                                  </div>
                              ) : (
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              )}
                           </div>
                        </div>
                    )}

                    {/* Hover Play Button */}
                    {!isThisPlaying && (
                        <div className="absolute inset-0 bg-[#0A1128]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#F97316] transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                           </div>
                        </div>
                    )}
                 </div>

                 {/* 📝 Track Info */}
                 <div className="flex-1 z-10 min-w-0 flex flex-col justify-center">
                   <h3 className={`font-serif italic text-3xl lg:text-4xl truncate transition-colors duration-500 tracking-tight leading-tight ${isThisPlaying ? 'text-[#F97316]' : 'text-[#0A1128] group-hover:text-[#6B7AE5]'}`}>{track.title}</h3>
                   <div className="flex items-center gap-4 mt-4">
                      <p className="text-[10px] text-[#0A1128]/50 uppercase tracking-[0.3em] font-black truncate">{track.creatorName}</p>
                      <span className="w-1 h-1 rounded-full bg-[#0A1128]/20"></span>
                      <p className="text-[9px] text-[#F97316] uppercase tracking-[0.2em] font-mono font-bold bg-[#F97316]/10 px-3 py-1 rounded-full">{track.genre || 'Trending Asset'}</p>
                   </div>
                 </div>

                 {/* ❤️ Likes Badge (Premium Pill) */}
                 <div className={`z-10 border px-6 py-3 rounded-full flex items-center gap-3 transition-all duration-500 shrink-0 mt-4 sm:mt-0 ${isThisPlaying ? 'bg-[#F97316] border-[#F97316] text-white shadow-[0_10px_20px_rgba(249,115,22,0.3)]' : 'bg-[#F4F5F7] border-[#0A1128]/5 text-[#0A1128]/40 group-hover:bg-[#F97316]/10 group-hover:text-[#F97316] group-hover:border-[#F97316]/30'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill={isThisPlaying ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isThisPlaying ? '' : 'group-hover:fill-current'}>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="font-mono text-[12px] font-black tracking-widest">{track.likes?.length || 0}</span>
                 </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}