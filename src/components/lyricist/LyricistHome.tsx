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
        const vaultRes = await axios.get('import.meta.env.VITE_API_URL/api/projects/my-vault', {
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
        const feedRes = await axios.get('import.meta.env.VITE_API_URL/api/feed');
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

  // 🎬 PREMIUM EDITORIAL LOADER
  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px] border border-[#0A1A14]/5 rounded-[2.5rem] bg-white shadow-sm">
       <div className="w-16 h-16 rounded-full border-2 border-[#0A1A14]/10 border-t-[#10B981] animate-spin mb-6"></div>
       <span className="text-[10px] uppercase font-mono tracking-[0.4em] font-black text-[#0A1A14]/50">Syncing Canvas...</span>
    </div>
  );

  return (
    // 🔥 PREMIUM LIGHT BASE (Transparent so it uses LyricistMaster's Ivory base)
    <div className="flex-1 bg-transparent flex flex-col relative z-10 h-full overflow-y-auto custom-scrollbar text-[#0A1A14]" data-lenis-prevent="true">
        
        {/* 🌟 TOP EDITORIAL BANNER */}
        <div className="bg-white border border-[#0A1A14]/5 rounded-[2.5rem] p-10 md:p-16 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] group hover:shadow-[0_20px_60px_rgba(16,185,129,0.05)] transition-all duration-700">
            {/* Elegant Soft Green Glow */}
            <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-[#10B981]/10 blur-[100px] rounded-full pointer-events-none transition-opacity duration-700 group-hover:opacity-100 opacity-60"></div>
            
            <div className="z-10 relative">
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#10B981] font-black mb-4 font-mono flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  Writer's Canvas
                </p>
                <h1 className="text-4xl md:text-6xl font-serif italic text-[#0A1A14] tracking-tight leading-none mb-6">
                    Welcome, <br className="md:hidden"/> {currentUser.username || 'Ghostwriter'}.
                </h1>
                <p className="text-[#0A1A14]/60 font-serif text-base md:text-lg max-w-lg leading-relaxed border-l-[3px] border-[#10B981] pl-5 italic">
                  The industry awaits your next masterpiece. Enter the zone and forge the narrative.
                </p>
            </div>

            <button 
                onClick={() => navigate('/studio/lyricist/pad')}
                className="mt-10 md:mt-0 px-10 py-5 bg-[#0A1A14] text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(16,185,129,0.3)] hover:bg-[#10B981] transition-all duration-500 z-10 transform active:scale-95 flex items-center gap-3 shrink-0"
            >
                Open Notepad <span className="text-lg font-light leading-none">→</span>
            </button>
        </div>

        {/* 📊 STATS ROW (Clean & Minimal) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
            <div className="bg-white border border-[#0A1A14]/5 rounded-[1.5rem] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden group hover:border-[#10B981]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
                <span className="text-5xl lg:text-6xl font-black text-[#0A1A14] mb-3 tracking-tighter leading-none group-hover:text-[#10B981] transition-colors">{stats.totalProjects}</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#0A1A14]/50 font-black font-mono">Vault Records</span>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#10B981] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
            <div className="bg-white border border-[#0A1A14]/5 rounded-[1.5rem] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden group hover:border-[#10B981]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
                <span className="text-5xl lg:text-6xl font-black text-[#0A1A14] mb-3 tracking-tighter leading-none group-hover:text-[#10B981] transition-colors">{stats.totalWords}</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#0A1A14]/50 font-black font-mono">Words Penned</span>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#10B981] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
            <div className="bg-white border border-[#0A1A14]/5 rounded-[1.5rem] p-8 lg:p-10 flex flex-col justify-center relative overflow-hidden group hover:border-[#10B981]/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,0,0,0.03)]">
                <span className="text-5xl lg:text-6xl font-serif italic text-[#0A1A14] mb-3 tracking-tighter leading-none group-hover:text-[#10B981] transition-colors">Elite</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#0A1A14]/50 font-black font-mono">Current Status</span>
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#10B981] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            </div>
        </div>

        {/* 🗂️ BOTTOM SPLIT (Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pb-20">
            
            {/* Left: Recent Drafts */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-[#0A1A14]/10 pb-4">
                    <h3 className="text-[12px] uppercase tracking-[0.4em] font-black text-[#0A1A14]">Recent Drafts</h3>
                </div>
                
                <div className="flex flex-col gap-5">
                    {recentProjects.length === 0 ? (
                        <div className="bg-white border border-dashed border-[#0A1A14]/20 rounded-[1.5rem] p-12 text-center flex flex-col items-center justify-center">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#0A1A14]/30 mb-4 scale-150"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
                            <p className="text-[10px] font-mono font-black uppercase tracking-widest text-[#0A1A14]/40">No drafts initiated yet.</p>
                        </div>
                    ) : (
                        recentProjects.map((project) => (
                            <div 
                              key={project._id} 
                              onClick={() => navigate('/studio/lyricist/pad', { state: { project } })} 
                              className="bg-white border border-[#0A1A14]/5 hover:border-[#10B981] rounded-[1.5rem] p-8 flex justify-between items-center cursor-pointer group transition-all duration-500 hover:shadow-[0_15px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1"
                            >
                                <div>
                                    <h4 className="text-2xl font-serif italic text-[#0A1A14] group-hover:text-[#10B981] transition-colors">{project.name}</h4>
                                    <p className="text-[9px] uppercase tracking-[0.2em] font-black text-[#0A1A14]/40 mt-2 font-mono">Last edit: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full border border-[#0A1A14]/10 flex items-center justify-center group-hover:bg-[#10B981] group-hover:border-[#10B981] transition-all duration-300 shadow-sm">
                                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1A14]/40 group-hover:text-white transition-colors"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: REAL Global Collab Feed */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-8 border-b border-[#0A1A14]/10 pb-4">
                    <h3 className="text-[12px] uppercase tracking-[0.4em] font-black text-[#0A1A14]">Global Pitch Board</h3>
                    <span className="flex items-center gap-2 text-[9px] bg-[#10B981]/10 text-[#10B981] px-3 py-1 rounded-full border border-[#10B981]/20 uppercase tracking-[0.3em] font-black shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div> LIVE
                    </span>
                </div>

                <div className="flex flex-col gap-5">
                    {realCollabs.length === 0 ? (
                       <div className="bg-white border border-dashed border-[#0A1A14]/20 rounded-[1.5rem] p-12 text-center flex flex-col items-center justify-center">
                           <p className="text-[10px] font-mono font-black uppercase tracking-widest text-[#0A1A14]/40">No live beats available to pitch to right now.</p>
                       </div>
                    ) : (
                       realCollabs.map((post) => (
                        <div key={post._id} className="bg-white border border-[#0A1A14]/5 hover:border-[#0A1A14]/20 hover:shadow-[0_15px_40px_rgba(0,0,0,0.04)] transition-all duration-500 rounded-[1.5rem] p-8 flex flex-col group relative overflow-hidden">
                            
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border border-[#0A1A14]/10 overflow-hidden bg-[#F9F8F6] shadow-sm group-hover:border-[#D4AF37] transition-colors">
                                       <img src={post.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorId}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" alt="Producer" />
                                    </div>
                                    <div>
                                        <h4 className="text-[14px] font-bold text-[#0A1A14]">{post.creatorName}</h4>
                                        <p className="text-[8px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mt-1">{post.creatorRole}</p>
                                    </div>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/20 shadow-sm">{post.genre || 'Beat'}</span>
                            </div>
                            
                            <h4 className="text-2xl font-serif italic text-[#0A1A14] mb-3">{post.title}</h4>
                            <p className="text-sm font-light text-[#0A1A14]/60 leading-relaxed mb-8 italic border-l-[3px] border-[#10B981]/30 pl-4 line-clamp-2">"{post.description || 'Looking for lyrics...'}"</p>
                            
                            <button className="w-full py-4 bg-[#F9F8F6] border border-[#0A1A14]/5 text-[10px] uppercase tracking-[0.3em] font-black text-[#0A1A14]/50 hover:bg-[#10B981] hover:text-white rounded-full transition-all duration-300 hover:border-[#10B981] hover:shadow-[0_10px_20px_rgba(16,185,129,0.3)] mt-auto active:scale-95 flex items-center justify-center gap-2">
                                Pitch Lyrics <span className="font-serif italic font-light text-base leading-none">→</span>
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