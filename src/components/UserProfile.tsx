import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
import EditProfileModal from './EditProfileModal'; 

export default function UserProfile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const currentUserId = loggedInUser.id || loggedInUser._id;
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlayPause, progress, seek } = useAudio();

  useEffect(() => {
    const targetId = id || currentUserId;
    if (!targetId) {
      navigate('/roles');
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`http://localhost:5000/api/users/${targetId}`);
        setProfileUser(userRes.data);
        
        if (userRes.data.followers?.includes(currentUserId)) {
          setIsFollowing(true);
        }

        const postsRes = await axios.get(`http://localhost:5000/api/feed/user/${targetId}`);
        setUserPosts(postsRes.data);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id, navigate, currentUserId]);

  const handleFollowToggle = async () => {
    try {
      await axios.post(`http://localhost:5000/api/users/${profileUser._id}/follow`, {}, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      setIsFollowing(!isFollowing);
      setProfileUser((prev: any) => ({
        ...prev,
        followers: isFollowing 
          ? prev.followers.filter((fId: string) => fId !== currentUserId)
          : [...(prev.followers || []), currentUserId]
      }));
    } catch (error) {
      console.error("Error following user", error);
    }
  };

  const handlePlayClick = (post: any) => {
    if (currentTrack?._id === post._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: post._id,
        title: post.title,
        contentUrl: post.contentUrl || post.audioUrl,
        creatorName: profileUser.username,
        creatorRole: profileUser.role,
        creatorId: profileUser._id,
        coverImage: profileUser.profileImage
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) seek(Number(e.target.value));
  };

  // 🔥 NEW: LOGOUT FUNCTIONALITY 🔥
  const handleLogout = () => {
    if(isPlaying) togglePlayPause(); // Stop music if playing
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles'); // Redirect to identity selection
  };

  // 🎬 CINEMATIC PRELOADER
  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none"></div>
        <div className="w-16 h-16 border border-white/10 border-t-[#F0F0EB] rounded-full animate-spin z-10"></div>
        <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-[#888888] mt-6 animate-pulse">Decrypting Identity...</span>
      </div>
    );
  }

  // 🎬 404 STATE
  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center relative overflow-hidden select-none">
         <span className="text-[5rem] opacity-20 mb-6 grayscale">👤</span>
         <span className="text-2xl font-serif italic text-[#F0F0EB]">Entity Not Found</span>
         <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#888888] mt-2">The requested signal does not exist in the network.</span>
         <button onClick={() => navigate(-1)} className="mt-8 px-6 py-2 border border-white/10 text-[#888888] hover:text-white rounded-full text-[9px] uppercase tracking-widest transition-all">Go Back</button>
      </div>
    );
  }

  const isMe = currentUserId === profileUser._id;
  const isAdminProfile = profileUser.role === 'admin';

  // 🔥 DYNAMIC PREMIUM THEME MAPPER 🔥
  const getTheme = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return { hex: '#E63946', shadow: 'rgba(230,57,70,0.3)', bg: 'bg-[#E63946]', border: 'border-[#E63946]' };
    if (r === 'lyricist') return { hex: '#52B788', shadow: 'rgba(82,183,136,0.3)', bg: 'bg-[#52B788]', border: 'border-[#52B788]' };
    if (r === 'producer') return { hex: '#D4AF37', shadow: 'rgba(212,175,55,0.3)', bg: 'bg-[#D4AF37]', border: 'border-[#D4AF37]' };
    return { hex: '#8ECAE6', shadow: 'rgba(142,202,230,0.3)', bg: 'bg-[#8ECAE6]', border: 'border-[#8ECAE6]' }; // Default Listener
  };

  const theme = getTheme(profileUser.role);
  const avatarSrc = profileUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser._id}&backgroundColor=transparent`;

  // ==========================================
  // 💀 1. THE GOD MODE PROFILE (For Admin) 💀
  // ==========================================
  if (isAdminProfile) {
    return (
      <div className="min-h-screen bg-[#030305] text-[#F0F0EB] overflow-y-auto custom-scrollbar relative select-none">
        <div className="relative h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#9B2226]/20 to-[#030305] z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#9B2226]/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{animationDuration: '4s'}}></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-screen pointer-events-none z-0"></div>
          
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-[#010101]/60 backdrop-blur-md border border-[#9B2226]/30 text-[#9B2226] rounded-full flex items-center justify-center hover:bg-[#9B2226] hover:text-black transition-all shadow-[0_0_20px_rgba(155,34,38,0.4)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto px-8 relative z-10 -mt-28 pb-32">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div className="flex items-end gap-10">
              <div className="w-48 h-48 rounded-[2rem] bg-[#010101] border border-[#9B2226]/50 shadow-[0_0_60px_rgba(155,34,38,0.3)] flex items-center justify-center relative overflow-hidden group">
                 <span className="text-[5rem] group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_20px_#9B2226]">👁️</span>
              </div>
              <div className="pb-4">
                <h1 className="text-6xl md:text-7xl font-serif italic text-[#9B2226] tracking-tighter drop-shadow-[0_0_20px_rgba(155,34,38,0.5)] leading-none">{profileUser.username}</h1>
                <div className="flex items-center gap-4 mt-6">
                  <span className="px-5 py-2 bg-[#9B2226]/10 border border-[#9B2226]/50 text-[#9B2226] text-[9px] font-black uppercase tracking-[0.4em] rounded-full shadow-[0_0_15px_rgba(155,34,38,0.2)] animate-pulse">
                    System Overlord
                  </span>
                  <span className="text-[#888888] font-mono text-[9px] uppercase tracking-[0.4em]">Omnipresent</span>
                </div>
                <p className="mt-6 text-sm text-[#888888] font-mono max-w-lg leading-relaxed border-l-2 border-[#9B2226]/50 pl-5">
                  "I see everything. I control everything. The network bends to my will."
                </p>
              </div>
            </div>
            
            <div className="pb-4 flex flex-col items-end gap-4">
              <div className="px-8 py-3 rounded-full border border-[#9B2226]/30 text-[#9B2226] font-mono text-[10px] uppercase tracking-widest bg-[#9B2226]/5 cursor-not-allowed">
                Access Level: Maximum
              </div>
              {/* ADMIN LOGOUT */}
              {isMe && (
                <button onClick={handleLogout} className="text-[9px] uppercase font-black tracking-[0.3em] text-[#888888] hover:text-[#9B2226] transition-colors flex items-center gap-2 border-b border-transparent hover:border-[#9B2226] pb-1">
                   Terminate Session <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-16 border-y border-[#9B2226]/20 py-10 bg-[#9B2226]/5 backdrop-blur-sm rounded-[2rem] px-12">
            <div className="flex flex-col gap-2">
               <span className="text-4xl text-[#9B2226] font-serif italic drop-shadow-[0_0_15px_rgba(155,34,38,0.5)]">∞</span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black">Power Level</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-4xl text-[#9B2226] font-serif italic drop-shadow-[0_0_15px_rgba(155,34,38,0.5)]">100%</span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black">System Control</span>
            </div>
            <div className="flex flex-col gap-2">
               <span className="text-4xl text-[#9B2226] font-serif italic drop-shadow-[0_0_15px_rgba(155,34,38,0.5)]">ALL</span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black">Visibility Scope</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 2. NORMAL USER PROFILE (Rapper/Producer/Lyricist) 
  // ==========================================
  return (
    <div className="min-h-screen bg-[#030305] text-[#F0F0EB] overflow-y-auto custom-scrollbar relative select-none">
      
      {/* 🌟 Cinematic Cover Header */}
      <div className="relative h-96 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#030305]/0 via-[#030305]/60 to-[#030305] z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] blur-[150px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: theme.hex }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-[#010101]/60 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black hover:scale-105 transition-all shadow-xl">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>

        {/* 🔥 NEW: DISCONNECT / LOGOUT BUTTON (TOP RIGHT) 🔥 */}
        {isMe && (
           <button 
             onClick={handleLogout} 
             className="absolute top-8 right-8 z-20 px-6 py-3 bg-[#010101]/60 backdrop-blur-md border border-white/5 text-[#888888] rounded-full flex items-center gap-3 hover:border-red-500/50 hover:text-red-500 transition-all shadow-xl group"
           >
              <span className="text-[9px] uppercase font-black tracking-[0.3em]">Disconnect</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
           </button>
        )}
      </div>

      {/* 👤 Profile Identity Section */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-20 -mt-40">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-16">
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left w-full md:w-auto">
            
            {/* 🔥 THE BIG PREMIUM AVATAR 🔥 */}
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-[2.5rem] bg-[#010101] border-[6px] border-[#030305] flex items-center justify-center relative overflow-hidden group shrink-0 transition-transform hover:scale-105 duration-700" style={{ boxShadow: `0 30px 60px ${theme.shadow}` }}>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
               <img 
                 src={avatarSrc} 
                 alt={profileUser.username} 
                 className="w-full h-full object-cover p-2 scale-110 grayscale group-hover:grayscale-0 transition-all duration-700" 
               />
               <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none z-20"></div>
            </div>

            <div className="pb-4 animate-in slide-in-from-bottom-8 duration-700">
              {/* 🔥 NAME + VERIFIED BADGE 🔥 */}
              <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                <h1 className="text-5xl md:text-7xl font-serif italic text-[#F0F0EB] tracking-tighter drop-shadow-2xl">
                  {profileUser.username}
                </h1>
                {profileUser.isVerified && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)]" title="Verified Artist">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
                <span 
                  className="px-5 py-2 text-[9px] font-black uppercase tracking-[0.4em] rounded-full border shadow-inner"
                  style={{ color: theme.hex, borderColor: `${theme.hex}50`, backgroundColor: `${theme.hex}10` }}
                >
                  {profileUser.role}
                </span>
                <span className="text-[#888888] font-mono text-[9px] uppercase tracking-[0.3em]">
                  Joined {new Date(profileUser.createdAt).getFullYear()}
                </span>
              </div>
              
              {profileUser.bio && (
                <p className="mt-6 text-sm text-[#888888] font-light max-w-lg leading-relaxed italic border-l-2 pl-5" style={{ borderColor: `${theme.hex}50` }}>
                  "{profileUser.bio}"
                </p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS (Follow / Edit) */}
          <div className="pb-4 w-full md:w-auto flex justify-center md:justify-end animate-in slide-in-from-right-8 duration-700">
            {!isMe && (
              <button 
                onClick={handleFollowToggle}
                className="px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 shadow-xl active:scale-95 w-full md:w-auto"
                style={isFollowing 
                  ? { backgroundColor: 'transparent', color: '#888888', border: '1px solid rgba(255,255,255,0.1)' } 
                  : { backgroundColor: '#F0F0EB', color: '#000', boxShadow: `0 10px 30px ${theme.shadow}` }
                }
              >
                {isFollowing ? 'Following' : 'Follow Signal'}
              </button>
            )}
            {isMe && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-10 py-4 bg-[#010101] border border-white/10 text-[#F0F0EB] rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500 hover:scale-105 active:scale-95 shadow-xl w-full md:w-auto"
              >
                Edit Identity
              </button>
            )}
          </div>
        </div>

        {/* 📊 Stats Strip */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-12 md:gap-24 border-y border-white/5 py-10 mb-20 bg-[#010101]/50 backdrop-blur-md rounded-[2rem] px-12">
          <div className="flex flex-col gap-2 items-center md:items-start">
             <span className="text-4xl md:text-5xl font-serif italic text-[#F0F0EB] drop-shadow-md">{profileUser.followers?.length || 0}</span>
             <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black">Followers</span>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
             <span className="text-4xl md:text-5xl font-serif italic text-[#F0F0EB] drop-shadow-md">{profileUser.following?.length || 0}</span>
             <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black">Following</span>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
             <span className="text-4xl md:text-5xl font-serif italic text-[#F0F0EB] drop-shadow-md">{userPosts.length}</span>
             <span className="text-[9px] uppercase tracking-[0.3em] text-[#888888] font-black">Total Assets</span>
          </div>
        </div>

        {/* 🎵 Artist's Portfolio / Drops (The Catalog) */}
        <div className="pb-32">
          <div className="flex items-center gap-6 mb-12">
             <h3 className="text-3xl md:text-4xl font-serif italic text-[#F0F0EB]">The Catalog<span style={{ color: theme.hex }}>.</span></h3>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
          </div>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-32 border border-dashed border-white/10 rounded-[2rem] bg-[#010101]">
               <span className="text-[3rem] opacity-20 block mb-4 grayscale">📭</span>
               <p className="text-[#888888] font-mono text-[10px] uppercase tracking-[0.4em]">No assets transmitted to the global network yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {userPosts.map((post, index) => {
                const isThisPlaying = currentTrack?._id === post._id;

                return (
                  <div 
                    key={post._id} 
                    className="group bg-[#010101] border transition-all duration-700 p-8 md:p-10 rounded-[2rem] flex flex-col justify-between relative overflow-hidden hover:-translate-y-1"
                    style={{
                       borderColor: isThisPlaying ? `${theme.hex}80` : 'rgba(255,255,255,0.05)',
                       boxShadow: isThisPlaying ? `0 20px 50px ${theme.shadow}` : 'none'
                    }}
                  >
                    {/* Background Subtle Glow on Play */}
                    <div className={`absolute top-0 right-0 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 ${isThisPlaying ? 'opacity-20' : 'opacity-0'}`} style={{ backgroundColor: theme.hex }}></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <h4 className="text-2xl md:text-3xl font-serif italic text-[#F0F0EB] transition-colors pr-4 truncate" style={{ color: isThisPlaying ? theme.hex : '#F0F0EB' }}>{post.title}</h4>
                      <span className="text-[8px] uppercase tracking-[0.3em] font-black text-[#888888] bg-white/5 px-3 py-1.5 rounded-md border border-white/5 shrink-0">{post.genre}</span>
                    </div>
                    
                    <p className="text-sm text-[#888888] font-light line-clamp-2 mb-10 h-10 leading-relaxed relative z-10">{post.description}</p>

                    {/* ✨ AUDIO PLAYER WITH SCRUBBER ✨ */}
                    {post.contentUrl && (
                      <div onClick={(e) => e.stopPropagation()} className="mb-8 rounded-2xl p-5 border flex flex-col gap-4 relative z-10 transition-colors duration-500" style={{ backgroundColor: isThisPlaying ? `${theme.hex}10` : 'rgba(0,0,0,0.4)', borderColor: isThisPlaying ? `${theme.hex}40` : 'rgba(255,255,255,0.05)' }}>
                         <div className="flex items-center gap-5">
                           
                           {/* SVGs instead of Emojis for Play */}
                           <button 
                             onClick={() => handlePlayClick(post)} 
                             className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 shadow-lg active:scale-95"
                             style={{ 
                                backgroundColor: isThisPlaying && isPlaying ? theme.hex : '#F0F0EB', 
                                color: '#010101',
                                boxShadow: isThisPlaying && isPlaying ? `0 0 20px ${theme.shadow}` : 'none'
                             }}
                           >
                             {isThisPlaying && isPlaying ? (
                               <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                             ) : (
                               <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                             )}
                           </button>
                           
                           <span className="text-[9px] uppercase tracking-[0.4em] font-black" style={{ color: isThisPlaying && isPlaying ? theme.hex : '#888888' }}>
                             {isThisPlaying && isPlaying ? 'Transmitting...' : 'Preview Audio'}
                           </span>
                         </div>
                         
                         {/* Scrubber Bar */}
                         {isThisPlaying && (
                           <div className="flex items-center gap-3 w-full px-1 mt-1 z-10 animate-in fade-in">
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={progress || 0} 
                                onChange={handleSeek}
                                className="w-full h-1 bg-black/50 rounded-lg appearance-none cursor-pointer hover:h-1.5 transition-all"
                                style={{ accentColor: theme.hex }}
                              />
                           </div>
                         )}
                      </div>
                    )}

                    {post.lyricsText && (
                      <div className="border-l-2 p-6 rounded-2xl rounded-l-none mb-8 max-h-36 overflow-hidden relative group/lyrics transition-colors bg-[#010101]" style={{ borderColor: `${theme.hex}40` }}>
                         <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#010101] to-transparent pointer-events-none"></div>
                         <p className="text-xs font-serif italic text-[#888888] whitespace-pre-wrap leading-loose">"{post.lyricsText}"</p>
                      </div>
                    )}

                    <div className="flex gap-8 text-[10px] font-mono text-[#888888] pt-6 border-t border-white/5 mt-auto uppercase tracking-widest relative z-10">
                      <span className="flex items-center gap-2 group-hover:text-red-500 transition-colors cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> {post.likes?.length || 0}</span>
                      <span className="flex items-center gap-2 group-hover:text-[#F0F0EB] transition-colors cursor-pointer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> {post.comments?.length || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🔥 THE EDIT PROFILE MODAL MOUNT 🔥 */}
      {showEditModal && (
        <EditProfileModal 
          user={profileUser}
          onClose={() => setShowEditModal(false)}
          onSuccess={(updatedUser: any) => {
            setProfileUser(updatedUser); 
            setShowEditModal(false);     
            const currentSession = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
            currentSession.profileImage = updatedUser.profileImage;
            sessionStorage.setItem('beatflow_user', JSON.stringify(currentSession));
            window.location.reload(); 
          }}
        />
      )}
    </div>
  );
}