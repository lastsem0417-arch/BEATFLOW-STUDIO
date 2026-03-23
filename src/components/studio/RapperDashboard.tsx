import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import StudioMaster from './StudioMaster';
import RapperNetwork from './RapperNetwork'; 
import GlobalFeed from '../feed/GlobalFeed'; 
import CreateDropModal from '../feed/CreateDropModal'; 
import NotificationBell from '../feed/NotificationBell';
import { useAudio } from '../../context/AudioContext'; 

// 🔥 COMPONENTS IMPORT 🔥
import CollabLobby from '../CollabLobby'; 
import CollabStudio from '../CollabStudio';
import SmartSplitter from '../SmartSplitter'; // 👈 SMART SPLITTER YAHAN HAI

gsap.registerPlugin(ScrollTrigger);

export default function RapperDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  
  const navigate = useNavigate();
  const [isDawOpen, setIsDawOpen] = useState(false);
  const [showDropModal, setShowDropModal] = useState(false); 

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id;

  const [producerBeats, setProducerBeats] = useState<any[]>([]);
  const [vaultProjects, setVaultProjects] = useState<any[]>([]);

  // 🔥 REFRESH-SAFE ROOM STATE 🔥
  const [currentCollabRoom, setCurrentCollabRoom] = useState<{id: string, role: string} | null>(() => {
    const savedRoom = sessionStorage.getItem('active_collab_room');
    return savedRoom ? JSON.parse(savedRoom) : null;
  });

  // 🔥 ACTIVE TAB STATE UPDATED WITH 'splitter' 🔥
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault' | 'collab' | 'splitter'>(
    currentCollabRoom ? 'collab' : 'home'
  );

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) { 
        navigate('/roles'); 
        return; 
    }

    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const beatsRes = await axios.get('import.meta.env.VITE_API_URL/api/tracks/type/beat', config);
        setProducerBeats(Array.isArray(beatsRes.data) ? beatsRes.data : []);

        if (userId) {
          const vaultRes = await axios.get('import.meta.env.VITE_API_URL/api/projects/my-vault', config);
          setVaultProjects(Array.isArray(vaultRes.data) ? vaultRes.data : []);
        }
      } catch (err) { console.error("Data Fetch Error:", err); }
    };
    fetchDashboardData();
  }, [navigate, userId, user.token]); 

  useLayoutEffect(() => {
    if (isDawOpen || activeTab === 'collab' || activeTab === 'splitter') return; 
    
    let ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', 
        { yPercent: 120, opacity: 0, rotateX: 10 }, 
        { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.1 }
      );
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power3.out', delay: 0.4 });
      
      const cards = gsap.utils.toArray('.bento-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, 
          { opacity: 0, y: 100 }, 
          { 
            opacity: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "power4.out",
            scrollTrigger: { trigger: ".grid-container", start: "top 80%" }
          }
        );
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, [activeTab, isDawOpen, producerBeats]);

  const handlePlayPreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id, title: beat.title, contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Architect', creatorRole: 'producer', creatorId: beat.creator
      });
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    setActiveVideoUrl(videoUrl);
    if (isPlaying) togglePlayPause(); 
  };

  if (isDawOpen) {
    return (
      <div className="relative w-full h-screen overflow-hidden animate-in fade-in duration-500 bg-[#0A0A0C]">
        <button 
          onClick={() => {
            setIsDawOpen(false);
            axios.get('import.meta.env.VITE_API_URL/api/projects/my-vault', { headers: { Authorization: `Bearer ${user.token}` }})
              .then(res => setVaultProjects(Array.isArray(res.data) ? res.data : []))
              .catch(err => console.error(err));
          }} 
          className="absolute top-8 right-8 z-[9999] bg-[#E63946] text-white px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black shadow-[0_10px_30px_rgba(230,57,70,0.4)] hover:bg-[#111] hover:text-[#E63946] transition-all flex items-center gap-3 group"
        >
          Exit Booth <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <StudioMaster />
      </div>
    );
  }

  return (
    // 🔥 NATURAL SCROLLING RESTORED (min-h-screen, overflow-x-hidden ONLY) 🔥
    <div ref={containerRef} className="min-h-screen bg-[#F4F3EF] text-[#111111] flex font-sans relative select-none overflow-x-hidden selection:bg-[#E63946] selection:text-white">
      
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none z-0 mix-blend-multiply"></div>

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-[#111]/90 backdrop-blur-md flex items-center justify-center"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      {activeVideoUrl && (
        <div className="fixed inset-0 z-[999999] bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <button onClick={() => setActiveVideoUrl(null)} className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E63946] transition-all duration-300 z-50 group">
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          <div className="w-[90vw] max-w-5xl aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 relative">
             <video src={activeVideoUrl} controls autoPlay className="w-full h-full object-contain"></video>
          </div>
          <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 font-black animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E63946]"></span> Director's Booth Footage
          </p>
        </div>
      )}

      {/* --- SLEEK MINIMAL SIDEBAR --- */}
      <aside className="w-24 md:w-28 sticky top-0 h-screen border-r border-[#111]/10 bg-[#F4F3EF] flex flex-col items-center py-10 z-50 overflow-y-auto shrink-0">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-white border border-[#111]/10 flex items-center justify-center shadow-sm hover:border-[#E63946] transition-all duration-500 cursor-pointer group shrink-0" onClick={() => setIsDawOpen(true)}>
           <span className="font-black text-2xl text-[#111] group-hover:text-[#E63946]">🎙️</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-10 w-full px-5">
          <button onClick={() => setActiveTab('collab')} className={`sidebar-btn w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'collab' ? 'bg-[#111] text-white' : 'bg-white border border-[#E63946]/30 text-[#E63946]'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
            <span className="text-[7px] font-black font-mono tracking-[0.2em] uppercase mt-1">Collab</span>
          </button>

          {/* 🔥 ROYALTY TAB 🔥 */}
          <button onClick={() => {setActiveTab('splitter'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'splitter' ? 'text-[#E63946]' : 'text-[#111]/40 hover:text-[#111]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 group-hover:-translate-y-1 transition-transform"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Royalty</span>
          </button>

          <div className="w-full h-[1px] bg-[#111]/5 my-2"></div>

          <button onClick={() => {setActiveTab('home'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'home' ? 'text-[#E63946]' : 'text-[#111]/40 hover:text-[#111]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Scout</span>
          </button>
          
          <button onClick={() => {setActiveTab('network'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'network' ? 'text-[#E63946]' : 'text-[#111]/40 hover:text-[#111]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => {setActiveTab('vault'); setCurrentCollabRoom(null);}} className={`sidebar-btn flex flex-col items-center justify-center transition-all duration-300 group ${activeTab === 'vault' ? 'text-[#E63946]' : 'text-[#111]/40 hover:text-[#111]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
            <span className="text-[8px] font-black font-mono uppercase tracking-[0.2em]">Vault</span>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 bg-white border border-[#111]/10 p-0.5 hover:border-[#E63946] transition-all mt-auto mb-4 group rounded-full shrink-0 overflow-hidden cursor-pointer">
           <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Artist'}`} className="w-full h-full grayscale group-hover:grayscale-0 transition-all object-cover rounded-full" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col relative z-10 w-full">
        
        {/* HEADER */}
        {activeTab !== 'collab' && activeTab !== 'splitter' && (
          <header className="h-24 px-10 lg:px-16 sticky top-0 bg-[#F4F3EF]/90 backdrop-blur-xl border-b border-[#111]/5 flex items-center justify-between z-40">
             <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1">
                  <span className="w-1.5 h-1.5 bg-[#E63946] animate-pulse rounded-full"></span>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-[#111]/60 font-black font-mono">SYSTEM / ACTIVE</span>
                </div>
             </div>
             <div className="flex items-center gap-6">
                <NotificationBell />
                <button onClick={() => setShowDropModal(true)} className="px-6 py-2.5 border border-[#111]/20 bg-transparent text-[#111] hover:border-[#E63946] transition-all rounded-full text-[9px] font-black uppercase tracking-[0.2em]">Drop Asset</button>
                <button onClick={() => setIsDawOpen(true)} className="px-8 py-3 bg-[#E63946] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-[#111] transition-all shadow-lg">Initialize Booth</button>
             </div>
          </header>
        )}

        {/* 🚨 NO SCROLL LOCKS HERE. JUST NATURAL FLOW 🚨 */}
        <main ref={mainRef} className="flex-1 relative z-20 w-full pb-32">
            
           {/* TITLE AREA */}
           {activeTab !== 'collab' && activeTab !== 'splitter' && (
             <div className="pt-24 pb-20 px-10 lg:px-16 border-b border-[#111]/5 overflow-hidden text-center md:text-left">
                <h1 className="hero-title text-[11vw] md:text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#111]">
                   {activeTab === 'home' ? 'VOCAL' : activeTab === 'vault' ? 'PRIVATE' : activeTab === 'network' ? 'GLOBAL' : 'SECURE'}
                </h1>
                <h1 className="hero-title text-[12vw] md:text-[10vw] leading-[0.8] font-serif italic tracking-tighter text-[#E63946]">
                   {activeTab === 'home' ? 'Chamber.' : activeTab === 'vault' ? 'Archive.' : activeTab === 'network' ? 'Network.' : 'Comms.'}
                </h1>
             </div>
           )}

           {/* 🔥 SMART SPLITTER RENDERING 🔥 */}
           {activeTab === 'splitter' && (
             <div className="p-8 lg:p-16 flex items-start justify-center animate-in fade-in duration-500 w-full">
                <div className="max-w-[1400px] w-full">
                   <SmartSplitter />
                </div>
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

           {/* 🔥 TERA VAULT WAPAS AA GAYA 🔥 */}
           {activeTab === 'vault' && (
             <div className="grid-container p-10 lg:p-16 max-w-[1800px] mx-auto w-full">
                 <div className="flex items-end justify-between pb-8 mb-8 relative z-10">
                     <p className="text-[10px] font-mono text-[#111]/50 uppercase tracking-[0.4em]">Secure Project Archives</p>
                 </div>
                 
                 {vaultProjects.length === 0 ? (
                     <div className="text-center py-32 text-[#111]/40 font-mono text-[11px] uppercase tracking-widest border border-dashed border-[#111]/10 rounded-2xl bg-white">Vault is empty.</div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10">
                        {vaultProjects.map((project) => (
                          <div key={project._id} className="bento-card group relative bg-white p-8 rounded-[1.5rem] border border-[#111]/5 hover:border-[#E63946]/50 transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between min-h-[260px] shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_50px_rgba(230,57,70,0.15)] overflow-hidden">
                             
                             {project.videoUrl && (
                               <div className="absolute top-6 right-6 z-20 flex items-center gap-1.5 bg-[#E63946] text-white text-[7px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow-[0_0_10px_rgba(230,57,70,0.5)]">
                                 <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg> Footage
                               </div>
                             )}

                             <div>
                               <h4 className="font-serif italic text-3xl text-[#111] group-hover:text-[#E63946] transition-colors leading-tight mb-2 pr-6">{project.name}</h4>
                               <p className="text-[10px] text-[#111]/40 font-mono uppercase tracking-[0.3em]">{project.tracks?.length || 0} Layers Saved</p>
                             </div>
                             
                             <div className="mt-8 flex flex-col gap-3 relative z-10">
                               {project.videoUrl && (
                                  <button onClick={() => handlePlayVideo(project.videoUrl)} className="w-full py-3 rounded-full bg-[#111] text-white text-[9px] font-black uppercase tracking-[0.2em] hover:bg-[#E63946] hover:shadow-[0_5px_15px_rgba(230,57,70,0.4)] transition-all duration-300 flex items-center justify-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> View Footage
                                  </button>
                               )}
                               <button onClick={() => setIsDawOpen(true)} className="w-full py-3 rounded-full bg-[#F4F3EF] text-[#111]/80 text-[9px] font-black uppercase tracking-[0.2em] group-hover:bg-[#111] group-hover:text-white transition-all duration-300">
                                 Resume Studio
                               </button>
                             </div>
                          </div>
                        ))}
                     </div>
                 )}
             </div>
           )}

           {/* 🔍 DISCOVERY GRID */}
           {activeTab === 'home' && (
             <div className="grid-container p-10 lg:p-16 max-w-[1800px] mx-auto w-full">
                 <div className="flex items-end justify-between pb-8 mb-8 relative z-10">
                     <p className="text-[10px] font-mono text-[#111]/50 uppercase tracking-[0.4em]">Latest Frequencies Detected</p>
                     <span className="text-[10px] font-black uppercase tracking-widest border-b border-[#111] pb-1 cursor-pointer hover:text-[#E63946] hover:border-[#E63946] transition-colors">View All</span>
                 </div>

                 {producerBeats.length === 0 ? (
                     <div className="text-center py-32 text-[#111]/40 font-mono text-[11px] uppercase tracking-widest border border-dashed border-[#111]/10 rounded-2xl bg-white">Scanning frequencies...</div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-10 relative z-10">
                        {producerBeats.map((beat) => {
                          const isThisPlaying = currentTrack?._id === beat._id;

                          return (
                           <div key={beat._id} className={`bento-card group bg-white p-6 rounded-[1rem] flex flex-col justify-between min-h-[280px] shadow-sm hover:shadow-xl border border-[#111]/5 transition-all ${isThisPlaying ? 'border-[2px] border-[#E63946]' : ''}`}>
                             <div className="flex justify-between items-start mb-10">
                               <button onClick={() => handlePlayPreview(beat)} className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${isThisPlaying && isPlaying ? 'bg-[#E63946] text-white shadow-md border-[#E63946]' : 'bg-[#F4F3EF] text-[#111] group-hover:bg-[#111] group-hover:text-white group-hover:border-[#111]'}`}>
                                  {isThisPlaying && isPlaying ? "⏸" : "▶"}
                               </button>
                             </div>
                             <div>
                               <h4 className="font-serif italic text-2xl text-[#111] truncate">{beat.title}</h4>
                               <p className="text-[9px] text-[#111]/40 mt-2 font-mono uppercase tracking-[0.2em] truncate">BY {beat.creatorName || 'ARCHITECT'}</p>
                             </div>
                             <button onClick={() => setIsDawOpen(true)} className="mt-6 w-full py-3 bg-[#F4F3EF] rounded-full text-[#111]/60 text-[9px] font-black uppercase group-hover:bg-[#E63946] group-hover:text-white transition-all">Load to Booth</button>
                           </div>
                          );
                        })}
                     </div>
                 )}
             </div>
           )}

           {activeTab === 'network' && <div className="p-10 lg:p-16 pb-32 max-w-[1800px] mx-auto"><GlobalFeed /></div>}
           {activeTab === 'chat' && <div className="p-10 lg:p-16 pb-32 max-w-[1800px] mx-auto"><RapperNetwork setIsDawOpen={setIsDawOpen} /></div>}
        </main>
      </div>

      {/* GLOBAL CUSTOM SCROLLBAR FOR ENTIRE PAGE */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #F4F3EF; }
        ::-webkit-scrollbar-thumb { background: #111111; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #E63946; }
      `}</style>
    </div>
  );
}