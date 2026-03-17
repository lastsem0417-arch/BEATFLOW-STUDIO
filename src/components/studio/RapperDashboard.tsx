import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import StudioMaster from './StudioMaster';
import RapperNetwork from './RapperNetwork'; // 🔥 CHAT HUB
import GlobalFeed from '../feed/GlobalFeed'; // 🔥 PITCH COLLAB FEED
import CreateDropModal from '../feed/CreateDropModal'; 
import NotificationBell from '../feed/NotificationBell';

// 🔥 GLOBAL AUDIO CONTEXT IMPORT
import { useAudio } from '../../context/AudioContext'; 

export default function RapperDashboard() {
  const navigate = useNavigate();
  const [isDawOpen, setIsDawOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'network' | 'chat' | 'vault'>('home');
  const [showDropModal, setShowDropModal] = useState(false); 

  // 🔥 AUDIO ACTIONS NIKALE
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

  // 🔥 NEW PLAY HANDLER: Local preview ki jagah Global Player call kiya
  const handlePlayPreview = (beat: any) => {
    if (currentTrack?._id === beat._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: beat._id,
        title: beat.title,
        contentUrl: beat.audioUrl,
        creatorName: beat.creatorName || 'Producer',
        creatorRole: 'producer',
        creatorId: beat.creator
      });
    }
  };

  if (isDawOpen) {
    return (
      <div className="relative w-full h-screen overflow-hidden animate-in fade-in duration-500">
        <button onClick={() => setIsDawOpen(false)} className="absolute top-4 left-4 z-[9999] bg-black/80 backdrop-blur-md border border-white/10 text-white px-6 py-2.5 rounded-full text-[9px] uppercase tracking-widest font-black hover:bg-white hover:text-black shadow-2xl transition-all">
          ← Exit Studio
        </button>
        <StudioMaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#ebebe6] flex font-sans overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 blur-[150px] rounded-full -z-10 pointer-events-none animate-pulse" style={{ animationDuration: '7s' }}></div>

      {showDropModal && <CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} />}

      {/* --- SIDEBAR --- */}
      <aside className="w-20 border-r border-white/5 bg-[#080808]/80 backdrop-blur-xl flex flex-col items-center py-10 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]">
           <span className="font-black text-[10px] text-white tracking-widest">MIC</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-12 w-full px-4">
          <button onClick={() => setActiveTab('home')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'home' ? 'bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white'}`}>
            <span className="text-xl mb-1">🏠</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Home</span>
          </button>

          <button onClick={() => setActiveTab('network')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'network' ? 'bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white'}`}>
            <span className="text-xl mb-1">🌍</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Feed</span>
          </button>

          <button onClick={() => setActiveTab('vault')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'vault' ? 'bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white'}`}>
            <span className="text-xl mb-1">🗄️</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Vault</span>
          </button>

          <button onClick={() => setActiveTab('chat')} className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'chat' ? 'bg-purple-600 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white'}`}>
            <span className="text-xl mb-1">💬</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Chat</span>
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          </button>
        </nav>

        <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border-2 border-white/10 p-0.5 overflow-hidden cursor-pointer hover:border-purple-500 transition-all shadow-xl mt-auto">
           <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Artist'}`} className="w-full h-full rounded-full grayscale hover:grayscale-0 transition-all duration-500 object-cover" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 px-12 sticky top-0 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between z-40">
           <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-[9px] uppercase tracking-[0.6em] text-purple-500 font-black italic">Artist Hub</span>
              <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
                  {activeTab === 'home' ? 'Discovery' : activeTab === 'vault' ? 'My Vault' : activeTab === 'network' ? 'Global Pitch Feed' : 'The Chat Hub'}
              </h2>
           </div>

           <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <NotificationBell />
              <button onClick={() => setShowDropModal(true)} className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                Drop to Global Feed 🌍
              </button>
              <button onClick={() => setIsDawOpen(true)} className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105">
                Enter DAW Studio
              </button>
           </div>
        </header>

        <main className="flex-1 relative z-10 w-full overflow-hidden pb-32">
           
           {activeTab === 'home' && (
             <div className="p-8 lg:p-12 max-w-[1600px] mx-auto overflow-y-auto h-full custom-scrollbar animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[80px] rounded-full pointer-events-none"></div>
                  <h3 className="text-2xl font-serif italic text-white mb-8 border-b border-white/5 pb-6">Producer Beats</h3>
                  {producerBeats.length === 0 ? (
                      <div className="text-center py-20 text-neutral-500">No beats found in the marketplace yet.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                         {producerBeats.map((beat) => {
                           const isThisPlaying = currentTrack?._id === beat._id;

                           return (
                            <div key={beat._id} className={`group bg-black/40 p-7 rounded-[2rem] hover:bg-white/5 border transition-all ${isThisPlaying ? 'border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/5'}`}>
                              <div className="flex justify-between items-start mb-6">
                                <button 
                                  onClick={() => handlePlayPreview(beat)} 
                                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isThisPlaying && isPlaying ? 'bg-purple-500 text-white scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white'}`}
                                >
                                    {isThisPlaying && isPlaying ? '⏸' : '▶'}
                                </button>
                                <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-white/5 rounded-full text-neutral-500 border border-white/10">PREVIEW</span>
                              </div>
                              <h4 className={`font-bold text-xl truncate w-full transition-colors ${isThisPlaying ? 'text-purple-400' : 'text-white'}`}>{beat.title}</h4>
                              <p className="text-[10px] text-neutral-500 mt-2 font-mono uppercase tracking-widest">ID: {beat._id.slice(-6)}</p>
                              
                              <button onClick={() => setIsDawOpen(true)} className="mt-8 w-full py-4 border border-purple-500/30 rounded-xl text-[10px] uppercase font-black text-purple-400 hover:bg-purple-600 hover:text-white transition-all">Load into DAW</button>
                            </div>
                           );
                         })}
                      </div>
                  )}
               </div>
             </div>
           )}

           {activeTab === 'network' && (
              <div className="h-full w-full animate-in fade-in duration-500">
                 <GlobalFeed /> 
              </div>
           )}

           {activeTab === 'chat' && (
              <div className="h-full w-full animate-in fade-in duration-500">
                 <RapperNetwork userId={userId} setIsDawOpen={setIsDawOpen} />
              </div>
           )}

           {activeTab === 'vault' && (
             <div className="p-8 lg:p-12 max-w-[1600px] mx-auto overflow-y-auto h-full custom-scrollbar animate-in fade-in zoom-in-95 duration-500">
               <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                  <h3 className="text-2xl font-serif italic text-white mb-8 border-b border-white/5 pb-6">My Vault</h3>
                  {vaultProjects.length === 0 ? (
                      <div className="text-center py-20 text-neutral-500">Your vault is empty.</div>
                  ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                         {vaultProjects.map((project) => (
                           <div key={project._id} className="bg-black/40 p-7 rounded-[2rem] hover:bg-white/5 border border-white/5 transition-all">
                              <h4 className="font-bold text-xl text-white">{project.name}</h4>
                              <button onClick={() => setIsDawOpen(true)} className="mt-8 w-full py-4 border border-green-500/30 rounded-xl text-[10px] uppercase font-black text-green-400 hover:bg-green-600 hover:text-white">Resume Session</button>
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