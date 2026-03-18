import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function RapperActivity() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/projects/all'); 
      // Filter out empty sessions if needed
      setSessions(res.data.filter((s: any) => s.tracks && s.tracks.length > 0));
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // --- 🔥 FEEDBACK INJECTION LOGIC ---
  const handleInjectFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSaving(true);
    try {
      await axios.patch(`http://localhost:5000/api/projects/${selectedSession._id}/notes`, {
        notes: feedback
      });
      // Premium UI Feedback instead of Alert
      const btn = document.getElementById('inject-btn');
      if(btn) {
          btn.innerHTML = "Injected ✓";
          btn.classList.add('bg-green-500', 'text-black');
      }
      setTimeout(() => {
        setSelectedSession(null);
        setFeedback("");
      }, 1500);
    } catch (err) {
      alert("Transmission Failed. Retry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0A0A0C] border border-white/5 rounded-[2rem] p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] h-full relative overflow-hidden group">
      
      {/* 🌌 AMBIENT BACKGROUND GLOW */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[60px] rounded-full pointer-events-none transition-opacity duration-700"></div>
      
      {/* ============================================================== */}
      {/* 📝 THE SESSION DETAIL OVERLAY (Cinematic Popup)                  */}
      {/* ============================================================== */}
      {selectedSession && (
        <div className="absolute inset-0 z-50 bg-[#030305]/95 backdrop-blur-2xl p-8 lg:p-10 flex flex-col animate-in slide-in-from-bottom-8 duration-500">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-white/5 pb-6">
                <div>
                    <h4 className="text-[#D4AF37] text-[9px] uppercase tracking-[0.4em] font-black mb-1">Architect Override</h4>
                    <h2 className="text-2xl font-serif italic text-[#F0F0EB]">{selectedSession.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedSession(null)} 
                  className="text-[#888888] hover:text-white uppercase text-[10px] tracking-[0.3em] font-black transition-colors"
                >
                  Close ×
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 mt-8 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-2" data-lenis-prevent="true">
                
                {/* Active Layers Display */}
                <div>
                    <span className="text-[9px] text-[#888888] uppercase tracking-[0.3em] font-black block mb-4">Active Mix Layers</span>
                    <div className="flex flex-col gap-3">
                        {selectedSession.tracks?.map((t: any, i: number) => (
                            <div key={i} className="px-4 py-3 bg-[#010101] border border-white/5 rounded-xl flex items-center justify-between group/layer hover:border-white/10 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${t.trackType === 'beat' ? 'bg-[#D4AF37]' : 'bg-[#E63946]'}`}></div>
                                    <span className="text-[12px] font-mono text-[#F0F0EB] truncate group-hover/layer:text-white">{t.title || 'Untitled Layer'}</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-[0.2em] font-black text-[#888888]">{t.trackType}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Input Area */}
                <div className="flex flex-col gap-3 mt-auto">
                    <span className="text-[9px] text-[#D4AF37] uppercase tracking-[0.3em] font-black flex items-center gap-2">
                       <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse"></span>
                       Direct Intercept Line
                    </span>
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Transmit mix notes to the artist... (e.g. Drop the vocal gain by -3dB on the hook)"
                        className="w-full h-32 bg-[#010101] border border-white/10 rounded-2xl p-5 text-[13px] text-[#F0F0EB] font-mono outline-none focus:border-[#D4AF37]/50 transition-all resize-none leading-relaxed placeholder:text-[#888888]/50"
                    />
                    
                    <button 
                        id="inject-btn"
                        onClick={handleInjectFeedback}
                        disabled={isSaving || !feedback.trim()}
                        className="w-full py-5 bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-white/10 hover:border-[#D4AF37] disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-[#F0F0EB] disabled:hover:border-white/10 text-[#F0F0EB] text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-lg active:scale-[0.98] mt-2 flex items-center justify-center"
                    >
                        {isSaving ? "Transmitting..." : "Inject Feedback"}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 📡 THE MAIN MONITOR LIST VIEW                                    */}
      {/* ============================================================== */}
      <div className="flex justify-between items-center mb-10 relative z-10">
        <div className="flex flex-col">
            <h3 className="text-[11px] uppercase tracking-[0.5em] font-black text-[#F0F0EB]">Live Monitor</h3>
            <span className="text-[8px] text-[#888888] uppercase tracking-widest mt-1 font-mono">Global Collaborations</span>
        </div>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] text-green-500 font-bold animate-pulse flex items-center gap-1.5">
           <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> 
           SYNC
        </div>
      </div>

      <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 h-[350px] lg:h-auto relative z-10" data-lenis-prevent="true">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-30">
               <span className="w-8 h-8 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin mb-4"></span>
               <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-[#888888]">Scanning frequencies...</span>
            </div>
        ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full opacity-40 border border-dashed border-white/10 rounded-2xl py-12">
               <span className="text-2xl mb-4 grayscale">📡</span>
               <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-[#888888] text-center px-4">No active signals detected.</span>
            </div>
        ) : (
            sessions.map((session, i) => (
            <div 
                key={i} 
                onClick={() => { setSelectedSession(session); setFeedback(session.producerNotes || ""); }} 
                className="group p-5 lg:p-6 bg-[#010101] border border-white/5 rounded-[1.5rem] hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 transition-all flex items-center justify-between cursor-pointer active:scale-[0.98] shadow-inner"
            >
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-black overflow-hidden border border-white/10 group-hover:border-[#D4AF37]/50 transition-colors">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator || i}`} alt="avatar" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"/>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-[#F0F0EB] group-hover:text-[#D4AF37] transition-colors">{session.name || 'Untitled Session'}</span>
                        <span className="text-[9px] text-[#888888] uppercase tracking-[0.2em] mt-1 font-mono">{session.tracks?.length || 0} Layers Active</span>
                    </div>
                </div>
                {/* Status Indicator */}
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] opacity-20 group-hover:opacity-100 group-hover:shadow-[0_0_10px_#D4AF37] transition-all duration-500"></div>
            </div>
            ))
        )}
      </div>

    </div>
  );
}