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
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
      const responseData = res.data;
      
      const actualRole = responseData.role || responseData.user?.role || '';

      if (actualRole.toLowerCase() !== 'admin') {
        setError(`Access Denied: Administrative clearance required.`);
        setLoading(false);
        return;
      }

      // Safe save to session
      const userToSave = responseData.user ? { ...responseData.user, token: responseData.token } : responseData;
      sessionStorage.setItem('beatflow_user', JSON.stringify(userToSave));
      
      // Full reload to bypass auth guards gracefully
      window.location.href = '/admin';

    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication Failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    // 🔥 LUXURY ALABASTER BASE 🔥
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center relative overflow-hidden font-sans select-none">
      
      {/* 🍷 PREMIUM AMBIENT GLOWS 🍷 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] bg-[#800020]/5 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>

      <div className="w-full max-w-lg z-10 p-6 sm:p-8 relative">
        
        {/* 🎩 EDITORIAL HEADER */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="w-20 h-20 mx-auto rounded-full bg-white border border-black/5 flex items-center justify-center shadow-[0_15px_35px_rgba(0,0,0,0.05)] mb-8 relative group overflow-hidden">
             <span className="font-serif italic text-2xl text-[#1A1A1A] group-hover:scale-110 transition-transform duration-500">BF</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-serif italic text-[#1A1A1A] tracking-tight leading-none mb-4">Management Suite</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-black/40 font-black flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 bg-[#800020] rounded-full shadow-[0_0_8px_#800020] animate-pulse"></span> Secure Executive Access
          </p>
        </div>

        {/* 📝 LUXURY LOGIN CARD */}
        <form onSubmit={handleAdminLogin} className="bg-white/80 backdrop-blur-2xl p-10 sm:p-14 rounded-[3rem] border border-white shadow-[0_40px_80px_rgba(0,0,0,0.04)] animate-in fade-in zoom-in-95 duration-1000 relative">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#800020]/5 blur-[50px] rounded-full pointer-events-none"></div>

          {/* Error Message */}
          {error && (
            <div className="mb-10 p-5 bg-red-50 border border-red-100 rounded-2xl text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E63946]"></div>
              <span className="text-[10px] uppercase font-black tracking-widest text-[#E63946]">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-8 relative z-10">
            {/* ID Input */}
            <div className="group">
              <label className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-black mb-3 block ml-1 transition-colors group-focus-within:text-[#800020]">Executive ID</label>
              <div className="relative">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full bg-[#F9F9FB] border border-black/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-[#1A1A1A] outline-none focus:border-[#800020]/30 focus:bg-white transition-all text-sm shadow-sm placeholder:text-black/30"
                   placeholder="manager@beatflow.com"
                 />
              </div>
            </div>
            
            {/* Passcode Input */}
            <div className="group">
              <label className="text-[10px] uppercase tracking-[0.3em] text-black/40 font-black mb-3 block ml-1 transition-colors group-focus-within:text-[#800020]">Access Key</label>
              <div className="relative">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full bg-[#F9F9FB] border border-black/5 rounded-[1.5rem] py-5 pl-14 pr-6 text-[#1A1A1A] outline-none focus:border-[#800020]/30 focus:bg-white transition-all text-lg tracking-[0.3em] shadow-sm placeholder:text-black/30"
                   placeholder="••••••••"
                 />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-12 py-5 bg-[#1A1A1A] border border-transparent text-white rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-[#800020] transition-all duration-500 transform active:scale-95 shadow-[0_15px_30px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_rgba(128,0,32,0.3)] disabled:opacity-50 disabled:hover:bg-[#1A1A1A] flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <span className="relative z-10">{loading ? 'Authorizing...' : 'Sign In To Suite'}</span>
            {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
          </button>
        </form>

      </div>
    </div>
  );
}