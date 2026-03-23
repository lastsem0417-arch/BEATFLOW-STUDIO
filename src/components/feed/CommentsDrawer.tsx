import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

// 🔥 VITE ENV API URL FETCH 🔥
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CommentsDrawer({ post, onClose, onCommentAdded }: any) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  // 🔥 DYNAMIC EDITORIAL THEME MAPPER 🔥
  const getRoleTheme = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return { color: '#E63946', shadow: 'rgba(230,57,70,0.2)' }; // Crimson
    if (r === 'lyricist') return { color: '#10B981', shadow: 'rgba(16,185,129,0.2)' }; // Emerald
    if (r === 'listener') return { color: '#2563EB', shadow: 'rgba(37,99,235,0.2)' }; // Royal Blue
    return { color: '#D4AF37', shadow: 'rgba(212,175,55,0.2)' }; // Gold for Producer/Default
  };

  const theme = getRoleTheme(post.creatorRole);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    try {
      // 🚨 FIX: URL Syntax Fixed
      const res = await axios.post(`${BACKEND_URL}/api/feed/${post._id}/comment`, { text }, {
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

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex justify-end font-sans select-none text-[#111111]">
      
      {/* 🌫️ Premium Backdrop Blur Overlay */}
      <div 
        className="absolute inset-0 bg-[#111111]/30 backdrop-blur-md transition-opacity duration-700 animate-in fade-in"
        onClick={onClose}
      ></div>

      {/* 🎛️ Slide-out Glassmorphic Drawer (Alabaster White) */}
      <div className="relative w-full md:w-[480px] h-[100dvh] bg-[#F4F5F7]/95 backdrop-blur-3xl border-l border-white/50 flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden">
        
        {/* Dynamic Ambient Glow behind the panel */}
        <div 
          className="absolute top-0 right-0 w-96 h-96 blur-[120px] rounded-full pointer-events-none -z-10 opacity-15 transition-colors duration-700" 
          style={{ backgroundColor: theme.color }}
        ></div>

        {/* 🎩 Premium Editorial Header */}
        <div className="p-8 md:p-10 border-b border-[#111111]/5 flex items-center justify-between bg-white/50 backdrop-blur-md relative z-20 shrink-0">
          <div>
            <h3 className="text-3xl font-serif italic text-[#111111] tracking-tight leading-none mb-2">Feedback Matrix</h3>
            <p className="text-[9px] uppercase tracking-[0.4em] font-black mt-1 font-mono flex items-center gap-2" style={{ color: theme.color }}>
               <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }}></span>
               Asset by {post.creatorName}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-12 h-12 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/40 hover:text-[#111111] hover:border-[#111111]/20 hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] transition-all duration-300 active:scale-95 group"
            title="Close Panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 💬 Comments Feed (SCROLLABLE AREA) */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 pb-32 flex flex-col gap-8 custom-scrollbar relative z-10" data-lenis-prevent="true">
          
          {/* EMPTY STATE */}
          {!post.comments || post.comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-60 h-full mt-10">
               <div className="w-28 h-28 rounded-[2rem] border border-[#111111]/10 flex items-center justify-center mb-8 bg-white shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 rounded-[2rem] border border-[#111111]/10 animate-[ping_3s_infinite]" style={{ borderColor: `${theme.color}40` }}></div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]/30"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
               </div>
               <h3 className="text-2xl font-serif italic text-[#111111] mb-3">No feedback yet</h3>
               <p className="font-mono text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/40 text-center leading-relaxed">
                 Be the first to analyze <br/> this transmission.
               </p>
            </div>
          ) : (
            
            // FILLED STATE
            post.comments.map((comment: any, idx: number) => {
              const avatarSrc = comment.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.username}&backgroundColor=transparent`;
              
              return (
                <div key={idx} className="flex gap-5 group animate-in slide-in-from-bottom-2 fade-in duration-500">
                  {/* User Avatar */}
                  <div className="w-12 h-12 rounded-[1.2rem] border border-[#111111]/10 bg-[#F4F5F7] flex items-center justify-center shrink-0 overflow-hidden shadow-sm group-hover:border-[#111111]/20 transition-colors">
                     <img src={avatarSrc} alt="avt" className="w-full h-full scale-105 object-cover grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-500" />
                  </div>
                  
                  {/* Comment Body */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-[#111111] tracking-tight">{comment.username}</span>
                      <span className="text-[9px] text-[#111111]/40 font-mono uppercase tracking-[0.2em] font-bold">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="p-5 rounded-[1.5rem] rounded-tl-sm bg-white border border-[#111111]/5 text-[#111111]/70 text-[13px] font-medium leading-relaxed group-hover:text-[#111111] transition-colors group-hover:shadow-[0_10px_20px_rgba(0,0,0,0.03)] shadow-sm relative overflow-hidden">
                       {/* Subtle Accent Line on Hover */}
                       <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: theme.color }}></div>
                       {comment.text}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* ✍️ Input Area (FIXED AT BOTTOM - Glassmorphic White) */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 border-t border-[#111111]/5 bg-white/80 backdrop-blur-2xl z-30 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
          <form onSubmit={handleSubmit} className="relative flex items-center group/input">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Drop your analysis..." 
              className="w-full bg-[#F4F5F7] border border-[#111111]/10 rounded-full py-4 md:py-5 pl-6 pr-16 text-sm text-[#111111] outline-none transition-all placeholder:text-[#111111]/30 shadow-inner font-mono focus:bg-white"
              style={{ ':focus': { borderColor: theme.color } } as any}
              onFocus={(e) => e.target.style.borderColor = theme.color}
              onBlur={(e) => e.target.style.borderColor = 'rgba(17,17,17,0.1)'}
              disabled={loading}
            />
            
            {/* Dynamic Premium Send Button */}
            <button 
              type="submit" 
              disabled={loading || !text.trim()}
              className="absolute right-2 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 active:scale-95 overflow-hidden group/btn shadow-md"
              style={{ 
                 backgroundColor: loading || !text.trim() ? '#E5E7EB' : theme.color,
                 color: loading || !text.trim() ? '#9CA3AF' : 'white',
                 boxShadow: loading || !text.trim() ? 'none' : `0 10px 20px ${theme.shadow}`
              }}
            >
              {loading ? (
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              ) : (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover/btn:-translate-y-1 group-hover/btn:translate-x-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              )}
            </button>
          </form>
        </div>

        {/* Custom Scrollbar for Light Theme */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.25); }
        `}</style>
      </div>
    </div>,
    document.body // 🔥 RENDERS DIRECTLY ON TOP OF EVERYTHING 🔥
  );
}