import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';

export default function ListenerVault() {
  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      } catch (err) { 
        console.error("Error fetching vault:", err); 
      } finally {
        setIsLoading(false);
      }
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

  if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full opacity-40 select-none min-h-[500px]">
           <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#8ECAE6] animate-spin mb-6"></div>
           <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#888888]">Syncing Vault Data...</span>
        </div>
      );
  }

  return (
    <div className="p-8 lg:p-12 h-full w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-700 custom-scrollbar pb-32" data-lenis-prevent="true">
      
      {/* 🎩 The Cinematic Header */}
      <div className="mb-16 text-center flex flex-col items-center relative">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8ECAE6]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
         
         <div className="w-20 h-20 bg-[#010101] border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(142,202,230,0.2)]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8ECAE6]"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
         </div>
         <h2 className="text-5xl md:text-6xl font-serif italic text-[#F0F0EB] drop-shadow-md mb-4 tracking-tighter">Your Personal Vault</h2>
         <p className="text-[#888888] font-mono text-[10px] uppercase tracking-[0.4em] flex items-center gap-2">
            Identity Synced <span className="w-1.5 h-1.5 bg-[#8ECAE6] rounded-full animate-pulse shadow-[0_0_10px_#8ECAE6]"></span> {currentUser.username}
         </p>
      </div>

      {/* 🎛️ The Glassmorphic Grid */}
      {vaultTracks.length === 0 ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-24 border border-dashed border-white/10 rounded-[3rem] bg-[#010101]/50 backdrop-blur-sm select-none">
              <span className="text-[4rem] mb-6 opacity-30 grayscale">🎧</span>
              <h3 className="text-2xl font-serif italic text-[#F0F0EB] mb-2">Vault is Empty</h3>
              <p className="text-[#888888] font-mono text-[10px] uppercase tracking-[0.3em] text-center leading-relaxed">
                  Navigate to the Global Feed and heart <br/> frequencies to store them locally.
              </p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-[1600px] mx-auto pb-20">
            {vaultTracks.map(track => {
              const isThisPlaying = currentTrack?._id === track._id;
              
              return (
                <div 
                  key={track._id} 
                  onClick={() => handlePlay(track)} 
                  className={`bg-[#010101]/80 backdrop-blur-xl border p-6 rounded-[2rem] cursor-pointer transition-all duration-500 group flex flex-col ${isThisPlaying ? 'border-[#8ECAE6]/50 shadow-[0_20px_50px_rgba(142,202,230,0.15)] -translate-y-2' : 'border-white/5 hover:border-[#8ECAE6]/30 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.8)]'}`}
                >
                   {/* 💿 Cover Image Container */}
                   <div className="w-full aspect-square rounded-[1.5rem] bg-[#0A0A0C] mb-6 overflow-hidden relative border border-white/5 shadow-inner">
                      <img 
                        src={track.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.creatorId || track.creatorName}`} 
                        className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105'}`} 
                        alt="Track Cover" 
                      />
                      
                      {/* 🔥 Playing Indicator (Frosted Overlay) */}
                      {isThisPlaying && (
                        <div className="absolute inset-0 bg-[#030305]/40 backdrop-blur-sm flex items-center justify-center transition-all duration-500">
                           <div className="w-16 h-16 rounded-full bg-[#8ECAE6]/20 border border-[#8ECAE6]/50 flex items-center justify-center shadow-[0_0_30px_rgba(142,202,230,0.4)]">
                              {isPlaying ? (
                                  <div className="flex gap-1.5 h-6 items-end">
                                      <div className="w-1.5 bg-[#F0F0EB] h-full animate-[bounce_1s_infinite] rounded-full"></div>
                                      <div className="w-1.5 bg-[#F0F0EB] h-2/3 animate-[bounce_1s_infinite_0.1s] rounded-full"></div>
                                      <div className="w-1.5 bg-[#F0F0EB] h-4/5 animate-[bounce_1s_infinite_0.2s] rounded-full"></div>
                                  </div>
                              ) : (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-[#F0F0EB] ml-1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              )}
                           </div>
                        </div>
                      )}

                      {/* Hover Play Indicator (When not playing) */}
                      {!isThisPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transform scale-90 group-hover:scale-100 transition-all duration-300">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* 📝 Track Details */}
                   <div className="flex-1 flex flex-col justify-end">
                       <h3 className={`font-serif italic text-2xl mb-1 truncate transition-colors duration-500 ${isThisPlaying ? 'text-[#8ECAE6]' : 'text-[#F0F0EB]'}`}>{track.title}</h3>
                       <div className="flex items-center justify-between mt-4 border-t border-white/5 pt-4">
                         <div className="flex flex-col">
                            <p className="text-[8px] text-[#888888] uppercase tracking-[0.3em] font-black truncate">{track.creatorName}</p>
                            <p className="text-[8px] text-[#6366F1] uppercase tracking-[0.2em] font-mono mt-1">{track.genre || 'BeatFlow Audio'}</p>
                         </div>
                         <button onClick={(e) => e.stopPropagation()} className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full border border-white/10 text-[#E63946] group-hover:bg-[#E63946]/10 group-hover:border-[#E63946]/30 transition-colors shadow-inner" title="Remove from Vault">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                         </button>
                       </div>
                   </div>
                </div>
              );
            })}
          </div>
      )}
    </div>
  );
}