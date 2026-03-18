import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LyricistHome() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [realCollabs, setRealCollabs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalWords: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = currentUser.token;
        
        // 1. Fetch Vault Stats
        const vaultRes = await axios.get('http://localhost:5000/api/projects/my-vault', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const projects = vaultRes.data;
        const sortedVault = [...projects].sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        setRecentProjects(sortedVault.slice(0, 3));
        
        let wordCount = 0;
        projects.forEach((p: any) => {
            if (p.lyrics) wordCount += p.lyrics.split(/\s+/).filter((w: string) => w.length > 0).length;
        });
        setStats({ totalProjects: projects.length, totalWords: wordCount });

        // 2. 🔥 FETCH REAL FEED DATA FOR COLLABS 🔥
        const feedRes = await axios.get('http://localhost:5000/api/feed');
        // Filter out lyrics, only keep Beats/Audio where Lyricist can pitch
        const beatsOnly = feedRes.data.filter((post: any) => post.contentUrl).reverse().slice(0, 4);
        setRealCollabs(beatsOnly);

        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser.token]);

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full opacity-40 select-none min-h-[500px] border border-white/5 rounded-[2.5rem] bg-[#0A0A0C]">
       <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#52B788] animate-spin mb-6"></div>
       <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#888888]">Synchronizing Workspace...</span>
    </div>
  );

  return (
    <div className="flex-1 bg-transparent flex flex-col relative z-10 h-full overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
        
        {/* 🌟 TOP BANNER */}
        <div className="bg-[#010101] border border-white/5 rounded-[2rem] p-10 mb-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#52B788]/10 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="z-10">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#52B788] font-black mb-3 font-mono">Writer's Dashboard</p>
                <h1 className="text-4xl md:text-5xl font-serif italic text-[#F0F0EB] tracking-tight drop-shadow-lg">
                    Welcome, {currentUser.username || 'Ghostwriter'}.
                </h1>
                <p className="text-[#888888] font-light text-sm mt-4 max-w-md leading-relaxed border-l-2 border-[#52B788]/50 pl-4">
                  The industry awaits your next masterpiece. Enter the zone and forge the narrative.
                </p>
            </div>

            <button 
                onClick={() => navigate('/studio/lyricist/pad')}
                className="mt-8 md:mt-0 px-8 py-4 bg-[#F0F0EB] text-[#010101] rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(82,183,136,0.4)] hover:bg-[#52B788] hover:text-white transition-all duration-500 z-10 transform active:scale-95 flex items-center gap-3 group"
            >
                Open Notepad <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
        </div>

        {/* 📊 STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-[#010101] border border-white/5 rounded-[1.5rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#52B788]/30 transition-all duration-500 hover:-translate-y-1">
                <span className="text-5xl font-serif italic text-[#F0F0EB] mb-2 group-hover:text-[#52B788] transition-colors">{stats.totalProjects}</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono">Vault Records</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#52B788] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
            <div className="bg-[#010101] border border-white/5 rounded-[1.5rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#52B788]/30 transition-all duration-500 hover:-translate-y-1">
                <span className="text-5xl font-serif italic text-[#F0F0EB] mb-2 group-hover:text-[#52B788] transition-colors">{stats.totalWords}</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono">Words Penned</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#52B788] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
            <div className="bg-[#010101] border border-white/5 rounded-[1.5rem] p-8 flex flex-col justify-center relative overflow-hidden group hover:border-[#52B788]/30 transition-all duration-500 hover:-translate-y-1">
                <span className="text-5xl font-serif italic text-[#F0F0EB] mb-2 group-hover:text-[#52B788] transition-colors">Elite</span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono">Current Status</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#52B788] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
        </div>

        {/* 🗂️ BOTTOM SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            
            {/* Left: Recent Drafts */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-[#F0F0EB]">Recent Drafts</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                    {recentProjects.length === 0 ? (
                        <div className="bg-[#010101] border border-white/5 rounded-2xl p-10 text-center opacity-40 flex flex-col items-center justify-center border-dashed">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#888888] mb-3"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
                            <p className="text-[9px] font-mono uppercase tracking-widest text-[#888888]">No drafts initiated yet.</p>
                        </div>
                    ) : (
                        recentProjects.map((project) => (
                            <div 
                              key={project._id} 
                              onClick={() => navigate('/studio/lyricist/pad', { state: { project } })} 
                              className="bg-[#010101] border border-white/5 hover:border-[#52B788]/40 rounded-[1.5rem] p-6 flex justify-between items-center cursor-pointer group transition-all duration-500 hover:shadow-[0_10px_20px_rgba(82,183,136,0.1)] hover:-translate-y-0.5"
                            >
                                <div>
                                    <h4 className="text-xl font-serif italic text-[#F0F0EB] group-hover:text-[#52B788] transition-colors">{project.name}</h4>
                                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#888888] mt-1.5 font-mono">Last edit: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#52B788]/10 transition-colors">
                                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888] group-hover:text-[#52B788] transition-colors group-hover:translate-x-1 duration-300"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: REAL Global Collab Feed */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black text-[#F0F0EB]">Global Pitch Board</h3>
                    <span className="flex items-center gap-1.5 text-[8px] bg-[#E63946]/10 text-[#E63946] px-2.5 py-1 rounded-sm border border-[#E63946]/30 uppercase tracking-[0.3em] font-black animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E63946]"></div> LIVE
                    </span>
                </div>

                <div className="flex flex-col gap-4">
                    {realCollabs.length === 0 ? (
                       <div className="bg-[#010101] border border-white/5 rounded-2xl p-10 text-center opacity-40 flex flex-col items-center justify-center">
                           <p className="text-[9px] font-mono uppercase tracking-widest text-[#888888]">No live beats available to pitch to right now.</p>
                       </div>
                    ) : (
                       realCollabs.map((post) => (
                        <div key={post._id} className="bg-[#010101] border border-white/5 hover:border-white/10 transition-all rounded-[1.5rem] p-6 flex flex-col group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden bg-black">
                                       <img src={post.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorId}`} className="w-full h-full object-cover" alt="Producer" />
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-[#F0F0EB]">{post.creatorName}</h4>
                                        <p className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mt-0.5">{post.creatorRole}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-[#52B788] bg-[#52B788]/10 px-2.5 py-1 rounded border border-[#52B788]/20">{post.genre || 'Beat'}</span>
                            </div>
                            
                            <h4 className="text-lg font-serif italic text-white mb-2">{post.title}</h4>
                            <p className="text-xs font-light text-[#888888] leading-relaxed mb-5 italic border-l-2 border-white/10 pl-3 line-clamp-2">"{post.description || 'Looking for lyrics...'}"</p>
                            
                            <button className="w-full py-3 bg-white/5 hover:bg-[#52B788] text-[9px] uppercase tracking-[0.3em] font-black text-[#888888] hover:text-[#010101] rounded-xl transition-all duration-300 border border-transparent hover:border-[#52B788] hover:shadow-[0_0_20px_rgba(82,183,136,0.3)] mt-auto active:scale-95">
                                Pitch Lyrics To Beat
                            </button>
                        </div>
                       ))
                    )}
                </div>
            </div>

        </div>
    </div>
  );
}