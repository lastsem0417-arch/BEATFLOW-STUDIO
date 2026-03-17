import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
// 🔥 TERE PATH KE HISAB SE WEBCAM IMPORT KIYA
import DraggableWebcam from '../studio/DraggableWebcam'; 

export default function ProducerMaster() {  
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'network' | 'chat'>('dashboard');
  const [showDropModal, setShowDropModal] = useState(false);
  
  const user = JSON.parse(sessionStorage.getItem('beatflow_user')|| '{}');

  useEffect(() => {
    if (!sessionStorage.getItem('beatflow_user')) navigate('/roles');
  }, [navigate]);

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-[#ebebe6] flex font-sans overflow-hidden relative">
      
      {/* 🔥 TERA DRAGGABLE WEBCAM YAHAN HAI 🔥 */}
      <DraggableWebcam />

      {showDropModal && <CreateDropModal onClose={() => setShowDropModal(false)} onSuccess={() => setShowDropModal(false)} />}

      {/* --- SIDEBAR --- */}
      <aside className="w-24 border-r border-white/5 bg-[#080808]/80 backdrop-blur-xl flex flex-col items-center py-10 z-50 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
           <span className="font-black text-xs italic text-white tracking-wider">BF</span>
        </div>
        
        <nav className="flex flex-col gap-6 flex-1 mt-12 w-full px-5">
          <button onClick={() => setActiveView('dashboard')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeView === 'dashboard' ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
            <span className="text-xl mb-1">🎛️</span>
            <span className="text-[7px] font-black uppercase tracking-widest">Dash</span>
          </button>
          
          <button onClick={() => setActiveView('network')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeView === 'network' ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
             <span className="text-xl mb-1">🌍</span>
             <span className="text-[7px] font-black uppercase tracking-widest">Feed</span>
          </button>

          <button onClick={() => setActiveView('chat')} className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${activeView === 'chat' ? 'bg-blue-600/20 border border-blue-500/50 text-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white border border-transparent'}`}>
             <span className="text-xl mb-1">💬</span>
             <span className="text-[7px] font-black uppercase tracking-widest">Hub</span>
             <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
          </button>
        </nav>

        {/* 🔥 UNIFIED PROFILE BUTTON 🔥 */}
        <div onClick={() => navigate('/profile')} className="w-12 h-12 rounded-full border-2 border-white/10 p-0.5 hover:border-blue-500 transition-all cursor-pointer overflow-hidden shadow-xl mt-auto group" title="View Identity">
            <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Producer'}`} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-500 object-cover" alt="Profile" />
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-24 px-12 sticky top-0 bg-[#050505]/80 border-b border-white/5 flex items-center justify-between z-40 backdrop-blur-2xl">
           <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="text-[9px] uppercase tracking-[0.6em] text-blue-500 font-black italic">Studio Console</span>
              <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
                {activeView === 'dashboard' ? 'Command Center' : activeView === 'network' ? 'Global Pitch Feed' : 'Network Hub'}
              </h2>
           </div>

           <div className="flex items-center gap-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <NotificationBell />
              <button onClick={() => setShowDropModal(true)} className="group relative px-6 py-3.5 overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(37,99,235,0.3)]">
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                <span className="relative text-[10px] uppercase tracking-[0.3em] font-black text-blue-400 group-hover:text-white transition-colors">
                  Drop to Global Feed 🌍
                </span>
              </button>
           </div>
        </header>

        {/* 🔥 pb-32 ADDED FOR BOTTOM AUDIO PLAYER 🔥 */}
        <main className="flex-1 w-full relative z-10 overflow-y-auto custom-scrollbar pb-32">
           {activeView === 'dashboard' && (
             <div className="p-8 lg:p-12 flex flex-col gap-12 max-w-[1600px] mx-auto w-full animate-in fade-in zoom-in-95 duration-700">
               <AnalyticsHeader />
               <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
                  <div className="xl:col-span-2"><BeatInventory refreshTrigger={refreshTrigger} /></div>
                  <div className="xl:col-span-1"><RapperActivity /></div>
                  <div className="xl:col-span-1"><DrumPad /></div>
               </div>
               <BeatExplorer />
               <UploadPortal onUploadSuccess={() => setRefreshTrigger(t => t + 1)} />
             </div>
           )}

           {activeView === 'network' && <div className="h-full w-full animate-in fade-in duration-500"><GlobalFeed /></div>}
           {activeView === 'chat' && <div className="h-full w-full animate-in fade-in duration-500"><LiveNetwork /></div>}
        </main>
      </div>
    </div>
  ); 
}