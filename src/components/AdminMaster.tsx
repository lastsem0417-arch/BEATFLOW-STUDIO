import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import GlobalFeed from './feed/GlobalFeed'; 
import NotificationBell from './feed/NotificationBell';

export default function AdminMaster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'content'>('dashboard');
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  useEffect(() => {
    if (!loggedInUser.token || loggedInUser.role !== 'admin') {
      alert("⚠️ ACCESS DENIED: EXECUTIVE CLEARANCE REQUIRED");
      navigate('/');
      return;
    }

    const fetchAdminData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
        const [statsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/users', config)
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Admin Access Error", err);
      }
    };

    fetchAdminData();
  }, [navigate, loggedInUser.token, loggedInUser.role]);

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
    if (!window.confirm(`⚠️ SYSTEM WARNING: Are you sure you want to PERMANENTLY SUSPEND ${username}?`)) return;
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}/ban`, config);
      setUsers(users.filter(u => u._id !== userId));
      setStats({ ...stats, totalUsers: stats.totalUsers - 1 }); 
    } catch (err) {
      alert("Error banning user.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles');
  };

  // 🎬 GSAP CINEMATIC EDITORIAL ENTRY
  useLayoutEffect(() => {
    if (!stats) return; 
    let ctx = gsap.context(() => {
      gsap.fromTo('.hero-title', 
        { yPercent: 100, opacity: 0 }, 
        { yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.1 }
      );
      gsap.fromTo('.stagger-card', 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'expo.out', delay: 0.3 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [activeTab, stats]);

  // 🎬 PREMIUM LIGHT PRELOADER
  if (!stats) return (
    <div className="h-screen w-full bg-[#F4F5F7] flex flex-col items-center justify-center select-none relative overflow-hidden">
      <div className="w-16 h-16 border-[3px] border-[#111111]/10 border-t-[#111111] rounded-full animate-spin mb-6"></div>
      <span className="text-[10px] uppercase font-mono tracking-[0.5em] text-[#111111]/50 animate-pulse font-black">Connecting to Mainframe...</span>
    </div>
  );

  return (
    // 🔥 LUXURY OFF-WHITE BASE 🔥
    <div ref={containerRef} className="flex min-h-screen bg-[#F4F5F7] text-[#111111] font-sans relative select-none w-full overflow-x-hidden">
      
      {/* 🔴🟡🔵🟢 MULTICOLOR AMBIENT GLOWS (Very Soft) */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#2563EB]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-multiply z-0"></div>

      {/* --- EXECUTIVE SIDEBAR --- */}
      <aside className="w-24 md:w-28 sticky top-0 h-screen border-r border-[#111111]/5 bg-white/80 backdrop-blur-3xl flex flex-col items-center py-10 z-50 shadow-sm shrink-0 transition-all duration-500">
        
        {/* Branding */}
        <div className="mb-14 cursor-pointer group" onClick={() => navigate('/profile')}>
          <div className="w-14 h-14 rounded-2xl bg-[#111111] border border-transparent flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.1)] group-hover:bg-white group-hover:border-[#111111]/10 transition-all duration-500">
             <span className="font-serif italic text-2xl text-white group-hover:text-[#111111] transition-colors">BF</span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex flex-col gap-6 w-full px-4 flex-1">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'dashboard' ? 'bg-[#111111] text-white shadow-xl scale-105' : 'bg-transparent border border-transparent hover:bg-[#F4F5F7] text-[#111111]/40 hover:text-[#111111]'}`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            <span className="text-[8px] font-black uppercase tracking-widest">Dash</span>
          </button>

          <button onClick={() => setActiveTab('users')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'users' ? 'bg-[#111111] text-white shadow-xl scale-105' : 'bg-transparent border border-transparent hover:bg-[#F4F5F7] text-[#111111]/40 hover:text-[#111111]'}`}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
             <span className="text-[8px] font-black uppercase tracking-widest">Users</span>
          </button>

          <button onClick={() => setActiveTab('content')} className={`w-full aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-500 group ${activeTab === 'content' ? 'bg-[#111111] text-white shadow-xl scale-105' : 'bg-transparent border border-transparent hover:bg-[#F4F5F7] text-[#111111]/40 hover:text-[#111111]'}`}>
             <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1.5"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
             <span className="text-[8px] font-black uppercase tracking-widest">Feed</span>
          </button>
        </nav>

        {/* Lock System */}
        <div className="mt-auto">
          <button 
            onClick={handleLogout} 
            className="w-12 h-12 rounded-full border border-transparent hover:border-[#E63946]/30 bg-[#F4F5F7] hover:bg-[#E63946]/10 text-[#111111]/40 hover:text-[#E63946] flex items-center justify-center transition-all duration-300"
            title="Lock Terminal"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col relative w-full min-w-0">
        
        {/* Executive Header */}
        <header className="h-24 px-10 md:px-16 flex items-center justify-between z-40 border-b border-[#111111]/5 bg-[#F4F5F7]/80 backdrop-blur-2xl sticky top-0 shrink-0">
          <div className="flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-[0_0_10px_#10B981]"></span>
             <span className="text-[9px] uppercase tracking-[0.4em] text-[#111111]/50 font-black font-mono">
               Network Online
             </span>
          </div>
          
          <div className="flex items-center gap-6">
            <NotificationBell />
            <div 
              className="w-10 h-10 rounded-full overflow-hidden border border-[#111111]/10 bg-white shrink-0 shadow-sm cursor-pointer hover:shadow-md hover:scale-105 transition-all" 
              onClick={() => navigate('/profile')}
              title="Access Profile"
            >
               <img src={loggedInUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} className="w-full h-full object-cover" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 relative z-20 w-full pb-32">
          
          {/* 🔥 MASSIVE TYPOGRAPHY INTRO */}
          <div className="pt-24 pb-20 px-10 lg:px-16 border-b border-[#111111]/5 overflow-hidden">
              <div className="overflow-hidden">
                 <h1 className="hero-title text-[11vw] md:text-[9vw] leading-[0.8] font-black uppercase tracking-tighter text-[#111111] m-0 opacity-90">
                    {activeTab === 'dashboard' ? 'SYSTEM' : activeTab === 'users' ? 'NETWORK' : 'GLOBAL'}
                 </h1>
              </div>
              <div className="overflow-hidden">
                 <h1 className="hero-title text-[12vw] md:text-[10vw] leading-[0.8] font-serif italic tracking-tighter text-[#111111]/20 m-0 pr-4">
                    {activeTab === 'dashboard' ? 'Telemetry.' : activeTab === 'users' ? 'Identities.' : 'Feed.'}
                 </h1>
              </div>
          </div>
          
          {/* 🔥 1. TELEMETRY DASHBOARD 🔥 */}
          {activeTab === 'dashboard' && (
            <div className="p-8 lg:p-16 max-w-[1800px] mx-auto w-full flex flex-col gap-10 lg:gap-16">
              
              {/* CRITICAL STATS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">
                
                {/* Users Card (Neutral Black) */}
                <div className="stagger-card bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 hover:border-[#111111]/20 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono relative z-10 flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#111111]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path></svg>
                    Network Nodes
                  </span>
                  <span className="text-6xl md:text-7xl font-serif italic text-[#111111] mt-10 transition-colors duration-500 relative z-10">{stats.totalUsers}</span>
                </div>

                {/* Drops Card (Neutral Black) */}
                <div className="stagger-card bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 hover:border-[#111111]/20 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono relative z-10 flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#111111]"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line></svg>
                    Global Assets
                  </span>
                  <span className="text-6xl md:text-7xl font-serif italic text-[#111111] mt-10 transition-colors duration-500 relative z-10">{stats.totalDrops}</span>
                </div>
                
                {/* Server Health Card (Blue) */}
                <div className="stagger-card bg-white p-10 rounded-[2.5rem] border border-[#111111]/5 hover:border-[#2563EB]/30 shadow-[0_20px_40px_rgba(0,0,0,0.03)] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#2563EB]/5 blur-[40px] rounded-full group-hover:bg-[#2563EB]/10 transition-colors"></div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono relative z-10 group-hover:text-[#2563EB] transition-colors flex items-center gap-3">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    Core Uptime
                  </span>
                  <div className="relative z-10 mt-10">
                    <span className="text-5xl md:text-6xl font-serif italic text-[#2563EB] block leading-none">99.9%</span>
                    <div className="w-full bg-[#F4F5F7] h-1.5 rounded-full mt-6 overflow-hidden shadow-inner">
                       <div className="bg-[#2563EB] h-full w-[99.9%] rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* System Status Card (Green) */}
                <div className="stagger-card bg-white p-10 rounded-[2.5rem] border border-[#10B981]/20 hover:border-[#10B981]/50 shadow-[0_10px_30px_rgba(16,185,129,0.05)] flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#10B981]/5 blur-[50px] rounded-full group-hover:bg-[#10B981]/10 transition-colors"></div>
                   <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono flex items-center gap-3 relative z-10">
                     <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shadow-[0_0_8px_#10B981]"></span> Status
                   </span>
                   <span className="text-3xl md:text-4xl font-mono font-black uppercase text-[#10B981] mt-10 tracking-widest relative z-10">NOMINAL</span>
                </div>
              </div>

              {/* SECOND ROW - BREAKDOWN & LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Breakdown (Gold, Red, Green) */}
                <div className="stagger-card bg-white p-10 lg:p-12 rounded-[3rem] border border-[#111111]/5 shadow-[0_20px_50px_rgba(0,0,0,0.03)] flex flex-col col-span-1 lg:col-span-2 h-full relative overflow-hidden group">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono mb-10 border-b border-[#111111]/5 pb-6 relative z-10">Ecosystem Breakdown</span>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-around mt-auto pb-4 relative z-10 gap-10 sm:gap-0">
                    <div className="text-center group/item cursor-default hover:-translate-y-2 transition-transform duration-500">
                      <span className="block text-6xl md:text-7xl font-serif italic text-[#111111] mb-4 group-hover/item:text-[#D4AF37] transition-colors">{stats.breakdown.producers}</span>
                      <span className="text-[9px] text-[#111111]/40 uppercase font-black font-mono tracking-[0.4em]">Producers</span>
                    </div>
                    <div className="w-full sm:w-[1px] h-[1px] sm:h-20 bg-[#111111]/10"></div>
                    <div className="text-center group/item cursor-default hover:-translate-y-2 transition-transform duration-500">
                      <span className="block text-6xl md:text-7xl font-serif italic text-[#111111] mb-4 group-hover/item:text-[#E63946] transition-colors">{stats.breakdown.rappers}</span>
                      <span className="text-[9px] text-[#111111]/40 uppercase font-black font-mono tracking-[0.4em]">Rappers</span>
                    </div>
                    <div className="w-full sm:w-[1px] h-[1px] sm:h-20 bg-[#111111]/10"></div>
                    <div className="text-center group/item cursor-default hover:-translate-y-2 transition-transform duration-500">
                      <span className="block text-6xl md:text-7xl font-serif italic text-[#111111] mb-4 group-hover/item:text-[#10B981] transition-colors">{stats.breakdown.lyricists}</span>
                      <span className="text-[9px] text-[#111111]/40 uppercase font-black font-mono tracking-[0.4em]">Lyricists</span>
                    </div>
                  </div>
                </div>

                {/* CLEAN WHITE TERMINAL LOGS */}
                <div className="stagger-card bg-[#F9F9FB] p-10 rounded-[3rem] border border-[#111111]/5 shadow-inner font-mono relative overflow-hidden flex flex-col h-full min-h-[350px]">
                  
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/40 font-black mb-8 flex items-center gap-3 relative z-10">
                     <span className="w-2 h-2 bg-[#2563EB] rounded-full animate-pulse shadow-[0_0_8px_#2563EB]"></span> Live Telemetry
                  </span>
                  
                  <div className="flex flex-col gap-4 text-[11px] leading-relaxed text-[#111111]/50 h-full justify-end relative z-10 tracking-[0.2em]">
                    <p className="opacity-40">&gt; Authenticating Access...</p>
                    <p className="opacity-60">&gt; Fetching {stats.totalUsers} identities...</p>
                    <p className="opacity-80">&gt; Syncing distributed ledgers...</p>
                    <p className="text-[#10B981] font-bold mt-2">&gt; CONNECTION ESTABLISHED.<span className="animate-pulse">_</span></p>
                    <div className="mt-6 pt-6 border-t border-[#111111]/10 text-[9px] text-[#111111]/30">
                      SYS_TIME: {new Date().toISOString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 🔥 2. IDENTITIES MATRIX (USERS TABLE) 🔥 */}
          {activeTab === 'users' && (
            <div className="p-8 lg:p-16 max-w-[1800px] mx-auto w-full stagger-card">
              <div className="bg-white rounded-[3rem] border border-[#111111]/5 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.03)]">
                
                {/* Table Header */}
                <div className="p-8 md:p-12 border-b border-[#111111]/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-[#F9F9FB] gap-6">
                  <div>
                     <h3 className="text-3xl md:text-4xl font-serif italic text-[#111111] tracking-tight">Network Ledger</h3>
                     <p className="text-[10px] font-mono text-[#111111]/40 uppercase tracking-[0.3em] mt-2 font-black">All registered identities</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-[#2563EB] font-black px-6 py-3 bg-[#2563EB]/10 rounded-full border border-[#2563EB]/20 shadow-sm">
                    {users.length} Nodes Active
                  </span>
                </div>
                
                {/* Table Body */}
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-[#111111]/5 text-[9px] uppercase tracking-[0.4em] text-[#111111]/40 bg-white">
                        <th className="p-8 lg:p-10 font-black">Identity</th>
                        <th className="p-8 lg:p-10 font-black">Designation</th>
                        <th className="p-8 lg:p-10 font-black">Onboarded</th>
                        <th className="p-8 lg:p-10 font-black text-right">Directives</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => {
                        // Role Badge Colors
                        const roleColors: any = {
                          admin: 'bg-[#111111]/10 text-[#111111] border-[#111111]/20',
                          rapper: 'bg-[#E63946]/10 text-[#E63946] border-[#E63946]/20',
                          producer: 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20',
                          lyricist: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20',
                          listener: 'bg-[#2563EB]/10 text-[#2563EB] border-[#2563EB]/20'
                        };
                        const badgeStyle = roleColors[u.role] || roleColors['listener'];

                        return (
                        <tr key={u._id} className="border-b border-[#111111]/5 hover:bg-[#F9F9FB] transition-colors group">
                          
                          <td className="p-8 lg:p-10 flex items-center gap-6 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                            <div className="w-14 h-14 rounded-2xl border border-[#111111]/10 overflow-hidden shadow-sm bg-[#F4F5F7]">
                               <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="DP" />
                            </div>
                            <div>
                              <p className="font-serif italic text-[#111111] text-xl md:text-2xl group-hover:text-[#2563EB] transition-colors tracking-tight">{u.username}</p>
                              <p className="text-[10px] text-[#111111]/40 font-mono mt-1 tracking-widest">{u.email}</p>
                            </div>
                          </td>
                          
                          <td className="p-8 lg:p-10">
                            <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.3em] border ${badgeStyle}`}>
                              {u.role}
                            </span>
                          </td>
                          
                          <td className="p-8 lg:p-10 text-[11px] text-[#111111]/50 font-mono tracking-widest font-bold">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          
                          <td className="p-8 lg:p-10 text-right">
                            <div className="flex gap-4 justify-end opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                                
                                {/* Premium Verify Button (Gold) */}
                                <button 
                                  onClick={() => handleVerify(u._id)}
                                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-[9px] uppercase font-black tracking-[0.2em] transition-all duration-300 shadow-sm border active:scale-95 ${u.isVerified ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-[0_10px_20px_rgba(212,175,55,0.3)]' : 'bg-white border-[#111111]/10 text-[#111111]/50 hover:border-[#D4AF37] hover:text-[#D4AF37]'}`}
                                >
                                  {u.isVerified ? (
                                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg> Verified</>
                                  ) : (
                                    <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Verify</>
                                  )}
                                </button>
                                
                                {/* Premium Ban Button (Red) */}
                                {u.role !== 'admin' && (
                                  <button 
                                    onClick={() => handleBan(u._id, u.username)}
                                    className="flex items-center gap-2 px-6 py-3 bg-white border border-[#E63946]/30 text-[#E63946] hover:bg-[#E63946] hover:text-white hover:shadow-[0_10px_20px_rgba(230,57,70,0.2)] rounded-full text-[9px] uppercase font-black tracking-[0.2em] transition-all duration-300 active:scale-95"
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> Purge
                                  </button>
                                )}
                            </div>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 3. CONTENT MODERATION (Global Feed) 🔥 */}
          {activeTab === 'content' && (
            <div className="w-full stagger-card p-8 lg:p-16 max-w-[1800px] mx-auto">
               <GlobalFeed />
            </div>
          )}

        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.3); }
      `}</style>
    </div>
  );
}