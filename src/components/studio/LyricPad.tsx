import React, { useState } from 'react';

export default function LyricPad() {
  const [isOpen, setIsOpen] = useState(false);
  const [lyrics, setLyrics] = useState("");

  return (
    <div className={`fixed right-8 top-24 z-[90] transition-all duration-500 ease-out ${isOpen ? 'w-80 h-[450px]' : 'w-12 h-12 overflow-hidden'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute right-0 top-0 w-12 h-12 rounded-full flex items-center justify-center border border-white/10 shadow-2xl z-[101] transition-all ${isOpen ? 'bg-red-500 text-white rotate-45' : 'bg-white/5 text-neutral-400 hover:text-white backdrop-blur-xl hover:bg-white/10'}`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* Notepad Body */}
      <div className={`w-full h-full bg-[#0a0a0a]/60 backdrop-blur-3xl rounded-3xl border border-white/10 p-6 flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.5)] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Lyric Pad</h3>
          <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-1 italic">Write your bars below</p>
        </div>
        
        <textarea 
          value={lyrics}
          onChange={(e) => setLyrics(e.target.value)}
          placeholder="I got these flows in my soul..."
          className="flex-1 bg-transparent border-none outline-none resize-none font-serif text-xl italic text-white/90 placeholder:text-neutral-700 leading-relaxed custom-scrollbar"
        />
        
        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
            <span className="text-[8px] text-neutral-600 font-mono uppercase">{lyrics.split(/\s+/).filter(x => x).length} Words</span>
            <span className="text-[8px] text-neutral-600 font-mono uppercase tracking-widest animate-pulse">Auto-Saving...</span>
        </div>
      </div>
    </div>
  );
}