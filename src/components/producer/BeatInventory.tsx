import React, { useEffect, useState } from 'react';
import axios from 'axios';
// 🔥 AUDIO CONTEXT IMPORT KIYA
import { useAudio } from '../../context/AudioContext'; 

export default function BeatInventory({ refreshTrigger }: { refreshTrigger: number }) {
  const [beats, setBeats] = useState<any[]>([]);
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  // 🔥 AUDIO ACTIONS NIKALE
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

  // 🔥 PLAY HANDLER: Jo global player ko data bhejega
  const handlePreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl || beat.contentUrl, // Jo bhi field tera audio store kar rahi hai
        creatorName: user.username || 'Producer',
        creatorRole: 'producer',
        creatorId: user.id || user._id
      });
    }
  };

  return (
    <div className="bg-[#080808] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
      <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
        <h3 className="text-xs uppercase tracking-[0.3em] font-black text-white/80">
          Beat Inventory <span className="text-blue-500 ml-2">[{beats.length}]</span>
        </h3>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[9px] uppercase tracking-widest text-blue-400 font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                Cloud Sync Active
            </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              {['Asset Name', 'Created', 'Type', 'Status', 'Control'].map(h => (
                <th key={h} className="px-8 py-4 text-[9px] uppercase tracking-widest text-neutral-500 font-black">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {beats.map((beat, idx) => {
              const isThisPlaying = currentTrack?._id === beat._id;
              
              return (
                <tr key={idx} className={`group hover:bg-white/[0.03] transition-all border-b border-white/5 last:border-0 ${isThisPlaying ? 'bg-blue-500/[0.03]' : ''}`}>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-4">
                        {/* 🔥 PLAY/PREVIEW ICON */}
                        <div 
                          onClick={() => handlePreview(beat)}
                          className={`w-10 h-10 rounded-xl cursor-pointer flex items-center justify-center transition-all duration-300 ${isThisPlaying ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] scale-105' : 'bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white'}`}
                        >
                           {isThisPlaying && isPlaying ? (
                             <span className="text-xs">⏸</span>
                           ) : (
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                           )}
                        </div>
                        
                        <div className="flex flex-col">
                          <span className={`text-[13px] font-bold transition-colors ${isThisPlaying ? 'text-blue-400' : 'text-white/90'}`}>
                            {beat.title}
                          </span>
                          <span className="text-[8px] text-neutral-600 uppercase tracking-widest mt-1 font-mono">ID: {beat._id.slice(-6)}</span>
                        </div>
                     </div>
                  </td>
                  <td className="px-8 py-6 text-[10px] font-mono text-neutral-500">{new Date(beat.createdAt).toLocaleDateString()}</td>
                  <td className="px-8 py-6 text-[10px] font-mono text-blue-400 uppercase tracking-widest">{beat.trackType}</td>
                  <td className="px-8 py-6">
                     <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${isThisPlaying && isPlaying ? 'bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                       {isThisPlaying && isPlaying ? 'Transmitting' : 'Live'}
                     </span>
                  </td>
                  <td className="px-8 py-6">
                     <div className="flex items-center gap-6">
                        <button className="text-[10px] text-neutral-500 hover:text-red-500 uppercase tracking-widest transition-colors font-black">
                          Delete
                        </button>
                     </div>
                  </td>
                </tr>
              );
            })}
            
            {beats.length === 0 && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-neutral-600 uppercase tracking-widest text-[10px] font-mono italic">
                  No audio assets detected in encrypted storage.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}