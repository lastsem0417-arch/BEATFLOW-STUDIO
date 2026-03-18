import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import StudioMaster from './StudioMaster';
import RapperNetwork from './RapperNetwork'; 
import GlobalFeed from '../feed/GlobalFeed'; 
import CreateDropModal from '../feed/CreateDropModal'; 
import NotificationBell from '../feed/NotificationBell';

import { useAudio } from '../../context/AudioContext'; 

export default function RapperDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isDawOpen, setIsDawOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault'>('home');
  const [showDropModal, setShowDropModal] = useState(false); 

  const { playTrack, currentTrack, isPlaying, togglePlayPause } = useAudio();

  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id;

  const [producerBeats, setProducerBeats] = useState<any[]>([]);
  const [vaultProjects, setVaultProjects] = useState<any[]>([]);

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) { 
        navigate('/roles'); 
        return; 
    }

    const fetchDashboardData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const beatsRes = await axios.get('http://localhost:5000/api/tracks/type/beat', config);
        setProducerBeats(Array.isArray(beatsRes.data) ? beatsRes.data : []);

        if (userId) {
          const vaultRes = await axios.get('http://localhost:5000/api/projects/my-vault', config);
          setVaultProjects(Array.isArray(vaultRes.data) ? vaultRes.data : []);
        }
      } catch (err) { console.error("Data Fetch Error:", err); }
    };
    fetchDashboardData();
  }, [navigate, userId, user.token]); 

  // 🔥 GSAP CINEMATIC ENTRY
  useLayoutEffect(() => {
    if (isDawOpen) return;
    let ctx = gsap.context(() => {
      gsap.fromTo('.master-header', { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 1.5, ease: 'power3.out' });
      gsap.fromTo('.sidebar-btn', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1, stagger: 0.1, ease: 'power4.out', delay: 0.2 });
      gsap.fromTo('.bento-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: [0.76, 0, 0.24, 1], delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab, isDawOpen]);

  const handlePlayPreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Architect',
        creatorRole: 'producer',
        creatorId: beat.creator
      });
    }
  };

  if (isDawOpen) {
    return (
      <div className="relative w-full h-screen overflow-hidden animate-in fade-in duration-500 bg-brand-onyx">
        
        {/* 🔥 FIX: Exit Button bottom-right me mast float karega 🔥 */}
        <button 
          onClick={() => setIsDawOpen(false)} 
          className="absolute bottom-8 right-8 z-[9999] bg-[#E63946] text-white px-8 py-3.5 rounded-full text-[10px] uppercase tracking-[0.3em] font-black shadow-[0_10px_30px_rgba(230,57,70,0.4)] hover:bg-red-600 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
        >
          Exit Studio <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        
        <StudioMaster />
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-brand-onyx text-brand-pearl flex font-sans relative select-none">
      
      {/* 🔴 AMBIENT RED ROOM GLOW */}
      <div className="fixed top-[5%] left-[-10%] w-[60vw] h-[60vw] bg-rapper/5 blur-[200px] rounded-full z-0 pointer-events-none"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>

      {showDropModal && <div className="absolute inset-0 z-[99999] bg-black/80 backdrop-blur-2xl"><CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} /></div>}

      {/* --- SLEEK SIDEBAR --- */}
      <aside className="w-24 sticky top-0 h-screen border-r border-white/5 bg-[#030305]/80 backdrop-blur-2xl flex flex-col items-center py-10 z-50 shadow-[10px_0_30px_rgba(0,0,0,0.8)]">
        
        {/* 🔥 THE FIX IS HERE: onClick setIsDawOpen(true) 🔥 */}
        <div 
          className="w-14 h-14 rounded-2xl bg-brand-dark border border-white/10 flex items-center justify-center shadow-inner group hover:border-rapper/50 hover:shadow-[0_0_30px_rgba(230,57,70,0.3)] transition-all duration-500 cursor-pointer" 
          onClick={() => setIsDawOpen(true)}
          title="Enter Recording Studio"
        >
           <span className="font-black text-xl text-brand-pearl group-hover:text-rapper transition-colors animate-pulse">🎙️</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-12 w-full px-4">
          <button onClick={() => setActiveTab('home')} className={`sidebar-btn w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'home' ? 'bg-rapper/10 border border-rapper/30 text-rapper shadow-[0_0_20px_rgba(230,57,70,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Discover</span>
          </button>

          <button onClick={() => setActiveTab('network')} className={`sidebar-btn w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'network' ? 'bg-rapper/10 border border-rapper/30 text-rapper shadow-[0_0_20px_rgba(230,57,70,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Feed</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`sidebar-btn w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'vault' ? 'bg-rapper/10 border border-rapper/30 text-rapper shadow-[0_0_20px_rgba(230,57,70,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
             <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Vault</span>
          </button>

          <button onClick={() => setActiveTab('chat')} className={`sidebar-btn relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 ${activeTab === 'chat' ? 'bg-rapper/10 border border-rapper/30 text-rapper shadow-[0_0_20px_rgba(230,57,70,0.15)] scale-105' : 'bg-transparent hover:bg-white/5 text-brand-muted hover:text-brand-pearl border border-transparent'}`}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
             <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Comms</span>
             <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-rapper rounded-full animate-pulse shadow-[0_0_10px_#E63946]"></div>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border border-white/10 p-0.5 hover:border-rapper transition-all duration-500 cursor-pointer overflow-hidden shadow-xl mt-auto group" title="View Identity">
           <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Artist'}`} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-700 object-cover scale-110" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">
        
        {/* 🎩 THE PERFORMANCE HEADER */}
        <header className="master-header h-28 px-12 sticky top-0 bg-[#030305]/80 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between z-40">
           <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-[0.6em] text-brand-muted font-black italic mb-1.5">The Artist Hub</span>
              <h2 className="text-3xl font-serif italic text-brand-pearl tracking-tight">
                 {activeTab === 'home' ? 'Beat Discovery' : activeTab === 'vault' ? 'Private Vault' : activeTab === 'network' ? 'Global Pitch Feed' : 'Encrypted Comms'}
              </h2>
           </div>

           <div className="flex items-center gap-6">
              <NotificationBell />
              <button onClick={() => setShowDropModal(true)} className="group relative px-6 py-3 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-rapper/50 transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-muted group-hover:text-white transition-colors">
                  Drop to Global 🌍
                </span>
              </button>
              <button onClick={() => setIsDawOpen(true)} className="px-8 py-3.5 bg-brand-pearl text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-rapper hover:text-white hover:shadow-[0_0_30px_rgba(230,57,70,0.4)] transition-all duration-500 hover:scale-105 active:scale-95">
                Initialize Studio
              </button>
           </div>
        </header>

        <main className="flex-1 relative z-20 w-full pb-32">
           
           {/* 🔍 DISCOVERY GRID */}
           {activeTab === 'home' && (
             <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
               <div className="bg-brand-dark/90 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  
                  <div className="absolute top-0 right-0 w-64 h-64 bg-rapper/5 blur-[80px] rounded-full pointer-events-none"></div>
                  
                  <div className="flex items-end justify-between border-b border-white/5 pb-6 mb-8 relative z-10">
                      <h3 className="text-3xl font-serif italic text-brand-pearl">Marketplace<span className="text-rapper">.</span></h3>
                      <p className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.3em]">Latest Architect Uploads</p>
                  </div>

                  {producerBeats.length === 0 ? (
                      <div className="text-center py-32 text-brand-muted font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">No frequencies detected in the marketplace.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10 relative z-10">
                         {producerBeats.map((beat) => {
                           const isThisPlaying = currentTrack?._id === beat._id;

                           return (
                            <div key={beat._id} className={`bento-card group bg-[#010101] p-8 rounded-[1.5rem] hover:bg-white/[0.02] border transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between min-h-[250px] ${isThisPlaying ? 'border-rapper/50 shadow-[0_10px_30px_rgba(230,57,70,0.15)]' : 'border-white/5 hover:border-rapper/30'}`}>
                              
                              <div className="flex justify-between items-start mb-8">
                                {/* ⏯️ PREMIUM SVG PLAY BUTTON */}
                                <button 
                                  onClick={() => handlePlayPreview(beat)} 
                                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isThisPlaying && isPlaying ? 'bg-rapper text-white scale-110 shadow-[0_0_20px_rgba(230,57,70,0.4)]' : 'bg-white/5 text-brand-pearl border border-white/10 hover:border-rapper hover:text-rapper hover:scale-105'}`}
                                >
                                    {isThisPlaying && isPlaying ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    )}
                                </button>
                                <span className={`text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1 rounded-full border transition-colors ${isThisPlaying ? 'bg-rapper/10 border-rapper/30 text-rapper' : 'bg-white/5 border-white/10 text-brand-muted group-hover:text-white'}`}>
                                  {isThisPlaying ? 'Transmitting' : 'Preview'}
                                </span>
                              </div>

                              <div>
                                <h4 className={`font-serif italic text-2xl truncate w-full transition-colors duration-500 ${isThisPlaying ? 'text-rapper' : 'text-brand-pearl group-hover:text-white'}`}>{beat.title}</h4>
                                <p className="text-[9px] text-brand-muted mt-2 font-mono uppercase tracking-[0.2em] group-hover:text-brand-pearl/70 transition-colors">PROD ID: {beat.creator?.slice(-6) || 'GUEST'}</p>
                              </div>
                              
                              <button onClick={() => setIsDawOpen(true)} className="mt-6 w-full py-4 border border-white/10 group-hover:border-rapper/40 rounded-xl text-[9px] uppercase font-black text-brand-muted group-hover:text-rapper group-hover:bg-rapper/10 active:scale-95 transition-all duration-300">
                                Import to Studio
                              </button>
                            </div>
                           );
                         })}
                      </div>
                  )}
               </div>
             </div>
           )}

           {activeTab === 'network' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><GlobalFeed /></div>}

           {activeTab === 'chat' && <div className="w-full animate-in fade-in duration-500 p-8 lg:p-12"><RapperNetwork setIsDawOpen={setIsDawOpen} /></div>}

           {/* 🗄️ PRIVATE VAULT GRID */}
           {activeTab === 'vault' && (
             <div className="p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
               <div className="bg-brand-dark/90 backdrop-blur-xl border border-white/5 rounded-[2rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                  <div className="flex items-end justify-between border-b border-white/5 pb-6 mb-8 relative z-10">
                      <h3 className="text-3xl font-serif italic text-brand-pearl">Encrypted Vault<span className="text-rapper">.</span></h3>
                      <p className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.3em]">Saved Sessions</p>
                  </div>
                  
                  {vaultProjects.length === 0 ? (
                      <div className="text-center py-32 text-brand-muted font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/10 rounded-2xl">Your vault is completely empty.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {vaultProjects.map((project) => (
                           <div key={project._id} className="bento-card group bg-[#010101] p-8 rounded-[1.5rem] hover:bg-white/[0.02] border border-white/5 hover:border-rapper/30 transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between min-h-[200px]">
                              <div>
                                <h4 className="font-serif italic text-2xl text-brand-pearl group-hover:text-white transition-colors">{project.name}</h4>
                                <p className="text-[9px] text-brand-muted mt-2 font-mono uppercase tracking-[0.2em]">{project.tracks?.length || 0} Layers Recorded</p>
                              </div>
                              <button onClick={() => setIsDawOpen(true)} className="mt-8 w-full py-4 border border-white/10 group-hover:border-rapper/40 rounded-xl text-[9px] uppercase font-black text-brand-muted group-hover:text-rapper group-hover:bg-rapper/10 active:scale-95 transition-all duration-300">
                                Resume Session
                              </button>
                           </div>
                         ))}
                      </div>
                  )}
               </div>
             </div>
           )}

        </main>
      </div>
    </div>
  );
}