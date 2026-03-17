import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import GlobalFeed from './feed/GlobalFeed'; // 🔥 GLOBAL FEED IMPORT KIYA

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
        
        // Stats aur Users dono fetch karo
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
      
      // UI ko turant update karo
      setUsers(users.map(u => u._id === userId ? { ...u, isVerified: !u.isVerified } : u));
    } catch (err) {
      alert("Error verifying user.");
    }
  };

  // 🔥 BAN FUNCTION
  const handleBan = async (userId: string, username: string) => {
    if (!window.confirm(`⚠️ EXTREME WARNING: Are you sure you want to PERMANENTLY BAN ${username}? This cannot be undone.`)) return;
    
    try {
      const config = { headers: { Authorization: `Bearer ${loggedInUser.token}` } };
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}/ban`, config);
      
      // Banned user ko list se hatao
      setUsers(users.filter(u => u._id !== userId));
      setStats({ ...stats, totalUsers: stats.totalUsers - 1 }); // Stat update
      alert(`${username} has been eradicated from the network. 🚫`);
    } catch (err) {
      alert("Error banning user.");
    }
  };

  if (!stats) return <div className="h-screen w-full bg-[#050505] flex items-center justify-center"><div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex h-screen bg-[#050505] text-white font-sans overflow-hidden select-none">
      
      {/* 🔴 RED AMBIENT GLOW FOR ADMIN 🔴 */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-red-600/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '5s' }}></div>

      {/* --- ADMIN SIDEBAR --- */}
      <aside className="w-64 border-r border-white/5 bg-[#080808]/90 backdrop-blur-xl flex flex-col z-50 shadow-[5px_0_30px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-white/5 flex flex-col gap-2 cursor-pointer group" onClick={() => navigate('/profile')}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-900 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5)] mb-4 group-hover:scale-110 transition-transform">
             <span className="font-black text-white text-xl">👁️</span>
          </div>
          <h1 className="text-xl font-serif italic text-white tracking-tight group-hover:text-red-400 transition-colors">God Mode</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] text-red-500 font-black animate-pulse">System Override</p>
        </div>
        
        <nav className="flex flex-col gap-2 p-4 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-red-600/10 border border-red-500/30 text-red-400' : 'hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
            <span className="text-lg">📊</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'users' ? 'bg-red-600/10 border border-red-500/30 text-red-400' : 'hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
             <span className="text-lg">👥</span>
             <span className="text-[10px] font-black uppercase tracking-widest">Users Matrix</span>
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${activeTab === 'content' ? 'bg-red-600/10 border border-red-500/30 text-red-400' : 'hover:bg-white/5 text-neutral-500 hover:text-white'}`}>
             <span className="text-lg">🌍</span>
             <span className="text-[10px] font-black uppercase tracking-widest">Global Feed</span>
          </button>
        </nav>

        <div className="mt-auto p-4">
          <button onClick={() => { sessionStorage.removeItem('beatflow_user'); navigate('/'); }} className="w-full py-4 border border-white/10 rounded-2xl text-[10px] uppercase font-black tracking-widest text-neutral-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
            Lock System 🔒
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar relative z-10">
        <header className="h-24 px-12 flex items-center justify-between z-20 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0">
          <h2 className="text-2xl font-serif italic text-white/90">
             {activeTab === 'dashboard' ? 'Network Telemetry' : activeTab === 'users' ? 'User Management' : 'Content Moderation'}
          </h2>
          <div className="flex items-center gap-4 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full cursor-pointer hover:bg-red-500/20 transition-colors" onClick={() => navigate('/profile')}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[9px] uppercase tracking-widest font-black text-red-400">Admin Session Active</span>
          </div>
        </header>

        <main className="p-12 max-w-7xl mx-auto w-full">
          
          {/* 🔥 OVERVIEW DASHBOARD (Bhara-Bhara) 🔥 */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-8">
              
              {/* TOP STRIP - CRITICAL STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Total Network Users</span>
                  <span className="text-6xl font-serif italic text-white mt-4">{stats.totalUsers}</span>
                </div>
                <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full"></div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Total Drops (Content)</span>
                  <span className="text-6xl font-serif italic text-emerald-400 mt-4">{stats.totalDrops}</span>
                </div>
                
                {/* NEW: SERVER HEALTH & BANDWIDTH */}
                <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">Server Uptime</span>
                  <div>
                    <span className="text-5xl font-serif italic text-blue-400 mt-4">99.9%</span>
                    <div className="w-full bg-white/5 h-2 rounded-full mt-4 overflow-hidden">
                       <div className="bg-blue-500 h-full w-[99.9%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-red-500/20 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-[40px] rounded-full animate-pulse"></div>
                   <span className="text-[10px] uppercase tracking-widest text-red-500 font-black flex items-center gap-2">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Network Status
                   </span>
                   <span className="text-3xl font-black uppercase text-white mt-4 tracking-tighter">NOMINAL</span>
                </div>
              </div>

              {/* SECOND ROW - BREAKDOWN & LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Breakdown (Expanded) */}
                <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/5 shadow-2xl flex flex-col col-span-1 lg:col-span-2 h-full">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-8 border-b border-white/5 pb-4">Ecosystem Breakdown</span>
                  <div className="flex items-center justify-around mt-auto pb-4">
                    <div className="text-center">
                      <span className="block text-5xl font-serif italic text-blue-400 mb-2 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">{stats.breakdown.producers}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest border border-blue-500/30 px-3 py-1 rounded-full bg-blue-500/5">Producers</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-5xl font-serif italic text-purple-400 mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]">{stats.breakdown.rappers}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest border border-purple-500/30 px-3 py-1 rounded-full bg-purple-500/5">Rappers</span>
                    </div>
                    <div className="text-center">
                      <span className="block text-5xl font-serif italic text-emerald-400 mb-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">{stats.breakdown.lyricists}</span>
                      <span className="text-[10px] text-neutral-500 uppercase font-black tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full bg-emerald-500/5">Lyricists</span>
                    </div>
                  </div>
                </div>

                {/* NEW: LIVE SYSTEM LOGS (Hacker Vibe) */}
                <div className="bg-black p-8 rounded-3xl border border-white/10 shadow-2xl font-mono relative overflow-hidden flex flex-col h-full min-h-[300px]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-green-500 font-black mb-6 flex items-center gap-3">
                     <span className="w-2 h-2 bg-green-500 rounded-sm animate-pulse"></span> Terminal Logs
                  </span>
                  
                  <div className="flex flex-col gap-3 text-xs text-green-400/70 h-full justify-end">
                    <p className="opacity-50"> Initializing God Mode Protocol...</p>
                    <p className="opacity-60"> Fetching {stats.totalUsers} encrypted identities...</p>
                    <p className="opacity-70"> Syncing global audio packets...</p>
                    <p className="opacity-80"> Connecting to MongoDB Clusters...</p>
                    <p className="text-green-400"> ⚡ CONNECTION ESTABLISHED.</p>
                    <div className="mt-4 pt-4 border-t border-green-500/20 text-[10px] text-green-500/50">
                      SYS_TIME: {new Date().toISOString()}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* 🔥 USERS TABLE 🔥 */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-[#0a0a0a] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                  <h3 className="text-xl font-serif italic text-white">Network Database</h3>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">{users.length} Registered</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-widest text-neutral-500 bg-white/[0.01]">
                        <th className="p-6 font-black">Identity</th>
                        <th className="p-6 font-black">Role</th>
                        <th className="p-6 font-black">Joined</th>
                        <th className="p-6 font-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="p-6 flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                            <img src={u.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${u.username}`} className="w-10 h-10 rounded-full bg-black hover:scale-110 transition-transform" />
                            <div>
                              <p className="font-bold text-white text-sm hover:text-blue-400 transition-colors">{u.username}</p>
                              <p className="text-[10px] text-neutral-600 font-mono">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-6">
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-white/5 border-white/10 text-neutral-400'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-6 text-[11px] text-neutral-500 font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* 🔥 ACTIVE VERIFY & BAN BUTTONS 🔥 */}
                            <button 
                              onClick={() => handleVerify(u._id)}
                              className={`px-4 py-2 rounded-lg text-[9px] uppercase font-black tracking-widest transition-all ${u.isVerified ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white'}`}
                            >
                              {u.isVerified ? 'Verified ✔️' : 'Verify'}
                            </button>
                            
                            {u.role !== 'admin' && (
                              <button 
                                onClick={() => handleBan(u._id, u.username)}
                                className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg text-[9px] uppercase font-black tracking-widest transition-all"
                              >
                                Ban 🚫
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 🔥 ADMIN GLOBAL FEED 🔥 */}
          {activeTab === 'content' && (
            <div className="h-[80vh] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-3xl overflow-hidden border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl shadow-2xl">
               <GlobalFeed />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}