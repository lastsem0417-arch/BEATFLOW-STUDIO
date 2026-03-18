import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LyricistVault() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const [vaultItems, setVaultItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchVault();
  }, []);

  const fetchVault = async () => {
    try {
      const token = currentUser.token;
      const res = await axios.get('http://localhost:5000/api/projects/my-vault', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sort by newest first
      const sorted = res.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setVaultItems(sorted);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const openInStudio = (project: any) => {
    navigate('/studio/lyricist/pad', { state: { project } });
  };

  const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); 
    if (!window.confirm(`Are you sure you want to burn "${name}"? This action is irreversible.`)) return;

    try {
      const token = currentUser.token;
      await axios.delete(`http://localhost:5000/api/projects/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVaultItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert("Failed to delete project. Check backend.");
    }
  };

  const filteredVault = vaultItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.lyrics && item.lyrics.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full opacity-40 select-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen min-h-[500px] border border-white/5 rounded-[2rem] bg-[#0A0A0C]">
       <div className="w-16 h-16 rounded-full border-2 border-white/10 border-t-[#52B788] animate-spin mb-6"></div>
       <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#888888]">Decrypting Vault...</span>
    </div>
  );

  return (
    <div className="flex-1 bg-[#0A0A0C]/90 backdrop-blur-xl p-8 lg:p-12 flex flex-col relative z-10 h-full overflow-hidden border border-white/5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#52B788]/5 blur-[100px] rounded-full pointer-events-none"></div>

        {/* 🗂️ HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-white/5 pb-8 gap-6 relative z-10">
            <div>
                <h2 className="text-3xl font-serif italic text-[#F0F0EB]">Private Vault<span className="text-[#52B788]">.</span></h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#888888] font-black mt-2 font-mono">Manage Your Compositions</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="relative w-full md:w-80">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                        type="text" 
                        placeholder="Search lyrical archives..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#010101] border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-sm text-[#F0F0EB] focus:outline-none focus:border-[#52B788]/50 focus:bg-white/[0.02] transition-all placeholder:text-[#888888]/50 font-mono shadow-inner"
                    />
                </div>
                <div className="text-right hidden md:flex flex-col items-end border-l border-white/10 pl-6 shrink-0">
                    <span className="text-2xl font-serif italic text-[#F0F0EB] leading-none mb-1">{filteredVault.length}</span>
                    <p className="text-[8px] uppercase tracking-widest text-[#52B788] font-black">Records</p>
                </div>
            </div>
        </div>

        {/* 📝 VAULT GRID */}
        {filteredVault.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none border border-dashed border-white/10 rounded-2xl bg-[#010101]/50">
                <div className="w-24 h-24 rounded-full border border-[#52B788]/30 flex items-center justify-center mb-6 relative">
                   <div className="absolute inset-0 rounded-full border border-[#52B788]/10 animate-[ping_3s_infinite]"></div>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
                </div>
                <h2 className="text-3xl font-serif italic mb-2 text-[#F0F0EB]">{searchTerm ? "No Archives Found" : "Vault is Empty"}</h2>
                <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-[#888888]">{searchTerm ? "Refine your search parameters." : "Initiate a writing session to store data."}</p>
            </div>
        ) : (
            // 🔥 data-lenis-prevent lagaya hai taaki smooth scrolling maintain rahe 🔥
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-10 pr-2 h-full" data-lenis-prevent="true">
                {filteredVault.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => openInStudio(item)} 
                      className="bento-card bg-[#010101] border border-white/5 rounded-[1.5rem] p-7 flex flex-col h-72 group hover:border-[#52B788]/40 hover:shadow-[0_15px_30px_rgba(82,183,136,0.1)] hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <h3 className="text-xl font-serif italic text-[#F0F0EB] truncate pr-4 group-hover:text-white transition-colors">{item.name}</h3>
                            
                            {/* 🔥 PREMIUM SVG DELETE BUTTON */}
                            <button 
                                onClick={(e) => handleDelete(e, item._id, item.name)}
                                className="opacity-0 group-hover:opacity-100 text-[#888888] hover:text-[#E63946] transition-all p-1 z-20 bg-white/5 hover:bg-[#E63946]/10 rounded-md"
                                title="Burn Record"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <p className="text-[8px] uppercase tracking-[0.3em] text-[#888888] font-mono mb-5 border-b border-white/5 pb-4 relative z-10 group-hover:border-[#52B788]/20 transition-colors">
                            Last Sync: <span className="text-[#52B788]">{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                        </p>
                        
                        <div className="flex-1 overflow-hidden relative z-10">
                            <p className="text-xs font-mono text-[#888888] whitespace-pre-wrap leading-relaxed group-hover:text-[#F0F0EB]/80 transition-colors">
                                {item.lyrics ? item.lyrics.substring(0, 120) + "..." : "No linguistic data recorded..."}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#010101] to-transparent"></div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity relative z-10 group-hover:border-[#52B788]/20">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#F0F0EB]">Access Record</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#52B788]"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}