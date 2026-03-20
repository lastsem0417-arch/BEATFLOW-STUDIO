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

  // ⏳ PREMIUM LOADER
  if (isLoading) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px] select-none bg-white rounded-[2.5rem] border border-[#0A1128]/5 shadow-sm m-8 lg:m-16">
           <div className="w-16 h-16 rounded-full border-[3px] border-[#0A1128]/10 border-t-[#6B7AE5] animate-spin mb-6"></div>
           <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#0A1128]/50 font-black">Syncing Vault Data...</span>
        </div>
      );
  }

  return (
    // 🔥 SCROLL FIX: No max-heights, natural flow 🔥
    <div className="w-full flex flex-col font-sans">
      
      {/* 🎩 The Cinematic Header */}
      <div className="mb-16 text-center flex flex-col items-center relative py-10 px-6">
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#6B7AE5]/10 blur-[100px] rounded-full pointer-events-none -z-10"></div>
         
         <div className="w-20 h-20 bg-white border border-[#0A1128]/10 rounded-full flex items-center justify-center mb-8 shadow-[0_15px_30px_rgba(107,122,229,0.15)] group hover:scale-105 transition-transform duration-500">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#6B7AE5] group-hover:text-[#0A1128] transition-colors"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
         </div>
         <h2 className="text-5xl md:text-6xl font-serif italic text-[#0A1128] mb-4 tracking-tighter leading-none">Your Personal Vault</h2>
         <p className="text-[#0A1128]/50 font-mono text-[10px] uppercase tracking-[0.4em] flex items-center gap-2 font-black">
            Identity Synced <span className="w-1.5 h-1.5 bg-[#6B7AE5] rounded-full animate-pulse shadow-[0_0_8px_#6B7AE5]"></span> {currentUser.username}
         </p>
      </div>

      {/* 🎛️ The Glassmorphic Grid */}
      {vaultTracks.length === 0 ? (
          <div className="max-w-4xl mx-auto flex flex-col items-center justify-center p-24 border border-dashed border-[#0A1128]/20 rounded-[3rem] bg-white select-none shadow-sm">
              <span className="text-[4rem] mb-6 opacity-30 grayscale">🎧</span>
              <h3 className="text-3xl font-serif italic text-[#0A1128] mb-4">Vault is Empty</h3>
              <p className="text-[#0A1128]/50 font-mono text-[10px] uppercase tracking-[0.3em] font-black text-center leading-relaxed">
                  Navigate to the Global Feed and heart <br/> frequencies to store them locally.
              </p>
          </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
            {vaultTracks.map(track => {
              const isThisPlaying = currentTrack?._id === track._id;
              
              return (
                <div 
                  key={track._id} 
                  onClick={() => handlePlay(track)} 
                  // 🔥 PREMIUM LIGHT CARD 🔥
                  className={`bg-white border p-6 lg:p-8 rounded-[2.5rem] cursor-pointer transition-all duration-500 group flex flex-col ${isThisPlaying ? 'border-[#6B7AE5] shadow-[0_20px_50px_rgba(107,122,229,0.15)] -translate-y-2' : 'border-[#0A1128]/5 hover:border-[#6B7AE5]/30 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)]'}`}
                >
                   {/* 💿 Cover Image Container */}
                   <div className="w-full aspect-square rounded-[1.5rem] bg-[#F4F5F7] mb-8 overflow-hidden relative border border-[#0A1128]/5 shadow-sm group-hover:shadow-md transition-shadow">
                      <img 
                        src={track.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.creatorId || track.creatorName}`} 
                        className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`} 
                        alt="Track Cover" 
                      />
                      
                      {/* 🔥 Playing Indicator (Frosted Overlay) */}
                      {isThisPlaying && (
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
                           <div className="w-16 h-16 rounded-full bg-[#6B7AE5] flex items-center justify-center shadow-[0_10px_30px_rgba(107,122,229,0.4)]">
                              {isPlaying ? (
                                  <div className="flex gap-1.5 h-6 items-end">
                                      <div className="w-1.5 bg-white h-full animate-[bounce_1s_infinite] rounded-full"></div>
                                      <div className="w-1.5 bg-white h-2/3 animate-[bounce_1s_infinite_0.1s] rounded-full"></div>
                                      <div className="w-1.5 bg-white h-4/5 animate-[bounce_1s_infinite_0.2s] rounded-full"></div>
                                  </div>
                              ) : (
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-white ml-1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              )}
                           </div>
                        </div>
                      )}

                      {/* Hover Play Indicator (When not playing) */}
                      {!isThisPlaying && (
                        <div className="absolute inset-0 bg-[#0A1128]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#6B7AE5] transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* 📝 Track Details */}
                   <div className="flex-1 flex flex-col justify-end">
                       <h3 className={`font-serif italic text-2xl md:text-3xl mb-2 truncate transition-colors duration-500 tracking-tight ${isThisPlaying ? 'text-[#6B7AE5]' : 'text-[#0A1128] group-hover:text-[#6B7AE5]'}`}>{track.title}</h3>
                       <div className="flex items-center justify-between mt-4 border-t border-[#0A1128]/5 pt-5">
                         <div className="flex flex-col gap-1.5">
                            <p className="text-[9px] text-[#0A1128]/50 uppercase tracking-[0.3em] font-black truncate">{track.creatorName}</p>
                            <p className="text-[9px] text-[#6B7AE5] uppercase tracking-[0.2em] font-mono font-bold">{track.genre || 'BeatFlow Audio'}</p>
                         </div>
                         <button onClick={(e) => { e.stopPropagation(); /* Optional: handle Unlike here */ }} className="w-10 h-10 flex items-center justify-center bg-[#F4F5F7] rounded-full border border-[#0A1128]/5 text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white transition-colors shadow-sm" title="Favorited">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
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