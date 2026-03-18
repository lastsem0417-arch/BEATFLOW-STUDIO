import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

export default function PitchModal({ post, onClose }: any) {
  const [proposal, setProposal] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleSendPitch = async () => {
    if (!proposal.trim()) return;
    setStatus('loading');
    
    try {
      await axios.post(`http://localhost:5000/api/feed/${post._id}/pitch`, { proposal }, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      
      // Smooth Success State instead of ugly alert()
      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (err) { 
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 font-sans select-none">
      
      {/* 🌑 Cinematic Frosted Overlay */}
      <div 
        className="absolute inset-0 bg-[#010101]/80 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={status === 'loading' ? undefined : onClose}
      ></div>
      
      {/* 💼 The Executive Modal Card */}
      <div className="relative w-full max-w-xl bg-[#030305] border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_30px_60px_rgba(0,0,0,0.9)] animate-in zoom-in-95 fade-in duration-500 overflow-hidden">
        
        {/* Ambient Gold Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 blur-[80px] rounded-full pointer-events-none -z-10"></div>
        
        {/* ✕ Close Button */}
        <button 
          onClick={onClose}
          disabled={status === 'loading'}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#F0F0EB] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37]/30 transition-all duration-300 active:scale-95 disabled:opacity-50"
          title="Cancel Pitch"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* 🎩 Header */}
        <div className="mb-10 relative z-10 pr-10">
           <h3 className="text-3xl md:text-4xl font-serif italic text-[#F0F0EB] mb-3 tracking-tight">Initiate Pitch</h3>
           <p className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-mono leading-relaxed">
             Proposal target: <br/>
             <span className="text-[#D4AF37] font-black">{post.title}</span> by {post.creatorName}
           </p>
        </div>

        {/* 📝 Input Section */}
        <div className="mb-10 relative z-10">
          <label className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-black mb-4 flex items-center gap-2 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span> Terms & Sonic Vision
          </label>
          
          <div className="relative group">
            <textarea 
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Define terms: 50/50 Royalty split, lyrical direction, or production credits..."
              className="w-full h-40 bg-[#0A0A0C] border border-white/10 rounded-[1.5rem] p-5 text-[#F0F0EB] text-sm outline-none focus:border-[#D4AF37]/50 focus:bg-white/[0.02] transition-all resize-none custom-scrollbar shadow-inner placeholder:text-[#888888]/40 font-mono leading-relaxed"
              data-lenis-prevent="true"
              disabled={status === 'loading' || status === 'success'}
            />
            {/* Subtle glow border effect on hover/focus */}
            <div className="absolute inset-0 rounded-[1.5rem] border border-[#D4AF37] opacity-0 group-focus-within:opacity-30 pointer-events-none transition-opacity duration-500 shadow-[0_0_20px_rgba(212,175,55,0.1)]"></div>
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <p className="text-[9px] uppercase tracking-widest text-[#E63946] font-mono mt-3 text-center animate-in fade-in">
              Transmission Failed. Network Interference.
            </p>
          )}
        </div>

        {/* ⚡ Action Button */}
        <button 
          onClick={handleSendPitch}
          disabled={status === 'loading' || status === 'success' || !proposal.trim()}
          className={`w-full py-4 rounded-[1.2rem] font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group ${
            status === 'success' 
              ? 'bg-[#52B788] text-[#010101] shadow-[0_0_30px_rgba(82,183,136,0.4)] border border-transparent' 
              : 'bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#010101] shadow-[0_10px_20px_rgba(212,175,55,0.1)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.3)] disabled:opacity-40 disabled:hover:bg-[#D4AF37]/10 disabled:hover:text-[#D4AF37] active:scale-95'
          }`}
        >
          {status === 'idle' && (
            <>
              Transmit Proposal 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </>
          )}
          {status === 'loading' && (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Encrypting...
            </>
          )}
          {status === 'success' && (
            <>
              Deal Sent 
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-300"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </>
          )}
        </button>
      </div>
    </div>,
    document.body
  );
}