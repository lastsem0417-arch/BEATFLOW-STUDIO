import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';

export default function RapperActivity() {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [btnText, setBtnText] = useState("INJECT COMMAND");

  const fetchSessions = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/projects/all`); 
      setSessions(res.data.filter((s: any) => s.tracks && s.tracks.length > 0));
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🎬 GSAP: Main List Entrance
  useLayoutEffect(() => {
    if (!loading && sessions.length > 0) {
      let ctx = gsap.context(() => {
        gsap.fromTo(".activity-card", 
          { opacity: 0, x: 20 },
          { opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "expo.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, sessions]);

  // 🎬 GSAP: Modal Entrance
  useLayoutEffect(() => {
    if (selectedSession && modalRef.current) {
      gsap.fromTo(modalRef.current,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.5, ease: "power4.out" }
      );
    }
  }, [selectedSession]);

  const closeSession = () => {
    gsap.to(modalRef.current, {
      y: "100%", opacity: 0, duration: 0.4, ease: "power3.in",
      onComplete: () => setSelectedSession(null)
    });
  };

  // --- 🔥 FEEDBACK INJECTION LOGIC (Untouched, just UI state updated) ---
  const handleInjectFeedback = async () => {
    if (!feedback.trim()) return;
    setIsSaving(true);
    setBtnText("TRANSMITTING...");
    try {
      await axios.patch(`import.meta.env.VITE_API_URL/api/projects/${selectedSession._id}/notes`, {
        notes: feedback
      });
      setBtnText("OVERRIDE INJECTED ✓");
      setTimeout(() => {
        closeSession();
        setFeedback("");
        setBtnText("INJECT COMMAND");
      }, 1000);
    } catch (err) {
      setBtnText("ERROR. RETRY.");
      setTimeout(() => setBtnText("INJECT COMMAND"), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    // 🔥 PURE WHITE BRUTALIST CONTAINER
    <div ref={containerRef} className="w-full bg-white border-[4px] border-[#0000FF] shadow-[12px_12px_0_#0000FF] p-6 lg:p-8 flex flex-col relative font-sans h-full min-h-[400px] overflow-hidden mt-2">
      
      {/* ============================================================== */}
      {/* 📝 THE SESSION DETAIL OVERLAY (Neon Yellow Brutalist Panel)    */}
      {/* ============================================================== */}
      {selectedSession && (
        <div ref={modalRef} className="absolute inset-0 z-50 bg-[#EAF205] flex flex-col justify-between overflow-hidden shadow-[inset_0_0_0_6px_#0000FF]">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b-[4px] border-[#0000FF] p-6 lg:p-8 shrink-0 bg-white">
                <div>
                    <h4 className="text-[#0000FF] text-[10px] uppercase tracking-[0.4em] font-black mb-1 bg-[#EAF205] inline-block px-2 border-[2px] border-[#0000FF]">OVERRIDE_MODE</h4>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[#0000FF] truncate mt-2">{selectedSession.name}</h2>
                </div>
                <button 
                  onClick={closeSession} 
                  className="w-12 h-12 flex items-center justify-center border-[3px] border-[#0000FF] text-[#0000FF] hover:bg-[#0000FF] hover:text-[#EAF205] text-xl font-black transition-all shadow-[4px_4px_0_#0000FF] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none shrink-0"
                >
                  ×
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 lg:p-8 flex flex-col gap-6 overflow-y-auto custom-brutal-scroll bg-[#EAF205]">
                
                {/* Active Layers Display */}
                <div>
                    <span className="text-[10px] text-[#0000FF] uppercase tracking-[0.4em] font-black block mb-4 border-b-[2px] border-[#0000FF] pb-2">ACTIVE_MIX_LAYERS</span>
                    <div className="flex flex-col gap-3">
                        {selectedSession.tracks?.map((t: any, i: number) => (
                            <div key={i} className="px-4 py-3 bg-white border-[3px] border-[#0000FF] flex items-center justify-between shadow-[4px_4px_0_#0000FF] transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#0000FF]">
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className={`w-3 h-3 border-[2px] border-[#0000FF] ${t.trackType === 'beat' ? 'bg-[#0000FF]' : 'bg-white'}`}></div>
                                    <span className="text-[14px] font-black uppercase tracking-tighter text-[#0000FF] truncate">{t.title || 'UNTITLED LAYER'}</span>
                                </div>
                                <span className="text-[8px] uppercase tracking-widest font-black text-white bg-[#0000FF] px-2 py-1 border-[2px] border-[#0000FF]">{t.trackType}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Input Area */}
                <div className="flex flex-col gap-3 mt-auto pt-6 border-t-[4px] border-[#0000FF]">
                    <span className="text-[10px] text-[#0000FF] uppercase tracking-[0.4em] font-black flex items-center gap-3">
                       <span className="w-3 h-3 bg-[#0000FF] border-[2px] border-[#0000FF] animate-pulse"></span>
                       DIRECT_INTERCEPT_LINE
                    </span>
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="TRANSMIT MIX NOTES... (E.G. DROP VOCAL GAIN BY -3DB)"
                        className="w-full h-32 bg-white border-[3px] border-[#0000FF] p-4 text-[13px] text-[#0000FF] font-black uppercase tracking-widest outline-none focus:shadow-[inset_4px_4px_0_rgba(0,0,255,0.1)] transition-all resize-none placeholder:text-[#0000FF]/40 shadow-[4px_4px_0_#0000FF]"
                    />
                    
                    <button 
                        id="inject-btn"
                        onClick={handleInjectFeedback}
                        disabled={isSaving || !feedback.trim()}
                        className="w-full py-4 mt-2 bg-[#0000FF] text-[#EAF205] border-[3px] border-[#0000FF] shadow-[6px_6px_0_white] hover:bg-white hover:text-[#0000FF] hover:shadow-[6px_6px_0_#0000FF] disabled:opacity-50 disabled:pointer-events-none text-[12px] font-black uppercase tracking-[0.4em] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center"
                    >
                        {btnText}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 📡 THE MAIN MONITOR LIST VIEW (Brutalist Style)                */}
      {/* ============================================================== */}
      <div className="flex justify-between items-start border-b-[4px] border-[#0000FF] pb-6 mb-6 shrink-0 relative z-10">
        <div className="flex flex-col">
            <p className="text-[10px] text-[#0000FF] font-black uppercase tracking-[0.4em] mb-1 font-mono">GLOBAL_COLLABS</p>
            <h3 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter text-[#0000FF] leading-none">LIVE MONITOR</h3>
        </div>
        <div className="px-4 py-2 bg-[#EAF205] border-[3px] border-[#0000FF] text-[10px] text-[#0000FF] font-black tracking-widest shadow-[4px_4px_0_#0000FF] flex items-center gap-3">
           <span className="w-2 h-2 bg-[#0000FF] animate-ping border border-[#0000FF]"></span> 
           SYNCED
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-brutal-scroll relative z-10 pr-2">
        {loading ? (
            <div className="flex flex-col items-center justify-center h-full opacity-50">
               <div className="w-12 h-12 border-[4px] border-[#0000FF] border-t-transparent animate-spin mb-4"></div>
               <span className="text-[10px] uppercase font-black font-mono tracking-[0.3em] text-[#0000FF]">SCANNING_FREQUENCIES...</span>
            </div>
        ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full border-[4px] border-dashed border-[#0000FF] bg-[#EAF205]/20 p-8 text-center">
               <span className="text-4xl mb-4 text-[#0000FF] opacity-50">📡</span>
               <span className="text-[12px] font-black uppercase font-mono tracking-[0.4em] text-[#0000FF]">NO ACTIVE SIGNALS</span>
            </div>
        ) : (
            <div className="flex flex-col gap-4 pb-4">
              {sessions.map((session, i) => (
              <div 
                  key={i} 
                  onClick={() => { setSelectedSession(session); setFeedback(session.producerNotes || ""); }} 
                  className="activity-card group p-5 bg-white border-[3px] border-[#0000FF] hover:bg-[#EAF205] transition-all duration-150 flex items-center justify-between cursor-pointer shadow-[6px_6px_0_#0000FF] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0_#0000FF] active:shadow-none"
              >
                  <div className="flex items-center gap-5 overflow-hidden">
                      <div className="w-14 h-14 border-[3px] border-[#0000FF] bg-white overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator || i}`} alt="avatar" className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all"/>
                      </div>
                      <div className="flex flex-col overflow-hidden">
                          <span className="text-[16px] font-black uppercase tracking-tighter text-[#0000FF] truncate">{session.name || 'UNTITLED SESSION'}</span>
                          <span className="text-[9px] text-[#0000FF] font-bold uppercase tracking-[0.3em] mt-1 font-mono">{session.tracks?.length || 0} LAYERS ACTIVE</span>
                      </div>
                  </div>
                  {/* Action Arrow */}
                  <div className="w-10 h-10 border-[3px] border-[#0000FF] flex items-center justify-center font-black text-lg text-[#0000FF] bg-white group-hover:bg-[#0000FF] group-hover:text-[#EAF205] transition-colors shrink-0">
                    →
                  </div>
              </div>
              ))}
            </div>
        )}
      </div>

      <style>{`
        .custom-brutal-scroll::-webkit-scrollbar {
          width: 14px !important;
          display: block !important;
        }
        .custom-brutal-scroll::-webkit-scrollbar-track {
          background: white !important;
          border-left: 3px solid #0000FF !important;
        }
        .custom-brutal-scroll::-webkit-scrollbar-thumb {
          background: #0000FF !important;
          border: 3px solid white !important;
        }
      `}</style>
    </div>
  );
}