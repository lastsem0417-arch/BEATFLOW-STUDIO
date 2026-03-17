import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalFeed from './feed/GlobalFeed'; 
import UserProfile from './UserProfile';
// 🔥 MODULAR IMPORTS (Uncommented and Ready!) 🔥
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

  // 🔥 CLEAN ARCHITECTURE: Render Zen Mode separately
  if (activeTab === 'zen') {
    return <ZenMode4D onClose={() => setActiveTab('hub')} />;
  }

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden font-sans">
      
      {/* SIDEBAR */}
      <div className="w-24 bg-[#0a0a0a]/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="mb-10 w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center border border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.4)] group cursor-pointer hover:scale-110 transition-transform">
            <span className="font-serif italic font-bold text-white text-2xl drop-shadow-md">BF</span>
        </div>

        <div className="flex flex-col gap-6 flex-1 w-full px-4">
          <button onClick={() => setActiveTab('hub')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'hub' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🏠</span><span className="text-[7px] font-black tracking-widest uppercase">Hub</span>
          </button>

          <button onClick={() => setActiveTab('feed')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'feed' ? 'bg-white/10 border border-white/20 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🌍</span><span className="text-[7px] font-black tracking-widest uppercase">Feed</span>
          </button>
          
          <button onClick={() => setActiveTab('trending')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'trending' ? 'bg-orange-500/10 border border-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🔥</span><span className="text-[7px] font-black tracking-widest uppercase">Trend</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'vault' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'bg-transparent border border-transparent hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-2xl mb-1">🗄️</span><span className="text-[7px] font-black tracking-widest uppercase">Vault</span>
          </button>

          <button onClick={() => setActiveTab('zen')} className="w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 bg-gradient-to-br from-black to-neutral-900 border border-white/10 text-white shadow-[0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:border-white/30 group overflow-hidden relative mt-auto mb-4">
             <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
             <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">🌌</span>
             <span className="text-[7px] font-black tracking-widest uppercase text-white/50 group-hover:text-white">5D Zen</span>
          </button>
        </div>

        <div onClick={() => setActiveTab('profile')} className={`w-12 h-12 rounded-full border-2 p-0.5 flex items-center justify-center transition-all cursor-pointer overflow-hidden shadow-xl ${activeTab === 'profile' ? 'border-white' : 'border-white/10 hover:border-white/50'}`}>
            <img src={currentUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username || 'Fan'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-500 object-cover" alt="Profile" />
        </div>
        <button onClick={handleLogout} className="w-12 h-12 mt-6 rounded-full border border-white/5 hover:border-red-500/50 hover:bg-red-500/10 text-neutral-600 hover:text-red-500 flex items-center justify-center transition-all">
          <span className="text-lg">🚪</span>
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden relative bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-900/10 to-transparent pointer-events-none -z-10"></div>
        <div className="absolute inset-0 bg-[#050505]/95 z-0"></div> 

        <header className="h-24 px-12 flex items-center justify-between z-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-2xl sticky top-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 font-black mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Listener Network
            </p>
            <h1 className="text-3xl text-white font-serif italic tracking-tight">
               {activeTab === 'hub' ? `Welcome back, ${currentUser.username || 'Fan'}` : activeTab === 'feed' ? 'Global Pitch Feed' : activeTab === 'trending' ? 'Trending Charts' : activeTab === 'vault' ? 'Your Personal Vault' : 'Identity Settings'}
            </h1>
          </div>
        </header>

        <div className="flex-1 overflow-hidden z-20 h-full flex flex-col relative w-full pb-32 custom-scrollbar">
          
          {/* 🏠 HUB */}
          {activeTab === 'hub' && (
            <div className="p-8 lg:p-12 h-full w-full overflow-y-auto animate-in fade-in zoom-in-95 duration-500">
               <div className="w-full h-80 rounded-[3rem] bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl group cursor-pointer mb-12">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1493225457124-a1a2a5f5f4b5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 group-hover:opacity-40 transition-opacity duration-700 mix-blend-overlay"></div>
                  <div className="relative z-10 text-center">
                    <span className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[9px] font-black uppercase tracking-widest text-white mb-6 inline-block">Featured Today</span>
                    <h2 className="text-5xl md:text-7xl font-serif italic text-white drop-shadow-2xl mb-4 group-hover:scale-105 transition-transform duration-500">The Discovery Hub</h2>
                  </div>
               </div>
            </div>
          )}

          {/* 🌍 FEED */}
          {activeTab === 'feed' && <div className="h-full w-full animate-in fade-in duration-500"><GlobalFeed /></div>}

          {/* 🔥 TRENDING CHARTS (Fully Integrated) */}
          {activeTab === 'trending' && <div className="h-full w-full animate-in fade-in duration-500"><TrendingCharts /></div>}
          
          {/* 🗄️ VAULT (Fully Integrated) */}
          {activeTab === 'vault' && <div className="h-full w-full animate-in fade-in duration-500"><ListenerVault /></div>}
          
          {/* 👤 PROFILE */}
          {activeTab === 'profile' && <div className="h-full w-full overflow-y-auto animate-in fade-in duration-500"><UserProfile /></div>}
        </div>
      </div>
    </div>
  );
}