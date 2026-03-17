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
      setStats({ ...stats, totalUsers: stats.totalUsers - 1 }); 
      alert(`${username} has been eradicated from the network. 🚫`);
    } catch (err) {
      alert("Error banning user.");
    }
  };

  if (!stats) return <div className="h-screen w-full bg-[#020202] flex items-center justify-center"><div className="w-12 h-12 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    // 🔥 FIX 1: overflow-hidden hataya, min-h-screen aur relative lagaya for window scroll
    <div className="flex min-h-screen bg-[#020202] text-white font-sans relative select-none">
      
      {/* 🔴 RED AMBIENT GLOW FOR ADMIN 🔴 */}
      <div className="fixed top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-red-600/10 blur-[200px] rounded-full pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none mix-blend-screen z-0"></div>

      {/* --- ADMIN SIDEBAR --- */}
      {/* 🔥 FIX 2: sticky top-0 h-screen lagaya */}
      <aside className="w-64 sticky top-0 h-screen border-r border-white/5 bg-[#050505]/80 backdrop-blur-2xl flex flex-col z-50 shadow-[20px_0_50px_rgba(0,0,0,0.8)]">
        <div className="p-8 border-b border-white/5 flex flex-col gap-2 cursor-pointer group" onClick={() => navigate('/profile')}>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.4)] mb-4 group-hover:scale-110 group-hover:shadow-[0_0_40px_rgba(220,38,38,0.6)] transition-all duration-500">
             <span className="font-black text-white text-2xl">👁️</span>
          </div>
          <h1 className="text-2xl font-serif italic text-white tracking-tight group-hover:text-red-400 transition-colors">God Mode</h1>
          <p className="text-[9px] uppercase tracking-[0.4em] text-red-500 font-black animate-pulse mt-1">System Override</p>
        </div>
        
        <nav className="flex flex-col gap-3 p-6 mt-4">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'dashboard' ? 'bg-red-600/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.15)] scale-105' : 'hover:bg-white/5 text-neutral-500 hover:text-white border border-transparent'}`}>
            <span className="text-xl">📊</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'users' ? 'bg-red-600/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.15)] scale-105' : 'hover:bg-white/5 text-neutral-500 hover:text-white border border-transparent'}`}>
             <span className="text-xl">👥</span>
             <span className="text-[10px] font-black uppercase tracking-widest">Users Matrix</span>
          </button>
          <button onClick={() => setActiveTab('content')} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 ${activeTab === 'content' ? 'bg-red-600/10 border border-red-500/30 text-red-400 shadow-[0_0_20px_rgba(220,38,38,0.15)] scale-105' : 'hover:bg-white/5 text-neutral-500 hover:text-white border border-transparent'}`}>
             <span className="text-xl">🌍</span>
             <span className="text-[10px] font-black uppercase tracking-widest">Global Feed</span>
          </button>
        </nav>

        <div className="mt-auto p-6">
          <button onClick={() => { sessionStorage.removeItem('beatflow_user'); navigate('/'); }} className="w-full py-4 border border-white/10 rounded-2xl text-[10px] uppercase font-black tracking-widest text-neutral-500 hover:bg-red-600 hover:text-white hover:border-red-600 shadow-xl hover:shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all duration-300">
            Lock System 🔒
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      {/* 🔥 FIX 3: overflow-y-auto hataya, relative z-10 lagaya */}
      <div className="flex-1 flex flex-col relative z-10 min-h-screen">
        
        {/* 🔥 FIX 4: Header ko sticky top-0 rakha */}
        <header className="h-24 px-12 flex items-center justify-between z-40 border-b border-white/5 bg-[#020202]/80 backdrop-blur-3xl sticky top-0">
          <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <h2 className="text-3xl font-serif italic text-white/90 tracking-tight">
               {activeTab === 'dashboard' ? 'Network Telemetry' : activeTab === 'users' ? 'User Management' : 'Content Moderation'}
            </h2>
          </div>
          <div className="flex items-center gap-4 px-5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-full cursor-pointer hover:bg-red-500/20 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.1)]" onClick={() => navigate('/profile')}>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(220,38,38,1)]"></span>
            <span className="text-[9px] uppercase tracking-widest font-black text-red-400">Admin Session Active</span>
          </div>
        </header>

        {/* 🔥 FIX 5: Main wrapper ko pb-32 diya aur full width render hone diya */}
        <main className="flex-1 relative z-20 p-8 lg:p-12 max-w-[1600px] mx-auto w-full pb-32">
          
          {/* 🔥 OVERVIEW DASHBOARD 🔥 */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in zoom-in-95 duration-700 flex flex-col gap-10">
              
              {/* TOP STRIP - CRITICAL STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="bg-[#080808]/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-white/10 shadow-2xl flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group">
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black group-hover:text-white transition-colors">Total Network Users</span>
                  <span className="text-6xl md:text-7xl font-serif italic text-white mt-6 drop-shadow-lg">{stats.totalUsers}</span>
                </div>

                <div className="bg-[#080808]/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-emerald-500/30 shadow-2xl flex flex-col justify-between relative overflow-hidden hover:-translate-y-2 transition-all duration-500 group">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 blur-[50px] rounded-full group-hover:bg-emerald-500/20 transition-colors"></div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black group-hover:text-emerald-400 transition-colors relative z-10">Total Drops (Content)</span>
                  <span className="text-6xl md:text-7xl font-serif italic text-emerald-400 mt-6 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] relative z-10">{stats.totalDrops}</span>
                </div>
                
                {/* SERVER HEALTH */}
                <div className="bg-[#080808]/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 shadow-2xl flex flex-col justify-between hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/20 transition-colors"></div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black group-hover:text-blue-400 transition-colors relative z-10">Server Uptime</span>
                  <div className="relative z-10">
                    <span className="text-5xl md:text-6xl font-serif italic text-blue-400 mt-6 block drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">99.9%</span>
                    <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
                       <div className="bg-blue-500 h-full w-[99.9%] rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)] relative">
                          <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/50 blur-sm animate-[translateX_2s_infinite]"></div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#080808]/90 backdrop-blur-xl p-8 rounded-[2rem] border border-red-500/20 hover:border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.1)] flex flex-col justify-between relative overflow-hidden hover:-translate-y-2 transition-all duration-500 group">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 blur-[50px] rounded-full animate-pulse group-hover:bg-red-600/20"></div>
                   <span className="text-[10px] uppercase tracking-widest text-red-500 font-black flex items-center gap-2 relative z-10">
                     <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Network Status
                   </span>
                   <span className="text-4xl font-black uppercase text-white mt-6 tracking-tighter relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">NOMINAL</span>
                </div>
              </div>

              {/* SECOND ROW - BREAKDOWN & LOGS */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Breakdown */}
                <div className="bg-[#080808]/90 backdrop-blur-xl p-10 rounded-[2rem] border border-white/5 shadow-2xl flex flex-col col-span-1 lg:col-span-2 h-full relative overflow-hidden group hover:border-white/10 transition-colors">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
                  <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-black mb-10 border-b border-white/5 pb-5 relative z-10">Ecosystem Breakdown</span>
                  
                  <div className="flex items-center justify-around mt-auto pb-6 relative z-10">
                    <div className="text-center group/item cursor-pointer">
                      <span className="block text-6xl md:text-7xl font-serif italic text-blue-400 mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] group-hover/item:scale-110 transition-transform duration-500">{stats.breakdown.producers}</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest border border-blue-500/30 px-4 py-1.5 rounded-full bg-blue-500/5 group-hover/item:bg-blue-500/20 group-hover/item:text-white transition-all">Producers</span>
                    </div>
                    <div className="text-center group/item cursor-pointer">
                      <span className="block text-6xl md:text-7xl font-serif italic text-purple-400 mb-4 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] group-hover/item:scale-110 transition-transform duration-500">{stats.breakdown.rappers}</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest border border-purple-500/30 px-4 py-1.5 rounded-full bg-purple-500/5 group-hover/item:bg-purple-500/20 group-hover/item:text-white transition-all">Rappers</span>
                    </div>
                    <div className="text-center group/item cursor-pointer">
                      <span className="block text-6xl md:text-7xl font-serif italic text-emerald-400 mb-4 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover/item:scale-110 transition-transform duration-500">{stats.breakdown.lyricists}</span>
                      <span className="text-[10px] text-neutral-400 uppercase font-black tracking-widest border border-emerald-500/30 px-4 py-1.5 rounded-full bg-emerald-500/5 group-hover/item:bg-emerald-500/20 group-hover/item:text-white transition-all">Lyricists</span>
                    </div>
                  </div>
                </div>

                {/* TERMINAL LOGS */}
                <div className="bg-black/80 backdrop-blur-xl p-8 rounded-[2rem] border border-green-500/20 shadow-[0_0_30px_rgba(0,255,0,0.05)] font-mono relative overflow-hidden flex flex-col h-full min-h-[350px]">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none"></div>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
                  
                  <span className="text-[10px] uppercase tracking-[0.4em] text-green-500 font-black mb-8 flex items-center gap-3 relative z-10">
                     <span className="w-2 h-2 bg-green-500 rounded-sm animate-pulse shadow-[0_0_10px_#22c55e]"></span> Terminal Logs
                  </span>
                  
                  <div className="flex flex-col gap-4 text-[11px] leading-relaxed text-green-400/80 h-full justify-end relative z-10">
                    <p className="opacity-50"> Initializing God Mode Protocol...</p>
                    <p className="opacity-60"> Fetching {stats.totalUsers} encrypted identities...</p>
                    <p className="opacity-70"> Syncing global audio packets...</p>
                    <p className="opacity-80"> Connecting to MongoDB Clusters...</p>
                    <p className="text-green-400 font-bold drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]">⚡ CONNECTION ESTABLISHED.</p>
                    <div className="mt-4 pt-4 border-t border-green-500/20 text-[9px] text-green-500/50">
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
              <div className="bg-[#080808]/90 backdrop-blur-xl rounded-[2rem] border border-white/5 overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-b from-white/[0.02] to-transparent">
                  <h3 className="text-2xl font-serif italic text-white">Network Database</h3>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-black px-4 py-2 bg-white/5 rounded-full border border-white/10">{users.length} Registered</span>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-neutral-500 bg-black/40">
                        <th className="p-8 font-black">Identity</th>
                        <th className="p-8 font-black">Role</th>
                        <th className="p-8 font-black">Joined</th>
                        <th className="p-8 font-black text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">
                          <td className="p-8 flex items-center gap-5 cursor-pointer" onClick={() => navigate(`/profile/${u._id}`)}>
                            <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden shadow-lg group-hover:border-blue-500/50 transition-colors">
                               <img src={u.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${u.username}`} className="w-full h-full bg-black object-cover group-hover:scale-110 transition-transform duration-500" alt="DP" />
                            </div>
                            <div>
                              <p className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">{u.username}</p>
                              <p className="text-[10px] text-neutral-600 font-mono mt-1">{u.email}</p>
                            </div>
                          </td>
                          <td className="p-8">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${u.role === 'admin' ? 'bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_10px_rgba(220,38,38,0.2)]' : 'bg-white/5 border-white/10 text-neutral-400 group-hover:border-white/30 transition-colors'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-8 text-xs text-neutral-500 font-mono">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-8 text-right">
                            <div className="flex gap-3 justify-end opacity-40 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleVerify(u._id)}
                                  className={`px-5 py-2.5 rounded-full text-[9px] uppercase font-black tracking-[0.2em] transition-all shadow-lg ${u.isVerified ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white'}`}
                                >
                                  {u.isVerified ? 'Verified ✔️' : 'Verify'}
                                </button>
                                
                                {u.role !== 'admin' && (
                                  <button 
                                    onClick={() => handleBan(u._id, u.username)}
                                    className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-600 hover:text-white rounded-full text-[9px] uppercase font-black tracking-[0.2em] transition-all shadow-lg"
                                  >
                                    Ban 🚫
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

          {/* 🔥 ADMIN GLOBAL FEED 🔥 */}
          {activeTab === 'content' && (
            // 🔥 FIX 6: Fixed height hatayi aur natural flow aane diya taaki scroll ho
            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
               <GlobalFeed />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}