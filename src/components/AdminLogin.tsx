import React, { useState } from 'react';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const responseData = res.data;
      
      const actualRole = responseData.role || responseData.user?.role || '';

      if (actualRole.toLowerCase() !== 'admin') {
        setError(`ACCESS DENIED: Role is '${actualRole}'. God Mode requires 'admin'.`);
        setLoading(false);
        return;
      }

      // Safe save to session
      const userToSave = responseData.user ? { ...responseData.user, token: responseData.token } : responseData;
      sessionStorage.setItem('beatflow_user', JSON.stringify(userToSave));
      
      // Full reload to bypass auth guards gracefully
      window.location.href = '/admin';

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid Credentials. Connection Terminated.');
      setLoading(false);
    }
  };

  return (
    // 🔥 LUXURY ONYX BASE 🔥
    <div className="min-h-screen bg-[#030305] flex items-center justify-center relative overflow-hidden font-sans select-none">
      
      {/* 🔴 DEEP CRIMSON AMBIENT GLOWS 🔴 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-[#9B2226]/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
      
      {/* Subtle Grid overlay for that Terminal aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none opacity-30"></div>

      <div className="w-full max-w-md z-10 p-8 relative">
        
        {/* 🎩 HEADER */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-20 h-20 mx-auto rounded-[1.5rem] bg-[#010101] border border-[#9B2226]/30 flex items-center justify-center shadow-[0_0_40px_rgba(155,34,38,0.2)] mb-8 relative group overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-b from-[#9B2226]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#9B2226] drop-shadow-[0_0_10px_rgba(155,34,38,0.8)]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <h1 className="text-4xl font-serif italic text-[#F0F0EB] tracking-tight drop-shadow-md mb-3">System Override</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black mt-3 font-mono flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-[#9B2226] rounded-full animate-pulse shadow-[0_0_10px_#9B2226]"></span> Restricted Terminal
          </p>
        </div>

        {/* 🎛️ LOGIN TERMINAL */}
        <form onSubmit={handleAdminLogin} className="bg-[#010101]/80 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-700 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#9B2226]/5 blur-[50px] rounded-full pointer-events-none"></div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-[#E63946]/10 border border-[#E63946]/30 rounded-xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E63946]"></div>
              <span className="text-[9px] uppercase font-black tracking-[0.2em] text-[#E63946] font-mono">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-6 relative z-10">
            {/* ID Input */}
            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black mb-3 block font-mono">Admin Clearance ID</label>
              <div className="relative">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-[#0A0A0C] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-[#F0F0EB] outline-none focus:border-[#9B2226]/50 focus:bg-white/[0.02] transition-all font-mono text-sm shadow-inner placeholder:text-[#888888]/40"
                   placeholder="overlord@beatflow.com"
                 />
              </div>
            </div>
            
            {/* Passcode Input */}
            <div>
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black mb-3 block font-mono">Security Passcode</label>
              <div className="relative">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-5 top-1/2 -translate-y-1/2 text-[#888888]"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[#0A0A0C] border border-white/5 rounded-2xl py-4 pl-14 pr-4 text-[#F0F0EB] outline-none focus:border-[#9B2226]/50 focus:bg-white/[0.02] transition-all font-mono text-lg tracking-[0.3em] shadow-inner placeholder:text-[#888888]/40"
                   placeholder="••••••••"
                 />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-10 py-5 bg-[#9B2226]/10 border border-[#9B2226]/30 text-[#9B2226] rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#9B2226] hover:text-white transition-all duration-500 transform active:scale-95 shadow-[0_0_20px_rgba(155,34,38,0.1)] hover:shadow-[0_0_30px_rgba(155,34,38,0.4)] disabled:opacity-50 disabled:hover:bg-[#9B2226]/10 disabled:hover:text-[#9B2226] flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <span className="relative z-10">{loading ? 'Decrypting Protocol...' : 'Initiate God Mode'}</span>
            {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
          </button>
        </form>

      </div>
    </div>
  );
}