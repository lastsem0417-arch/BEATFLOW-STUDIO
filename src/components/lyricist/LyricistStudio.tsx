import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import DraggableWebcam from '../studio/DraggableWebcam'; 

export default function LyricistStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  
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

  // 🔥 GSAP EDITORIAL REVEAL 🔥
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.studio-reveal', 
        { opacity: 0, y: 30, filter: "blur(5px)" }, 
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.5, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
    // 🔥 PREMIUM EDITORIAL CANVAS (#F9F8F6) WITH EMERALD ACCENTS 🔥
    <div ref={containerRef} className="h-screen w-full bg-[#F9F8F6] text-[#0A1A14] flex flex-col font-sans overflow-hidden relative selection:bg-[#10B981] selection:text-white select-none">
      
      {/* 📖 The Premium Canvas Texture & Glow */}
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#0A1A14 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] mix-blend-multiply pointer-events-none z-0"></div>
      
      {/* Ambient subtle emerald glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[50vh] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* 📸 DRAGGABLE WEBCAM COMPONENT */}
      <DraggableWebcam />

      {/* ========================================================= */}
      {/* 🎩 TOP TRANSPORT & COMMAND BAR                             */}
      {/* ========================================================= */}
      <div className="h-28 md:h-32 border-b border-[#0A1A14]/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-16 z-20 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        
        {/* Left: Branding & Session Name */}
        <div className="flex items-center gap-6 md:gap-10 studio-reveal">
          <button 
            onClick={() => navigate('/studio/lyricist')} 
            className="group flex items-center justify-center w-14 h-14 rounded-full border border-[#0A1A14]/10 bg-white hover:bg-[#10B981] hover:border-[#10B981] transition-all duration-300 shadow-sm active:scale-95"
            title="Exit Canvas"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1A14]/50 group-hover:text-white transition-colors"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          
          <div className="w-[1px] h-10 bg-[#0A1A14]/10 hidden md:block"></div>
          
          <div className="flex flex-col relative z-10 group">
             <span className="text-[9px] uppercase tracking-[0.4em] font-black text-[#0A1A14]/40 mb-1 flex items-center gap-2 font-mono">
               <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
               Canvas Title
             </span>
             <input 
               type="text" 
               value={projectName} 
               onChange={(e) => setProjectName(e.target.value)} 
               className="bg-transparent text-3xl md:text-5xl font-serif italic text-[#0A1A14] outline-none w-48 md:w-96 border-b border-transparent focus:border-[#10B981]/50 hover:border-[#0A1A14]/20 transition-all placeholder:text-[#0A1A14]/20 pb-1 tracking-tight" 
             />
          </div>
        </div>

        {/* Right: Tools & Actions */}
        <div className="flex items-center gap-6 md:gap-10 relative z-10 studio-reveal">
          
          {/* Real-time Flow Meter HUD (Editorial Style) */}
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 rounded-full border border-[#0A1A14]/5 bg-[#F9F8F6] shadow-inner">
            <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase tracking-[0.4em] text-[#0A1A14]/50 font-black">Flow Count</span>
            </div>
            <span className="text-xl font-serif italic text-[#10B981]">{syllableCount}</span>
          </div>

          <div className="w-[1px] h-8 bg-[#0A1A14]/10 hidden lg:block"></div>

          <div className="flex items-center gap-4">
              {/* AI Copilot Button */}
              <button 
                onClick={triggerAIGhostwriter} 
                disabled={isAiLoading}
                className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#10B981]/20 text-[#10B981] rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#10B981] hover:text-white hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#10B981] active:-translate-y-0.5 shadow-sm"
              >
                {isAiLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                )}
                {isAiLoading ? 'Synthesizing...' : 'Spark AI'}
              </button>

              {/* Save & Sync Button */}
              <button 
                onClick={() => handleSaveToVault(false)} 
                disabled={isSaving} 
                className="px-8 py-3.5 bg-[#0A1A14] text-white border border-transparent rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#10B981] hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-300 disabled:opacity-50 active:-translate-y-0.5 flex flex-col items-center justify-center relative overflow-hidden"
              >
                <span className="relative z-10">{isSaving ? 'Encrypting...' : 'Commit Draft'}</span>
                {lastSaved && !isSaving && <span className="absolute bottom-1 text-[6px] text-white/50 font-mono">Last: {lastSaved}</span>}
              </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📝 THE MAIN CANVAS & STRUCTURE TAGS                        */}
      {/* ========================================================= */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Structure Tag Sidebar (Left) */}
        <div className="w-24 md:w-32 h-full border-r border-[#0A1A14]/5 bg-[#F9F8F6]/80 backdrop-blur-xl flex flex-col items-center py-12 gap-6 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-20 overflow-y-auto custom-scrollbar studio-reveal" data-lenis-prevent="true">
          <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#0A1A14]/40 mb-4 -rotate-90 origin-center whitespace-nowrap mt-10 shrink-0">Structures</span>
          
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
              className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[1.5rem] bg-white border border-[#0A1A14]/5 hover:border-[#10B981] hover:bg-[#10B981] hover:text-white text-[#0A1A14]/60 transition-all duration-300 flex flex-col items-center justify-center group active:scale-95 shadow-sm hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
              title={`Insert ${block.label} Tag`}
            >
               <span className="font-black text-sm md:text-base group-hover:scale-110 transition-transform duration-300">{block.tag}</span>
               <span className="text-[7px] uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1 absolute -bottom-4 text-[#10B981]">{block.label}</span>
            </button>
          ))}
        </div>

        {/* 🔥 THE PREMIUM WRITER'S TEXTAREA 🔥 */}
        <div className="flex-1 bg-transparent p-10 md:p-20 lg:p-32 flex justify-center h-full relative z-10 overflow-hidden studio-reveal">
          <textarea 
            ref={textareaRef} 
            value={lyricsText} 
            onChange={(e) => setLyricsText(e.target.value)}
            placeholder="Let the narrative flow..."
            className="w-full max-w-4xl h-full bg-transparent border-none text-[#0A1A14] font-serif italic text-2xl md:text-4xl lg:text-5xl leading-[2.2] tracking-normal outline-none resize-none placeholder:text-[#0A1A14]/15 focus:ring-0 overflow-y-auto custom-scrollbar pb-60"
            spellCheck="false" 
            autoFocus
            data-lenis-prevent="true"
          />
          
          {/* Subtle bottom fade to hide text cutting off abruptly */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F9F8F6] to-transparent pointer-events-none z-20"></div>
        </div>
      </div>

      {/* Inject custom light scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px !important;
          display: block !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(10,26,20,0.1) !important;
          border-radius: 10px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #10B981 !important;
        }
      `}</style>
    </div>
  );
}