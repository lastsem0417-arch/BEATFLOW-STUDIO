import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

export default function LiveNetwork() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null); // The active session to chat in
  const [chatMessage, setChatMessage] = useState("");

  // 1. FETCH ALL PROJECTS (To find all active rappers)
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/projects/all');
        const activeProjects = Array.isArray(res.data) ? res.data : [];
        setProjects(activeProjects);
        
        // Auto-update live lyrics/chat if a project is selected
        if (selectedProject) {
           const updated = activeProjects.find((p: any) => p._id === selectedProject._id);
           if (updated) setSelectedProject(updated);
        }
      } catch (err) { console.error("Data Fetch Error:", err); }
    };
    
    fetchRealData();
    const interval = setInterval(fetchRealData, 3000); // 3-sec sync
    return () => clearInterval(interval);
  }, [selectedProject]);

  // 2. EXTRACT UNIQUE RAPPERS (ARTISTS) FROM PROJECTS
  const uniqueArtists = useMemo(() => {
    const artistsMap = new Map();
    projects.forEach(proj => {
      const aId = typeof proj.creator === 'string' ? proj.creator : (proj.creator?._id || "Unknown");
      if (!artistsMap.has(aId)) {
        artistsMap.set(aId, {
          id: aId,
          name: typeof proj.creator === 'object' && proj.creator?.name ? proj.creator.name : `Artist_${aId.slice(-4)}`,
          projectCount: 1
        });
      } else {
        artistsMap.get(aId).projectCount += 1;
      }
    });
    return Array.from(artistsMap.values());
  }, [projects]);

  // 3. GET PROJECTS FOR SELECTED ARTIST
  const selectedArtistProjects = projects.filter(p => {
      const aId = typeof p.creator === 'string' ? p.creator : (p.creator?._id || "Unknown");
      return aId === selectedArtistId;
  });

  // Auto-select the artist's first project when clicked
  const handleArtistClick = (artistId: string) => {
      setSelectedArtistId(artistId);
      const artistProjects = projects.filter(p => {
          const aId = typeof p.creator === 'string' ? p.creator : (p.creator?._id || "Unknown");
          return aId === artistId;
      });
      if (artistProjects.length > 0) setSelectedProject(artistProjects[0]);
  };

  const handleSendMessage = async () => {
    if(!chatMessage.trim() || !selectedProject) return;
    try {
      await axios.patch(`http://localhost:5000/api/projects/update/${selectedProject._id}`, {
        producerNotes: chatMessage
      });
      setChatMessage("");
    } catch (err) {
      alert("Error sending message to Artist.");
    }
  };

  const getSafeId = (c: any) => (typeof c === 'string' ? c : c?._id || "unknown");

  return (
    <div className="h-full bg-[#080808] border border-white/5 rounded-[2rem] flex overflow-hidden shadow-2xl">
      
      {/* --- LEFT PANE: REAL ARTISTS DIRECTORY --- */}
      <div className="w-80 border-r border-white/5 bg-[#050505] flex flex-col">
        <div className="p-6 border-b border-white/5">
           <h2 className="text-xl font-serif italic text-white">Artist Roster</h2>
           <p className="text-[9px] uppercase tracking-widest text-blue-500 font-black mt-2 animate-pulse">Monitoring Active Nodes</p>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
           {uniqueArtists.length > 0 ? uniqueArtists.map((artist: any) => (
             <div 
               key={artist.id} onClick={() => handleArtistClick(artist.id)}
               className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedArtistId === artist.id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-white/5 border border-transparent'}`}
             >
               <div className="relative">
                 {/* GENERATED PROFILE PIC BASED ON RAPPER ID */}
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${artist.id}`} className="w-12 h-12 rounded-full bg-[#111] border border-white/10" alt="avatar" />
                 <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#050505] rounded-full"></div>
               </div>
               <div className="flex-1 overflow-hidden">
                 <h4 className="text-sm font-bold text-white truncate">{artist.name}</h4>
                 <p className="text-[10px] text-neutral-500 truncate font-mono">{artist.projectCount} Active Sessions</p>
               </div>
             </div>
           )) : (
             <div className="flex flex-col items-center justify-center mt-20 opacity-30">
                 <p className="text-xs text-center uppercase tracking-widest font-black">No Artists in DB yet.</p>
             </div>
           )}
        </div>
      </div>

      {/* --- MIDDLE PANE: ARTIST PROFILE & LIVE CHAT --- */}
      <div className="flex-1 flex flex-col bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
        {selectedArtistId ? (
          <>
            {/* ARTIST PROFILE HEADER */}
            <div className="p-8 border-b border-white/5 bg-[#050505] flex items-center gap-6">
               <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedArtistId}`} className="w-20 h-20 rounded-full border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]" />
               <div>
                  <h3 className="text-2xl font-serif italic text-white">Artist {selectedArtistId.slice(-4)}</h3>
                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 inline-block">Active Network Member</span>
               </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* SUB-LEFT: Artist's Project List */}
                <div className="w-64 border-r border-white/5 bg-black/40 p-6 overflow-y-auto">
                    <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-4">Session Select</p>
                    <div className="space-y-2">
                        {selectedArtistProjects.map(proj => (
                            <button 
                                key={proj._id} onClick={() => setSelectedProject(proj)}
                                className={`w-full text-left p-3 rounded-xl text-xs transition-all ${selectedProject?._id === proj._id ? 'bg-blue-600 text-white font-bold shadow-lg' : 'bg-white/5 text-neutral-400 hover:bg-white/10'}`}
                            >
                                {proj.name || "Untitled"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* SUB-RIGHT: Live Chat Workspace */}
                <div className="flex-1 flex flex-col relative">
                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                        
                        {/* RAPPER'S LYRICS DRAFT */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 self-start w-full max-w-[80%]">
                            <p className="text-[9px] uppercase tracking-widest text-blue-400 font-black mb-4 border-b border-white/5 pb-2">Artist's Live Pad</p>
                            <p className="text-sm italic text-neutral-300 whitespace-pre-wrap font-light leading-relaxed">
                                {selectedProject?.lyrics || "Artist is in the booth... no lyrics synced yet."}
                            </p>
                        </div>

                        {/* PRODUCER'S LAST MESSAGE */}
                        {selectedProject?.producerNotes && (
                           <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 self-end w-full max-w-[80%]">
                              <p className="text-[9px] uppercase tracking-widest text-blue-500 font-black mb-4 border-b border-blue-500/10 pb-2">Your Sent Directive</p>
                              <p className="text-sm text-white">{selectedProject.producerNotes}</p>
                           </div>
                        )}
                    </div>

                    {/* INPUT BOX */}
                    <div className="p-6 bg-[#0a0a0a] border-t border-white/5 flex gap-4 items-center">
                       <input 
                         type="text" placeholder="Type direct instruction to artist's DAW..." 
                         value={chatMessage} onChange={(e) => setChatMessage(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         className="flex-1 bg-white/5 border border-white/10 rounded-full px-6 py-4 text-sm text-white focus:border-blue-500 outline-none transition-all"
                       />
                       <button onClick={handleSendMessage} className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                         <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                       </button>
                    </div>
                </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="white" className="mb-4"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
            <p className="text-sm uppercase tracking-widest font-bold">Select an Artist to Monitor</p>
          </div>
        )}
      </div>
    </div>
  );
}