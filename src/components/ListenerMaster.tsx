import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import GlobalFeed from './feed/GlobalFeed'; 
import UserProfile from './UserProfile';
import ZenMode4D from './listener/ZenMode4D';
import TrendingCharts from './listener/TrendingCharts'; 
import ListenerVault from './listener/ListenerVault'; 
import NotificationBell from './feed/NotificationBell';
import GodModePlayer from './listener/GodModePlayer'; 

// 🔥 GLOBAL AUDIO CONTEXT IMPORTED 🔥
// (Adjust path if your context is located elsewhere, e.g., '../../context/AudioContext')
import { useAudio } from '../context/AudioContext'; 

export default function ListenerMaster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'hub' | 'feed' | 'trending' | 'vault' | 'zen' | 'profile' | 'sonic_vault'>('hub'); 
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const [topArchitects, setTopArchitects] = useState<any[]>([]);
  
  // 🔥 REAL DATA STATE FOR "CURATED FOR YOU" 🔥
  const [feedTracks, setFeedTracks] = useState<any[]>([]);

  // Accessing Global Audio State
  const { currentTrack, isPlaying: isGlobalPlaying, togglePlayPause, playTrack } = useAudio();

  // Fetch real data from Feed for the Hub dashboard
  useEffect(() => {
    const fetchHubData = async () => {
      try {
        const token = currentUser.token;
        // Fetch Architects
        const userRes = await axios.get('import.meta.env.VITE_API_URL/api/users/all', { headers: { Authorization: `Bearer ${token}` } });
        const creators = userRes.data.filter((u: any) => u.role !== 'listener');
        setTopArchitects(creators.slice(0, 10));

        // Fetch Real Audio Posts from Feed
        const feedRes = await axios.get('import.meta.env.VITE_API_URL/api/feed', { headers: { Authorization: `Bearer ${token}` } });
        // Filter only posts that have audio
        const audioPosts = feedRes.data.filter((p: any) => p.contentUrl || p.audioUrl);
        setFeedTracks(audioPosts.reverse().slice(0, 4)); // Get top 4 newest beats/songs
      } catch (err) { console.error("Error loading Hub data", err); }
    };
    if (activeTab === 'hub') fetchHubData();
  }, [activeTab, currentUser.token]);

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles');
  };

  useLayoutEffect(() => {
    if (activeTab === 'zen' || activeTab === 'sonic_vault' || !containerRef.current) return;
    let ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', { yPercent: 120, opacity: 0, rotateX: 10 }, { yPercent: 0, opacity: 1, rotateX: 0, duration: 1.5, stagger: 0.1, ease: 'expo.out', delay: 0.1 });
      gsap.fromTo('.stagger-fade', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab]);

  if (activeTab === 'zen') return <ZenMode4D onClose={() => setActiveTab('hub')} />;

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'text-[#E63946] border-[#E63946]/30 bg-[#E63946]/10';
    if (r === 'lyricist') return 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10';
    return 'text-[#D4AF37] border-[#D4AF37]/30 bg-[#D4AF37]/10'; 
  };

  return (
    <div ref={containerRef} className="flex min-h-screen bg-[#F4F5F7] text-[#0A1128] font-sans relative select-none selection:bg-[#6B7AE5] selection:text-white w-full overflow-x-hidden">
      
      {/* 🌌 CINEMATIC AMBIENT GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6B7AE5]/10 blur-[150px] rounded-full pointer-events-none animate-pulse z-0" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#8ECAE6]/5 blur-[150px] rounded-full pointer-events-none animate-pulse z-0" style={{ animationDuration: '10s' }}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- SLEEK SIDEBAR --- */}
      <aside className="w-24 md:w-28 sticky top-0 h-screen bg-white/80 backdrop-blur-3xl border-r border-[#0A1128]/5 flex flex-col items-center py-8 z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] shrink-0">
        
        <div onClick={() => setActiveTab('hub')} className="mb-6 w-14 h-14 md:w-16 md:h-16 bg-white border border-[#0A1128]/10 rounded-[1.2rem] flex items-center justify-center shadow-sm group cursor-pointer hover:border-[#6B7AE5]/50 hover:shadow-[0_10px_20px_rgba(107,122,229,0.2)] transition-all duration-500" title="Home">
            <span className="font-serif italic font-bold text-[#0A1128] text-2xl group-hover:text-[#6B7AE5] transition-colors">BF</span>
        </div>

        <nav className="flex flex-col gap-4 flex-1 w-full px-5 overflow-y-auto custom-scrollbar py-2">
          
          {/* 🔥 SONIC VAULT BUTTON 🔥 */}
          <button onClick={() => setActiveTab('sonic_vault')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group relative overflow-hidden ${activeTab === 'sonic_vault' ? 'bg-[#0A1128] text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] scale-105' : 'bg-white border border-[#6B7AE5]/30 hover:bg-[#0A1128] text-[#6B7AE5] hover:text-white shadow-sm'}`}>
            <div className="absolute inset-0 bg-gradient-to-tr from-[#6B7AE5]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:scale-110 transition-transform"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"></path><path d="M12 12a4 4 0 1 0 4 4A4 4 0 0 0 12 12z"></path></svg>
            <span className="text-[7px] font-black font-mono tracking-[0.2em] uppercase relative z-10">Sonic Vault</span>
            {/* Ping indicator if a track is playing globally but we are not in vault */}
            {currentTrack && activeTab !== 'sonic_vault' && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E63946] animate-pulse shadow-[0_0_10px_#E63946]"></span>}
          </button>

          <div className="w-full h-[1px] bg-[#0A1128]/5 my-2 stagger-fade"></div>

          <button onClick={() => setActiveTab('hub')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'hub' ? 'bg-[#6B7AE5] text-white shadow-[0_10px_20px_rgba(107,122,229,0.3)] scale-105' : 'bg-transparent border border-transparent hover:bg-white text-[#0A1128]/40 hover:text-[#0A1128] hover:shadow-sm'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-1.5 group-hover:-translate-y-1 transition-transform"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
            <span className="text-[8px] font-black font-mono tracking-[0.2em] uppercase">Hub</span>
          </button>

          <button onClick={() => setActiveTab('feed')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'feed' ? 'bg-[#6B7AE5] text-white shadow-[0_10px_20px_rgba(107,122,229,0.3)] scale-105' : 'bg-transparent border border-transparent hover:bg-white text-[#0A1128]/40 hover:text-[#0A1128] hover:shadow-sm'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-1.5 group-hover:-translate-y-1 transition-transform"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span className="text-[8px] font-black font-mono tracking-[0.2em] uppercase">Feed</span>
          </button>
          
          <button onClick={() => setActiveTab('trending')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'trending' ? 'bg-[#6B7AE5] text-white shadow-[0_10px_20px_rgba(107,122,229,0.3)] scale-105' : 'bg-transparent border border-transparent hover:bg-white text-[#0A1128]/40 hover:text-[#0A1128] hover:shadow-sm'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-1.5 group-hover:-translate-y-1 transition-transform"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            <span className="text-[8px] font-black font-mono tracking-[0.2em] uppercase">Trend</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'vault' ? 'bg-[#6B7AE5] text-white shadow-[0_10px_20px_rgba(107,122,229,0.3)] scale-105' : 'bg-transparent border border-transparent hover:bg-white text-[#0A1128]/40 hover:text-[#0A1128] hover:shadow-sm'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" className="mb-1.5 group-hover:-translate-y-1 transition-transform"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span className="text-[8px] font-black font-mono tracking-[0.2em] uppercase">Vault</span>
          </button>

          <button onClick={() => setActiveTab('zen')} className="w-full aspect-square rounded-[1rem] flex flex-col items-center justify-center transition-all duration-700 bg-[#0A1128] text-white shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(107,122,229,0.4)] hover:bg-[#6B7AE5] group overflow-hidden relative mt-auto mb-4">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5 group-hover:scale-110 transition-transform duration-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
             <span className="text-[7px] font-black tracking-widest uppercase text-white/50 group-hover:text-white transition-colors">5D Zen</span>
          </button>
        </nav>

        <div className="flex flex-col items-center gap-4 mt-auto">
            <div onClick={() => setActiveTab('profile')} className={`w-12 h-12 rounded-full border p-0.5 flex items-center justify-center transition-all duration-500 cursor-pointer overflow-hidden bg-white ${activeTab === 'profile' ? 'border-[#6B7AE5] scale-105 shadow-[0_10px_20px_rgba(107,122,229,0.3)]' : 'border-[#0A1128]/10 hover:border-[#6B7AE5]/50 hover:scale-105 hover:shadow-sm'}`} title="Identity">
                <img src={currentUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username || 'Fan'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-700 object-cover scale-110" alt="Profile" />
            </div>
            <button onClick={handleLogout} className="w-10 h-10 rounded-full border border-transparent hover:border-[#E63946]/50 bg-[#0A1128]/5 hover:bg-[#E63946]/10 text-[#0A1128]/40 hover:text-[#E63946] flex items-center justify-center transition-all duration-300">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative w-full min-w-0">
        
        {activeTab !== 'sonic_vault' && (
          <header className="h-24 px-10 md:px-16 flex items-center justify-between z-40 border-b border-[#0A1128]/5 bg-[#F4F5F7]/80 backdrop-blur-xl sticky top-0 shrink-0">
            <div className="flex items-center gap-3 mb-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#6B7AE5] animate-pulse shadow-[0_0_8px_#6B7AE5]"></span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-[#0A1128]/50 font-black font-mono">Network Connected</span>
            </div>
            <div className="flex items-center gap-6"><NotificationBell /></div>
          </header>
        )}

        {/* 🔥 MAIN WRAPPER: Handles perfect scrolling 🔥 */}
        <main className="flex-1 relative z-20 w-full overflow-y-auto custom-scrollbar">
          
          {activeTab !== 'sonic_vault' && (
            <div className="pt-24 pb-16 px-10 lg:px-16 border-b border-[#0A1128]/5 overflow-hidden">
                <div className="overflow-hidden">
                   <h1 className="hero-title text-[11vw] md:text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#0A1128] m-0">
                      {activeTab === 'hub' ? 'AUDIO' : activeTab === 'feed' ? 'GLOBAL' : activeTab === 'trending' ? 'TRENDING' : 'PRIVATE'}
                   </h1>
                </div>
                <div className="overflow-hidden">
                   <h1 className="hero-title text-[12vw] md:text-[10vw] leading-[0.8] font-serif italic tracking-tighter text-[#6B7AE5] m-0 pr-4">
                      {activeTab === 'hub' ? 'Sanctuary.' : activeTab === 'feed' ? 'Feed.' : activeTab === 'trending' ? 'Charts.' : 'Vault.'}
                   </h1>
                </div>
            </div>
          )}

          {/* 🔥 SONIC VAULT COMPONENT 🔥 */}
          {activeTab === 'sonic_vault' && (
             <div className="w-full min-h-screen">
                <GodModePlayer 
                  currentTrack={currentTrack} 
                  onTakeover={() => {
                    // Stop global audio to avoid echo when GodMode takes over
                    if (isGlobalPlaying) togglePlayPause(); 
                  }} 
                />
             </div>
          )}

          {activeTab === 'hub' && (
            <div className="p-8 md:p-12 lg:p-16 max-w-[1800px] mx-auto w-full stagger-fade pb-40 pt-8">
               
               <div className="w-full h-[400px] md:h-[500px] rounded-[3rem] bg-white border border-[#0A1128]/5 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] group cursor-pointer mb-24 hover:shadow-[0_30px_60px_rgba(107,122,229,0.1)] transition-all duration-700">
                  <div className="absolute inset-0 bg-[#6B7AE5]/5 transition-colors duration-700"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6B7AE5]/20 blur-[100px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
                  
                  <div className="relative z-10 text-center">
                    <span className="px-6 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-[#0A1128]/10 text-[9px] font-black uppercase tracking-[0.4em] text-[#6B7AE5] mb-6 inline-block shadow-sm">Immersive Experience</span>
                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-serif italic text-[#0A1128] tracking-tight leading-none mb-4 group-hover:scale-105 transition-transform duration-700">The Discovery Hub.</h2>
                    <p className="text-[#0A1128]/50 font-mono text-xs uppercase tracking-widest font-bold">Find your next auditory obsession.</p>
                  </div>
               </div>

               {/* 🔥 CURATED FOR YOU WITH REAL FEED DATA 🔥 */}
               <div className="mb-24">
                 <div className="flex items-center gap-6 mb-12">
                    <span className="w-2 h-2 rounded-full bg-[#6B7AE5]"></span>
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0A1128] leading-none">Curated For You</h3>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-[#0A1128]/10 to-transparent"></div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {feedTracks.length === 0 ? (
                      <p className="text-xs font-mono text-[#0A1128]/40 col-span-4 text-center py-10 border border-dashed rounded-3xl">No tracks found on network...</p>
                    ) : (
                      feedTracks.map((item, i) => (
                        <div 
                          key={item._id} 
                          onClick={() => { 
                            // Play via Global Audio Context natively!
                            playTrack({
                              _id: item._id,
                              title: item.title,
                              contentUrl: item.contentUrl || item.audioUrl,
                              creatorName: item.creatorName,
                              creatorRole: item.creatorRole,
                              creatorId: item.creatorId,
                              coverImage: item.coverImage || item.creatorProfileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${item._id}`
                            });
                            // Then send user to the Vault to Vibe!
                            setActiveTab('sonic_vault'); 
                          }} 
                          className="bg-white border-[#0A1128]/5 border p-10 rounded-[2rem] hover:-translate-y-2 transition-all duration-500 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group cursor-pointer relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-[#6B7AE5]"></div>
                          
                          <div className="flex justify-between items-start mb-6">
                             <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-md group-hover:scale-110 transition-transform duration-500">
                               <img src={item.coverImage || item.creatorProfileImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${item._id}`} className="w-full h-full object-cover" alt="cover"/>
                             </div>
                             <button className="w-10 h-10 rounded-full border border-[#6B7AE5]/20 group-hover:border-[#6B7AE5] bg-transparent text-[#6B7AE5]/50 group-hover:text-[#6B7AE5] flex items-center justify-center transition-all">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><path d="M5 3l14 9-14 9V3z"></path></svg>
                             </button>
                          </div>

                          <h4 className="text-2xl font-serif italic text-[#0A1128] mb-1 group-hover:text-[#6B7AE5] transition-colors truncate">{item.title}</h4>
                          <p className="text-sm font-bold text-[#0A1128]/60 mb-3">{item.creatorName}</p>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-[#0A1128]/40 font-mono font-black">{item.genre || 'Beat Drop'}</p>
                        </div>
                      ))
                    )}
                 </div>
               </div>

               <div>
                 <div className="flex items-center gap-6 mb-12">
                    <span className="w-2 h-2 rounded-full bg-[#6B7AE5]"></span>
                    <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#0A1128] leading-none">Top Architects</h3>
                 </div>
                 
                 <div className="flex gap-8 overflow-x-auto pb-10 pt-4 scroll-smooth" data-lenis-prevent="true">
                    {topArchitects.map((architect) => (
                      <div key={architect._id} onClick={() => navigate(`/profile/${architect._id}`)} className="flex flex-col items-center gap-6 min-w-[160px] group cursor-pointer">
                        <div className={`w-32 h-32 rounded-full bg-white border-4 border-transparent overflow-hidden transition-all duration-500 shadow-md group-hover:border-[#6B7AE5] relative group-hover:-translate-y-2`}>
                           <img src={architect.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${architect._id}`} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105" alt={architect.username} />
                        </div>
                        <div className="text-center">
                          <h5 className="text-[15px] font-bold text-[#0A1128] group-hover:text-[#6B7AE5] transition-colors tracking-tight">{architect.username}</h5>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>

            </div>
          )}

          {activeTab === 'feed' && <div className="w-full stagger-fade p-8 lg:p-16 max-w-[1800px] mx-auto pb-40"><GlobalFeed /></div>}
          {activeTab === 'trending' && <div className="w-full stagger-fade p-8 lg:p-16 max-w-[1800px] mx-auto pb-40"><TrendingCharts /></div>}
          {activeTab === 'vault' && <div className="w-full stagger-fade p-8 lg:p-16 max-w-[1800px] mx-auto pb-40"><ListenerVault /></div>}
          
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10,17,40,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #6B7AE5; }
      `}</style>
    </div>
  );
}