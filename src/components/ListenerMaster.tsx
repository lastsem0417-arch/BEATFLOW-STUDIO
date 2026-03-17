import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalFeed from './feed/GlobalFeed'; 
import UserProfile from './UserProfile';
import ZenMode4D from './listener/ZenMode4D';
import TrendingCharts from './listener/TrendingCharts'; 
import ListenerVault from './listener/ListenerVault'; 

export default function ListenerMaster() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hub' | 'feed' | 'trending' | 'vault' | 'zen'>('hub'); 
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/');
  };

  if (activeTab === 'zen') {
    return <ZenMode4D onClose={() => setActiveTab('hub')} />;
  }

  return (
    <div className="flex min-h-screen bg-[#020202] font-sans relative overflow-hidden">
      
      {/* 🌌 CINEMATIC AMBIENT GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '10s' }}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-screen"></div>

      {/* --- SIDEBAR --- */}
      <div className="w-24 sticky top-0 h-screen bg-[#050505]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center py-8 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        <div className="mb-10 w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.4)] group cursor-pointer hover:scale-110 transition-transform duration-500">
            <span className="font-serif italic font-bold text-white text-2xl drop-shadow-md">BF</span>
        </div>

        <div className="flex flex-col gap-6 flex-1 w-full px-4">
          <button onClick={() => setActiveTab('hub')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'hub' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🏠</span><span className="text-[7px] font-black tracking-widest uppercase">Hub</span>
          </button>

          <button onClick={() => setActiveTab('feed')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'feed' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🌍</span><span className="text-[7px] font-black tracking-widest uppercase">Feed</span>
          </button>
          
          <button onClick={() => setActiveTab('trending')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'trending' ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.2)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🔥</span><span className="text-[7px] font-black tracking-widest uppercase">Trend</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'vault' ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-105' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🗄️</span><span className="text-[7px] font-black tracking-widest uppercase">Vault</span>
          </button>

          <button onClick={() => setActiveTab('zen')} className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-700 bg-gradient-to-br from-black to-neutral-900 border border-white/10 text-white shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:border-white/30 group overflow-hidden relative mt-auto mb-4">
             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
             <span className="text-2xl mb-1 group-hover:scale-110 transition-transform duration-500">🌌</span>
             <span className="text-[7px] font-black tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">5D Zen</span>
          </button>
        </div>

        <div onClick={() => setActiveTab('profile')} className={`w-12 h-12 rounded-full border-2 p-0.5 flex items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden shadow-xl ${activeTab === 'profile' ? 'border-white scale-105' : 'border-white/10 hover:border-white/50 hover:scale-105'}`}>
            <img src={currentUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username || 'Fan'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-700 object-cover" alt="Profile" />
        </div>
        <button onClick={handleLogout} className="w-12 h-12 mt-6 rounded-full border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-600 hover:text-red-500 flex items-center justify-center transition-all duration-300">
          <span className="text-lg">🚪</span>
        </button>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative min-h-screen">
        <header className="h-24 px-12 flex items-center justify-between z-40 border-b border-white/5 bg-[#020202]/60 backdrop-blur-3xl sticky top-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-700">
            <p className="text-[9px] uppercase tracking-[0.5em] text-neutral-500 font-black mb-1 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]"></span> Listener Network
            </p>
            <h1 className="text-3xl text-white font-serif italic tracking-tight drop-shadow-lg">
               {activeTab === 'hub' ? `Welcome back, ${currentUser.username || 'Visionary'}` : activeTab === 'feed' ? 'Global Pitch Feed' : activeTab === 'trending' ? 'Trending Charts' : activeTab === 'vault' ? 'Your Personal Vault' : 'Identity Settings'}
            </h1>
          </div>
        </header>

        <div className="flex-1 relative z-20 w-full pb-32">
          
          {/* 🏠 THE CINEMATIC HUB */}
          {activeTab === 'hub' && (
            <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full animate-in fade-in zoom-in-95 duration-700">
               
               {/* Massive Hero Banner */}
               <div className="w-full h-[400px] rounded-[3rem] bg-[#050505] border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] group cursor-pointer mb-16">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-105 transition-all duration-1000 mix-blend-luminosity"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent"></div>
                  <div className="relative z-10 text-center mt-20">
                    <span className="px-5 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[9px] font-black uppercase tracking-[0.3em] text-white mb-6 inline-block shadow-xl">Immersive Experience</span>
                    <h2 className="text-6xl md:text-8xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 drop-shadow-2xl mb-4 transition-transform duration-700">The Discovery Hub</h2>
                  </div>
               </div>

               {/* Curated Grid Section */}
               <div className="mb-16">
                 <h3 className="text-2xl font-serif italic text-white mb-8 flex items-center gap-4">
                   Curated For You <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { title: "Midnight Synths", type: "Beat Playlist", emoji: "🎹", color: "indigo" },
                      { title: "Raw Poetry", type: "Lyrical Genius", emoji: "✍️", color: "emerald" },
                      { title: "Vocal Hooks", type: "Top Melodies", emoji: "🎙️", color: "purple" },
                      { title: "Deep Bass", type: "Subwoofer Test", emoji: "🌊", color: "orange" },
                    ].map((item, i) => (
                      <div key={i} className={`bg-[#0a0a0a]/80 backdrop-blur-md border border-white/5 hover:border-${item.color}-500/50 p-8 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-xl hover:shadow-[0_15px_40px_rgba(var(--${item.color}-rgb),0.15)] group cursor-pointer`}>
                        <span className="text-4xl mb-6 block group-hover:scale-110 transition-transform duration-500">{item.emoji}</span>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-white transition-colors">{item.title}</h4>
                        <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{item.type}</p>
                      </div>
                    ))}
                 </div>
               </div>

               {/* Top Sound Architects Section */}
               <div>
                 <h3 className="text-2xl font-serif italic text-white mb-8 flex items-center gap-4">
                   Top Sound Architects <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
                 </h3>
                 <div className="flex gap-8 overflow-x-auto pb-8 custom-scrollbar">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-4 min-w-[120px] group cursor-pointer">
                        <div className="w-24 h-24 rounded-full border border-white/10 overflow-hidden group-hover:border-indigo-500/50 transition-colors shadow-lg group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                           <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Artist${i}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="Artist" />
                        </div>
                        <div className="text-center">
                          <h5 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">Creator 0{i}</h5>
                          <p className="text-[9px] uppercase tracking-widest text-neutral-500 mt-1">Verified</p>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

            </div>
          )}

          {/* 🌍 FEED */}
          {activeTab === 'feed' && <div className="w-full animate-in fade-in duration-500"><GlobalFeed /></div>}

          {/* 🔥 TRENDING CHARTS */}
          {activeTab === 'trending' && <div className="w-full animate-in fade-in duration-500"><TrendingCharts /></div>}
          
          {/* 🗄️ VAULT */}
          {activeTab === 'vault' && <div className="w-full animate-in fade-in duration-500"><ListenerVault /></div>}
          
          {/* 👤 PROFILE */}
          {activeTab === 'profile' && <div className="w-full animate-in fade-in duration-500"><UserProfile /></div>}
        </div>
      </div>
    </div>
  );
}