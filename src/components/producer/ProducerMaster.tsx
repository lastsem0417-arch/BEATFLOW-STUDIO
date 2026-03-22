import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import AnalyticsHeader from './AnalyticsHeader';
import BeatInventory from './BeatInventory';
import UploadPortal from './UploadPortal';
import DrumPad from './DrumPad'; 
import BeatExplorer from './BeatExplorer'; 
import ProducerNetwork from './ProducerNetwork'; 
import GlobalFeed from '../feed/GlobalFeed'; 
import CreateDropModal from '../feed/CreateDropModal'; 
import NotificationBell from '../feed/NotificationBell'; 
import DraggableWebcam from '../studio/DraggableWebcam'; 

import EnvironmentTester from './EnvironmentTester'; 
import AIStemMixer from './AIStemMixer'; 

// 🔥 LOBBY, STUDIO & SPLITTER IMPORTS 🔥
import CollabLobby from '../CollabLobby'; 
import CollabStudio from '../CollabStudio';
import SmartSplitter from '../SmartSplitter'; // 👈 TERA SMART SPLITTER YAHAN AAGAYA

// Register ScrollTrigger for premium scroll animations
gsap.registerPlugin(ScrollTrigger);

export default function ProducerMaster() {  
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  const [showDropModal, setShowDropModal] = useState(false);
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  // 🔥 THE FIX: REFRESH-SAFE ROOM STATE 🔥
  const [currentCollabRoom, setCurrentCollabRoom] = useState<{id: string, role: string} | null>(() => {
    const savedRoom = sessionStorage.getItem('active_collab_room');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });

  // 🔥 UPDATED VIEW STATE 🔥
  const [activeView, setActiveView] = useState<'dashboard' | 'network' | 'chat' | 'collab' | 'splitter'>(
    currentCollabRoom ? 'collab' : 'dashboard'
  );

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) navigate('/roles');
  }, [navigate]);

  // 🔥 GSAP PREMIUM EDITORIAL ANIMATIONS 🔥
  useLayoutEffect(() => {
    if (activeView === 'collab' || activeView === 'splitter') return; 
    
    let ctx = gsap.context(() => {
      
      // 1. Massive Top Text Reveal
      gsap.fromTo('.hero-title', 
        { yPercent: 120, opacity: 0, rotateX: 10 }, 
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.1 }
      );

      // 2. Sidebar & Header smooth entry
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
      
      // 3. Scroll Reveal for components
      const scrollElements = gsap.utils.toArray('.scroll-reveal');
      if (scrollElements.length > 0) {
        gsap.fromTo(scrollElements, 
          { opacity: 0, y: 100 }, 
          { 
            opacity: 1, 
            y: 0, 
            stagger: 0.1, 
            duration: 1.2, 
            ease: "power4.out",
            scrollTrigger: {
              trigger: mainRef.current,
              start: "top 80%", 
            }
          }
        );
      }

    }, containerRef);
    
    return () => ctx.revert();
  }, [activeView, refreshTrigger]);

  return (
    // 🔥 NATURAL SCROLLING RESTORED (min-h-screen, overflow-x-hidden ONLY) 🔥
    <div ref={containerRef} className="min-h-screen bg-[#F4F3EF] text-[#001433] flex font-sans relative select-none overflow-x-hidden selection:bg-[#D4AF37] selection:text-white">
      
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none z-0 mix-blend-multiply"></div>
      <div className="fixed top-0 left-[20%] w-[50vw] h-[50vw] bg-[#D4AF37] mix-blend-multiply blur-[200px] rounded-full pointer-events-none z-0 opacity-10"></div>

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-[#001433]/90 backdrop-blur-md flex items-center justify-center"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      <DraggableWebcam />

      {/* --- SLEEK MINIMAL SIDEBAR --- */}
      <aside className="w-24 md:w-28 shrink-0 sticky top-0 h-screen border-r border-[#001433]/10 bg-[#F4F3EF] flex flex-col items-center py-10 z-50 overflow-y-auto custom-scrollbar">
        
        <div 
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-[#001433]/10 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-500 cursor-pointer group shrink-0" 
          onClick={() => navigate('/')}
          title="Back to Base"
        >
           <span className="font-serif italic text-2xl text-[#001433] group-hover:text-[#D4AF37] transition-colors">BF</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-10 w-full px-5 pb-8">
          
          <button onClick={() => setActiveView('collab')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group relative overflow-hidden ${activeView === 'collab' ? 'bg-[#001433] text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] scale-105' : 'bg-white border border-[#D4AF37]/30 hover:bg-[#001433] text-[#D4AF37] hover:text-white shadow-sm'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:scale-110 transition-transform"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            <span className="text-[7px] font-black font-mono tracking-[0.2em] uppercase relative z-10">Collab</span>
          </button>

          {/* 🔥 NAYA SPLITTER TAB 🔥 */}
          <button onClick={() => {setActiveView('splitter'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'splitter' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Royalty</span>
          </button>

          <div className="w-full h-[1px] bg-[#001433]/5 my-2"></div>

          <button onClick={() => {setActiveView('dashboard'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'dashboard' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Dash</span>
          </button>

          <button onClick={() => {setActiveView('network'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'network' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => {setActiveView('chat'); setCurrentCollabRoom(null);}} className={`sidebar-btn relative flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'chat' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Hub</span>
             <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 bg-white border border-[#001433]/10 p-0.5 hover:border-[#D4AF37] hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all duration-300 cursor-pointer overflow-hidden mt-auto mb-4 group rounded-full shrink-0" title="View Identity">
           <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Producer'}`} className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover rounded-full" alt="Profile" />
        </div>
      </aside>

      {/* --- 🏗️ MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        
        {/* HIDE HEADER IF IN COLLAB OR SPLITTER ROOM */}
        {activeView !== 'collab' && activeView !== 'splitter' && (
          <header className="h-24 px-10 lg:px-16 sticky top-0 bg-[#F4F3EF]/90 backdrop-blur-xl border-b border-[#001433]/5 flex items-center justify-between z-40">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-1.5 h-1.5 bg-[#D4AF37] animate-pulse rounded-full"></span>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-[#001433]/60 font-black font-mono">
                      SYSTEM / ACTIVE
                  </span>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <NotificationBell />
                <button onClick={() => setShowDropModal(true)} className="group px-6 py-2.5 border border-[#001433]/20 bg-transparent text-[#001433] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all duration-300 rounded-full">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    Drop Asset <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </button>
             </div>
          </header>
        )}

        {/* 🚨 NATURAL SCROLLING MAIN CONTAINER 🚨 */}
        <main ref={mainRef} className="flex-1 relative z-20 w-full pb-32">
            
           {/* HIDE TITLE IF IN COLLAB OR SPLITTER ROOM */}
           {activeView !== 'collab' && activeView !== 'splitter' && (
             <div className="pt-24 pb-20 px-10 lg:px-16 border-b border-[#001433]/5 overflow-hidden">
                <div className="overflow-hidden">
                   <h1 className="hero-title text-[11vw] md:text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#001433] m-0">
                      {activeView === 'dashboard' ? 'SONIC' : activeView === 'network' ? 'GLOBAL' : 'PRODUCER'}
                   </h1>
                </div>
                <div className="overflow-hidden">
                   <h1 className="hero-title text-[12vw] md:text-[10vw] leading-[0.8] font-serif italic tracking-tighter text-[#D4AF37] m-0 pr-4">
                      {activeView === 'dashboard' ? 'Architect.' : activeView === 'network' ? 'Network.' : 'Hub.'}
                   </h1>
                </div>
             </div>
           )}

           {/* 🔥 SMART SPLITTER (ROYALTY) MOUNTED HERE 🔥 */}
           {activeView === 'splitter' && (
              <div className="w-full p-8 lg:p-16 flex items-start justify-center animate-in fade-in duration-500 min-h-[calc(100vh-2rem)]">
                  <div className="max-w-[1400px] w-full">
                     <SmartSplitter />
                  </div>
              </div>
           )}

           {activeView === 'collab' && (
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

           {/* 🎛️ DASHBOARD BENTO BOX */}
           {activeView === 'dashboard' && (
             <div className="p-10 lg:p-16 max-w-[1800px] mx-auto w-full">
               
               <div className="scroll-reveal w-full mb-10">
                 <AnalyticsHeader />
               </div>
               
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10 w-full mb-10">
                 <div className="scroll-reveal xl:col-span-3 flex flex-col h-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                   <BeatInventory refreshTrigger={refreshTrigger} />
                 </div>
                 
                 <div className="scroll-reveal xl:col-span-1 flex flex-col h-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                   <DrumPad />
                 </div>
               </div>
               
               <div className="scroll-reveal w-full mb-10 bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                 <BeatExplorer />
               </div>
               
               <div className="scroll-reveal w-full mb-10 flex justify-center">
                 <EnvironmentTester />
               </div>

               <div className="scroll-reveal w-full mb-10 flex justify-center">
                 <AIStemMixer />
               </div>
               
               <div className="scroll-reveal w-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                 <UploadPortal onUploadSuccess={() => setRefreshTrigger(t => t + 1)} />
               </div>
               
             </div>
           )}

           {activeView === 'network' && <div className="p-10 lg:p-16 max-w-[1800px] mx-auto"><GlobalFeed /></div>}
           {activeView === 'chat' && <div className="p-10 lg:p-16 max-w-[1800px] mx-auto"><ProducerNetwork /></div>}
        </main>
      </div>

      {/* GLOBAL CUSTOM SCROLLBAR FOR ENTIRE PAGE */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #001433; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #D4AF37; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d1d1; border-radius: 10px; }
      `}</style>
    </div>
  ); 
}