import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import AnalyticsHeader from './AnalyticsHeader';
import BeatInventory from './BeatInventory';
import UploadPortal from './UploadPortal';
import RapperActivity from './RapperActivity';
import DrumPad from './DrumPad'; 
import BeatExplorer from './BeatExplorer'; 
import LiveNetwork from './ProducerNetwork'; 
import GlobalFeed from '../feed/GlobalFeed'; 
import CreateDropModal from '../feed/CreateDropModal'; 
import NotificationBell from '../feed/NotificationBell'; 
import DraggableWebcam from '../studio/DraggableWebcam'; 

export default function ProducerMaster() {  
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'network' | 'chat'>('dashboard');
  const [showDropModal, setShowDropModal] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) navigate('/roles');
  }, [navigate]);

  // 🔥 GSAP CINEMATIC ENTRY
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.master-header',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' }
      );
      gsap.fromTo('.sidebar-btn',
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-onyx text-brand-pearl flex font-sans relative select-none">
      
      {/* 🌌 AMBIENT PRODUCER GLOW */}
      <div className="fixed top-[10%] right-[-5%] w-[60vw] h-[60vw] bg-producer/5 blur-[200px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>

      <DraggableWebcam />

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-2xl"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      {/* --- SLEEK SIDEBAR --- */}
      <aside className="w-24 sticky top-0 h-screen border-r border-white/5 bg-[#050505]/80 backdrop-blur-2xl flex flex-col items-center py-10 z-50 shadow-[10px_0_30px_rgba(0,0,0,0.8)]">
        
        <div className="w-14 h-14 rounded-2xl bg-brand-onyx border border-white/10 flex items-center justify-center shadow-lg group hover:border-producer/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-500 cursor-pointer" onClick={() => navigate('/')}>
           <span className="font-serif italic font-bold text-xl text-brand-pearl group-hover:text-producer transition-colors">BF</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-12 w-full px-4">
          <button onClick={() => setActiveView('dashboard')} className={`sidebar-btn w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeView === 'dashboard' ? 'bg-producer/10 border border-producer/30 text-producer shadow-[0_0_20px_rgba(212,175,55,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
            <span className="text-xl mb-1">🎛️</span>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Dash</span>
          </button>
          
          <button onClick={() => setActiveView('network')} className={`sidebar-btn w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeView === 'network' ? 'bg-producer/10 border border-producer/30 text-producer shadow-[0_0_20px_rgba(212,175,55,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
             <span className="text-xl mb-1">🌍</span>
             <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => setActiveView('chat')} className={`sidebar-btn relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeView === 'chat' ? 'bg-producer/10 border border-producer/30 text-producer shadow-[0_0_20px_rgba(212,175,55,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
             <span className="text-xl mb-1">💬</span>
             <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Hub</span>
             <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-producer rounded-full animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border border-white/10 p-0.5 hover:border-producer transition-all duration-500 cursor-pointer overflow-hidden shadow-xl mt-auto group" title="View Identity">
            <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Producer'}`} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-700 object-cover scale-110" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative z-10 min-h-screen">
        
        {/* 🎩 THE ARCHITECT HEADER */}
        <header className="master-header h-28 px-12 sticky top-0 bg-[#030305]/80 border-b border-white/5 flex items-center justify-between z-40 backdrop-blur-3xl">
           <div className="flex flex-col">
              <p className="text-[9px] uppercase tracking-[0.6em] text-brand-muted font-black mb-1">
                The Architect Console
              </p>
              <h2 className="text-3xl font-serif italic text-brand-pearl tracking-tight">
                {activeView === 'dashboard' ? 'Command Center' : activeView === 'network' ? 'Global Pitch Feed' : 'Network Hub'}
              </h2>
           </div>

          <div className="flex items-center gap-6">
    <NotificationBell />
    {/* 🔥 NAYA HIGHLIGHTED CTA BUTTON 🔥 */}
    <button onClick={() => setShowDropModal(true)} className="group relative px-8 py-3.5 overflow-hidden rounded-full bg-producer/10 border border-producer/50 hover:bg-producer transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)]">
      <span className="relative text-[10px] uppercase tracking-[0.3em] font-black text-producer group-hover:text-black transition-colors flex items-center gap-2">
        Drop to Global 🌍
      </span>
    </button>
  </div>
        </header>

        <main className="flex-1 w-full relative z-20 pb-32">
           
           {/* 🎛️ DASHBOARD BENTO BOX */}
           {activeView === 'dashboard' && (
             <div className="p-8 lg:p-12 flex flex-col gap-10 max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
               
               {/* ⚠️ IN ANDAR WALE COMPONENTS KO BHI UPDATE KARNA HOGA AWWWARDS VIBE KE LIYE */}
               <AnalyticsHeader />
               
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                  <div className="xl:col-span-2"><BeatInventory refreshTrigger={refreshTrigger} /></div>
                  <div className="xl:col-span-1"><RapperActivity /></div>
                  <div className="xl:col-span-1"><DrumPad /></div>
               </div>
               
               <BeatExplorer />
               
               <UploadPortal onUploadSuccess={() => setRefreshTrigger(t => t + 1)} />
             </div>
           )}

           {activeView === 'network' && <div className="w-full animate-in fade-in duration-500"><GlobalFeed /></div>}
           {activeView === 'chat' && <div className="w-full animate-in fade-in duration-500"><LiveNetwork /></div>}
        </main>
      </div>
    </div>
  ); 
}