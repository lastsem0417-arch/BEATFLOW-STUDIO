import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import axios from 'axios';

export default function LyricistDashboard() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [beats, setBeats] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [selectedBeat, setSelectedBeat] = useState<string | null>(null);
  const [currentNote, setCurrentNote] = useState({ id: '', title: '', content: '' });
  
  // AI STATES
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const beatPlayerRef = useRef<HTMLAudioElement | null>(null);
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id;

  // 1. DATA SYNC
  const fetchData = async () => {
    try {
      const [beatRes, noteRes] = await Promise.all([
        axios.get('import.meta.env.VITE_API_URL/api/tracks/type/beat'),
        axios.get(`import.meta.env.VITE_API_URL/api/lyrics/user/${userId}`)
      ]);
      setBeats(beatRes.data);
      setNotes(noteRes.data);
    } catch (err) { console.error("Sync Error"); }
  };

  // 2. AI RHYME ENGINE
  const getRhymes = async (text: string) => {
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (!lastWord || lastWord.length < 2) return;

    setIsAiLoading(true);
    try {
      const res = await axios.get(`import.meta.env.VITE_API_URL/api/ai/rhymes/${lastWord}`);
      setRhymes(res.data);
    } catch (err) { console.log("AI Rhyme Engine Offline"); }
    finally { setIsAiLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🎬 GSAP PREMIUM EDITORIAL ENTRY
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.lyric-panel', 
        { opacity: 0, y: 40, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Debounced AI Trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentNote.content) getRhymes(currentNote.content);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentNote.content]);

  // 3. SAVE LOGIC
  const handleSave = async () => {
    if (!currentNote.content) return;
    setIsSaving(true);
    try {
      if (currentNote.id) {
        await axios.put(`import.meta.env.VITE_API_URL/api/lyrics/update/${currentNote.id}`, {
          title: currentNote.title || 'Untitled Draft',
          content: currentNote.content
        });
      } else {
        const res = await axios.post('import.meta.env.VITE_API_URL/api/lyrics/save', {
          title: currentNote.title || 'Untitled Draft',
          content: currentNote.content,
          creator: userId
        });
        setCurrentNote(prev => ({ ...prev, id: res.data._id }));
      }
      fetchData();
      // Premium discrete alert (could be replaced with a toast later)
      alert("Draft Encrypted & Saved to Vault. 🖋️");
    } catch (err) { alert("Save failed."); }
    setIsSaving(false);
  };

  return (
    // 🔥 PREMIUM CYBER-ORGANIC BASE (#F9F8F6) WITH EMERALD GREEN ACCENT (#10B981) 🔥
    <div ref={containerRef} className="flex h-screen w-full bg-[#F9F8F6] text-[#0A1A14] p-6 md:p-8 gap-6 lg:gap-8 overflow-hidden font-sans select-none selection:bg-[#10B981] selection:text-white relative">
      
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* 🗄️ LEFT: Draft Vault */}
      <div className="lyric-panel flex w-72 lg:w-80 flex-col rounded-[2.5rem] border border-[#0A1A14]/5 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] overflow-y-auto custom-scrollbar relative z-10">
        <div className="flex justify-between items-center mb-10 pb-6 border-b border-[#0A1A14]/5">
          <h3 className="text-[10px] tracking-[0.4em] text-[#0A1A14]/50 uppercase font-black font-mono">Draft Vault</h3>
          <button 
            onClick={() => setCurrentNote({ id: '', title: '', content: '' })} 
            className="h-8 w-8 rounded-full border border-[#0A1A14]/10 flex items-center justify-center hover:bg-[#10B981] hover:text-white hover:border-[#10B981] transition-all duration-300 shadow-sm active:scale-95"
            title="New Canvas"
          >
            +
          </button>
        </div>
        <div className="space-y-3 flex-1">
          {notes.length === 0 && (
             <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0A1A14]/30 text-center mt-10">Vault is empty.</p>
          )}
          {notes.map((note) => (
            <div 
              key={note._id}
              onClick={() => setCurrentNote({ id: note._id, title: note.title, content: note.content })}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${currentNote.id === note._id ? 'border-[#10B981] bg-[#10B981]/5 shadow-[0_5px_15px_rgba(16,185,129,0.1)] -translate-y-0.5' : 'border-[#0A1A14]/5 bg-[#F9F8F6]/50 hover:bg-white hover:border-[#0A1A14]/10 hover:shadow-sm'}`}
            >
              <p className={`text-[13px] truncate font-bold tracking-tight mb-2 transition-colors ${currentNote.id === note._id ? 'text-[#10B981]' : 'text-[#0A1A14]'}`}>{note.title}</p>
              <p className="text-[9px] text-[#0A1A14]/40 font-mono uppercase tracking-widest">{new Date(note.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✍️ CENTER: Main Writing Studio */}
      <div className="flex flex-1 flex-col gap-6 lg:gap-8 relative z-10">
        
        {/* Top AI Rhyme Bar (Cyber-Organic Aesthetic) */}
        <div className="lyric-panel h-20 rounded-[2rem] border border-[#0A1A14]/5 bg-white flex items-center px-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] overflow-hidden relative">
          <div className="flex items-center gap-3 mr-8 shrink-0">
             <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></div>
             <div className="text-[9px] tracking-[0.4em] text-[#10B981] uppercase font-black font-mono">Rhyme Synth</div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto custom-scrollbar py-2 flex-1 items-center">
            {rhymes.length > 0 ? rhymes.map((rhyme, i) => (
              <span 
                key={i} 
                className="px-4 py-2 rounded-full bg-[#F9F8F6] border border-[#0A1A14]/5 text-[10px] text-[#0A1A14]/60 hover:text-[#0A1A14] hover:border-[#10B981]/50 hover:bg-[#10B981]/5 hover:shadow-sm cursor-pointer transition-all uppercase whitespace-nowrap tracking-[0.2em] font-black"
                onClick={() => setCurrentNote(prev => ({...prev, content: prev.content + ' ' + rhyme}))} // Bonus functionality: Click to add rhyme
              >
                {rhyme}
              </span>
            )) : (
              <span className="text-[10px] text-[#0A1A14]/30 uppercase font-bold tracking-[0.2em] font-mono">Analyzing cadence...</span>
            )}
          </div>
          {isAiLoading && <div className="absolute right-8 h-1.5 w-1.5 bg-[#10B981] rounded-full animate-ping"></div>}
        </div>

        {/* 📝 THE EDITOR CANVAS (Premium Notebook Feel) */}
        <div className="lyric-panel flex-1 rounded-[3rem] border border-[#0A1A14]/5 bg-white p-12 md:p-16 relative shadow-[0_20px_60px_rgba(0,0,0,0.04)] flex flex-col group">
          {/* Subtle Canvas/Paper Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-[3rem]" style={{ backgroundImage: 'radial-gradient(#0A1A14 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <input 
            type="text" 
            className="w-full bg-transparent border-none outline-none font-serif italic text-4xl md:text-5xl mb-12 text-[#0A1A14] placeholder:text-[#0A1A14]/20 tracking-tight transition-colors focus:text-[#10B981]"
            placeholder="Name the Vision..."
            value={currentNote.title}
            onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
          />
          <textarea 
            className="w-full flex-1 bg-transparent border-none outline-none resize-none font-serif text-2xl md:text-3xl leading-[2.2] text-[#0A1A14]/80 placeholder:text-[#0A1A14]/10 custom-scrollbar relative z-10"
            placeholder="Write with the rhythm..."
            value={currentNote.content}
            onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
          />
          
          <div className="mt-8 pt-8 flex justify-between items-center border-t border-[#0A1A14]/5 relative z-10">
            <div className="text-[10px] tracking-[0.3em] text-[#0A1A14]/40 uppercase font-black font-mono">
              Word Count: <span className="text-[#0A1A14]">{currentNote.content.split(/\s+/).filter(x => x).length}</span>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-4 rounded-full bg-[#0A1A14] text-white text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#10B981] hover:shadow-[0_10px_20px_rgba(16,185,129,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? 'Encrypting...' : 'Commit to Vault'}
            </button>
          </div>
        </div>
      </div>

      {/* 🎧 RIGHT: Vibe Selector (Beat Market) */}
      <div className="lyric-panel w-72 lg:w-80 flex flex-col rounded-[2.5rem] border border-[#0A1A14]/5 bg-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.03)] relative z-10">
        <h3 className="text-[10px] tracking-[0.4em] text-[#0A1A14]/50 mb-8 pb-6 border-b border-[#0A1A14]/5 uppercase font-black font-mono">Audio Stimulus</h3>
        
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 mb-8">
          {beats.length === 0 && (
             <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#0A1A14]/30 text-center mt-10">No beats in market.</p>
          )}
          {beats.map((beat) => (
            <div 
              key={beat._id}
              onClick={() => setSelectedBeat(beat.audioUrl)}
              className={`p-5 rounded-[1.2rem] border transition-all duration-300 cursor-pointer ${selectedBeat === beat.audioUrl ? 'border-[#10B981] bg-[#10B981] shadow-[0_10px_20px_rgba(16,185,129,0.2)] -translate-y-0.5' : 'border-[#0A1A14]/5 bg-[#F9F8F6] hover:bg-white hover:border-[#0A1A14]/10 hover:shadow-sm'}`}
            >
              <p className={`text-[12px] font-bold truncate tracking-tight mb-1 transition-colors ${selectedBeat === beat.audioUrl ? 'text-white' : 'text-[#0A1A14]'}`}>{beat.title}</p>
              <p className={`text-[8px] uppercase tracking-widest font-mono transition-colors ${selectedBeat === beat.audioUrl ? 'text-white/70' : 'text-[#0A1A14]/40'}`}>Select Frequency</p>
            </div>
          ))}
        </div>
        
        {/* Custom styled default audio player for light mode */}
        <div className="bg-[#F9F8F6] rounded-2xl p-3 border border-[#0A1A14]/5 shadow-inner mb-6">
           <audio 
             ref={beatPlayerRef} 
             src={selectedBeat || ''} 
             className="w-full h-10 outline-none opacity-80 hover:opacity-100 transition-opacity" 
             controls 
             crossOrigin="anonymous" 
           />
        </div>

        <button 
          onClick={() => navigate('/roles')} 
          className="mt-auto py-4 rounded-full border border-[#0A1A14]/10 bg-transparent text-[9px] font-black uppercase tracking-[0.3em] text-[#0A1A14]/50 hover:bg-[#0A1A14] hover:text-white hover:border-[#0A1A14] transition-all duration-300 active:scale-95"
        >
          Exit Studio
        </button>
      </div>

      {/* Light Mode Scrollbar Styling */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10,26,20,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10B981; }
      `}</style>
    </div>
  );
}