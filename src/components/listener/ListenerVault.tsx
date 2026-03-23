import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext';

export default function ListenerVault() {
  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { currentTrack, isPlaying, togglePlayPause, playTrack } = useAudio();
  
  // State for expanding/scrolling lyrics
  const [expandedLyricId, setExpandedLyricId] = useState<string | null>(null);

  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = currentUser.id || currentUser._id;

  useEffect(() => {
    const fetchVault = async () => {
      try {
        const res = await axios.get('import.meta.env.VITE_API_URL/api/feed');
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

  const handleInteraction = (track: any) => {
    const isAudio = !!(track.contentUrl || track.audioUrl);
    
    if (isAudio) {
      // Audio Asset -> Play it
      if (currentTrack?._id === track._id) {
        togglePlayPause();
      } else {
        playTrack(track);
      }
    } else {
      // Text Asset (Lyrics) -> Toggle Expand/Read Mode
      setExpandedLyricId(expandedLyricId === track._id ? null : track._id);
    }
  };

  const getRoleColor = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return '#E63946'; // Red
    if (r === 'lyricist') return '#10B981'; // Green
    if (r === 'producer') return '#D4AF37'; // Gold
    return '#6B7AE5'; // Default Blue
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
              const isAudio = !!(track.contentUrl || track.audioUrl);
              const isThisPlaying = currentTrack?._id === track._id;
              const roleColor = getRoleColor(track.creatorRole);
              const isExpandedLyric = expandedLyricId === track._id;
              
              return (
                <div 
                  key={track._id} 
                  onClick={() => handleInteraction(track)} 
                  // 🔥 PREMIUM LIGHT CARD 🔥 (Kept exact same as your requested UI)
                  className={`bg-white border p-6 lg:p-8 rounded-[2.5rem] cursor-pointer transition-all duration-500 group flex flex-col ${isThisPlaying ? 'shadow-[0_20px_50px_rgba(107,122,229,0.15)] -translate-y-2' : 'border-[#0A1128]/5 hover:border-[#6B7AE5]/30 hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(0,0,0,0.05)]'}`}
                  style={{ borderColor: isThisPlaying ? roleColor : undefined }}
                >
                   {/* 💿 DYNAMIC CONTENT CONTAINER (Aspect Square) */}
                   <div className={`w-full aspect-square rounded-[1.5rem] bg-[#F4F5F7] mb-8 overflow-hidden relative border border-[#0A1128]/5 shadow-sm group-hover:shadow-md transition-shadow ${isExpandedLyric ? 'overflow-y-auto custom-scrollbar' : ''}`}>
                      
                      {isAudio ? (
                        /* --- AUDIO VIEW (BEATS/RAPS) --- */
                        <>
                          <img 
                            src={track.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${track.creatorId || track.creatorName}`} 
                            className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-100 scale-110' : 'opacity-80 group-hover:opacity-100 group-hover:scale-105'}`} 
                            alt="Track Cover" 
                          />
                          
                          {/* Playing Indicator (Frosted Overlay) */}
                          {isThisPlaying && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-500">
                               <div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: roleColor }}>
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
                               <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg" style={{ color: roleColor }}>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                               </div>
                            </div>
                          )}
                        </>
                      ) : (
                        /* --- LYRICS VIEW (TEXT DRAFTS) --- */
                        <div className="w-full h-full p-6 flex flex-col bg-white/50 relative">
                           <div className="flex items-center justify-between mb-4">
                             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: roleColor, opacity: 0.5 }}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                             {isExpandedLyric && <span className="text-[8px] font-black uppercase tracking-widest text-[#0A1128]/30">Scroll to read</span>}
                           </div>
                           <p className={`font-serif italic text-[#0A1128]/80 text-sm leading-relaxed ${isExpandedLyric ? 'whitespace-pre-wrap' : 'line-clamp-6'}`}>
                             "{track.lyricsText}"
                           </p>
                           
                           {/* Fade out text at the bottom if not expanded */}
                           {!isExpandedLyric && (
                             <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#F4F5F7] to-transparent pointer-events-none"></div>
                           )}
                        </div>
                      )}
                   </div>

                   {/* 📝 Track Details */}
                   <div className="flex-1 flex flex-col justify-end">
                       <h3 className={`font-serif italic text-2xl md:text-3xl mb-2 truncate transition-colors duration-500 tracking-tight ${isThisPlaying ? 'text-[#6B7AE5]' : 'text-[#0A1128] group-hover:text-[#6B7AE5]'}`}>
                         {track.title}
                       </h3>
                       <div className="flex items-center justify-between mt-4 border-t border-[#0A1128]/5 pt-5">
                         <div className="flex flex-col gap-1.5 w-full pr-2">
                            <p className="text-[9px] text-[#0A1128]/50 uppercase tracking-[0.3em] font-black truncate">{track.creatorName}</p>
                            
                            {/* Dynamic Tag based on Content Type & Role */}
                            <p className="text-[9px] uppercase tracking-[0.2em] font-mono font-bold truncate" style={{ color: roleColor }}>
                              {isAudio ? (track.creatorRole === 'producer' ? 'Instrumental Beat' : 'Vocal Track') : 'Written Draft'}
                            </p>
                         </div>
                         
                         <button onClick={(e) => { e.stopPropagation(); /* Optional unlike logic */ }} className="w-10 h-10 shrink-0 flex items-center justify-center bg-[#F4F5F7] rounded-full border border-[#0A1128]/5 text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white transition-colors shadow-sm" title="Favorited">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                         </button>
                       </div>
                   </div>
                </div>
              );
            })}
          </div>
      )}

      {/* Keep your scrollbar styles intact */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10,17,40,0.15); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10B981; }
      `}</style>
    </div>
  );
}