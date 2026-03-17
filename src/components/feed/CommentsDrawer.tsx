import React, { useState } from 'react';
import axios from 'axios';

export default function CommentsDrawer({ post, onClose, onCommentAdded }: any) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      setLoading(true);
      // Backend pe comment bhejo
      const res = await axios.post(`http://localhost:5000/api/feed/${post._id}/comment`, { text }, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      
      // Feed ko batao ki naya comment add ho gaya hai
      onCommentAdded(post._id, res.data);
      setText(''); // Input clear karo
    } catch (err) {
      console.error("Error adding comment", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background Overlay (Click karne pe band hoga) */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Slide-out Drawer */}
      <div className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 z-[101] flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div>
            <h3 className="text-xl font-serif italic text-white">Comments</h3>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-black mt-1">On {post.creatorName}'s Drop</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all">✕</button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          {!post.comments || post.comments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 opacity-50">
               <span className="text-4xl mb-2">💬</span>
               <p className="text-xs font-mono">Be the first to drop a comment.</p>
            </div>
          ) : (
            post.comments.map((comment: any, idx: number) => (
              <div key={idx} className="flex gap-4 group">
                <div className="w-8 h-8 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${comment.username}&backgroundColor=transparent`} alt="avt" className="w-full h-full scale-110" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white">{comment.username}</span>
                    <span className="text-[9px] text-neutral-600 font-mono">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-neutral-300 font-light leading-relaxed">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 border-t border-white/5 bg-black/40">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Drop your thoughts..." 
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-5 pr-12 text-sm text-white focus:border-emerald-500/50 focus:bg-white/10 outline-none transition-all placeholder:text-neutral-600"
            />
            <button 
              type="submit" 
              disabled={loading || !text.trim()}
              className="absolute right-2 w-8 h-8 rounded-full bg-emerald-500 text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? '...' : '↑'}
            </button>
          </form>
        </div>

      </div>
    </>
  );
}