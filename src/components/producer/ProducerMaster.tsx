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

// Register ScrollTrigger for premium scroll animations
gsap.registerPlugin(ScrollTrigger);

export default function ProducerMaster() {  
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'network' | 'chat'>('dashboard');
  const [showDropModal, setShowDropModal] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) navigate('/roles');
  }, [navigate]);

  // 🔥 GSAP PREMIUM EDITORIAL ANIMATIONS 🔥
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Massive Top Text Reveal (The "Likha hua aaye upar" effect)
      gsap.fromTo('.hero-title', 
        { yPercent: 120, opacity: 0, rotateX: 10 }, 
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.1 }
      );

      // 2. Sidebar & Header smooth entry
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
      
      // 3. Scroll Reveal for components (Scroll karu toh blocks aayein)
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
              start: "top 80%", // Animates when grid enters 80% of screen
            }
          }
        );
      }

    }, containerRef);
    
    return () => ctx.revert();
  }, [activeView, refreshTrigger]);

  return (
    // 🔥 PREMIUM LIGHT BASE (#F4F3EF) + DEEP NAVY (#001433) + GOLD/YELLOW (#D4AF37) 🔥
    <div ref={containerRef} className="min-h-screen bg-[#F4F3EF] text-[#001433] flex font-sans relative select-none overflow-x-hidden selection:bg-[#D4AF37] selection:text-white">
      
      {/* Subtle Noise Texture for Editorial Feel */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none z-0 mix-blend-multiply"></div>
      {/* Very faint warm glow for Producer vibe */}
      <div className="fixed top-0 left-[20%] w-[50vw] h-[50vw] bg-[#D4AF37] mix-blend-multiply blur-[200px] rounded-full pointer-events-none z-0 opacity-10"></div>

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-[#001433]/90 backdrop-blur-md"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      <DraggableWebcam />

      {/* --- SLEEK MINIMAL SIDEBAR --- */}
      <aside className="w-24 md:w-28 sticky top-0 h-screen border-r border-[#001433]/10 bg-[#F4F3EF] flex flex-col items-center py-10 z-50">
        
        {/* Brand Logo */}
        <div 
          className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-[#001433]/10 flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:border-[#D4AF37] hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-500 cursor-pointer group" 
          onClick={() => navigate('/')}
          title="Back to Base"
        >
           <span className="font-serif italic text-2xl text-[#001433] group-hover:text-[#D4AF37] transition-colors">BF</span>
        </div>
        
        <nav className="flex flex-col gap-8 flex-1 mt-20 w-full px-5">
          <button onClick={() => setActiveView('dashboard')} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'dashboard' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Dash</span>
          </button>

          <button onClick={() => setActiveView('network')} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'network' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => setActiveView('chat')} className={`sidebar-btn relative flex flex-col items-center justify-center transition-all duration-300 group ${activeView === 'chat' ? 'text-[#D4AF37]' : 'text-[#001433]/40 hover:text-[#001433]'}`}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Hub</span>
             <div className="absolute top-0 right-1 w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></div>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 bg-white border border-[#001433]/10 p-0.5 hover:border-[#D4AF37] hover:shadow-[0_5px_15px_rgba(212,175,55,0.3)] transition-all duration-300 cursor-pointer overflow-hidden mt-auto group rounded-full" title="View Identity">
           <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Producer'}`} className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover rounded-full" alt="Profile" />
        </div>
      </aside>

      {/* --- 🏗️ MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative z-10 min-h-screen">
        
        {/* 🎩 THE EDITORIAL HEADER */}
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

        <main ref={mainRef} className="flex-1 w-full relative z-20 pb-32">
           
           {/* 🔥 MASSIVE TYPOGRAPHY INTRO (The "Likha hua aaye upar") 🔥 */}
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

           {/* 🎛️ DASHBOARD BENTO BOX (Clean White Cards on Alabaster Base) */}
           {activeView === 'dashboard' && (
             <div className="p-10 lg:p-16 max-w-[1800px] mx-auto w-full">
               
               {/* Component Blocks */}
               <div className="scroll-reveal w-full mb-10">
                 <AnalyticsHeader />
               </div>
               
               {/* 🧱 4-COLUMN GRID (Inventory takes 3, DrumPad takes 1) */}
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 lg:gap-10 w-full mb-10">
                  {/* BeatInventory takes more width for better table view */}
                  <div className="scroll-reveal xl:col-span-3 flex flex-col h-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                    <BeatInventory refreshTrigger={refreshTrigger} />
                  </div>
                  
                  {/* DrumPad stays tight and functional */}
                  <div className="scroll-reveal xl:col-span-1 flex flex-col h-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                    <DrumPad />
                  </div>
               </div>
               
               <div className="scroll-reveal w-full mb-10 bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                 <BeatExplorer />
               </div>
               
               <div className="scroll-reveal w-full bg-white rounded-[1rem] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-[#001433]/5 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(212,175,55,0.05)] hover:border-[#D4AF37]/30">
                 <UploadPortal onUploadSuccess={() => setRefreshTrigger(t => t + 1)} />
               </div>
               
             </div>
           )}

           {activeView === 'network' && <div className="w-full max-w-[1800px] mx-auto p-10 lg:p-16"><GlobalFeed /></div>}
           {activeView === 'chat' && <div className="w-full max-w-[1800px] mx-auto p-10 lg:p-16"><ProducerNetwork /></div>}
        </main>
      </div>

      {/* Inline Premium CSS adjustments */}
      <style>{`
        /* Minimalist Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #F4F3EF;
        }
        ::-webkit-scrollbar-thumb {
          background: #001433;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #D4AF37;
        }
      `}</style>
    </div>
  ); 
}