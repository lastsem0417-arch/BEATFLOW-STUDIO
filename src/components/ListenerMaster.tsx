import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlobalFeed from './feed/GlobalFeed'; 
import UserProfile from './UserProfile';
import ZenMode4D from './listener/ZenMode4D';
import TrendingCharts from './listener/TrendingCharts'; 
import ListenerVault from './listener/ListenerVault'; 

export default function ListenerMaster() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hub' | 'feed' | 'trending' | 'vault' | 'zen' | 'profile'>('hub'); 
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const [topArchitects, setTopArchitects] = useState<any[]>([]);

  useEffect(() => {
    const fetchArchitects = async () => {
      try {
        const token = currentUser.token;
        const res = await axios.get('http://localhost:5000/api/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Filter out listeners, keep creators (producers, rappers, lyricists)
        const creators = res.data.filter((u: any) => u.role !== 'listener');
        
        // Just taking top 10 for display in the slider
        setTopArchitects(creators.slice(0, 10));
      } catch (err) {
        console.error("Failed to fetch architects:", err);
      }
    };
    if (activeTab === 'hub') {
      fetchArchitects();
    }
  }, [activeTab, currentUser.token]);

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles');
  };

  if (activeTab === 'zen') {
    return <ZenMode4D onClose={() => setActiveTab('hub')} />;
  }

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'text-[#E63946] border-[#E63946]/30';
    if (r === 'lyricist') return 'text-[#52B788] border-[#52B788]/30';
    return 'text-[#D4AF37] border-[#D4AF37]/30'; // Gold for Producer
  };

  const getRoleGlow = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'group-hover:border-[#E63946]/80 group-hover:shadow-[0_0_30px_rgba(230,57,70,0.3)]';
    if (r === 'lyricist') return 'group-hover:border-[#52B788]/80 group-hover:shadow-[0_0_30px_rgba(82,183,136,0.3)]';
    return 'group-hover:border-[#D4AF37]/80 group-hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]';
  };

  // Custom Curated List Data 
  const curatedList = [
    { title: "Midnight Synths", type: "Beat Playlist", hex: "#6366F1", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg> },
    { title: "Raw Poetry", type: "Lyrical Genius", hex: "#52B788", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> },
    { title: "Vocal Hooks", type: "Top Melodies", hex: "#8ECAE6", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> },
    { title: "Deep Bass", type: "Subwoofer Test", hex: "#E63946", svg: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg> },
  ];

  return (
    <div className="flex min-h-screen bg-[#030305] font-sans relative overflow-hidden select-none">
      
      {/* 🌌 CINEMATIC AMBIENT GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6366F1]/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#8ECAE6]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen"></div>

      {/* --- SLEEK SIDEBAR --- */}
      <div className="w-24 sticky top-0 h-screen bg-[#010101]/80 backdrop-blur-3xl border-r border-white/5 flex flex-col items-center py-8 z-50 shadow-[10px_0_40px_rgba(0,0,0,0.8)] shrink-0">
        
        <div 
          onClick={() => setActiveTab('hub')}
          className="mb-10 w-14 h-14 bg-[#0A0A0C] border border-white/10 rounded-[1.2rem] flex items-center justify-center shadow-inner group cursor-pointer hover:border-[#8ECAE6]/50 hover:shadow-[0_0_20px_rgba(142,202,230,0.3)] transition-all duration-500"
        >
            <span className="font-serif italic font-bold text-[#F0F0EB] text-2xl drop-shadow-md group-hover:text-[#8ECAE6] transition-colors">BF</span>
        </div>

        <nav className="flex flex-col gap-6 flex-1 w-full px-4">
          <button onClick={() => setActiveTab('hub')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'hub' ? 'bg-[#8ECAE6]/10 border border-[#8ECAE6]/30 text-[#8ECAE6] shadow-[0_0_20px_rgba(142,202,230,0.15)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Hub</span>
          </button>

          <button onClick={() => setActiveTab('feed')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'feed' ? 'bg-[#8ECAE6]/10 border border-[#8ECAE6]/30 text-[#8ECAE6] shadow-[0_0_20px_rgba(142,202,230,0.15)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Feed</span>
          </button>
          
          <button onClick={() => setActiveTab('trending')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'trending' ? 'bg-[#8ECAE6]/10 border border-[#8ECAE6]/30 text-[#8ECAE6] shadow-[0_0_20px_rgba(142,202,230,0.15)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Trend</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'vault' ? 'bg-[#8ECAE6]/10 border border-[#8ECAE6]/30 text-[#8ECAE6] shadow-[0_0_20px_rgba(142,202,230,0.15)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="text-[8px] font-mono tracking-[0.2em] uppercase">Vault</span>
          </button>

          <button onClick={() => setActiveTab('zen')} className="w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-700 bg-gradient-to-br from-[#010101] to-[#6366F1]/20 border border-[#6366F1]/30 text-[#F0F0EB] shadow-[0_0_20px_rgba(99,102,241,0.1)] hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:border-[#6366F1]/60 group overflow-hidden relative mt-auto mb-4">
             <div className="absolute inset-0 bg-[#8ECAE6] opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:scale-110 transition-transform duration-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             <span className="text-[7px] font-black tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">5D Zen</span>
          </button>
        </nav>

        {/* Profile & Logout Section */}
        <div className="flex flex-col items-center gap-4 mt-auto">
            <div onClick={() => setActiveTab('profile')} className={`w-12 h-12 rounded-full border border-white/10 p-0.5 flex items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden shadow-xl ${activeTab === 'profile' ? 'border-[#8ECAE6] scale-105 shadow-[0_0_15px_rgba(142,202,230,0.3)]' : 'hover:border-[#8ECAE6]/50 hover:scale-105'}`} title="Identity">
                <img src={currentUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username || 'Fan'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-700 object-cover scale-110" alt="Profile" />
            </div>
            
            <button 
              onClick={handleLogout} 
              className="w-10 h-10 rounded-full border border-white/5 hover:border-[#E63946]/50 bg-white/5 hover:bg-[#E63946]/10 text-[#888888] hover:text-[#E63946] flex items-center justify-center transition-all duration-300"
              title="Disconnect"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative h-screen">
        
        {/* HEADER */}
        <header className="h-24 px-10 md:px-16 flex items-center justify-between z-40 border-b border-white/5 bg-[#030305]/80 backdrop-blur-3xl sticky top-0 shrink-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <p className="text-[9px] uppercase tracking-[0.5em] text-[#888888] font-black mb-1.5 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8ECAE6] animate-pulse shadow-[0_0_10px_rgba(142,202,230,0.8)]"></span> Listener Network
            </p>
            <h1 className="text-3xl md:text-4xl text-[#F0F0EB] font-serif italic tracking-tight drop-shadow-lg">
               {activeTab === 'hub' ? `Welcome back, ${currentUser.username || 'Visionary'}.` : activeTab === 'feed' ? 'Global Audio Feed' : activeTab === 'trending' ? 'Trending Charts' : activeTab === 'vault' ? 'Personal Vault' : 'Identity Settings'}
            </h1>
          </div>
        </header>

        {/* SCROLLABLE CONTENT AREA */}
        <div className="flex-1 relative z-20 w-full overflow-y-auto custom-scrollbar pb-32" data-lenis-prevent="true">
          
          {/* 🏠 THE CINEMATIC HUB */}
          {activeTab === 'hub' && (
            <div className="p-8 md:p-12 lg:p-16 max-w-[1600px] mx-auto w-full animate-in fade-in zoom-in-95 duration-700">
               
               {/* Massive Hero Banner */}
               <div className="w-full h-[400px] rounded-[3rem] bg-[#010101] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] group cursor-pointer mb-20">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000 mix-blend-luminosity"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/60 to-transparent"></div>
                  <div className="relative z-10 text-center mt-20">
                    <span className="px-5 py-2 rounded-full bg-[#010101]/80 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.4em] text-[#8ECAE6] mb-6 inline-block shadow-xl">Immersive Experience</span>
                    <h2 className="text-5xl md:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 drop-shadow-2xl mb-4 transition-transform duration-700">The Discovery Hub</h2>
                  </div>
               </div>

               {/* Curated Grid Section */}
               <div className="mb-20">
                 <h3 className="text-3xl font-serif italic text-[#F0F0EB] mb-10 flex items-center gap-6">
                   Curated For You <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {curatedList.map((item, i) => (
                      <div 
                        key={i} 
                        className="bg-[#010101]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl group cursor-pointer relative overflow-hidden"
                        style={{ '--hover-color': item.hex } as React.CSSProperties} 
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-20 transition-opacity duration-500" style={{ backgroundColor: item.hex }}></div>
                        <div className="absolute inset-0 border-2 border-transparent rounded-[2rem] pointer-events-none transition-colors duration-500" style={{ borderColor: 'transparent' }} onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${item.hex}40`)} onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'transparent')}></div>

                        <div className="text-[#888888] mb-8 block group-hover:scale-110 transition-transform duration-500" style={{ color: item.hex }}>
                           {item.svg}
                        </div>
                        <h4 className="text-xl font-serif italic text-[#F0F0EB] mb-2 group-hover:text-white transition-colors">{item.title}</h4>
                        <p className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-mono">{item.type}</p>
                      </div>
                    ))}
                 </div>
               </div>

               {/* 🔥 REAL DYNAMIC SOUND ARCHITECTS SECTION 🔥 */}
               <div>
                 <h3 className="text-3xl font-serif italic text-[#F0F0EB] mb-10 flex items-center gap-6">
                   Top Architects <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
                 </h3>
                 <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar" data-lenis-prevent="true">
                    
                    {topArchitects.length === 0 ? (
                      <div className="text-[#888888] font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/10 p-10 rounded-2xl w-full text-center">
                         Searching the network for creators...
                      </div>
                    ) : (
                      topArchitects.map((architect) => (
                        <div 
                           key={architect._id} 
                           onClick={() => navigate(`/profile/${architect._id}`)}
                           className="flex flex-col items-center gap-5 min-w-[140px] group cursor-pointer"
                        >
                          {/* Profile Image with Dynamic Glow based on Role */}
                          <div className={`w-28 h-28 rounded-full border-[3px] border-[#010101] overflow-hidden transition-all duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative ${getRoleGlow(architect.role)}`}>
                             <img src={architect.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${architect._id}`} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-110" alt={architect.username} />
                          </div>
                          
                          {/* Name and Dynamic Role Badge */}
                          <div className="text-center">
                            <h5 className="text-sm font-bold text-[#F0F0EB] group-hover:text-white transition-colors">{architect.username}</h5>
                            <p className={`text-[8px] uppercase tracking-[0.3em] font-black mt-2 inline-block px-2 py-0.5 rounded border ${getRoleColor(architect.role)}`}>
                               {architect.role}
                            </p>
                          </div>
                        </div>
                      ))
                    )}

                 </div>
               </div>

            </div>
          )}

          {/* 🌍 FEED */}
          {activeTab === 'feed' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><GlobalFeed /></div>}

          {/* 🔥 TRENDING CHARTS */}
          {activeTab === 'trending' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><TrendingCharts /></div>}
          
          {/* 🗄️ VAULT */}
          {activeTab === 'vault' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><ListenerVault /></div>}
          
          {/* 👤 PROFILE */}
          {activeTab === 'profile' && <div className="w-full animate-in fade-in duration-500"><UserProfile /></div>}
          
        </div>
      </div>
    </div>
  );
}