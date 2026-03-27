import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
import EditProfileModal from './EditProfileModal'; 

// 🔥 VITE ENV API URL FETCH 🔥
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 🔥 IMAGE URL FIXER (For Live Deployments) 🔥
const getValidImageUrl = (url: string | undefined | null) => {
  if (!url) return '';
  if (url.startsWith('http') || url.includes('cloudinary.com') || url.startsWith('data:image')) {
    return url;
  }
  const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const cleanPath = url.replace(/\\/g, '/').replace(/^\//, ''); 
  return `${baseUrl}/${cleanPath}`;
};

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

  // 🔥 NEW: CINEMATIC VIDEO STATE 🔥
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);

  const { currentTrack, isPlaying, playTrack, togglePlayPause, progress, seek } = useAudio();

  const [expandedLyrics, setExpandedLyrics] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const targetId = id || currentUserId;
    if (!targetId) {
      navigate('/roles');
      return;
    }

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const userRes = await axios.get(`${BACKEND_URL}/api/users/${targetId}`);
        setProfileUser(userRes.data);
        
        if (userRes.data.followers?.includes(currentUserId)) {
          setIsFollowing(true);
        }

        const postsRes = await axios.get(`${BACKEND_URL}/api/feed/user/${targetId}`);
        setUserPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
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
      await axios.post(`${BACKEND_URL}/api/users/${profileUser._id}/follow`, {}, {
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

  const handlePlayClick = (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    
    if (post.videoUrl) {
      setActiveVideoUrl(post.videoUrl);
      if (isPlaying) togglePlayPause(); 
    } else {
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
          coverImage: profileUser.profileImage // Will be fixed in AudioContext if needed
        });
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) seek(Number(e.target.value));
  };

  const handleLike = async (post: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    
    const currentLikes = Array.isArray(post.likes) ? post.likes : [];
    const isLiked = currentLikes.includes(currentUserId);

    setUserPosts(prevPosts => prevPosts.map(p => {
      if (p._id === post._id) {
        let newLikes = [...currentLikes];
        if (isLiked) {
          newLikes = newLikes.filter((id: string) => id !== currentUserId);
        } else {
          newLikes.push(currentUserId);
        }
        return { ...p, likes: newLikes };
      }
      return p;
    }));

    try {
      await axios.post(`${BACKEND_URL}/api/feed/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
    } catch (err) { 
      console.error("Failed to sync like with server:", err); 
    }
  };

  const handleLogout = () => {
    if(isPlaying) togglePlayPause(); 
    sessionStorage.removeItem('beatflow_user');
    navigate('/roles'); 
  };

  const toggleLyrics = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLyrics(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] flex flex-col items-center justify-center relative overflow-hidden select-none">
        <div className="w-16 h-16 border-[2px] border-[#111111]/10 border-t-[#111111] rounded-full animate-spin z-10"></div>
        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#111111]/60 mt-8 font-black">Decrypting Identity...</span>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-[#F4F3EF] flex flex-col items-center justify-center relative overflow-hidden select-none text-[#111111]">
         <span className="text-[5rem] opacity-20 mb-6 grayscale">👤</span>
         <span className="text-4xl font-serif italic">Entity Not Found</span>
         <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#111111]/50 mt-4 font-black">The requested signal does not exist.</span>
         <button onClick={() => navigate(-1)} className="mt-8 px-8 py-3 border border-[#111111]/20 hover:bg-[#111111] hover:text-white rounded-full text-[9px] uppercase tracking-widest font-black transition-all">Return to Base</button>
      </div>
    );
  }

  const isMe = currentUserId === profileUser._id;
  const isAdminProfile = profileUser.role === 'admin';

  const getTheme = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return { hex: '#E63946', shadow: 'rgba(230,57,70,0.2)' };
    if (r === 'lyricist') return { hex: '#10B981', shadow: 'rgba(16,185,129,0.2)' };
    if (r === 'producer') return { hex: '#D4AF37', shadow: 'rgba(212,175,55,0.2)' };
    return { hex: '#2563EB', shadow: 'rgba(37,99,235,0.2)' }; 
  };

  const theme = getTheme(profileUser.role);
  
  // 🔥 FIX 1: AVATAR SOURCE SECURED WITH HELPER 🔥
  const avatarSrc = getValidImageUrl(profileUser.profileImage) || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser._id}&backgroundColor=transparent`;

  // ==========================================
  // 💀 1. THE GOD MODE PROFILE (For Admin)
  // ==========================================
  if (isAdminProfile) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] text-[#F0F0EB] overflow-y-auto custom-scrollbar relative select-none font-sans">
        <div className="relative h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#9B2226]/20 to-[#0A0A0C] z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#9B2226]/10 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{animationDuration: '4s'}}></div>
          
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-white/5 backdrop-blur-md border border-[#9B2226]/30 text-[#9B2226] rounded-full flex items-center justify-center hover:bg-[#9B2226] hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
        </div>

        <div className="max-w-[1400px] mx-auto px-8 relative z-10 -mt-28 pb-32">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div className="flex items-end gap-10">
              <div className="w-48 h-48 rounded-[2rem] bg-[#050505] border border-[#9B2226]/50 shadow-[0_0_60px_rgba(155,34,38,0.3)] flex items-center justify-center relative overflow-hidden group">
                 <span className="text-[5rem] group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_0_20px_#9B2226]">👁️</span>
              </div>
              <div className="pb-4">
                <h1 className="text-6xl md:text-7xl font-serif italic text-[#9B2226] tracking-tighter leading-none">{profileUser.username}</h1>
                <div className="flex items-center gap-4 mt-6">
                  <span className="px-5 py-2 bg-[#9B2226]/10 border border-[#9B2226]/50 text-[#9B2226] text-[9px] font-black uppercase tracking-[0.4em] rounded-full animate-pulse">
                    System Overlord
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pb-4 flex flex-col items-end gap-4">
              {isMe && (
                <button onClick={handleLogout} className="text-[9px] uppercase font-black tracking-[0.3em] text-[#888888] hover:text-[#9B2226] transition-colors flex items-center gap-2 border-b border-transparent hover:border-[#9B2226] pb-1">
                    Terminate Session <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 2. THE EDITORIAL USER PROFILE (Premium Light Mode)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F4F3EF] text-[#111111] overflow-x-hidden overflow-y-auto custom-scrollbar relative select-none font-sans">
      
      {/* 🎬 THE CINEMATIC VIDEO PLAYER OVERLAY 🎬 */}
      {activeVideoUrl && (
        <div className="fixed inset-0 z-[999999] bg-[#050505]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-in fade-in duration-500">
          <button 
            onClick={() => setActiveVideoUrl(null)} 
            className="absolute top-10 right-10 w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all duration-300 z-50 group shadow-md"
          >
             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="w-[90vw] max-w-6xl aspect-video bg-black rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.9)] border border-white/10 relative">
             <video 
               src={activeVideoUrl} 
               controls 
               autoPlay 
               className="w-full h-full object-contain"
             ></video>
          </div>
          <p className="mt-8 text-[10px] font-mono uppercase tracking-[0.4em] text-white/40 font-black animate-pulse">Director's Booth Footage</p>
        </div>
      )}

      {/* 🌟 Cinematic Cover Header */}
      <div className="relative h-80 md:h-96 w-full overflow-hidden bg-white border-b border-[#111111]/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F4F3EF]/60 to-[#F4F3EF] z-10"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] md:w-[70vw] md:h-[70vw] blur-[150px] rounded-full pointer-events-none opacity-[0.12] transition-all duration-1000" style={{ backgroundColor: theme.hex }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-multiply pointer-events-none z-0"></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-white/50 backdrop-blur-md border border-[#111111]/10 text-[#111111] rounded-full flex items-center justify-center hover:bg-white hover:shadow-md hover:scale-105 transition-all">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        </button>

        {isMe && (
           <button 
             onClick={handleLogout} 
             className="absolute top-8 right-8 z-20 px-6 py-3 bg-white/50 backdrop-blur-md border border-[#111111]/10 text-[#111111]/60 rounded-full flex items-center gap-3 hover:bg-[#E63946] hover:text-white hover:border-[#E63946] transition-all shadow-sm group"
           >
              <span className="text-[9px] uppercase font-black tracking-[0.3em]">Disconnect</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
           </button>
        )}
      </div>

      {/* 👤 Profile Identity Section */}
      <div className="max-w-[1600px] mx-auto px-6 md:px-16 relative z-20 -mt-32 md:-mt-40">
        <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-8 mb-16">
          
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8 text-center md:text-left w-full md:w-auto">
            <div className="w-48 h-48 md:w-60 md:h-60 rounded-[2.5rem] bg-white border-[6px] border-[#F4F3EF] flex items-center justify-center relative overflow-hidden group shrink-0 transition-transform hover:scale-105 duration-700 shadow-xl" style={{ boxShadow: `0 30px 60px ${theme.shadow}` }}>
               <img src={avatarSrc} alt={profileUser.username} className="w-full h-full object-cover scale-105 transition-all duration-700" />
            </div>

            <div className="pb-4 animate-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row items-center md:items-center gap-4 mb-3">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#111111] leading-none">
                  {profileUser.username}
                </h1>
                {profileUser.isVerified && (
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-500 text-white shadow-[0_5px_15px_rgba(59,130,246,0.4)]" title="Verified Artist">
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-4 mt-2">
                <span className="px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.4em] rounded-full border shadow-sm" style={{ color: theme.hex, borderColor: `${theme.hex}30`, backgroundColor: `${theme.hex}10` }}>
                  {profileUser.role}
                </span>
                <span className="text-[#111111]/40 font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
                  Joined {new Date(profileUser.createdAt).getFullYear()}
                </span>
              </div>
              
              {profileUser.bio && (
                <p className="mt-6 text-base md:text-lg text-[#111111]/70 font-serif italic max-w-xl leading-relaxed border-l-[3px] pl-5" style={{ borderColor: theme.hex }}>
                  "{profileUser.bio}"
                </p>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pb-4 w-full md:w-auto flex justify-center md:justify-end animate-in slide-in-from-right-8 duration-700">
            {!isMe && (
              <button 
                onClick={handleFollowToggle}
                className="px-10 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 active:scale-95 w-full md:w-auto"
                style={isFollowing 
                  ? { backgroundColor: 'transparent', color: '#111111', border: '2px solid rgba(17,17,17,0.2)' } 
                  : { backgroundColor: theme.hex, color: 'white', boxShadow: `0 10px 30px ${theme.shadow}` }
                }
              >
                {isFollowing ? 'Following' : 'Follow Signal'}
              </button>
            )}
            {isMe && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-10 py-4 bg-[#111111] border border-transparent text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-[#111111] hover:border-[#111111]/20 transition-all duration-300 hover:shadow-lg active:scale-95 w-full md:w-auto"
              >
                Edit Identity
              </button>
            )}
          </div>
        </div>

        {/* 📊 Stats Strip */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-12 md:gap-24 border-y border-[#111111]/10 py-12 mb-20 bg-white/40 backdrop-blur-md rounded-[2rem] px-12">
          <div className="flex flex-col gap-2 items-center md:items-start md:border-r border-[#111111]/10 md:pr-24">
             <span className="text-5xl md:text-6xl font-black text-[#111111] tracking-tighter leading-none">{profileUser.followers?.length || 0}</span>
             <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/50 font-bold font-mono mt-2">Followers</span>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start md:border-r border-[#111111]/10 md:pr-24">
             <span className="text-5xl md:text-6xl font-black text-[#111111] tracking-tighter leading-none">{profileUser.following?.length || 0}</span>
             <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/50 font-bold font-mono mt-2">Following</span>
          </div>
          <div className="flex flex-col gap-2 items-center md:items-start">
             <span className="text-5xl md:text-6xl font-black text-[#111111] tracking-tighter leading-none">{userPosts.length}</span>
             <span className="text-[10px] uppercase tracking-[0.4em] text-[#111111]/50 font-bold font-mono mt-2">Total Assets</span>
          </div>
        </div>

        {/* 🎵 Artist's Portfolio / Drops (The Catalog) */}
        <div className="pb-32 w-full">
          <div className="flex items-center gap-6 mb-12">
             <span className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.hex }}></span>
             <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#111111] leading-none">The Catalog</h3>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-[#111111]/10 to-transparent"></div>
          </div>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-32 border border-dashed border-[#111111]/20 rounded-[2rem] bg-white w-full">
               <span className="text-[3rem] opacity-30 block mb-4 grayscale">📭</span>
               <p className="text-[#111111]/50 font-mono text-[10px] font-black uppercase tracking-[0.4em]">No assets transmitted to the global network yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
              {userPosts.map((post, index) => {
                const isThisPlaying = currentTrack?._id === post._id;
                const postLikes = Array.isArray(post.likes) ? post.likes : [];
                const iLikedThis = postLikes.includes(currentUserId);
                const isExpanded = expandedLyrics[post._id] || false;

                // 🔥 FIX 2: POST COVER IMAGE FIX APPLIED HERE 🔥
                const postCover = getValidImageUrl(post.coverImage) || avatarSrc;

                return (
                  <div 
                    key={post._id} 
                    className={`group bg-white border transition-all duration-500 p-8 md:p-10 rounded-[2rem] flex flex-col justify-between relative overflow-hidden hover:-translate-y-1 ${isThisPlaying ? 'shadow-[0_20px_50px_rgba(0,0,0,0.08)]' : 'shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.06)]'}`}
                    style={{ borderColor: isThisPlaying ? theme.hex : 'rgba(17,17,17,0.05)' }}
                  >
                    
                    {/* 🔥 RED VIDEO BADGE IF FOOTAGE ATTACHED 🔥 */}
                    {post.videoUrl && (
                      <div className="absolute top-8 right-8 z-30 flex items-center gap-2 bg-[#E63946] text-white text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-[0_5px_15px_rgba(230,57,70,0.4)] animate-in slide-in-from-right">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                        Studio Footage
                      </div>
                    )}

                    <div className={`absolute top-0 right-0 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-opacity duration-700 ${isThisPlaying ? 'opacity-10' : 'opacity-0'}`} style={{ backgroundColor: theme.hex }}></div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <h4 className="text-3xl md:text-4xl font-serif italic text-[#111111] transition-colors pr-4 truncate leading-tight" style={{ color: isThisPlaying ? theme.hex : '#111111' }}>{post.title}</h4>
                      {!post.videoUrl && <span className="text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/50 bg-[#F4F3EF] px-3 py-1.5 rounded-full border border-[#111111]/5 shrink-0">{post.genre || 'Asset'}</span>}
                    </div>
                    
                    {post.description && (
                       <p className="text-sm text-[#111111]/60 font-medium line-clamp-2 mb-10 h-10 leading-relaxed relative z-10">{post.description}</p>
                    )}

                    {post.contentUrl && (
                      <div onClick={(e) => e.stopPropagation()} className="mb-8 rounded-[1.5rem] p-5 md:p-6 border flex flex-col md:flex-row items-center gap-6 shadow-inner transition-all duration-500 bg-[#F4F3EF]" style={{ borderColor: isThisPlaying ? `${theme.hex}40` : 'rgba(17,17,17,0.05)' }}>
                         
                         {/* Play Button & Cover Art */}
                         <div className="relative w-24 h-24 shrink-0 rounded-[1rem] overflow-hidden bg-white group/playbtn cursor-pointer shadow-sm border border-[#111111]/10" onClick={(e) => handlePlayClick(e, post)}>
                             <img src={postCover} className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-50 scale-110 blur-[2px]' : 'opacity-90 group-hover/playbtn:opacity-100 group-hover/playbtn:scale-105'}`} alt="Cover" />
                             <div className="absolute inset-0 flex items-center justify-center bg-[#111111]/10 group-hover/playbtn:bg-[#111111]/20 transition-colors">
                                
                                {/* Show Video Play Icon if it has a videoUrl */}
                                {post.videoUrl ? (
                                   <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" className="ml-1 transition-transform duration-300 group-hover/playbtn:scale-110 drop-shadow-md"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                ) : isThisPlaying && isPlaying ? (
                                  <svg width="32" height="32" viewBox="0 0 24 24" fill={theme.hex}><rect x="6" y="4" width="4" height="16" rx="1.5"></rect><rect x="14" y="4" width="4" height="16" rx="1.5"></rect></svg>
                                ) : (
                                  <svg width="36" height="36" viewBox="0 0 24 24" fill={isThisPlaying ? theme.hex : "#FFFFFF"} className="ml-1 transition-transform duration-300 group-hover/playbtn:scale-110 drop-shadow-md"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                )}
                             </div>
                         </div>
                         
                         {/* Scrubber Console */}
                         <div className="flex-1 w-full">
                            <div className="flex items-end justify-between mb-5">
                               <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#111111]/50">
                                 {isThisPlaying && isPlaying ? <span className="animate-pulse" style={{color: theme.hex}}>Transmitting</span> : (post.videoUrl ? 'Cinematic Session' : 'Audio Asset')}
                               </p>
                            </div>
                            
                            {isThisPlaying && !post.videoUrl ? (
                              <div className="relative w-full h-2.5 bg-[#111111]/10 rounded-full overflow-hidden shadow-inner">
                                <div className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear" style={{ width: `${progress}%`, backgroundColor: theme.hex }}></div>
                                <input 
                                  type="range" min="0" max="100" 
                                  value={progress || 0} 
                                  onChange={handleSeek}
                                  className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                                />
                              </div>
                            ) : (
                              <div className="w-full h-2.5 bg-[#111111]/5 rounded-full shadow-inner"></div>
                            )}
                         </div>
                      </div>
                    )}

                    {post.lyricsText && (
                      <div className="mt-4 relative pt-6 border-t border-[#111111]/5">
                         <span className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6 block text-[#111111]/40 font-black">Written Draft Context</span>
                         
                         <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] ${isExpanded ? '' : 'max-h-[140px] overflow-hidden'}`}>
                           <p className="text-base md:text-lg font-serif italic whitespace-pre-wrap leading-[2.2] tracking-wide text-[#111111]/70">
                             "{post.lyricsText}"
                           </p>
                           
                           {!isExpanded && (
                             <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                           )}
                         </div>
                         
                         {post.lyricsText.length > 200 && (
                           <button 
                             onClick={(e) => toggleLyrics(post._id, e)} 
                             className="mt-4 text-[9px] uppercase tracking-[0.2em] font-black transition-opacity hover:opacity-100 opacity-60"
                             style={{ color: theme.hex }}
                           >
                             {isExpanded ? '[- Collapse Draft]' : '[+ Expand Draft]'}
                           </button>
                         )}
                      </div>
                    )}

                    <div className="flex gap-8 text-[11px] font-mono font-black text-[#111111]/40 pt-6 border-t border-[#111111]/5 mt-auto uppercase tracking-widest relative z-10">
                      <button onClick={(e) => handleLike(post, e)} className="flex items-center gap-2 group/btn transition-transform active:scale-95">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill={iLikedThis ? theme.hex : 'none'} stroke={iLikedThis ? theme.hex : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover/btn:opacity-100 transition-opacity text-[#111111]"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg> 
                         <span style={{ color: iLikedThis ? theme.hex : '' }}>{postLikes.length}</span>
                      </button>
                      <span className="flex items-center gap-2 group-hover:text-[#111111] transition-colors cursor-default">
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> 
                         {post.comments?.length || 0}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-[99999] bg-[#111111]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in">
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
        </div>
      )}
    </div>
  );
}