import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function LyricistProfile() {
  const navigate = useNavigate();
  // Session se current user uthao
  const [currentUser, setCurrentUser] = useState(JSON.parse(sessionStorage.getItem('beatflow_user') || '{}'));
  
  const [username, setUsername] = useState(currentUser.username || '');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const token = currentUser.token;
      // Backend POST route, update username on database
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, 
        { username }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 🔥 JAISE HI DB MEIN UPDATE HO, LOCAL SESSION BHI UPDATE KAR DO
      sessionStorage.setItem('beatflow_user', JSON.stringify(res.data));
      setCurrentUser(res.data);
      
      setMessage({ text: 'Profile updated successfully! 🔥', type: 'success' });
      // 3 second baad message hata do
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      
    } catch (error) {
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/');
  };

  return (
    <div className="flex-1 bg-transparent p-8 flex flex-col items-center justify-center relative z-10 h-full overflow-y-auto">
        
        <div className="w-full max-w-md bg-[#050505]/95 border border-white/10 rounded-3xl p-8 backdrop-blur-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)]">
            
            {/* 🔥 NEW & PRO AVATAR SECTION 🔥 */}
            <div className="text-center mb-10">
                <div className="relative group mx-auto mb-6 w-32 h-32 flex items-center justify-center">
                    {/* Outer Pulsing/Glowing Ring */}
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                    {/* Border Ring */}
                    <div className="absolute inset-2 bg-[#050505] rounded-full border border-white/5 shadow-inner z-10"></div>
                    
                    {/* Inner Circle and Initial Logo */}
                    <div className="w-28 h-28 bg-gradient-to-br from-emerald-500 to-black rounded-full flex items-center justify-center border border-emerald-500/40 relative z-20 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <span className="text-6xl text-white font-serif italic drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                            {currentUser.username?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    
                    {/* Stylized 'Writer' text badge */}
                    <p className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] bg-[#050505] px-3 py-1 rounded-full border border-white/10 uppercase tracking-[0.3em] text-emerald-400 font-black z-30">Writer</p>
                </div>
                <h2 className="text-3xl font-serif italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Profile</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 mt-1">Manage Your Identity</p>
            </div>

            <form onSubmit={handleUpdate} className="flex flex-col gap-6">
                
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black pl-1">Stage Name / Username</label>
                    <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                        required
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black pl-1">Email Address (Read Only)</label>
                    <input 
                        type="email" 
                        value={currentUser.email}
                        disabled
                        className="bg-[#0a0a0a] border border-white/5 rounded-xl px-4 py-3 text-neutral-600 cursor-not-allowed font-mono text-sm"
                    />
                </div>

                {message.text && (
                    <div className={`p-3 rounded-lg text-xs font-mono text-center border ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                        {message.text}
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs uppercase tracking-[0.2em] font-black transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] disabled:opacity-50 mt-2"
                >
                    {isSaving ? 'Syncing...' : 'Update Identity'}
                </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
                <button 
                    onClick={handleLogout}
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/50 rounded-xl text-xs uppercase tracking-widest font-black transition-all"
                >
                    Log Out
                </button>
            </div>

        </div>
    </div>
  );
}