import { useEffect, useState, useRef } from 'react';
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
        axios.get('http://localhost:5000/api/tracks/type/beat'),
        axios.get(`http://localhost:5000/api/lyrics/user/${userId}`)
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
      const res = await axios.get(`http://localhost:5000/api/ai/rhymes/${lastWord}`);
      setRhymes(res.data);
    } catch (err) { console.log("AI Rhyme Engine Offline"); }
    finally { setIsAiLoading(false); }
  };

  useEffect(() => {
    fetchData();
    gsap.fromTo('.lyric-panel', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out' });
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
        await axios.put(`http://localhost:5000/api/lyrics/update/${currentNote.id}`, {
          title: currentNote.title || 'Untitled Draft',
          content: currentNote.content
        });
      } else {
        const res = await axios.post('http://localhost:5000/api/lyrics/save', {
          title: currentNote.title || 'Untitled Draft',
          content: currentNote.content,
          creator: userId
        });
        setCurrentNote(prev => ({ ...prev, id: res.data._id }));
      }
      fetchData();
      alert("Draft Encrypted. 🖋️");
    } catch (err) { alert("Save failed."); }
    setIsSaving(false);
  };

  return (
    <div ref={containerRef} className="flex h-screen w-full bg-[#050505] text-[#EBEBE6] p-6 gap-6 overflow-hidden font-sans select-none">
      
      {/* LEFT: Draft Vault */}
      <div className="lyric-panel flex w-72 flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl shadow-2xl overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-[9px] tracking-[0.5em] text-neutral-600 uppercase font-bold italic">Draft_Vault</h3>
          <button onClick={() => setCurrentNote({ id: '', title: '', content: '' })} className="h-7 w-7 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all">+</button>
        </div>
        <div className="space-y-3">
          {notes.map((note) => (
            <div 
              key={note._id}
              onClick={() => setCurrentNote({ id: note._id, title: note.title, content: note.content })}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${currentNote.id === note._id ? 'border-white/30 bg-white/5' : 'border-white/5 hover:bg-white/[0.02]'}`}
            >
              <p className="text-[11px] truncate uppercase tracking-tighter mb-1">{note.title}</p>
              <p className="text-[9px] text-neutral-600 line-clamp-1 italic">{new Date(note.updatedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Main Writing Studio */}
      <div className="flex flex-1 flex-col gap-6">
        {/* Top AI Rhyme Bar */}
        <div className="lyric-panel h-20 rounded-[2rem] border border-white/5 bg-[#0A0A0A] flex items-center px-8 shadow-lg overflow-hidden relative">
          <div className="text-[8px] tracking-[0.4em] text-red-500 uppercase font-bold mr-8 italic animate-pulse">Rhyme_Assist</div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {rhymes.length > 0 ? rhymes.map((rhyme, i) => (
              <span key={i} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] text-neutral-400 hover:text-white hover:border-white/30 cursor-pointer transition-all uppercase whitespace-nowrap tracking-widest font-light">
                {rhyme}
              </span>
            )) : <span className="text-[9px] text-neutral-800 uppercase italic tracking-[0.3em]">Listening to the pulse...</span>}
          </div>
          {isAiLoading && <div className="absolute right-8 h-1 w-1 bg-white rounded-full animate-ping"></div>}
        </div>

        {/* The Editor */}
        <div className="lyric-panel flex-1 rounded-[3.5rem] border border-white/5 bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-16 relative shadow-2xl group">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#EBEBE6 0.5px, transparent 0.5px)', backgroundSize: '60px 60px' }}></div>
          
          <input 
            type="text" 
            className="w-full bg-transparent border-none outline-none font-serif italic text-4xl mb-10 text-white placeholder:text-neutral-900 tracking-tight"
            placeholder="Name the Vision"
            value={currentNote.title}
            onChange={(e) => setCurrentNote({...currentNote, title: e.target.value})}
          />
          <textarea 
            className="w-full flex-1 bg-transparent border-none outline-none resize-none font-serif text-2xl leading-[1.8] text-neutral-300 placeholder:text-neutral-900 custom-scrollbar italic"
            placeholder="Write with the rhythm..."
            value={currentNote.content}
            onChange={(e) => setCurrentNote({...currentNote, content: e.target.value})}
          />
          
          <div className="mt-auto pt-8 flex justify-between items-center border-t border-white/5">
            <div className="text-[9px] tracking-widest text-neutral-600 uppercase">
              Word_Count: {currentNote.content.split(/\s+/).filter(x => x).length}
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-12 py-4 rounded-full bg-[#EBEBE6] text-black text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.05)]"
            >
              {isSaving ? 'Encrypting...' : 'Save Verse'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Vibe Selector */}
      <div className="lyric-panel w-72 flex flex-col rounded-[2.5rem] border border-white/5 bg-white/[0.01] p-6 backdrop-blur-3xl shadow-2xl">
        <h3 className="text-[9px] tracking-[0.5em] text-neutral-600 mb-8 uppercase font-bold italic">Beat_Market</h3>
        <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 mb-6">
          {beats.map((beat) => (
            <div 
              key={beat._id}
              onClick={() => setSelectedBeat(beat.audioUrl)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedBeat === beat.audioUrl ? 'border-white bg-white/5' : 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03]'}`}
            >
              <p className="text-[10px] text-neutral-400 group-hover:text-white truncate uppercase tracking-tighter">{beat.title}</p>
            </div>
          ))}
        </div>
        <audio ref={beatPlayerRef} src={selectedBeat || ''} className="w-full h-8 invert opacity-30 hover:opacity-100 transition-all" controls crossOrigin="anonymous" />
        <button onClick={() => navigate('/roles')} className="mt-8 py-4 rounded-xl border border-white/5 text-[9px] uppercase tracking-widest text-neutral-700 hover:text-white transition-all">Exit Studio</button>
      </div>
    </div>
  );
}