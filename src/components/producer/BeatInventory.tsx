import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext'; 

export default function BeatInventory({ refreshTrigger }: { refreshTrigger: number }) {
  const [beats, setBeats] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/tracks/user/${user.id || user._id}`);
        setBeats(res.data.filter((t: any) => t.trackType === 'beat'));
      } catch (err) { console.error(err); }
    };
    fetchBeats();
  }, [refreshTrigger, user.id, user._id]);

  const handlePreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl || beat.contentUrl, 
        creatorName: user.username || 'Architect',
        creatorRole: 'producer',
        creatorId: user.id || user._id
      });
    }
  };

  return (
    <div className="bg-brand-dark border border-white/5 rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
      
      {/* 🎩 PREMIUM INVENTORY HEADER */}
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-[#010101]">
        <h3 className="text-xs uppercase tracking-[0.4em] font-black text-brand-pearl">
          Vault Assets <span className="text-producer font-serif italic text-lg ml-2">[{beats.length}]</span>
        </h3>
        <div className="flex gap-4">
            <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-producer/5 border border-producer/20 text-[9px] uppercase tracking-widest text-producer font-bold shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-producer shadow-[0_0_10px_#D4AF37] animate-pulse"></div>
                Encrypted Sync
            </div>
        </div>
      </div>
      
      {/* 🗂️ THE ASSET TABLE */}
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.01]">
              {['Asset Name', 'Created', 'Format', 'Status', 'Control'].map(h => (
                <th key={h} className="px-8 py-5 text-[9px] uppercase tracking-[0.3em] text-brand-muted font-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beats.map((beat, idx) => {
              const isThisPlaying = currentTrack?._id === beat._id;
              
              return (
                <tr 
                  key={idx} 
                  className={`group transition-all duration-500 border-b border-white/5 last:border-0 relative ${isThisPlaying ? 'bg-producer/5' : 'hover:bg-white/[0.02]'}`}
                >
                  {/* ACTIVE TRACK LEFT BORDER INDICATOR */}
                  {isThisPlaying && <td className="absolute left-0 top-0 bottom-0 w-1 bg-producer shadow-[0_0_15px_#D4AF37]"></td>}

                  <td className="px-8 py-6">
                     <div className="flex items-center gap-5">
                        
                        {/* ⏯️ SLEEK PLAY BUTTON */}
                        <div 
                          onClick={() => handlePreview(beat)}
                          className={`w-12 h-12 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-500 ${isThisPlaying ? 'bg-producer text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105' : 'bg-[#010101] text-brand-pearl border border-white/10 group-hover:border-producer group-hover:text-producer'}`}
                        >
                           {isThisPlaying && isPlaying ? (
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                           ) : (
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                           )}
                        </div>
                        
                        <div className="flex flex-col">
                          <span className={`text-[14px] font-sans font-light tracking-wide transition-colors duration-500 ${isThisPlaying ? 'text-producer font-bold' : 'text-brand-pearl group-hover:text-white'}`}>
                            {beat.title}
                          </span>
                          <span className="text-[9px] text-brand-muted uppercase tracking-[0.2em] mt-1 font-mono group-hover:text-producer/70 transition-colors">
                            ID: {beat._id.slice(-6)}
                          </span>
                        </div>
                     </div>
                  </td>
                  
                  <td className="px-8 py-6 text-[10px] font-mono text-brand-muted">{new Date(beat.createdAt).toLocaleDateString()}</td>
                  
                  <td className="px-8 py-6 text-[9px] font-mono text-producer uppercase tracking-[0.3em]">{beat.trackType}</td>
                  
                  <td className="px-8 py-6">
                     <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border transition-all duration-500 ${isThisPlaying && isPlaying ? 'bg-producer/10 text-producer border-producer/40 animate-pulse' : 'bg-white/5 text-brand-muted border-white/10'}`}>
                       {isThisPlaying && isPlaying ? 'Transmitting' : 'Archived'}
                     </span>
                  </td>
                  
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-6">
                        <button className="text-[10px] font-mono text-brand-muted hover:text-red-500 uppercase tracking-[0.2em] transition-colors">
                          Purge
                        </button>
                     </div>
                  </td>
                </tr>
              );
            })}
            
            {beats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-24 text-center text-brand-muted uppercase tracking-[0.4em] text-[9px] font-mono bg-[#010101]/50">
                  Vault is currently empty. Initialize a drop.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}