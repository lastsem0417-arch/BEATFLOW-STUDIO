import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // 🔥 PORTAL IMPORTED
import axios from 'axios';

export default function CommentsDrawer({ post, onClose, onCommentAdded }: any) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  // 🔥 DYNAMIC GLOW MAPPER BASED ON CREATOR ROLE 🔥
  const getRoleTheme = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return { color: '#E63946', bgClass: 'bg-[#E63946]', borderClass: 'border-[#E63946]/50', textClass: 'text-[#E63946]' };
    if (r === 'lyricist') return { color: '#52B788', bgClass: 'bg-[#52B788]', borderClass: 'border-[#52B788]/50', textClass: 'text-[#52B788]' };
    return { color: '#D4AF37', bgClass: 'bg-[#D4AF37]', borderClass: 'border-[#D4AF37]/50', textClass: 'text-[#D4AF37]' }; // Gold Default
  };

  const theme = getRoleTheme(post.creatorRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/api/feed/${post._id}/comment`, { text }, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      
      onCommentAdded(post._id, res.data);
      setText(''); 
    } catch (err) {
      console.error("Error adding comment", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 THE FIX: RETURN USING createPortal 🔥
  return createPortal(
    <div className="fixed inset-0 z-[999999] flex justify-end font-sans select-none">
      
      {/* 🌑 Background Overlay (Click to close) */}
      <div 
        className="absolute inset-0 bg-[#010101]/60 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* 🎛️ Slide-out Glassmorphic Drawer */}
      <div className="relative w-full md:w-[450px] h-[100dvh] bg-[#030305]/95 backdrop-blur-3xl border-l border-white/5 flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-500 ease-out overflow-hidden">
        
        {/* Dynamic Ambient Glow behind the panel */}
        <div className="absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full pointer-events-none -z-10 opacity-10 transition-colors duration-700" style={{ backgroundColor: theme.color }}></div>

        {/* 🎩 Premium Header */}
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between bg-transparent relative z-20 shrink-0">
          <div>
            <h3 className="text-2xl font-serif italic text-[#F0F0EB] tracking-tight">Feedback Matrix</h3>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black mt-1 font-mono flex items-center gap-2" style={{ color: theme.color }}>
               <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }}></span>
               Asset by {post.creatorName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full border border-white/10 bg-[#010101] flex items-center justify-center text-[#888888] hover:text-[#F0F0EB] hover:bg-white/5 transition-all duration-300 active:scale-95 group shadow-inner"
            title="Close Panel"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 💬 Comments Feed (SCROLLABLE AREA) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 flex flex-col gap-8 custom-scrollbar relative z-10" data-lenis-prevent="true">
          {!post.comments || post.comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40 h-full mt-20">
               <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-[#010101] shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_3s_infinite]"></div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>
               <h3 className="text-xl font-serif italic text-[#F0F0EB] mb-2">No feedback yet</h3>
               <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#888888] text-center leading-relaxed">Be the first to analyze <br/> this transmission.</p>
            </div>
          ) : (
            post.comments.map((comment: any, idx: number) => {
              const avatarSrc = comment.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}&backgroundColor=000000`;
              
              return (
                <div key={idx} className="flex gap-5 group">
                  {/* User Avatar */}
                  <div className="w-10 h-10 rounded-[0.8rem] border border-white/10 bg-[#0A0A0C] flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:border-white/30 transition-colors">
                     <img src={avatarSrc} alt="avt" className="w-full h-full scale-110 object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  
                  {/* Comment Body */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-[#F0F0EB] tracking-wide">{comment.username}</span>
                      <span className="text-[8px] text-[#888888] font-mono uppercase tracking-[0.2em]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="p-4 rounded-[1.2rem] rounded-tl-sm bg-[#010101] border border-white/5 text-[#888888] text-[13px] font-light leading-relaxed group-hover:text-white transition-colors group-hover:border-white/10 shadow-sm relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: theme.color }}></div>
                       {comment.text}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ✍️ Input Area (FIXED AT BOTTOM) */}
        <div className="absolute bottom-0 left-0 w-full p-6 border-t border-white/5 bg-[#030305]/90 backdrop-blur-xl z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="relative flex items-center group/input">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Drop your analysis..." 
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-full py-4 pl-6 pr-16 text-sm text-[#F0F0EB] outline-none transition-all placeholder:text-[#888888]/40 shadow-inner font-mono"
              style={{ ':focus': { borderColor: theme.color } } as any}
              disabled={loading}
            />
            
            {/* Dynamic Send Button */}
            <button 
              type="submit" 
              disabled={loading || !text.trim()}
              className="absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-40 active:scale-95 shadow-lg overflow-hidden group/btn"
              style={{ 
                 backgroundColor: loading || !text.trim() ? 'rgba(255,255,255,0.05)' : theme.color,
                 color: loading || !text.trim() ? '#888888' : '#010101'
              }}
            >
              {loading ? (
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>,
    document.body // 🔥 RENDERS DIRECTLY ON TOP OF EVERYTHING 🔥
  );
}