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
      const res = await axios.get('import.meta.env.VITE_API_URL/api/projects/my-vault', {
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
      await axios.delete(`import.meta.env.VITE_API_URL/api/projects/delete/${id}`, {
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

  // ⏳ PREMIUM LOADER
  if (isLoading) return (
    <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[500px] border border-[#0A1A14]/5 rounded-[2.5rem] bg-white shadow-sm select-none">
       <div className="w-16 h-16 rounded-full border-2 border-[#0A1A14]/10 border-t-[#10B981] animate-spin mb-6"></div>
       <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#0A1A14]/50 font-black">Decrypting Vault...</span>
    </div>
  );

  return (
    // 🔥 PREMIUM LIGHT CANVAS 🔥
    <div className="flex-1 bg-white p-10 lg:p-16 flex flex-col relative z-10 h-full overflow-hidden border border-[#0A1A14]/5 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] font-sans text-[#0A1A14]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#10B981]/5 blur-[100px] rounded-full pointer-events-none opacity-50"></div>

        {/* 🗂️ HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 border-b border-[#0A1A14]/10 pb-8 gap-6 relative z-10">
            <div>
                <h2 className="text-4xl md:text-5xl font-serif italic text-[#0A1A14] tracking-tight">Private Vault<span className="text-[#10B981]">.</span></h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-[#0A1A14]/50 font-black mt-4 font-mono">Manage Your Compositions</p>
            </div>
            
            <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="relative w-full md:w-80 shadow-sm rounded-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0A1A14]/30"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input 
                        type="text" 
                        placeholder="Search lyrical archives..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#F9F8F6] border border-[#0A1A14]/10 rounded-full py-4 pl-12 pr-6 text-sm text-[#0A1A14] focus:outline-none focus:border-[#10B981]/50 focus:bg-white transition-all placeholder:text-[#0A1A14]/30 font-medium"
                    />
                </div>
                <div className="text-right hidden md:flex flex-col items-end border-l border-[#0A1A14]/10 pl-8 shrink-0">
                    <span className="text-3xl font-serif italic text-[#0A1A14] leading-none mb-1">{filteredVault.length}</span>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-[#10B981] font-black font-mono">Records</p>
                </div>
            </div>
        </div>

        {/* 📝 VAULT GRID */}
        {filteredVault.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-80 select-none border border-dashed border-[#0A1A14]/10 rounded-[2rem] bg-[#F9F8F6]">
                <div className="w-24 h-24 rounded-full border border-[#10B981]/20 flex items-center justify-center mb-6 relative bg-white shadow-sm">
                   <div className="absolute inset-0 rounded-full border border-[#10B981]/10 animate-[ping_3s_infinite]"></div>
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1A14]/30"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
                </div>
                <h2 className="text-3xl font-serif italic mb-3 text-[#0A1A14]">{searchTerm ? "No Archives Found" : "Vault is Empty"}</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] font-mono text-[#0A1A14]/50 font-bold">{searchTerm ? "Refine your search parameters." : "Initiate a writing session to store data."}</p>
            </div>
        ) : (
            // 🔥 data-lenis-prevent lagaya hai taaki smooth scrolling maintain rahe 🔥
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 overflow-y-auto custom-scrollbar pb-10 pr-4 h-full" data-lenis-prevent="true">
                {filteredVault.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => openInStudio(item)} 
                      className="bento-card bg-white border border-[#0A1A14]/10 rounded-[1.5rem] p-8 flex flex-col h-80 group hover:border-[#10B981] hover:shadow-[0_15px_40px_rgba(16,185,129,0.08)] hover:-translate-y-1 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <h3 className="text-2xl font-serif italic text-[#0A1A14] truncate pr-4 group-hover:text-[#10B981] transition-colors">{item.name}</h3>
                            
                            {/* 🔥 PREMIUM SVG DELETE BUTTON */}
                            <button 
                                onClick={(e) => handleDelete(e, item._id, item.name)}
                                className="opacity-0 group-hover:opacity-100 text-[#0A1A14]/30 hover:text-[#E63946] transition-all p-2 z-20 bg-[#F9F8F6] hover:bg-[#E63946]/10 rounded-full border border-transparent hover:border-[#E63946]/30"
                                title="Burn Record"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                            </button>
                        </div>

                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#0A1A14]/50 font-mono mb-6 border-b border-[#0A1A14]/10 pb-4 relative z-10 group-hover:border-[#10B981]/20 transition-colors font-bold">
                            Last Sync: <span className="text-[#10B981]">{new Date(item.updatedAt || item.createdAt).toLocaleDateString()}</span>
                        </p>
                        
                        <div className="flex-1 overflow-hidden relative z-10">
                            <p className="text-sm font-serif italic text-[#0A1A14]/60 whitespace-pre-wrap leading-relaxed group-hover:text-[#0A1A14]/90 transition-colors">
                                {item.lyrics ? item.lyrics.substring(0, 120) + "..." : "No linguistic data recorded..."}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white to-transparent"></div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-[#0A1A14]/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity relative z-10 group-hover:border-[#10B981]/20">
                            <span className="text-[8px] font-black uppercase tracking-[0.4em] text-[#0A1A14]">Access Record</span>
                            <div className="w-8 h-8 rounded-full border border-[#0A1A14]/10 flex items-center justify-center group-hover:bg-[#10B981] group-hover:text-white group-hover:border-[#10B981] transition-all">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}