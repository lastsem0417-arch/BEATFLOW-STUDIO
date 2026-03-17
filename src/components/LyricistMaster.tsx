import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LyricistHub from './lyricist/LyricistHub'; 
import LyricistVault from './lyricist/LyricistVault'; 
import LyricistHome from './lyricist/LyricistHome';
import GlobalFeed from './feed/GlobalFeed'; 
import CreateDropModal from './feed/CreateDropModal'; 
import NotificationBell from './feed/NotificationBell'; 

export default function LyricistMaster() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault'>('home'); 
  const [showDropModal, setShowDropModal] = useState(false); 
  
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  return (
    // 🔥 FIX 1: overflow-hidden hataya, min-h-screen aur relative add kiya
    <div className="flex min-h-screen bg-[#050505] font-sans relative">
      <div className="fixed top-[-10%] left-[-10%] w-[700px] h-[700px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }}></div>

      {showDropModal && <CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} />}

      {/* --- SIDEBAR --- */}
      {/* 🔥 FIX 2: sticky top-0 h-screen add kiya */}
      <aside className="w-24 sticky top-0 h-screen bg-[#080808]/80 backdrop-blur-xl border-r border-white/5 flex flex-col items-center py-8 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col gap-5 flex-1 w-full px-5 mt-4">
          
          <button onClick={() => navigate('/studio/lyricist/pad')} className="w-full aspect-square rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-transparent hover:border-emerald-500/30 text-white flex flex-col items-center justify-center transition-all group">
            <span className="text-xl group-hover:text-emerald-400 group-hover:scale-110 transition-all">🎙️</span>
            <span className="text-[7px] font-bold mt-1 tracking-widest uppercase">Mic</span>
          </button>

          <div className="h-[1px] w-8 bg-white/10 mx-auto my-2" />

          <button onClick={() => setActiveTab('home')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'home' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
            <span className="text-xl">🏠</span>
            <span className="text-[7px] font-bold mt-1 tracking-widest uppercase">Home</span>
          </button>

          <button onClick={() => setActiveTab('network')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'network' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
            <span className="text-xl">🌍</span>
            <span className="text-[7px] font-bold mt-1 tracking-widest uppercase">Feed</span>
          </button>

          <button onClick={() => setActiveTab('chat')} className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'chat' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            <span className="text-xl">💬</span>
            <span className="text-[7px] font-bold mt-1 tracking-widest uppercase">Hub</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'vault' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
            <span className="text-xl">🗄️</span>
            <span className="text-[7px] font-bold mt-1 tracking-widest uppercase">Vault</span>
          </button>
        </div>

        {/* 🔥 UNIFIED PROFILE BUTTON 🔥 */}
        <button onClick={() => navigate('/profile')} className="mt-auto w-12 h-12 rounded-full border-2 border-white/10 p-0.5 flex items-center justify-center transition-all duration-300 shadow-xl hover:border-emerald-500 overflow-hidden group" title="View Identity">
          <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Lyricist'}`} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover" alt="Profile" />
        </button>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* 🔥 FIX 3: min-h-screen add kiya aur overflow-hidden hataya */}
      <div className="flex-1 flex flex-col min-h-screen relative">
        
        {/* 🔥 FIX 4: Header ko sticky top-0 kiya */}
        <header className="h-24 px-12 sticky top-0 flex items-center justify-between z-40 bg-[#050505]/70 backdrop-blur-2xl border-b border-white/5">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <p className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-black italic">Collaboration</p>
            <h1 className="text-3xl text-white font-serif italic tracking-tight">
              {activeTab === 'network' ? 'Global Pitch Feed' : activeTab === 'chat' ? 'Network Hub' : 'Ghostwriter Pad'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <NotificationBell />
            <button onClick={() => setShowDropModal(true)} className="px-6 py-2.5 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-black rounded-full text-[10px] uppercase tracking-widest font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-105 active:scale-95">
              Drop Bars 🌍
            </button>
          </div>
        </header>

        {/* 🔥 FIX 5: h-full aur overflow-y-auto hataya, pb-32 add kiya for audio player */}
        <main className="flex-1 relative z-20 w-full pb-32">
          {activeTab === 'home' && (
            <div className="p-8 w-full max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
              <LyricistHome />
            </div>
          )}
          
          {activeTab === 'network' && (
            <div className="w-full animate-in fade-in duration-500">
              <GlobalFeed />
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="w-full animate-in fade-in duration-500">
              <LyricistHub />
            </div>
          )}
          
          {activeTab === 'vault' && (
            <div className="p-8 w-full max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500">
              <LyricistVault />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}