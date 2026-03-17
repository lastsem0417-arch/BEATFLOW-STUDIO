import React, { useEffect, useState } from 'react';
import axios from 'axios';
// 🔥 GLOBAL AUDIO CONTEXT IMPORT
import { useAudio } from '../../context/AudioContext'; 

export default function BeatExplorer() {
  const [allBeats, setAllBeats] = useState<any[]>([]);
  // 🔥 AUDIO ACTIONS
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

  // 🔥 NEW PLAY HANDLER: Global Player se connect kiya
  const handlePlayClick = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Pro Artist',
        creatorRole: 'producer',
        creatorId: beat.creator
      });
    }
  };

  return (
    <div className="mt-12 space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-[12px] uppercase tracking-[0.5em] font-black text-white">Global Beat Market</h3>
          <span className="text-[9px] text-neutral-600 uppercase tracking-widest mt-1 italic">Discover what other producers are forging</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {allBeats.length > 0 ? allBeats.map((beat) => {
          const isThisPlaying = currentTrack?._id === beat._id;

          return (
            <div 
              key={beat._id} 
              className={`group relative bg-[#0a0a0a] border ${isThisPlaying ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-white/5'} rounded-[2rem] p-6 hover:border-blue-500/30 transition-all duration-500 overflow-hidden shadow-2xl`}
            >
              {/* 🎧 PLAY BUTTON OVERLAY */}
              <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => handlePlayClick(beat)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isThisPlaying && isPlaying ? 'bg-blue-600 text-white shadow-[0_0_15px_#3b82f6] scale-110' : 'bg-white/5 text-neutral-400 hover:bg-white hover:text-black hover:scale-110'}`}
                  >
                      {isThisPlaying && isPlaying ? 'II' : '▶'}
                  </button>
              </div>

              {/* 🌊 VISUALIZER ANIMATION */}
              <div className={`mb-6 flex flex-col items-center justify-center h-24 bg-gradient-to-br ${isThisPlaying ? 'from-blue-600/10' : 'from-white/5'} to-transparent rounded-2xl relative overflow-hidden transition-all duration-500`}>
                  <div className="flex items-end gap-1.5 h-8">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                          <div 
                            key={i} 
                            className={`w-1 rounded-full ${isThisPlaying && isPlaying ? 'bg-blue-500 animate-bounce' : 'bg-blue-500/20 h-2'}`} 
                            style={{ 
                              animationDelay: `${i * 0.15}s`,
                              height: isThisPlaying && isPlaying ? `${Math.random() * 20 + 10}px` : '4px'
                            }}
                          ></div>
                      ))}
                  </div>
              </div>

              {/* INFO SECTION */}
              <div className="space-y-1">
                  <h4 className={`text-[13px] font-bold truncate uppercase tracking-tight transition-colors ${isThisPlaying ? 'text-blue-400' : 'text-white/90'}`}>
                    {beat.title}
                  </h4>
                  <span className="text-[9px] text-neutral-600 font-mono tracking-widest uppercase block">
                    PROD ID: {beat.creator?.slice(-5) || 'BF_USER'}
                  </span>
              </div>

              {/* FOOTER */}
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isThisPlaying && isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-neutral-700'}`}></div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-tighter">
                      {isThisPlaying && isPlaying ? 'Streaming' : 'Asset Live'}
                    </span>
                  </div>
                  <button className="text-[8px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors">Details</button>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full py-20 text-center border border-dashed border-white/5 rounded-[2rem]">
              <span className="text-[9px] text-neutral-600 uppercase tracking-[0.3em]">No beats found in global market</span>
          </div>
        )}
      </div>
    </div>
  );
}