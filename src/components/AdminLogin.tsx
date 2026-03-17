import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      const responseData = res.data;
      
      const actualRole = responseData.role || responseData.user?.role || '';

      if (actualRole.toLowerCase() !== 'admin') {
        setError(`ACCESS DENIED: Your current role is '${actualRole}'. God Mode requires 'admin'.`);
        setLoading(false);
        return;
      }

      // Session me data save kiya
      const userToSave = responseData.user ? { ...responseData.user, token: responseData.token } : responseData;
      sessionStorage.setItem('beatflow_user', JSON.stringify(userToSave));
      
      // 🔥 THE FIX: navigate() ki jagah full reload taaki Auth Guard naya data padh le!
      window.location.href = '/admin';

    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid Credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden font-sans select-none">
      {/* 🔴 RED AMBIENT GLOW */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>

      <div className="w-full max-w-md z-10 p-8">
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] mb-6 border border-red-500/30">
             <span className="font-black text-white text-2xl">👁️</span>
          </div>
          <h1 className="text-3xl font-serif italic text-white tracking-tight">System Override</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black mt-3 animate-pulse">Restricted Access</p>
        </div>

        <form onSubmit={handleAdminLogin} className="bg-[#0a0a0a]/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-red-500/20 shadow-[0_0_50px_rgba(220,38,38,0.1)] animate-in fade-in zoom-in-95 duration-500">
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-center">
              <span className="text-[10px] uppercase font-black tracking-widest text-red-400">{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            <div>
              <label className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-2 block">Admin ID</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-red-500/50 transition-all font-mono text-sm"
                placeholder="admin@beatflow.com"
              />
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-widest text-neutral-500 font-black mb-2 block">Passcode</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-red-500/50 transition-all font-mono text-sm tracking-widest"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-10 py-5 bg-red-600/20 border border-red-500/50 text-red-500 rounded-full font-black uppercase tracking-[0.3em] text-[10px] hover:bg-red-600 hover:text-white transition-all transform active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.2)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Enter God Mode ⚡'}
          </button>
        </form>
      </div>
    </div>
  );
}