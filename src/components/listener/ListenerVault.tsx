import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';

export default function ListenerVault() {
  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const { currentTrack, isPlaying, togglePlayPause, playTrack } = useAudio();
  
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = currentUser.id || currentUser._id;

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        // Keep only tracks the current user has liked
        const likedTracks = res.data.filter((track: any) => track.likes?.includes(userId));
        setVaultTracks(likedTracks);
      } catch (err) { console.error("Error fetching vault:", err); }
    };
    fetchVault();
  }, [userId]);

  const handlePlay = (track: any) => {
    if (currentTrack?._id === track._id) {
      togglePlayPause();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="p-8 lg:p-12 h-full w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-500 custom-scrollbar pb-32">
      
      {/* Header */}
      <div className="mb-12 text-center flex flex-col items-center">
         <span className="text-6xl mb-6 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]">🎧</span>
         <h2 className="text-4xl font-serif italic text-white drop-shadow-md mb-2">Your Personal Vault</h2>
         <p className="text-blue-400/80 font-black text-[10px] uppercase tracking-[0.4em]">Synced with Identity: {currentUser.username}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        {vaultTracks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-20 border border-dashed border-white/10 rounded-[3rem] bg-white/[0.02]">
                <p className="text-neutral-500 font-mono text-sm text-center">Your vault is empty.<br/>Heart tracks in the Feed to save them here.</p>
            </div>
        ) : null}

        {vaultTracks.map(track => {
          const isThisPlaying = currentTrack?._id === track._id;
          
          return (
            <div 
              key={track._id} 
              onClick={() => handlePlay(track)} 
              className={`bg-[#0a0a0a]/80 backdrop-blur-xl border ${isThisPlaying ? 'border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.15)] -translate-y-2' : 'border-white/5 hover:border-blue-500/30 hover:-translate-y-2 hover:shadow-2xl'} p-6 rounded-[2rem] cursor-pointer transition-all duration-300 group`}
            >
               {/* Cover Image Container */}
               <div className="w-full aspect-square rounded-2xl bg-black mb-6 overflow-hidden relative border border-white/5">
                  <img src={track.creatorProfileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${track.creatorName}`} className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100 group-hover:scale-105'}`} alt="" />
                  
                  {/* Playing Indicator */}
                  {isThisPlaying && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                       <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                          {isPlaying ? (
                              <div className="flex gap-1 h-4 items-end">
                                  <div className="w-1 bg-white h-full animate-bounce"></div>
                                  <div className="w-1 bg-white h-2/3 animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-1 bg-white h-4/5 animate-bounce" style={{animationDelay: '0.2s'}}></div>
                              </div>
                          ) : (
                              <span className="text-white text-lg ml-1">▶</span>
                          )}
                       </div>
                    </div>
                  )}
               </div>

               {/* Track Details */}
               <h3 className={`font-serif italic text-xl mb-1 truncate transition-colors ${isThisPlaying ? 'text-blue-400' : 'text-white'}`}>{track.title}</h3>
               <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-4">
                 <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-black truncate">{track.creatorName}</p>
                 <span className="text-xs bg-white/5 px-2 py-1 rounded border border-white/10 text-neutral-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-colors">❤️</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}