import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

export default function GhostwriterPad({ selectedUser, currentUser }: any) {
  const [draftLyrics, setDraftLyrics] = useState("");
  const [isSavingLyrics, setIsSavingLyrics] = useState(false);
  const [userPortfolio, setUserPortfolio] = useState<any[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const loadContext = async () => {
      try {
        // Fetch Target User's Tracks
        const res = await axios.get(`http://localhost:5000/api/tracks/user/${selectedUser._id}`, { 
            headers: { Authorization: `Bearer ${currentUser.token}` } 
        });
        setUserPortfolio(res.data);
      } catch (err) {}
    };
    if (selectedUser) loadContext();
  }, [selectedUser, currentUser.token]);

  const togglePlay = (trackId: string) => { setPlayingTrackId(playingTrackId === trackId ? null : trackId); };

  // 🔥 SEND BARS AS A MASSIVE DM 🔥
  const pushLyricsToProject = async () => {
      if (!draftLyrics.trim()) return alert("Write something first!");
      setIsSavingLyrics(true);
      try {
          const messagePayload = {
              senderId: currentUser.id || currentUser._id, 
              receiverId: selectedUser._id, 
              text: "🔥 [GHOSTWRITTEN BARS]:\n\n" + draftLyrics,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          
          const tempSocket = io('http://localhost:5000');
          tempSocket.emit('send_message', messagePayload);
          await axios.post('http://localhost:5000/api/chat/send', messagePayload, { headers: { Authorization: `Bearer ${currentUser.token}` } });
          
          setTimeout(() => { 
              tempSocket.disconnect(); 
              setIsSavingLyrics(false); 
              setDraftLyrics(""); // Clear pad after sending
          }, 1000);
      } catch(e) { setIsSavingLyrics(false); alert("Failed to send lyrics."); }
  };

  const triggerAIGhostwriter = () => {
      setIsAiLoading(true);
      setTimeout(() => {
         const newBars = "\n\n[AI SUGGESTION]\nWe breakin' the mold, no chains on my soul,\nGot the Midas touch, turn the dust into gold.";
         setDraftLyrics(prev => prev + newBars);
         setIsAiLoading(false);
      }, 1500);
  };

  return (
    <div className="flex-1 bg-transparent p-10 flex flex-col relative z-10">
        
        {/* AUDIO BAR */}
        {userPortfolio.length > 0 && (
            <div className="mb-8 flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                {userPortfolio.map(track => (
                    <div key={track._id} className="flex-shrink-0 w-64 bg-[#111] border border-white/10 p-3 rounded-2xl flex items-center justify-between shadow-lg">
                        <div className="overflow-hidden pr-2">
                            <h4 className="text-xs text-white font-bold truncate">{track.title}</h4>
                            <p className="text-[8px] uppercase tracking-widest text-emerald-500 mt-1">{track.trackType} Reference</p>
                        </div>
                        <button onClick={() => togglePlay(track._id)} className="text-emerald-400 w-10 h-10 rounded-full bg-emerald-600/10 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center">
                            {playingTrackId === track._id ? '⏸' : '▶'}
                        </button>
                        {playingTrackId === track._id && track.audioUrl && <audio src={track.audioUrl} autoPlay onEnded={() => setPlayingTrackId(null)} className="hidden" />}
                    </div>
                ))}
            </div>
        )}

        {/* DISTRACTION-FREE WRITER UI */}
        <div className="flex-1 flex flex-col bg-[#050505]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 shadow-2xl relative group">
            
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div>
                    <h2 className="text-2xl font-serif italic text-white opacity-80 group-hover:opacity-100 transition-opacity">Session for {selectedUser.username}</h2>
                    <p className="text-[9px] uppercase tracking-[0.4em] text-emerald-500 font-black mt-1">Master Document</p>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={triggerAIGhostwriter} disabled={isAiLoading} className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/50 text-purple-400 rounded-full text-[9px] uppercase tracking-widest font-black hover:bg-purple-600 hover:text-white transition-all shadow-[0_0_15px_rgba(147,51,234,0.2)] disabled:opacity-50">
                        {isAiLoading ? 'Generating...' : '✨ Spark AI'}
                    </button>

                    <button onClick={pushLyricsToProject} disabled={isSavingLyrics} className={`px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-black transition-all ${isSavingLyrics ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)]' : 'bg-white text-black hover:bg-emerald-600 hover:text-white shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]'}`}>
                        {isSavingLyrics ? 'Syncing...' : 'DM Lyrics to Artist'}
                    </button>
                </div>
            </div>

            <textarea 
                value={draftLyrics}
                onChange={(e) => setDraftLyrics(e.target.value)}
                placeholder="Start typing your masterpiece..."
                className="flex-1 w-full bg-transparent border-none text-neutral-300 font-mono text-lg leading-[2.5] outline-none resize-none custom-scrollbar placeholder:text-neutral-800"
                spellCheck="false"
            />
        </div>
    </div>
  );
}