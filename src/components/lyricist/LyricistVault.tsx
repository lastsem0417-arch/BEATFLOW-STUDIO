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
    e.stopPropagation(); // Card click hone se rokne ke liye
    if (!window.confirm(`Are you sure you want to burn "${name}"? This cannot be undone.`)) return;

    try {
      const token = currentUser.token;
      await axios.delete(`http://localhost:5000/api/projects/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // UI se turant hata do bina refresh kiye
      setVaultItems(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert("Failed to delete project. Check backend.");
    }
  };

  // 🔥 Real-time Search Filter
  const filteredVault = vaultItems.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (item.lyrics && item.lyrics.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) return <div className="flex-1 flex items-center justify-center text-emerald-500 font-mono animate-pulse">Decrypting Vault...</div>;

  return (
    <div className="flex-1 bg-transparent p-8 flex flex-col relative z-10 h-full overflow-hidden">
        
        {/* HEADER & SEARCH BAR */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b border-white/5 pb-6 gap-4">
            <div>
                <h2 className="text-3xl font-serif italic text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">The Vault</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black mt-1">Manage Your Masterpieces</p>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search lyrics or titles..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[#0a0a0a] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-neutral-600 font-mono"
                    />
                </div>
                <div className="text-right hidden md:block border-l border-white/10 pl-4">
                    <span className="text-2xl font-mono text-white">{filteredVault.length}</span>
                    <p className="text-[8px] uppercase tracking-widest text-neutral-500">Records</p>
                </div>
            </div>
        </div>

        {/* VAULT GRID */}
        {filteredVault.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
                <span className="text-6xl mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]">🗄️</span>
                <h2 className="text-2xl font-serif italic mb-2 text-white">{searchTerm ? "No Matches Found" : "Vault is Empty"}</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] font-black text-white">{searchTerm ? "Try another keyword." : "Write something in the Studio first."}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto custom-scrollbar pb-10 pr-2">
                {filteredVault.map((item) => (
                    <div key={item._id} onClick={() => openInStudio(item)} className="bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col h-64 group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all cursor-pointer relative overflow-hidden">
                        
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start mb-1">
                            <h3 className="text-lg font-serif italic text-white truncate pr-4">{item.name}</h3>
                            {/* 🔥 DELETE BUTTON */}
                            <button 
                                onClick={(e) => handleDelete(e, item._id, item.name)}
                                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-500 transition-all p-1 z-10"
                                title="Delete Project"
                            >
                                🗑️
                            </button>
                        </div>

                        <p className="text-[8px] uppercase tracking-widest text-emerald-500 font-black mb-4 border-b border-white/5 pb-2">
                            Updated: {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                        </p>
                        
                        <div className="flex-1 overflow-hidden relative">
                            <p className="text-xs font-mono text-neutral-400 whitespace-pre-wrap leading-relaxed opacity-70">
                                {item.lyrics ? item.lyrics.substring(0, 150) + "..." : "No lyrics written yet..."}
                            </p>
                            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-[#050505] to-transparent"></div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] font-bold tracking-widest text-neutral-300">OPEN TO EDIT</span>
                            <span className="text-emerald-400">→</span>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
}