import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';

export default function TrendingCharts() {
  const [trendingTracks, setTrendingTracks] = useState<any[]>([]);
  const { currentTrack, togglePlayPause, playTrack } = useAudio();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        // Sort by most likes, slice top 10
        const sorted = res.data.sort((a: any, b: any) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10);
        setTrendingTracks(sorted);
      } catch (err) { console.error("Error fetching trending:", err); }
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

  return (
    <div className="p-8 lg:p-12 h-full w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-500 custom-scrollbar pb-32">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
            <div>
                <h2 className="text-4xl font-serif italic text-white drop-shadow-[0_0_15px_rgba(249,115,22,0.4)]">Global Top 10</h2>
                <p className="text-orange-400/70 uppercase tracking-[0.3em] text-[10px] font-black mt-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span> Most Liked Drops
                </p>
            </div>
            <span className="text-6xl drop-shadow-[0_0_20px_rgba(249,115,22,0.6)]">🔥</span>
        </div>

        {trendingTracks.length === 0 ? <p className="text-neutral-500 text-center mt-20 font-mono">No heat in the network yet.</p> : null}
        
        {/* Track List */}
        {trendingTracks.map((track, idx) => (
          <div 
            key={track._id} 
            onClick={() => handlePlay(track)} 
            className={`flex items-center gap-6 bg-[#0a0a0a]/80 backdrop-blur-md border ${currentTrack?._id === track._id ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-white/5'} hover:border-orange-500/30 p-4 pr-8 rounded-[2rem] cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden`}
          >
             {/* Rank Number */}
             <span className={`text-6xl font-black italic absolute -left-2 -bottom-4 z-0 pointer-events-none transition-colors ${idx < 3 ? 'text-orange-500/20' : 'text-white/5'} group-hover:text-orange-500/20`}>
                 {idx + 1}
             </span>
             
             {/* Cover */}
             <div className="relative w-16 h-16 rounded-xl overflow-hidden z-10 shrink-0">
                <img src={track.creatorProfileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${track.creatorName}`} className="w-full h-full object-cover bg-black" alt="Cover" />
                {currentTrack?._id === track._id && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                    </div>
                )}
             </div>

             {/* Info */}
             <div className="flex-1 z-10 min-w-0">
               <h3 className={`font-bold text-lg truncate transition-colors ${currentTrack?._id === track._id ? 'text-orange-400' : 'text-white group-hover:text-orange-100'}`}>{track.title}</h3>
               <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-black truncate">{track.creatorName} • {track.genre}</p>
             </div>

             {/* Likes Badge */}
             <div className="z-10 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-neutral-400 flex items-center gap-2 group-hover:bg-orange-500/10 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all shrink-0">
               ❤️ <span className="font-mono text-sm">{track.likes?.length || 0}</span>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}