import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import DraggableWebcam from '../studio/DraggableWebcam'; 

// 🔥 THE CUSTOM "DESI" RAP DICTIONARY 🔥
// Tu is list mein aage aur bhi hazaron words add kar sakta hai!
const desiDictionary = [
  "bhai", "sahi", "tabahi", "kamaai", "dawahi", "aai", "jaai", "likhai", "padhai", "gehraai",
  "yaar", "pyar", "vaar", "hazaar", "bazaar", "bimaar", "hathiyar", "kaar", "bahaar", "qaraar",
  "baat", "raat", "saath", "jazbaat", "auqaat", "ghaat", "maat", "haalaat", "barsaat", "maqaamaat",
  "aag", "jaag", "baag", "bhaag", "daag", "chiraag", "raaga", "bairag",
  "shor", "mor", "zor", "chor", "dor", "aur", "daur", "bhor",
  "dil", "mil", "mehfil", "haasil", "manzil", "mushkil", "qatil", "buzdil", "zaahil",
  "zamaana", "fasana", "deewana", "aana", "jaana", "khana", "gaana", "bahaana", "nishana", "taraana",
  "safar", "zahar", "kabar", "asar", "kadar", "gadar", "sabar", "qadar", "lehar", "pahar",
  "karo", "maro", "daro", "badho", "lado", "saho", "kaho", "baho",
  "jaan", "maan", "shaan", "pechaan", "asmaan", "tujaan", "nuqsan", "mehmaan", "imtihaan",
  "pani", "kahani", "rawani", "jawani", "nishaani", "zindagani", "qurbani", "rani"
];

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

  // 🔥 RHYME FINDER STATES 🔥
  const [rhymeLang, setRhymeLang] = useState<'eng' | 'desi'>('eng'); // 👈 LANGUAGE TOGGLE
  const [rhymeWord, setRhymeWord] = useState("");
  const [rhymes, setRhymes] = useState<string[]>([]);
  const [isSearchingRhyme, setIsSearchingRhyme] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 🔥 MINI BOOTH STATES 🔥
  const [isRecording, setIsRecording] = useState(false);
  const [vocalTakes, setVocalTakes] = useState<{ id: string, url: string, date: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const triggerAIGhostwriter = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    try {
      const token = currentUser.token;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/generate-bars`, 
        { currentLyrics: lyricsText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiBars = res.data.bars;
      setLyricsText(prev => prev + (prev ? "\n\n" : "") + aiBars);
      setIsAiLoading(false);
      
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

  const insertTag = (tag: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const text = textareaRef.current.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + `\n\n[${tag}]\n` + after;
    setLyricsText(newText.trimStart());
    
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + tag.length + 4, start + tag.length + 4);
    }, 0);
  };

  // 🔥 DUAL-LANGUAGE RHYME FINDER LOGIC 🔥
  const handleFindRhyme = async (e: React.FormEvent) => {
    e.preventDefault();
    const word = rhymeWord.trim().toLowerCase();
    if (!word) return;
    
    setIsSearchingRhyme(true);
    setHasSearched(false); 
    setRhymes([]);

    if (rhymeLang === 'eng') {
      // 🇺🇸 ENGLISH API (Datamuse)
      try {
        const res = await axios.get(`https://api.datamuse.com/words?rel_rhy=${word}&max=20`);
        const rhymeList = res.data.map((item: any) => item.word);
        setRhymes(rhymeList);
      } catch (error) { console.error("Rhyme fetch failed", error); }
    } else {
      // 🇮🇳 DESI HINGLISH ENGINE (Algorithm)
      setTimeout(() => {
        let suffix = word.length > 3 ? word.slice(-3) : word.slice(-2);
        let matches = desiDictionary.filter(w => w !== word && w.endsWith(suffix));
        
        // Agar 3 letter match nahi hua toh 2 letter pichhe se try kar
        if (matches.length === 0) {
          suffix = word.slice(-2);
          matches = desiDictionary.filter(w => w !== word && w.endsWith(suffix));
        }

        // Randomize hoke 15 rhymes dikhayega
        setRhymes(matches.sort(() => 0.5 - Math.random()).slice(0, 15));
      }, 300); // Thoda artificial delay taki feel aaye ki AI soch raha hai
    }

    setTimeout(() => {
       setIsSearchingRhyme(false);
       setHasSearched(true);
    }, 300);
  };

  const handleRhymeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRhymeWord(e.target.value);
    if (e.target.value === '') {
      setRhymes([]);
      setHasSearched(false);
    }
  };

  const insertRhyme = (word: string) => {
    if (!textareaRef.current) {
      setLyricsText(prev => prev + " " + word);
      return;
    }
    const start = textareaRef.current.selectionStart;
    const text = textareaRef.current.value;
    const before = text.substring(0, start);
    const after = text.substring(start, text.length);
    
    const spacePrefix = before.length > 0 && !before.endsWith(' ') && !before.endsWith('\n') ? ' ' : '';
    const newText = before + spacePrefix + word + after;
    
    setLyricsText(newText);
    
    setTimeout(() => {
      textareaRef.current?.focus();
      const newPos = start + spacePrefix.length + word.length;
      textareaRef.current?.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const toggleMiniBooth = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        mediaRecorderRef.current = new MediaRecorder(stream);
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        
        mediaRecorderRef.current.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          const newTake = {
            id: `memo_${Date.now()}`,
            url: audioUrl,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setVocalTakes(prev => [newTake, ...prev]);
        };

        setIsRecording(true);
        mediaRecorderRef.current.start();
      } catch (err) {
        alert("Mic permission needed to test flows!");
      }
    }
  };

  const deleteTake = (id: string) => setVocalTakes(prev => prev.filter(t => t.id !== id));

  const handleSaveToVault = async (isAuto = false) => {
    if (!lyricsText.trim()) return;
    if (!isAuto) setIsSaving(true);
    try {
      const projectData = { projectId, name: projectName, creator: safeUserId, lyrics: lyricsText, tracks: [] };
      const token = currentUser.token;
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/projects/save`, projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!projectId && res.data._id) setProjectId(res.data._id);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      if (!isAuto) setIsSaving(false);
    } catch (err) { if (!isAuto) setIsSaving(false); }
  };

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#F9F8F6] text-[#0A1A14] flex flex-col font-sans overflow-hidden relative selection:bg-[#10B981] selection:text-white select-none">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'radial-gradient(#0A1A14 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] mix-blend-multiply pointer-events-none z-0"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[50vh] bg-[#10B981]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <DraggableWebcam />

      <div className="h-28 md:h-32 border-b border-[#0A1A14]/5 bg-white/80 backdrop-blur-xl flex items-center justify-between px-8 md:px-16 z-20 shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-6 md:gap-10 studio-reveal">
          <button onClick={() => navigate('/studio/lyricist')} className="group flex items-center justify-center w-14 h-14 rounded-full border border-[#0A1A14]/10 bg-white hover:bg-[#10B981] hover:border-[#10B981] transition-all duration-300 shadow-sm active:scale-95" title="Exit Canvas">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1A14]/50 group-hover:text-white transition-colors"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <div className="w-[1px] h-10 bg-[#0A1A14]/10 hidden md:block"></div>
          <div className="flex flex-col relative z-10 group">
             <span className="text-[9px] uppercase tracking-[0.4em] font-black text-[#0A1A14]/40 mb-1 flex items-center gap-2 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>Canvas Title</span>
             <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-transparent text-3xl md:text-5xl font-serif italic text-[#0A1A14] outline-none w-48 md:w-96 border-b border-transparent focus:border-[#10B981]/50 hover:border-[#0A1A14]/20 transition-all placeholder:text-[#0A1A14]/20 pb-1 tracking-tight" />
          </div>
        </div>

        <div className="flex items-center gap-6 md:gap-10 relative z-10 studio-reveal">
          <div className="hidden lg:flex items-center gap-4 px-6 py-3 rounded-full border border-[#0A1A14]/5 bg-[#F9F8F6] shadow-inner">
            <div className="flex items-center gap-2"><span className="text-[9px] uppercase tracking-[0.4em] text-[#0A1A14]/50 font-black">Flow Count</span></div>
            <span className="text-xl font-serif italic text-[#10B981]">{syllableCount}</span>
          </div>
          <div className="w-[1px] h-8 bg-[#0A1A14]/10 hidden lg:block"></div>
          <div className="flex items-center gap-4">
              <button onClick={triggerAIGhostwriter} disabled={isAiLoading} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-[#10B981]/20 text-[#10B981] rounded-full text-[10px] uppercase tracking-[0.2em] font-black hover:bg-[#10B981] hover:text-white hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-[#10B981] active:-translate-y-0.5 shadow-sm">
                {isAiLoading ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>}
                {isAiLoading ? 'Synthesizing...' : 'Spark AI'}
              </button>
              <button onClick={() => handleSaveToVault(false)} disabled={isSaving} className="px-8 py-3.5 bg-[#0A1A14] text-white border border-transparent rounded-full text-[10px] uppercase tracking-[0.3em] font-black hover:bg-[#10B981] hover:shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all duration-300 disabled:opacity-50 active:-translate-y-0.5 flex flex-col items-center justify-center relative overflow-hidden">
                <span className="relative z-10">{isSaving ? 'Encrypting...' : 'Commit Draft'}</span>
                {lastSaved && !isSaving && <span className="absolute bottom-1 text-[6px] text-white/50 font-mono">Last: {lastSaved}</span>}
              </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative z-10">
        <div className="w-24 md:w-32 h-full border-r border-[#0A1A14]/5 bg-[#F9F8F6]/80 backdrop-blur-xl flex flex-col items-center py-12 gap-6 shrink-0 shadow-[10px_0_30px_rgba(0,0,0,0.02)] z-20 overflow-y-auto custom-scrollbar studio-reveal" data-lenis-prevent="true">
          <span className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-[#0A1A14]/40 mb-4 -rotate-90 origin-center whitespace-nowrap mt-10 shrink-0">Structures</span>
          {[{ tag: 'IN', label: 'Intro' }, { tag: 'V1', label: 'Verse 1' }, { tag: 'HK', label: 'Hook' }, { tag: 'V2', label: 'Verse 2' }, { tag: 'BR', label: 'Bridge' }, { tag: 'OUT', label: 'Outro' }].map((block, i) => (
            <button key={i} onClick={() => insertTag(block.tag)} className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-[1.5rem] bg-white border border-[#0A1A14]/5 hover:border-[#10B981] hover:bg-[#10B981] hover:text-white text-[#0A1A14]/60 transition-all duration-300 flex flex-col items-center justify-center group active:scale-95 shadow-sm hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)]" title={`Insert ${block.label} Tag`}>
               <span className="font-black text-sm md:text-base group-hover:scale-110 transition-transform duration-300">{block.tag}</span>
               <span className="text-[7px] uppercase tracking-[0.2em] font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1 absolute -bottom-4 text-[#10B981]">{block.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 bg-transparent p-10 md:p-16 lg:p-24 flex justify-center h-full relative z-10 overflow-hidden studio-reveal">
          <textarea ref={textareaRef} value={lyricsText} onChange={(e) => setLyricsText(e.target.value)} placeholder="Let the narrative flow..." className="w-full max-w-4xl h-full bg-transparent border-none text-[#0A1A14] font-serif italic text-2xl md:text-4xl lg:text-5xl leading-[2.2] tracking-normal outline-none resize-none placeholder:text-[#0A1A14]/15 focus:ring-0 overflow-y-auto custom-scrollbar pb-60" spellCheck="false" autoFocus data-lenis-prevent="true" />
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F9F8F6] to-transparent pointer-events-none z-20"></div>
        </div>

        <div className="w-80 lg:w-96 h-full border-l border-[#0A1A14]/5 bg-white/80 backdrop-blur-xl flex flex-col z-20 shrink-0 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] studio-reveal overflow-hidden">
           
           <div className="h-1/2 flex flex-col border-b border-[#0A1A14]/5 p-8 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02] mix-blend-multiply pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔍</span>
                  <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#0A1A14]/60">Lexicon</h3>
                </div>
                
                {/* 🔥 THE EN / DESI TOGGLE 🔥 */}
                <div className="flex bg-[#F9F8F6] border border-[#0A1A14]/10 rounded-full p-0.5 shadow-inner">
                  <button onClick={() => {setRhymeLang('eng'); setRhymes([]); setHasSearched(false); setRhymeWord("");}} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${rhymeLang === 'eng' ? 'bg-[#0A1A14] text-white shadow-sm' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>EN</button>
                  <button onClick={() => {setRhymeLang('desi'); setRhymes([]); setHasSearched(false); setRhymeWord("");}} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${rhymeLang === 'desi' ? 'bg-[#10B981] text-white shadow-sm' : 'text-[#0A1A14]/40 hover:text-[#0A1A14]'}`}>DESI</button>
                </div>
              </div>

              <form onSubmit={handleFindRhyme} className="flex relative z-10 mb-6 group">
                 <input 
                   type="text" 
                   value={rhymeWord}
                   onChange={handleRhymeInputChange}
                   placeholder={rhymeLang === 'eng' ? "Enter English word..." : "Hinglish word (e.g. Bhai)..."} 
                   className={`w-full bg-[#F9F8F6] border border-[#0A1A14]/10 rounded-full py-3.5 pl-5 pr-14 text-sm font-medium text-[#0A1A14] outline-none focus:bg-white transition-all shadow-inner placeholder:text-[#0A1A14]/30 ${rhymeLang === 'desi' ? 'focus:border-[#10B981]/50' : 'focus:border-[#0A1A14]/30'}`}
                 />
                 <button type="submit" className={`absolute right-1.5 top-1.5 bottom-1.5 w-10 text-white rounded-full flex items-center justify-center transition-colors active:scale-95 shadow-sm ${rhymeLang === 'desi' ? 'bg-[#10B981] hover:bg-[#0EA5E9]' : 'bg-[#0A1A14] hover:bg-[#333]'}`}>
                   {isSearchingRhyme ? '...' : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>}
                 </button>
              </form>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start relative z-10" data-lenis-prevent="true">
                 {isSearchingRhyme ? (
                   <div className="w-full text-center mt-10 opacity-40">
                     <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-black animate-pulse">Scanning Lexicon...</span>
                   </div>
                 ) : rhymes.length > 0 ? (
                   rhymes.map((word, idx) => (
                     <button key={idx} onClick={() => insertRhyme(word)} className={`px-4 py-2 bg-white border border-[#0A1A14]/10 rounded-[0.8rem] text-xs font-bold text-[#0A1A14]/70 hover:text-white transition-all hover:-translate-y-0.5 active:scale-95 shadow-sm ${rhymeLang === 'desi' ? 'hover:bg-[#10B981] hover:border-[#10B981]' : 'hover:bg-[#0A1A14] hover:border-[#0A1A14]'}`} title="Click to insert at cursor">
                       {word}
                     </button>
                   ))
                 ) : hasSearched ? (
                   <div className="w-full text-center mt-10 opacity-60">
                     <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-black text-[#E63946]">No rhymes found</span>
                     <p className="text-[8px] mt-2 font-mono text-[#0A1A14]/40 uppercase">
                       {rhymeLang === 'eng' ? "(Try a simpler English word)" : "(Word pattern not in Desi Dictionary)"}
                     </p>
                   </div>
                 ) : (
                   <div className="w-full text-center mt-10 opacity-40">
                     <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-black">Waiting for input</span>
                   </div>
                 )}
              </div>
           </div>

           {/* SECTION 2: MINI BOOTH */}
           <div className="h-1/2 flex flex-col p-8 bg-[#F9F8F6]/50 relative overflow-hidden">
              <div className={`absolute inset-0 bg-[#E63946]/5 transition-opacity duration-700 pointer-events-none ${isRecording ? 'opacity-100' : 'opacity-0'}`}></div>

              <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎙️</span>
                  <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.4em] text-[#0A1A14]/60">Flow Tester</h3>
                </div>
                {isRecording && <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#E63946] animate-pulse">Recording</span>}
              </div>

              <div className="flex items-center justify-center mb-6 relative z-10">
                 <button onClick={toggleMiniBooth} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 active:scale-95 ${isRecording ? 'bg-white border-[#E63946] shadow-[#E63946]/30' : 'bg-[#0A1A14] border-[#0A1A14] hover:bg-[#10B981] hover:border-[#10B981] hover:shadow-[#10B981]/30'}`}>
                   {isRecording ? <div className="w-5 h-5 bg-[#E63946] rounded-sm"></div> : <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>}
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-3 relative z-10" data-lenis-prevent="true">
                 {vocalTakes.length === 0 ? (
                   <div className="w-full text-center mt-4 opacity-40">
                     <span className="text-[10px] font-mono uppercase tracking-[0.3em] font-black">No takes recorded</span>
                   </div>
                 ) : (
                   vocalTakes.map((take, idx) => (
                     <div key={take.id} className="bg-white border border-[#0A1A14]/10 p-3 rounded-[1rem] flex flex-col gap-2 shadow-sm group hover:border-[#10B981]/50 transition-colors">
                        <div className="flex justify-between items-center px-1">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#0A1A14]/70">Take 0{vocalTakes.length - idx}</span>
                           <div className="flex items-center gap-3">
                             <span className="text-[8px] font-mono text-[#0A1A14]/40 font-bold">{take.date}</span>
                             <button onClick={() => deleteTake(take.id)} className="text-[#0A1A14]/30 hover:text-[#E63946] transition-colors"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
                           </div>
                        </div>
                        <audio src={take.url} controls className="w-full h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                     </div>
                   ))
                 )}
              </div>
           </div>

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px !important; display: block !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10,26,20,0.1) !important; border-radius: 10px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10B981 !important; }
        
        audio::-webkit-media-controls-panel { background-color: #F9F8F6; border-radius: 8px; }
        audio::-webkit-media-controls-current-time-display, audio::-webkit-media-controls-time-remaining-display { color: #0A1A14; font-family: monospace; font-size: 10px; font-weight: bold; }
      `}</style>
    </div>
  );
}