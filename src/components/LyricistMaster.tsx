import React, { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

// Child components
import LyricistHub from './lyricist/LyricistHub'; 
import LyricistVault from './lyricist/LyricistVault'; 
import LyricistHome from './lyricist/LyricistHome';
import GlobalFeed from './feed/GlobalFeed'; 
import CreateDropModal from './feed/CreateDropModal'; 
import NotificationBell from './feed/NotificationBell'; 

export default function LyricistMaster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault'>('home'); 
  const [showDropModal, setShowDropModal] = useState(false); 
  
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles');
  };

  // 🔥 GSAP CINEMATIC ENTRY
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.master-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' });
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.2 });
      gsap.fromTo('.bento-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: [0.76, 0, 0.24, 1], delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    <div ref={containerRef} className="flex min-h-screen bg-[#0A0A0C] font-sans relative select-none">
      
      {/* 🟢 AMBIENT GREEN ROOM GLOW */}
      <div className="fixed top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#52B788]/5 blur-[200px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-2xl"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      {/* --- SLEEK SIDEBAR --- */}
      <aside className="w-24 sticky top-0 h-screen bg-[#030305]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col items-center py-8 z-50 shadow-[10px_0_30px_rgba(0,0,0,0.8)]">
        
        {/* MIC LAUNCHER */}
        <button 
          onClick={() => navigate('/studio/lyricist/pad')} 
          className="w-14 h-14 rounded-[1rem] bg-[#010101] hover:bg-[#52B788]/10 border border-white/10 hover:border-[#52B788]/50 text-[#F0F0EB] flex flex-col items-center justify-center transition-all duration-500 shadow-inner group hover:shadow-[0_0_30px_rgba(82,183,136,0.3)] mb-4"
          title="Enter Ghostwriter Pad"
        >
          <span className="text-xl group-hover:text-[#52B788] group-hover:scale-110 transition-all duration-500">🎙️</span>
        </button>

        <div className="w-10 h-[1px] bg-white/10 my-4" />

        <nav className="flex flex-col gap-6 flex-1 w-full px-4">
          <button onClick={() => setActiveTab('home')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'home' ? 'bg-[#52B788]/10 border border-[#52B788]/30 text-[#52B788] shadow-[0_0_20px_rgba(82,183,136,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Home</span>
          </button>

          <button onClick={() => setActiveTab('network')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'network' ? 'bg-[#52B788]/10 border border-[#52B788]/30 text-[#52B788] shadow-[0_0_20px_rgba(82,183,136,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'vault' ? 'bg-[#52B788]/10 border border-[#52B788]/30 text-[#52B788] shadow-[0_0_20px_rgba(82,183,136,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Vault</span>
          </button>

          <button onClick={() => setActiveTab('chat')} className={`sidebar-btn relative w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'chat' ? 'bg-[#52B788]/10 border border-[#52B788]/30 text-[#52B788] shadow-[0_0_20px_rgba(82,183,136,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-[#888888] hover:text-[#F0F0EB]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Hub</span>
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#52B788] rounded-full animate-pulse shadow-[0_0_10px_#52B788]"></div>
          </button>
        </nav>

        {/* LOGOUT & PROFILE */}
        <div className="flex flex-col items-center gap-4 mt-auto">
          <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border border-white/10 p-0.5 flex items-center justify-center transition-all duration-500 shadow-xl hover:border-[#52B788] overflow-hidden cursor-pointer" title="View Identity">
            <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Lyricist'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-500 object-cover scale-110" alt="Profile" />
          </div>
          
          <button onClick={handleLogout} className="w-10 h-10 rounded-full border border-white/5 hover:border-[#E63946]/50 bg-white/5 hover:bg-[#E63946]/10 text-[#888888] hover:text-[#E63946] flex items-center justify-center transition-all duration-300" title="Disconnect">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        
        <header className="master-header h-28 px-12 sticky top-0 flex items-center justify-between z-40 bg-[#030305]/80 backdrop-blur-3xl border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.6em] text-[#888888] font-black italic mb-1.5">Ghostwriter Console</span>
            <h1 className="text-3xl text-[#F0F0EB] font-serif italic tracking-tight">
              {activeTab === 'network' ? 'Global Pitch Feed' : activeTab === 'chat' ? 'Network Hub' : activeTab === 'vault' ? 'Private Vault' : 'Writing Session'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell />
            <button onClick={() => setShowDropModal(true)} className="px-6 py-3.5 bg-white/5 border border-white/10 text-[#888888] hover:bg-[#52B788]/10 hover:border-[#52B788]/50 hover:text-[#52B788] rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-500 shadow-lg hover:scale-105 active:scale-95 group">
              Drop Lyrics <span className="group-hover:text-white transition-colors">🌍</span>
            </button>
            <button onClick={() => navigate('/studio/lyricist/pad')} className="px-8 py-3.5 bg-[#F0F0EB] text-[#010101] rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#52B788] hover:text-white hover:shadow-[0_0_30px_rgba(82,183,136,0.4)] transition-all duration-500 hover:scale-105 active:scale-95">
              Open Notepad
            </button>
          </div>
        </header>

        <main className="flex-1 relative z-20 w-full pb-32">
          {activeTab === 'home' && <div className="p-8 lg:p-12 w-full max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500"><LyricistHome /></div>}
          {activeTab === 'network' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><GlobalFeed /></div>}
          {activeTab === 'chat' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><LyricistHub /></div>}
          {activeTab === 'vault' && <div className="p-8 lg:p-12 w-full max-w-[1600px] mx-auto animate-in fade-in zoom-in-95 duration-500"><LyricistVault /></div>}
        </main>
      </div>
    </div>
  );
}