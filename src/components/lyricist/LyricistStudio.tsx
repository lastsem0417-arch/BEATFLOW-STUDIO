import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import DraggableWebcam from '../studio/DraggableWebcam'; 

export default function LyricistStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const safeUserId = currentUser.id || currentUser._id;

  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("Untitled Masterpiece");
  const [lyricsText, setLyricsText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false); 
  const [syllableCount, setSyllableCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (location.state && location.state.project) {
      const p = location.state.project;
      setProjectId(p._id);
      setProjectName(p.name);
      setLyricsText(p.lyrics || "");
    }
  }, [location.state]);

  // Real-time Syllable (Flow) Counter
  useEffect(() => {
    const countSyllables = (text: string) => {
      if (!text) return 0;
      const words = text.toLowerCase().match(/\b\w+\b/g) || [];
      let count = 0;
      words.forEach(word => {
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const syllables = word.match(/[aeiouy]{1,2}/g);
        count += syllables ? syllables.length : 1;
      });
      return count;
    };
    setSyllableCount(countSyllables(lyricsText));
  }, [lyricsText]);

  // AI Ghostwriter Integration
  const triggerAIGhostwriter = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const token = currentUser.token;
      const res = await axios.post('http://localhost:5000/api/ai/generate-bars', 
        { currentLyrics: lyricsText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiBars = res.data.bars;
      setLyricsText(prev => prev + (prev ? "\n\n" : "") + aiBars);
      setIsAiLoading(false);
      
      // Auto scroll to bottom after AI generates
      if (textareaRef.current) {
        setTimeout(() => {
          textareaRef.current!.scrollTop = textareaRef.current!.scrollHeight;
        }, 100);
      }
    } catch (err) {
      setIsAiLoading(false);
      alert("AI core offline. Please try again later.");
    }
  };

  // Structure Tag Injector
  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + `\n\n[${tag}]\n` + after;
    setLyricsText(newText.trimStart());
    
    // Auto focus and set cursor position after tag
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + tag.length + 4, start + tag.length + 4);
    }, 0);
  };

  // Vault Sync (Save)
  const handleSaveToVault = async (isAuto = false) => {
    if (!lyricsText.trim()) return;
    if (!isAuto) setIsSaving(true);
    try {
      const projectData = { projectId, name: projectName, creator: safeUserId, lyrics: lyricsText, tracks: [] };
      const token = currentUser.token;
      const res = await axios.post('http://localhost:5000/api/projects/save', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!projectId && res.data._id) setProjectId(res.data._id);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (!isAuto) setIsSaving(false);
    } catch (err) { if (!isAuto) setIsSaving(false); }
  };

  return (
    // 🔥 HIGH-END ONYX FOCUS ROOM 🔥
    <div className="h-screen w-full bg-[#030305] text-[#F0F0EB] flex flex-col font-sans overflow-hidden relative selection:bg-[#52B788]/40 select-none">
      
      {/* Cinematic Ambient Glow & Noise */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>
      <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[80vw] h-[50vh] bg-[#52B788]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* 📸 DRAGGABLE WEBCAM COMPONENT */}
      <DraggableWebcam />

      {/* ========================================================= */}
      {/* 🎩 TOP TRANSPORT & COMMAND BAR                             */}
      {/* ========================================================= */}
      <div className="h-24 border-b border-white/5 bg-[#010101]/80 backdrop-blur-3xl flex items-center justify-between px-6 md:px-12 z-20 shrink-0 shadow-[0_20px_40px_rgba(0,0,0,0.8)]">
        
        {/* Left: Branding & Session Name */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/studio/lyricist')} 
            className="group flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
            title="Exit Pad"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888] group-hover:text-white transition-colors"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          
          <div className="w-[1px] h-8 bg-white/10 hidden md:block"></div>
          
          <div className="flex flex-col relative z-10 group">
             <span className="text-[8px] uppercase tracking-[0.4em] font-black text-[#888888] mb-1">Active File</span>
             <input 
               type="text" 
               value={projectName} 
               onChange={(e) => setProjectName(e.target.value)} 
               className="bg-transparent text-2xl md:text-3xl font-serif italic text-[#F0F0EB] outline-none w-48 md:w-80 border-b border-transparent focus:border-[#52B788]/50 hover:border-white/20 transition-all placeholder:text-[#888888]/40 pb-1" 
             />
          </div>
        </div>

        {/* Right: Tools & Actions */}
        <div className="flex items-center gap-4 md:gap-8 relative z-10">
          
          {/* Real-time Flow Meter HUD */}
          <div className="hidden lg:flex items-center gap-4 bg-[#0A0A0C] px-5 py-2.5 rounded-full border border-white/5 shadow-inner">
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#52B788] rounded-full shadow-[0_0_8px_#52B788] animate-pulse"></span>
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black">Flow</span>
            </div>
            <span className="text-base font-mono text-[#52B788]">{syllableCount}</span>
          </div>

          <div className="w-[1px] h-6 bg-white/10 hidden lg:block"></div>

          {/* AI Copilot Button */}
          <button 
            onClick={triggerAIGhostwriter} 
            disabled={isAiLoading}
            className="flex items-center gap-2 px-5 py-3 bg-[#52B788]/5 border border-[#52B788]/30 text-[#52B788] rounded-full text-[9px] uppercase tracking-[0.2em] font-black hover:bg-[#52B788] hover:text-[#010101] hover:shadow-[0_0_20px_rgba(82,183,136,0.4)] transition-all duration-500 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-[#52B788] active:scale-95"
          >
            {isAiLoading ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            )}
            {isAiLoading ? 'Generating...' : 'Spark AI'}
          </button>

          {/* Save & Sync Button */}
          <button 
            onClick={() => handleSaveToVault(false)} 
            disabled={isSaving} 
            className="px-8 py-3 bg-[#F0F0EB] text-[#010101] border border-transparent rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#52B788] hover:text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(82,183,136,0.4)] transition-all duration-500 disabled:opacity-50 active:scale-95 flex flex-col items-center justify-center relative overflow-hidden"
          >
            <span className="relative z-10">{isSaving ? 'Syncing...' : 'Sync to Vault'}</span>
            {lastSaved && !isSaving && <span className="absolute bottom-0.5 text-[6px] text-black/50 font-mono">Last: {lastSaved}</span>}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📝 THE MAIN CANVAS & STRUCTURE TAGS                        */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Structure Tag Sidebar */}
        <div className="w-20 md:w-28 h-full border-r border-white/5 bg-[#010101]/80 backdrop-blur-md flex flex-col items-center py-10 gap-5 shrink-0 shadow-[10px_0_40px_rgba(0,0,0,0.5)] z-20 overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
          <span className="text-[8px] font-mono uppercase tracking-widest text-[#888888] mb-2 -rotate-90 origin-center whitespace-nowrap mt-8 shrink-0">Structure</span>
          
          {[
            { tag: 'IN', label: 'Intro' },
            { tag: 'V1', label: 'Verse 1' },
            { tag: 'HK', label: 'Hook' },
            { tag: 'V2', label: 'Verse 2' },
            { tag: 'BR', label: 'Bridge' },
            { tag: 'OUT', label: 'Outro' }
          ].map((block, i) => (
            <button 
              key={i} 
              onClick={() => insertTag(block.tag)} 
              className="w-12 h-12 md:w-16 md:h-16 shrink-0 rounded-[1rem] bg-white/[0.02] border border-white/10 hover:border-[#52B788]/60 hover:bg-[#52B788]/10 hover:text-[#52B788] text-[#888888] transition-all duration-300 flex flex-col items-center justify-center group active:scale-95 shadow-inner"
              title={`Insert ${block.label} Tag`}
            >
               <span className="font-black text-xs md:text-sm">{block.tag}</span>
               <span className="text-[6px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity mt-1">{block.label}</span>
            </button>
          ))}
        </div>

        {/* 🔥 FIX: Textarea is now properly scrolling 🔥 */}
        <div className="flex-1 bg-transparent p-6 md:p-12 lg:p-20 flex justify-center h-full relative z-10 overflow-hidden">
          <textarea 
            ref={textareaRef} 
            value={lyricsText} 
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder="Let the narrative flow..."
            className="w-full max-w-4xl h-full bg-transparent border-none text-[#F0F0EB] font-mono text-xl md:text-2xl lg:text-3xl leading-[2.5] tracking-wide outline-none resize-none placeholder:text-[#888888]/20 focus:ring-0 overflow-y-auto custom-scrollbar pb-40"
            spellCheck="false" 
            autoFocus
            data-lenis-prevent="true"
          />
        </div>
      </div>

    </div>
  );
}