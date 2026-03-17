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
      setSessions(res.data);
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
      // Backend ko patch request bhejo session ID ke saath
      await axios.patch(`http://localhost:5000/api/projects/${selectedSession._id}/notes`, {
        notes: feedback
      });
      alert("Feedback Injected into Session! 💉🔥");
      setSelectedSession(null);
      setFeedback("");
    } catch (err) {
      alert("Failed to inject feedback.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-8 shadow-2xl h-full relative overflow-hidden">
      
      {selectedSession && (
        <div className="absolute inset-0 z-50 bg-[#050505]/98 backdrop-blur-2xl p-8 flex flex-col animate-in slide-in-from-bottom duration-500">
            <button onClick={() => setSelectedSession(null)} className="ml-auto text-neutral-500 hover:text-white uppercase text-[9px] tracking-[0.3em] font-black">Back to List</button>
            
            <div className="mt-4 border-b border-white/5 pb-4">
                <h4 className="text-blue-500 text-[9px] uppercase tracking-[0.4em] font-black">Producer Control</h4>
                <h2 className="text-xl font-serif italic text-white mt-1">{selectedSession.name}</h2>
            </div>

            <div className="flex-1 mt-6 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {/* Track Status */}
                <div className="space-y-2">
                    <span className="text-[8px] text-neutral-500 uppercase tracking-widest block">Active Mix Layers</span>
                    <div className="grid grid-cols-2 gap-2">
                        {selectedSession.tracks?.map((t: any, i: number) => (
                            <div key={i} className="p-2 bg-white/5 border border-white/5 rounded-lg flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'beat' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                                <span className="text-[9px] text-white/50 truncate uppercase tracking-tighter">{t.title || 'Layer'}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Feedback Area */}
                <div className="space-y-3">
                    <span className="text-[8px] text-blue-500 uppercase tracking-[0.3em] font-black">Direct Feedback Injection</span>
                    <textarea 
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        placeholder="Type notes for the rapper... (e.g. Turn down the reverb on Track 2)"
                        className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500 transition-all resize-none font-light leading-relaxed"
                    />
                </div>

                <button 
                    onClick={handleInjectFeedback}
                    disabled={isSaving}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-800 text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95"
                >
                    {isSaving ? "Injecting..." : "Inject Feedback"}
                </button>
            </div>
        </div>
      )}

      {/* ... (Existing List View Code stays the same) ... */}
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-[10px] uppercase tracking-[0.4em] font-black text-blue-500">Live Monitor</h3>
        <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[8px] text-green-500 font-bold animate-pulse">Active</div>
      </div>

      <div className="flex flex-col gap-4">
        {sessions.map((session, i) => (
          <div key={i} onClick={() => { setSelectedSession(session); setFeedback(session.producerNotes || ""); }} className="group p-5 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all flex items-center justify-between cursor-pointer active:scale-95">
             {/* List content same as your image */}
             <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-white/10">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${session.creator || i}`} alt="avatar" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-white group-hover:text-blue-400">{session.name}</span>
                    <span className="text-[8px] text-neutral-600 uppercase tracking-widest">{session.tracks?.length} Layers Mixed</span>
                 </div>
             </div>
             <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
          </div>
        ))}
      </div>
    </div>
  );
}