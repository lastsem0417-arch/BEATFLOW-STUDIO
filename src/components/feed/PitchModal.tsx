import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

export default function PitchModal({ post, onClose }: any) {
  const [proposal, setProposal] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  // 🔥 DYNAMIC ROLE THEME (Executive Colors) 🔥
  const role = loggedInUser.role?.toLowerCase() || 'producer';
  const getRoleTheme = () => {
    if (role === 'rapper') return { hex: '#E63946', shadow: 'rgba(230,57,70,0.3)' }; // Crimson
    if (role === 'lyricist') return { hex: '#10B981', shadow: 'rgba(16,185,129,0.3)' }; // Emerald
    if (role === 'listener') return { hex: '#2563EB', shadow: 'rgba(37,99,235,0.3)' }; // Royal Blue
    return { hex: '#D4AF37', shadow: 'rgba(212,175,55,0.3)' }; // Gold for Producer
  };
  const theme = getRoleTheme();

  const handleSendPitch = async () => {
    if (!proposal.trim()) return;
    setStatus('loading');
    
    try {
      await axios.post(`import.meta.env.VITE_API_URL/api/feed/${post._id}/pitch`, { proposal }, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      
      // Smooth Success State
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
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-8 font-sans select-none overflow-hidden text-[#111111]">
      
      {/* 🌫️ Premium Frosted Backdrop Blur */}
      <div 
        className="absolute inset-0 bg-[#111111]/40 backdrop-blur-md animate-in fade-in duration-500 transition-opacity" 
        onClick={status === 'loading' ? undefined : onClose}
      ></div>
      
      {/* 💼 The Executive Modal Card */}
      <div className="relative w-full max-w-2xl bg-white border border-[#111111]/5 rounded-[3rem] p-10 md:p-14 shadow-[0_40px_80px_rgba(0,0,0,0.2)] animate-in zoom-in-[0.98] slide-in-from-bottom-8 fade-in duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] overflow-hidden">
        
        {/* Dynamic Ambient Glow inside the modal */}
        <div 
          className="absolute top-[-20%] right-[-10%] w-96 h-96 blur-[100px] rounded-full pointer-events-none -z-10 opacity-15 transition-colors duration-1000" 
          style={{ backgroundColor: theme.hex }}
        ></div>
        
        {/* ✕ Close Button */}
        <button 
          onClick={onClose}
          disabled={status === 'loading'}
          className="absolute top-10 right-10 w-12 h-12 rounded-full border border-[#111111]/10 bg-[#F4F5F7] flex items-center justify-center text-[#111111]/40 hover:text-[#E63946] hover:bg-white hover:border-[#E63946]/30 hover:shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50 group z-20"
          title="Cancel Pitch"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* 🎩 Editorial Header */}
        <div className="mb-12 pr-12 relative z-10">
           <h3 className="text-4xl md:text-5xl font-serif italic text-[#111111] leading-tight tracking-tight mb-3">Initiate Pitch</h3>
           <p className="text-[9px] uppercase tracking-[0.4em] text-[#111111]/50 font-mono font-black flex items-center gap-2">
             <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}></span> 
             Target: <span style={{ color: theme.hex }}>{post.title}</span> by {post.creatorName}
           </p>
        </div>

        {/* 📝 Input Section */}
        <div className="mb-10 relative z-10">
          <label className="text-[10px] uppercase tracking-[0.3em] font-black mb-4 flex items-center gap-2 font-mono text-[#111111]/40 ml-2">
             Terms & Sonic Vision
          </label>
          
          <div className="relative group">
            <textarea 
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Define terms: 50/50 Royalty split, lyrical direction, or production credits..."
              className="w-full h-40 bg-[#F4F5F7] border border-[#111111]/10 rounded-[2rem] p-6 text-[#111111] text-sm md:text-base outline-none transition-all duration-500 resize-none shadow-inner placeholder:text-[#111111]/30 font-serif italic focus:bg-white custom-scrollbar"
              data-lenis-prevent="true"
              disabled={status === 'loading' || status === 'success'}
              onFocus={(e) => { e.target.style.borderColor = theme.hex; e.target.style.boxShadow = `0 0 0 4px ${theme.hex}15`; }}
              onBlur={(e) => { e.target.style.borderColor = 'rgba(17,17,17,0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'; }}
            />
          </div>

          {/* Error Message */}
          {status === 'error' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-center relative overflow-hidden animate-in fade-in">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E63946]"></div>
              <span className="text-[9px] uppercase font-black tracking-widest text-[#E63946] font-mono">Transmission Failed. Network Interference.</span>
            </div>
          )}
        </div>

        {/* ⚡ Premium Action Button */}
        <button 
          onClick={handleSendPitch}
          disabled={status === 'loading' || status === 'success' || !proposal.trim()}
          className="w-full py-5 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 disabled:opacity-70 disabled:scale-100 disabled:shadow-none"
          style={{
            backgroundColor: status === 'success' ? '#10B981' : (status === 'loading' || !proposal.trim() ? '#F4F5F7' : theme.hex),
            color: status === 'success' ? 'white' : (status === 'loading' || !proposal.trim() ? '#111111' : 'white'),
            boxShadow: status === 'success' ? '0 15px 30px rgba(16,185,129,0.3)' : (status === 'loading' || !proposal.trim() ? 'none' : `0 15px 30px ${theme.shadow}`)
          }}
        >
          {status === 'idle' && (
            <>
              Transmit Proposal 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
            </>
          )}
          {status === 'loading' && (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-[#111111]/50"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              <span className="text-[#111111]/50">Encrypting Payload...</span>
            </>
          )}
          {status === 'success' && (
            <>
              Deal Proposed 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-in zoom-in duration-300"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </>
          )}
        </button>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.3); }
      `}</style>
    </div>,
    document.body
  );
}