import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlobalFeed from './feed/GlobalFeed'; 

export default function AdminMaster() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content'>('dashboard');
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  useEffect(() => {
    // 🛑 KICK OUT FAKE ADMINS
    if (!loggedInUser.token || loggedInUser.role !== 'admin') {
      alert("⚠️ ACCESS DENIED: GOD MODE ONLY");
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
        
        const statsRes = await axios.get('http://localhost:5000/api/admin/stats', config);
        setStats(statsRes.data);

        const usersRes = await axios.get('http://localhost:5000/api/admin/users', config);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Admin Access Error", err);
      }
    };

    fetchAdminData();
  }, [navigate]);

  // 🔥 VERIFY FUNCTION
  const handleVerify = async (userId: string) => {
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.put(`http://localhost:5000/api/admin/users/${userId}/verify`, {}, config);
      
      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      alert("Error verifying user.");
    }
  };

  // 🔥 BAN FUNCTION
  const handleBan = async (userId: string, username: string) => {
    if (!window.confirm(`⚠️ EXTREME WARNING: Are you sure you want to PERMANENTLY BAN ${username}? This action is irreversible.`)) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}/ban`, config);
      
      setUsers(users.filter(u => u._id !== userId));
      setStats({ ...stats, totalUsers: stats.totalUsers - 1 }); 
    } catch (err) {
      alert("Error banning user.");
    }
  };

  // 🎬 CINEMATIC PRELOADER
  if (!stats) return (
    <div className="h-screen w-full bg-[#030305] flex flex-col items-center justify-center select-none">
      <div className="w-16 h-16 border border-white/10 border-t-[#9B2226] rounded-full animate-spin mb-6"></div>
      <span className="text-[10px] uppercase font-mono tracking-[0.4em] text-[#888888] animate-pulse">Authenticating God Mode...</span>
    </div>
  );

  return (
    // 🔥 LUXURY ONYX BASE 🔥
    <div className="flex min-h-screen bg-[#030305] text-[#F0F0EB] font-sans relative select-none overflow-hidden">
      
      {/* 🔴 SUBTLE DEEP CRIMSON GLOWS (No cheap bright red) 🔴 */}
      <div className="fixed top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-[#9B2226]/5 blur-[200px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-screen z-0"></div>

      {/* --- EXECUTIVE SIDEBAR --- */}
      <aside className="w-64 sticky top-0 h-screen border-r border-white/5 bg-[#010101]/80 backdrop-blur-3xl flex flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.8)] shrink-0">
        
        {/* God Mode Branding */}
        <div className="p-10 border-b border-white/5 flex flex-col gap-4 cursor-pointer group" onClick={() => navigate('/profile')}>
          <div className="w-16 h-16 rounded-[1.2rem] bg-[#0A0A0C] border border-[#9B2226]/30 flex items-center justify-center shadow-[0_0_30px_rgba(155,34,38,0.1)] group-hover:border-[#9B2226] group-hover:shadow-[0_0_40px_rgba(155,34,38,0.3)] transition-all duration-700">
             {/* Premium Eye/Pyramid SVG */}
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#9B2226] group-hover:scale-110 transition-transform duration-700"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </div>
          <div>
             <h1 className="text-2xl font-serif italic text-[#F0F0EB] tracking-tight group-hover:text-white transition-colors">Overlord</h1>
             <p className="text-[8px] uppercase tracking-[0.4em] text-[#888888] font-mono mt-1 flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-[#9B2226] rounded-full animate-pulse"></span> System Active
             </p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-6 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'dashboard' ? 'bg-[#9B2226]/10 border border-[#9B2226]/30 text-[#F0F0EB] shadow-[0_0_20px_rgba(155,34,38,0.1)]' : 'hover:bg-white/5 text-[#888888] hover:text-white border border-transparent'}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Telemetry</span>
          </button>

          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'users' ? 'bg-[#9B2226]/10 border border-[#9B2226]/30 text-[#F0F0EB] shadow-[0_0_20px_rgba(155,34,38,0.1)]' : 'hover:bg-white/5 text-[#888888] hover:text-white border border-transparent'}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Identities</span>
          </button>

          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-5 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'content' ? 'bg-[#9B2226]/10 border border-[#9B2226]/30 text-[#F0F0EB] shadow-[0_0_20px_rgba(155,34,38,0.1)]' : 'hover:bg-white/5 text-[#888888] hover:text-white border border-transparent'}`}>
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Feed</span>
          </button>
        </nav>

        {/* Lock System */}
        <div className="mt-auto p-8 border-t border-white/5">
          <button 
            onClick={() => { sessionStorage.removeItem('beatflow_user'); navigate('/roles'); }} 
            className="w-full flex items-center justify-center gap-3 py-4 border border-white/10 rounded-[1rem] text-[10px] uppercase font-black tracking-[0.3em] text-[#888888] hover:bg-[#9B2226] hover:text-white hover:border-[#9B2226] shadow-xl hover:shadow-[0_0_30px_rgba(155,34,38,0.3)] transition-all duration-500 group"
          >
            Lock Terminal <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative z-10 h-screen">
        
        {/* Executive Header */}
        <header className="h-24 px-12 flex items-center justify-between z-40 border-b border-white/5 bg-[#030305]/80 backdrop-blur-3xl sticky top-0 shrink-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-3xl font-serif italic text-[#F0F0EB] tracking-tight">
               {activeTab === 'dashboard' ? 'Network Telemetry' : activeTab === 'users' ? 'Identity Management' : 'Content Moderation'}
            </h2>
          </div>
          <div 
            className="flex items-center gap-4 px-6 py-3 bg-[#010101] border border-white/10 rounded-full cursor-pointer hover:border-[#9B2226]/50 hover:bg-[#9B2226]/5 transition-colors duration-500 shadow-inner group" 
            onClick={() => navigate('/profile')}
          >
            <span className="text-[9px] uppercase tracking-[0.3em] font-black text-[#888888] group-hover:text-[#F0F0EB] transition-colors">Access Profile</span>
            <div className="w-6 h-6 rounded-full overflow-hidden border border-[#9B2226]/30">
               <img src={loggedInUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} className="w-full h-full object-cover grayscale" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 relative z-20 p-8 lg:p-12 w-full overflow-y-auto custom-scrollbar pb-32" data-lenis-prevent="true">
          
          {/* 🔥 1. TELEMETRY DASHBOARD 🔥 */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col gap-10 max-w-[1600px] mx-auto">
              
              {/* CRITICAL STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Users Card */}
                <div className="bg-[#010101]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-white/20 shadow-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono relative z-10">Network Nodes</span>
                  <span className="text-6xl font-serif italic text-[#F0F0EB] mt-8 group-hover:text-white transition-colors relative z-10">{stats.totalUsers}</span>
                </div>

                {/* Drops Card */}
                <div className="bg-[#010101]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-[#F0F0EB]/30 shadow-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono relative z-10">Global Assets</span>
                  <span className="text-6xl font-serif italic text-[#F0F0EB] mt-8 transition-colors relative z-10">{stats.totalDrops}</span>
                </div>
                
                {/* Server Health Card */}
                <div className="bg-[#010101]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-[#8ECAE6]/30 shadow-2xl flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#8ECAE6]/5 blur-[40px] rounded-full group-hover:bg-[#8ECAE6]/10 transition-colors"></div>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono relative z-10 group-hover:text-[#8ECAE6] transition-colors">Core Uptime</span>
                  <div className="relative z-10 mt-8">
                    <span className="text-5xl font-serif italic text-[#8ECAE6] block">99.9%</span>
                    <div className="w-full bg-white/5 h-1 rounded-full mt-4 overflow-hidden">
                       <div className="bg-[#8ECAE6] h-full w-[99.9%] rounded-full shadow-[0_0_10px_#8ECAE6]"></div>
                    </div>
                  </div>
                </div>

                {/* System Status Card */}
                <div className="bg-[#010101]/80 backdrop-blur-xl p-8 rounded-[2rem] border border-[#9B2226]/20 hover:border-[#9B2226]/50 shadow-[0_0_30px_rgba(155,34,38,0.05)] flex flex-col justify-between hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#9B2226]/10 blur-[50px] rounded-full group-hover:bg-[#9B2226]/20 transition-colors"></div>
                   <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black font-mono flex items-center gap-2 relative z-10">
                     <span className="w-1.5 h-1.5 bg-[#9B2226] rounded-full animate-pulse"></span> Network Status
                   </span>
                   <span className="text-3xl font-mono uppercase text-[#F0F0EB] mt-8 tracking-widest relative z-10">NOMINAL</span>
                </div>
              </div>

              {/* SECOND ROW - BREAKDOWN & LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Breakdown (Minimal Rings) */}
                <div className="bg-[#010101]/80 backdrop-blur-xl p-10 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col col-span-1 lg:col-span-2 h-full relative overflow-hidden group">
                  <span className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black font-mono mb-8 border-b border-white/5 pb-4 relative z-10">Ecosystem Breakdown</span>
                  
                  <div className="flex items-center justify-around mt-auto pb-4 relative z-10">
                    <div className="text-center group/item cursor-default">
                      <span className="block text-5xl md:text-6xl font-serif italic text-[#F0F0EB] mb-3 transition-transform duration-500 group-hover/item:text-[#D4AF37]">{stats.breakdown.producers}</span>
                      <span className="text-[8px] text-[#888888] uppercase font-black tracking-[0.3em]">Producers</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/5"></div>
                    <div className="text-center group/item cursor-default">
                      <span className="block text-5xl md:text-6xl font-serif italic text-[#F0F0EB] mb-3 transition-transform duration-500 group-hover/item:text-[#E63946]">{stats.breakdown.rappers}</span>
                      <span className="text-[8px] text-[#888888] uppercase font-black tracking-[0.3em]">Rappers</span>
                    </div>
                    <div className="w-[1px] h-12 bg-white/5"></div>
                    <div className="text-center group/item cursor-default">
                      <span className="block text-5xl md:text-6xl font-serif italic text-[#F0F0EB] mb-3 transition-transform duration-500 group-hover/item:text-[#52B788]">{stats.breakdown.lyricists}</span>
                      <span className="text-[8px] text-[#888888] uppercase font-black tracking-[0.3em]">Lyricists</span>
                    </div>
                  </div>
                </div>

                {/* LUXURY TERMINAL LOGS */}
                <div className="bg-[#050505] p-8 rounded-[2rem] border border-white/10 shadow-inner font-mono relative overflow-hidden flex flex-col h-full min-h-[300px]">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F0F0EB]/30 to-transparent opacity-50"></div>
                  
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black mb-6 flex items-center gap-2 relative z-10">
                     <span className="w-1.5 h-1.5 bg-[#F0F0EB] rounded-full animate-pulse shadow-[0_0_10px_white]"></span> Live Terminal
                  </span>
                  
                  <div className="flex flex-col gap-3 text-[10px] leading-relaxed text-[#888888] h-full justify-end relative z-10 tracking-widest">
                    <p className="opacity-40">&gt; Authenticating God Mode...</p>
                    <p className="opacity-50">&gt; Fetching {stats.totalUsers} identities...</p>
                    <p className="opacity-60">&gt; Syncing distributed ledgers...</p>
                    <p className="opacity-70">&gt; Bypassing core security protocols...</p>
                    <p className="text-[#F0F0EB] font-bold mt-2">&gt; CONNECTION ESTABLISHED.</p>
                    <div className="mt-4 pt-4 border-t border-white/5 text-[8px] text-[#888888]/50">
                      SYS_TIME: {new Date().toISOString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 🔥 2. IDENTITIES MATRIX (USERS TABLE) 🔥 */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-[1600px] mx-auto">
              <div className="bg-[#010101]/80 backdrop-blur-xl rounded-[2.5rem] border border-white/5 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-[#050505]/50">
                  <h3 className="text-2xl font-serif italic text-[#F0F0EB]">Network Ledger</h3>
                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black px-4 py-2 bg-white/5 rounded-full border border-white/10">{users.length} Nodes Active</span>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/5 text-[8px] uppercase tracking-[0.3em] text-[#888888] bg-[#030305]">
                        <th className="p-8 font-black">Identity</th>
                        <th className="p-8 font-black">Designation</th>
                        <th className="p-8 font-black">Onboarded</th>
                        <th className="p-8 font-black text-right">Moderation Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="p-8 flex items-center gap-5 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                            <div className="w-12 h-12 rounded-[1rem] border border-white/10 overflow-hidden shadow-inner bg-[#050505]">
                               <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" alt="DP" />
                            </div>
                            <div>
                              <p className="font-serif italic text-[#F0F0EB] text-lg group-hover:text-white transition-colors">{u.username}</p>
                              <p className="text-[9px] text-[#888888] font-mono mt-0.5 tracking-widest">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-8">
                            <span className={`px-4 py-1.5 rounded-sm text-[8px] font-black uppercase tracking-[0.2em] border ${u.role === 'admin' ? 'bg-[#9B2226]/10 border-[#9B2226]/30 text-[#9B2226]' : 'bg-white/5 border-white/10 text-[#888888]'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-8 text-[10px] text-[#888888] font-mono tracking-widest">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex gap-4 justify-end opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                                
                                {/* Premium Verify Button */}
                                <button 
                                  onClick={() => handleVerify(u._id)}
                                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[8px] uppercase font-black tracking-[0.2em] transition-all shadow-lg border ${u.isVerified ? 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37]' : 'bg-white/5 border-white/10 text-[#888888] hover:bg-white hover:text-black'}`}
                                >
                                  {u.isVerified ? (
                                    <><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> Verified</>
                                  ) : (
                                    <><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Verify</>
                                  )}
                                </button>
                                
                                {/* Premium Ban Button */}
                                {u.role !== 'admin' && (
                                  <button 
                                    onClick={() => handleBan(u._id, u.username)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#9B2226]/10 border border-[#9B2226]/30 text-[#9B2226] hover:bg-[#9B2226] hover:text-white rounded-full text-[8px] uppercase font-black tracking-[0.2em] transition-all shadow-lg"
                                  >
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> Terminate
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 3. CONTENT MODERATION (Global Feed) 🔥 */}
          {activeTab === 'content' && (
            <div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-[1600px] mx-auto">
               <GlobalFeed />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}