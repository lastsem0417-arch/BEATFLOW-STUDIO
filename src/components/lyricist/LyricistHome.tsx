import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LyricistHome() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const [recentProjects, setRecentProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalProjects: 0, totalWords: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 🔥 FETCH REAL STATS FROM VAULT
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = currentUser.token;
        const res = await axios.get('http://localhost:5000/api/projects/my-vault', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const projects = res.data;
        // Sort by newest and get top 3
        const sorted = [...projects].sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
        setRecentProjects(sorted.slice(0, 3));
        
        // Calculate total words written
        let wordCount = 0;
        projects.forEach((p: any) => {
            if (p.lyrics) wordCount += p.lyrics.split(/\s+/).filter((w: string) => w.length > 0).length;
        });

        setStats({
            totalProjects: projects.length,
            totalWords: wordCount
        });
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [currentUser.token]);

  // Fake Global Collab Feed (Iconic Vision)
  const collabFeed = [
    { id: 1, role: 'Producer', name: 'Metro Boomin', request: 'Need a dark hook for a trap beat. 140BPM.', bounty: '$500' },
    { id: 2, role: 'Rapper', name: 'Drill King', request: 'Looking for aggressive UK Drill bars. 2 Verses.', bounty: 'Split Royality' },
    { id: 3, role: 'Producer', name: 'Tay Keith', request: 'Need melodic R&B lyrics for a club banger.', bounty: '$300' },
  ];

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-emerald-500 font-mono animate-pulse">Loading Command Center...</div>;

  return (
    <div className="flex-1 bg-transparent p-8 flex flex-col relative z-10 h-full overflow-y-auto custom-scrollbar">
        
        {/* 🌟 TOP BANNER: WELCOME & QUICK ACTION */}
        <div className="bg-gradient-to-r from-emerald-900/20 to-transparent border border-emerald-500/20 rounded-3xl p-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="z-10">
                <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black mb-2">Welcome Back</p>
                <h1 className="text-4xl font-serif italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                    {currentUser.username || 'Ghostwriter'}
                </h1>
                <p className="text-neutral-400 font-mono text-sm mt-2 max-w-md">The industry is waiting for your next masterpiece. Get in the zone.</p>
            </div>

            <button 
                onClick={() => navigate('/studio/lyricist/pad')}
                className="mt-6 md:mt-0 px-8 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:bg-emerald-400 transition-all z-10 transform active:scale-95"
            >
                Enter Studio →
            </button>
        </div>

        {/* 📊 STATS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#050505]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <span className="text-4xl font-serif italic text-white mb-1 group-hover:text-emerald-400 transition-colors">{stats.totalProjects}</span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black">Vault Records</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
            
            <div className="bg-[#050505]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <span className="text-4xl font-serif italic text-white mb-1 group-hover:text-emerald-400 transition-colors">{stats.totalWords}</span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black">Total Words Written</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>

            <div className="bg-[#050505]/80 border border-white/5 rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                <span className="text-4xl font-serif italic text-white mb-1 group-hover:text-emerald-400 transition-colors">Elite</span>
                <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black">Writer Rank</span>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-all"></div>
            </div>
        </div>

        {/* 🗂️ BOTTOM SPLIT: RECENT WORKS & GLOBAL FEED */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
            
            {/* Left: Recent Masterpieces */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm uppercase tracking-widest font-black text-white/50">Recent Works</h3>
                </div>
                
                <div className="flex flex-col gap-4">
                    {recentProjects.length === 0 ? (
                        <div className="bg-[#050505]/80 border border-white/5 rounded-2xl p-8 text-center opacity-50">
                            <p className="text-xs font-mono text-white">No tracks written yet.</p>
                        </div>
                    ) : (
                        recentProjects.map((project) => (
                            <div key={project._id} onClick={() => navigate('/studio/lyricist/pad', { state: { project } })} className="bg-[#050505]/80 border border-white/5 hover:border-emerald-500/30 rounded-2xl p-5 flex justify-between items-center cursor-pointer group transition-all">
                                <div>
                                    <h4 className="text-lg font-serif italic text-white group-hover:text-emerald-400 transition-colors">{project.name}</h4>
                                    <p className="text-[8px] uppercase tracking-widest text-neutral-500 mt-1">Updated {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                                </div>
                                <span className="text-white/20 group-hover:text-emerald-400 transition-colors">→</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right: Global Collab Feed */}
            <div className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm uppercase tracking-widest font-black text-white/50">Collab Opportunities</h3>
                    <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full border border-red-500/30 uppercase tracking-widest font-black animate-pulse">Live</span>
                </div>

                <div className="flex flex-col gap-4">
                    {collabFeed.map((post) => (
                        <div key={post.id} className="bg-[#050505]/80 border border-white/5 rounded-2xl p-5 flex flex-col group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">👤</span>
                                    <div>
                                        <h4 className="text-sm font-bold text-white">{post.name}</h4>
                                        <p className="text-[8px] uppercase tracking-widest text-emerald-500 font-black">{post.role}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">{post.bounty}</span>
                            </div>
                            <p className="text-xs font-mono text-neutral-400 leading-relaxed mb-4">{post.request}</p>
                            <button className="w-full py-2 bg-white/5 hover:bg-emerald-600 text-[9px] uppercase tracking-widest font-black text-white rounded-lg transition-all border border-white/5 hover:border-emerald-500 shadow-inner">
                                Pitch Lyrics
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    </div>
  );
}