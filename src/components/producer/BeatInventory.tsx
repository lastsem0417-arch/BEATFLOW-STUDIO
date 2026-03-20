import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAudio } from '../../context/AudioContext'; 

export default function BeatInventory({ refreshTrigger }: { refreshTrigger: number }) {
  const [beats, setBeats] = useState<any[]>([]);
  const [localTrigger, setLocalTrigger] = useState(0); 
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
  }, [refreshTrigger, localTrigger, user.id, user._id]);

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

  // 🔥 DELETE FUNCTION ADDED 🔥
  const handleDelete = async (trackId: string) => {
    if (!window.confirm("System Warning: Purge this asset from the vault? This cannot be undone.")) return;

    try {
      const token = user.token;
      await axios.delete(`http://localhost:5000/api/tracks/${trackId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setLocalTrigger(prev => prev + 1);
    } catch (err: any) {
      console.error("Delete failed:", err);
      alert(err.response?.data?.message || "Purge Failed. System Error.");
    }
  };

  return (
    // 🔥 PREMIUM EDITORIAL CONTAINER 🔥
    <div className="w-full bg-transparent overflow-hidden relative font-sans h-full flex flex-col">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
           <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#001433] flex items-center gap-4 leading-none">
             VAULT ASSETS 
           </h3>
           <p className="text-[10px] font-mono text-[#001433]/50 uppercase tracking-[0.3em] mt-3 flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37] animate-pulse"></span>
             {beats.length} Verified Signatures
           </p>
        </div>
      </div>
      
      <div className="overflow-x-auto w-full flex-1 custom-scrollbar">
        <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="border-b border-[#001433]/10">
              {['Asset Data', 'Timestamp', 'Format', 'Status', ''].map((h, i) => (
                <th key={i} className={`px-6 py-4 text-[9px] uppercase tracking-[0.3em] text-[#001433]/50 font-black ${i === 4 ? 'text-right' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beats.map((beat, idx) => {
              const isThisPlaying = currentTrack?._id === beat._id;
              
              return (
                <tr 
                  key={idx} 
                  className={`group transition-all duration-300 border-b border-[#001433]/5 last:border-b-0 hover:bg-white ${isThisPlaying ? 'bg-white shadow-[0_5px_15px_rgba(212,175,55,0.1)]' : ''}`}
                >
                  <td className="px-6 py-5">
                     <div className="flex items-center gap-5">
                        <button 
                          onClick={() => handlePreview(beat)}
                          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border ${isThisPlaying && isPlaying ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_5px_15px_rgba(212,175,55,0.4)]' : 'bg-[#F4F3EF] border-[#001433]/10 text-[#001433] group-hover:bg-[#001433] group-hover:border-[#001433] group-hover:text-white'}`}
                        >
                           {isThisPlaying && isPlaying ? (
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                           ) : (
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                           )}
                        </button>
                        
                        <div className="flex flex-col">
                          <span className={`text-[18px] font-serif italic tracking-tight transition-colors ${isThisPlaying ? 'text-[#D4AF37]' : 'text-[#001433] group-hover:text-[#D4AF37]'}`}>
                            {beat.title}
                          </span>
                          <span className="text-[9px] text-[#001433]/40 font-bold uppercase tracking-widest mt-1 font-mono">
                            ID_{beat._id.slice(-6)}
                          </span>
                        </div>
                     </div>
                  </td>
                  
                  <td className="px-6 py-5 text-[11px] font-mono text-[#001433]/60">{new Date(beat.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-5 text-[10px] font-black text-[#001433]/60 uppercase tracking-widest">{beat.trackType}</td>
                  
                  <td className="px-6 py-5">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors ${isThisPlaying && isPlaying ? 'bg-[#D4AF37]/10 text-[#D4AF37]' : 'bg-[#F4F3EF] text-[#001433]/40'}`}>
                       {isThisPlaying && isPlaying ? 'LIVE' : 'ARCHIVED'}
                     </span>
                  </td>
                  
                  <td className="px-6 py-5 text-right">
                     <button 
                       onClick={() => handleDelete(beat._id)}
                       className="text-[9px] font-black text-[#001433]/40 hover:text-white bg-transparent hover:bg-[#E63946] px-4 py-2 rounded-full uppercase tracking-widest transition-all"
                       title="Delete Asset"
                     >
                       PURGE
                     </button>
                  </td>
                </tr>
              );
            })}
            
            {beats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="inline-block px-8 py-4 border border-dashed border-[#001433]/20 rounded-[1rem] text-[#001433]/40 uppercase tracking-[0.3em] text-[10px] font-black font-mono">
                    VAULT IS EMPTY. INITIALIZE A DROP.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}