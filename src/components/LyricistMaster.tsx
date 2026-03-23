import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Child components
import LyricistHub from './lyricist/LyricistHub'; 
import LyricistVault from './lyricist/LyricistVault'; 
import LyricistHome from './lyricist/LyricistHome';
import GlobalFeed from './feed/GlobalFeed'; 
import CreateDropModal from './feed/CreateDropModal'; 
import NotificationBell from './feed/NotificationBell'; 
import UserProfile from './UserProfile'; 

// 🔥 COLLAB & TOOLS IMPORTS 🔥
import CollabLobby from './CollabLobby'; 
import CollabStudio from './CollabStudio';
import SmartSplitter from './SmartSplitter';

gsap.registerPlugin(ScrollTrigger);

export default function LyricistMaster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null); // Added Main Ref for uniformity
  
  const navigate = useNavigate();
  const [showDropModal, setShowDropModal] = useState(false); 
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const [currentCollabRoom, setCurrentCollabRoom] = useState<{id: string, role: string} | null>(() => {
    const savedRoom = sessionStorage.getItem('active_collab_room');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });

  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault' | 'collab' | 'splitter' | 'profile'>(
    currentCollabRoom ? 'collab' : 'home'
  ); 

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles');
  };

  useLayoutEffect(() => {
    if (activeTab === 'collab' || activeTab === 'splitter') return; 
    
    let ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', 
        { yPercent: 120, opacity: 0, rotateX: 10 }, 
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.1 }
      );
      gsap.fromTo('.master-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' });
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.2 });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  return (
    // 🔥 MATCHED RAPPER DASHBOARD ROOT 🔥
    <div ref={containerRef} className="min-h-screen bg-[#F9F8F6] text-[#0A1A14] flex font-sans relative select-none overflow-x-hidden selection:bg-[#10B981] selection:text-white">
      
      <div className="absolute top-[-10%] left-[10%] w-[50vw] h-[50vw] bg-[#10B981] mix-blend-multiply blur-[180px] rounded-full pointer-events-none z-0 opacity-[0.08]"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-multiply pointer-events-none z-0"></div>

      {showDropModal && (
        <div className="fixed inset-0 z-[99999] bg-[#0A1A14]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in">
          <CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} />
        </div>
      )}

      {/* --- SLEEK EDITORIAL SIDEBAR --- */}
      <aside className="w-24 md:w-28 sticky top-0 h-screen bg-[#F9F8F6] border-r border-[#0A1A14]/10 flex flex-col items-center py-10 z-50 overflow-y-auto shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        
        <button 
          onClick={() => navigate('/studio/lyricist/pad')} 
          className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-[#0A1A14]/10 text-[#0A1A14] shadow-[0_10px_20px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center transition-all duration-500 hover:bg-[#10B981] hover:text-white hover:border-[#10B981] hover:shadow-[0_15px_30px_rgba(16,185,129,0.3)] group active:scale-95"
          title="Enter Ghostwriter Pad"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform duration-500">🎙️</span>
        </button>

        <nav className="flex flex-col gap-6 flex-1 mt-10 w-full px-5">
          <button onClick={() => setActiveTab('collab')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group relative overflow-hidden ${activeTab === 'collab' ? 'bg-[#0A1A14] text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] scale-105' : 'bg-white border border-[#10B981]/30 hover:bg-[#0A1A14] text-[#10B981] hover:text-white shadow-sm'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#10B981]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:scale-110 transition-transform"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="text-[7px] font-black font-mono tracking-[0.2em] uppercase relative z-10">Collab</span>
          </button>

          <button onClick={() => {setActiveTab('splitter'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room');}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'splitter' ? 'text-[#10B981]' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Royalty</span>
          </button>

          <div className="w-full h-[1px] bg-[#0A1A14]/5 my-2"></div>

          <button onClick={() => {setActiveTab('home'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room');}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'home' ? 'text-[#10B981]' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Home</span>
          </button>

          <button onClick={() => {setActiveTab('network'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room');}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'network' ? 'text-[#10B981]' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => {setActiveTab('vault'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room');}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'vault' ? 'text-[#10B981]' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Vault</span>
          </button>

          <button onClick={() => {setActiveTab('chat'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room');}} className={`sidebar-btn relative flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'chat' ? 'text-[#10B981]' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Hub</span>
            <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></div>
          </button>
        </nav>

        <div onClick={() => { setActiveTab('profile'); setCurrentCollabRoom(null); sessionStorage.removeItem('active_collab_room'); }} className="w-12 h-12 bg-white border border-[#0A1A14]/10 p-0.5 hover:border-[#10B981] transition-all mt-auto mb-4 group rounded-full shrink-0 overflow-hidden cursor-pointer" title="View Identity">
          <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Lyricist'}`} className="w-full h-full grayscale group-hover:grayscale-0 transition-all object-cover rounded-full scale-105" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA: Natural Flow --- */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        
        {/* HEADER */}
        {activeTab !== 'collab' && activeTab !== 'splitter' && (
          <header className="master-header h-24 px-10 lg:px-16 sticky top-0 bg-[#F9F8F6]/90 backdrop-blur-xl border-b border-[#0A1A14]/10 flex items-center justify-between z-40">
            <div className="flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <span className="w-1.5 h-1.5 bg-[#10B981] animate-pulse rounded-full"></span>
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#0A1A14]/50 font-black font-mono">
                  System Synced
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <NotificationBell />
              <button onClick={() => setShowDropModal(true)} className="group px-6 py-2.5 bg-transparent border border-[#0A1A14]/20 text-[#0A1A14] hover:bg-[#10B981] hover:border-[#10B981] hover:text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 active:scale-95 flex items-center gap-2">
                Drop Lyrics <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </header>
        )}

        {/* SCROLLABLE MAIN - Mimicking RapperDashboard Flow */}
        <main ref={mainRef} className="flex-1 relative z-20 w-full pb-32">
          
           {/* TITLE HEADER */}
           {activeTab !== 'collab' && activeTab !== 'splitter' && (
             <div className="pt-24 pb-20 px-10 lg:px-16 border-b border-[#0A1A14]/5 overflow-hidden text-center md:text-left">
                 <h1 className="hero-title text-[11vw] md:text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#0A1A14] m-0">
                    {activeTab === 'home' ? 'WRITER' : activeTab === 'vault' ? 'PRIVATE' : activeTab === 'network' ? 'GLOBAL' : activeTab === 'profile' ? 'YOUR' : 'SECURE'}
                 </h1>
                 <h1 className="hero-title text-[12vw] md:text-[10vw] leading-[0.8] font-serif italic tracking-tighter text-[#10B981] m-0 pr-4">
                    {activeTab === 'home' ? 'Canvas.' : activeTab === 'vault' ? 'Vault.' : activeTab === 'network' ? 'Network.' : activeTab === 'profile' ? 'Identity.' : 'Hub.'}
                 </h1>
             </div>
           )}

           {/* --- ALL TABS RENDERED IN NATURAL FLOW --- */}

           {activeTab === 'splitter' && (
              <div className="p-8 lg:p-16 flex items-start justify-center animate-in fade-in duration-500 w-full">
                  <div className="max-w-[1400px] w-full"><SmartSplitter /></div>
              </div>
           )}

           {activeTab === 'collab' && (
              <div className="w-full min-h-[calc(100vh-2rem)] pt-8 flex items-center justify-center p-4">
                 {!currentCollabRoom ? (
                    <CollabLobby onEnterRoom={(id, role) => {
                       const roomData = { id, role };
                       setCurrentCollabRoom(roomData);
                       sessionStorage.setItem('active_collab_room', JSON.stringify(roomData));
                    }} />
                 ) : (
                    <div className="w-full h-[85vh] min-h-[600px] animate-in fade-in zoom-in-95 duration-500">
                       <CollabStudio 
                          roomId={currentCollabRoom.id} 
                          role={currentCollabRoom.role} 
                          onLeave={() => {
                              setCurrentCollabRoom(null);
                              sessionStorage.removeItem('active_collab_room');
                          }} 
                       />
                    </div>
                 )}
              </div>
           )}

          {activeTab === 'home' && <div className="p-10 lg:p-16 max-w-[1800px] mx-auto w-full"><LyricistHome /></div>}
          {activeTab === 'network' && <div className="p-10 lg:p-16 pb-32 max-w-[1800px] mx-auto"><GlobalFeed /></div>}
          {activeTab === 'chat' && <div className="p-10 lg:p-16 pb-32 max-w-[1800px] mx-auto"><LyricistHub /></div>}
          {activeTab === 'vault' && <div className="grid-container p-10 lg:p-16 max-w-[1800px] mx-auto w-full"><LyricistVault /></div>}
          
          {/* PROFILE RENDER WRAPPER */}
          {activeTab === 'profile' && <div className="p-10 lg:p-16 max-w-[1800px] mx-auto w-full"><UserProfile /></div>}

        </main>
      </div>

      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(10,26,20,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #10B981; }
      `}</style>
    </div>
  );
}