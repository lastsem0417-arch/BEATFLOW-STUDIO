import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';

export default function PitchModal({ post, onClose }: any) {
  const [proposal, setProposal] = useState('');
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleSendPitch = async () => {
    if (!proposal.trim()) return;
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/feed/${post._id}/pitch`, { proposal }, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      alert("Proposal transmitted to " + post.creatorName + "! ⚡");
      onClose();
    } catch (err) { alert("Pitch failed. Try again."); }
    finally { setLoading(false); }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-emerald-500/30 rounded-[3rem] p-10 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in zoom-in-95 duration-300">
        <div className="mb-8">
           <h3 className="text-3xl font-serif italic text-white mb-2">Send Pitch</h3>
           <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Proposal for: <span className="text-emerald-400">{post.title}</span></p>
        </div>

        <div className="mb-8">
          <label className="text-[10px] uppercase tracking-widest text-emerald-500 font-black mb-3 block">Terms & Collaboration Idea</label>
          <textarea 
            value={proposal}
            onChange={(e) => setProposal(e.target.value)}
            placeholder="e.g. 50/50 Royalty split + I'll handle the hook..."
            className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-emerald-500 transition-all resize-none"
          />
        </div>

        <button 
          onClick={handleSendPitch}
          disabled={loading}
          className="w-full py-4 bg-emerald-500 text-black rounded-full font-black uppercase tracking-[0.3em] hover:bg-white transition-all transform active:scale-95 shadow-xl disabled:opacity-50"
        >
          {loading ? 'Transmitting...' : 'Send Pitch ⚡'}
        </button>
      </div>
    </div>,
    document.body
  );
}