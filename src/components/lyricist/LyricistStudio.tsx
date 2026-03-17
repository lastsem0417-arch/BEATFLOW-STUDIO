import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
// 🔥 TERE PATH KE HISAB SE IMPORT
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
      const res = await axios.post('http://localhost:5000/api/ai/generate-bars', 
        { currentLyrics: lyricsText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const aiBars = res.data.bars;
      setLyricsText(prev => prev + (prev ? "\n\n" : "") + aiBars);
      setIsAiLoading(false);
    } catch (err) {
      setIsAiLoading(false);
      alert("AI is low on fuel. Check backend.");
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
  };

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
    <div className="h-screen w-full bg-[#020202] text-white flex flex-col font-sans overflow-hidden relative selection:bg-emerald-500/30">
      
      {/* 🔥 TERA DRAGGABLE WEBCAM 🔥 */}
      <DraggableWebcam />

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,_#10b98115,_transparent_50%)] pointer-events-none"></div>

      {/* TOP BAR */}
      <div className="h-20 border-b border-white/5 bg-[#050505]/60 backdrop-blur-2xl flex items-center justify-between px-10 z-20">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate('/studio/lyricist')} className="group flex items-center gap-2 text-white/30 hover:text-emerald-400 transition-all">
            <span className="text-2xl group-hover:-translate-x-1 transition-transform">←</span>
            <span className="text-[10px] uppercase font-black tracking-widest">Back</span>
          </button>
          <input type="text" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="bg-transparent text-2xl font-serif italic text-white outline-none w-80" />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-white/5 px-5 py-2 rounded-full border border-white/10 shadow-inner">
            <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-500 font-black">Flow Meter</span>
            <span className="text-sm font-mono text-white">{syllableCount}</span>
          </div>

          <button 
            onClick={triggerAIGhostwriter} 
            disabled={isAiLoading}
            className="px-6 py-2.5 bg-purple-600/10 border border-purple-500/50 text-purple-400 rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-purple-600 hover:text-white transition-all shadow-[0_0_20px_rgba(168,85,247,0.2)] disabled:opacity-50"
          >
            {isAiLoading ? 'AI WRITING...' : '✨ SPARK AI'}
          </button>

          <button onClick={() => handleSaveToVault(false)} disabled={isSaving} className="px-8 py-2.5 bg-emerald-500 text-black rounded-full text-[10px] uppercase tracking-widest font-black hover:bg-emerald-400 transition-all">
            {isSaving ? 'Saving...' : 'Save to Vault'}
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex z-10 pb-32"> {/* 🔥 pb-32 ADDED FOR PLAYER */}
        <div className="w-24 border-r border-white/5 bg-[#030303] flex flex-col items-center py-10 gap-6">
          {['IN', 'V1', 'HK', 'V2', 'BR', 'OUT'].map((l, i) => (
            <button key={i} onClick={() => insertTag(l)} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 text-white/40 hover:text-emerald-400 transition-all flex items-center justify-center font-black text-[10px]">{l}</button>
          ))}
        </div>

        <div className="flex-1 bg-transparent p-12 flex justify-center overflow-y-auto custom-scrollbar">
          <textarea 
            ref={textareaRef} value={lyricsText} onChange={(e) => setLyricsText(e.target.value)}
            placeholder="Write your soul..."
            className="w-full max-w-4xl h-full bg-transparent border-none text-neutral-200 font-mono text-xl md:text-2xl leading-[2.5] outline-none resize-none"
            spellCheck="false" autoFocus
          />
        </div>
      </div>
    </div>
  );
}