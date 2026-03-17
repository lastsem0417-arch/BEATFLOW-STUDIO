import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAudio } from '../context/AudioContext';
// 🔥 MODAL IMPORT KIYA 🔥
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
  
  // 🔥 MODAL STATE 🔥
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
      playTrack(post);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) {
      seek(Number(e.target.value));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-purple-900/10 animate-pulse"></div>
        <div className="w-12 h-12 border-2 border-white/10 border-t-white rounded-full animate-spin z-10 shadow-[0_0_30px_rgba(255,255,255,0.2)]"></div>
      </div>
    );
  }

  if (!profileUser) return <div className="min-h-screen flex items-center justify-center text-white font-mono">Entity not found in the network.</div>;

  const isMe = currentUserId === profileUser._id;
  const isAdminProfile = profileUser.role === 'admin'; // 🔥 ADMIN CHECK

  // ==========================================
  // 🔥 1. THE GOD MODE PROFILE (For Admin) 🔥
  // ==========================================
  if (isAdminProfile) {
    return (
      <div className="min-h-screen bg-[#050505] text-[#ebebe6] overflow-y-auto custom-scrollbar relative select-none">
        <div className="relative h-80 w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-red-900/40 to-[#050505] z-0"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-red-600/20 blur-[150px] rounded-full pointer-events-none animate-pulse" style={{animationDuration: '4s'}}></div>
          
          <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-black/40 backdrop-blur-md border border-red-500/30 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl">
            ←
          </button>
        </div>

        <div className="max-w-5xl mx-auto px-8 relative z-10 -mt-28">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div className="flex items-end gap-8">
              <div className="w-48 h-48 rounded-2xl bg-[#0a0a0a] border-2 border-red-500/50 shadow-[0_0_50px_rgba(220,38,38,0.5)] flex items-center justify-center relative overflow-hidden group">
                 <span className="text-7xl">👁️</span>
              </div>
              <div className="pb-4">
                <h1 className="text-6xl font-serif italic text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]">{profileUser.username}</h1>
                <div className="flex items-center gap-4 mt-4">
                  <span className="px-4 py-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-black uppercase tracking-[0.4em] rounded-md shadow-[0_0_15px_rgba(220,38,38,0.4)] animate-pulse">
                    System Overlord
                  </span>
                  <span className="text-neutral-500 font-mono text-xs uppercase tracking-widest">OMNIPRESENT</span>
                </div>
                <p className="mt-4 text-sm text-red-200/50 font-mono max-w-lg leading-relaxed border-l-2 border-red-500/30 pl-4">
                  "I see everything. I control everything. The network bends to my will."
                </p>
              </div>
            </div>
            
            <div className="pb-4">
              <div className="px-8 py-3 rounded-full border border-red-500/30 text-red-500 font-mono text-[10px] uppercase tracking-widest bg-red-500/5 cursor-not-allowed">
                Access Level: Maximum
              </div>
            </div>
          </div>

          <div className="flex items-center gap-16 border-y border-red-500/20 py-8 mb-16 bg-red-900/5 backdrop-blur-sm rounded-2xl px-12 font-mono">
            <div className="flex flex-col gap-1">
               <span className="text-3xl text-red-500 drop-shadow-md font-bold">∞</span>
               <span className="text-[10px] uppercase tracking-[0.2em] text-red-500/50 font-black">Power</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-3xl text-red-500 drop-shadow-md font-bold">100%</span>
               <span className="text-[10px] uppercase tracking-[0.2em] text-red-500/50 font-black">Control</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-3xl text-red-500 drop-shadow-md font-bold">All</span>
               <span className="text-[10px] uppercase tracking-[0.2em] text-red-500/50 font-black">Visibility</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 2. NORMAL USER PROFILE (Rapper/Producer/etc) 
  // ==========================================
  const role = profileUser.role?.toLowerCase() || 'listener';
  const accentColor = role === 'producer' ? 'blue' : role === 'lyricist' ? 'emerald' : 'purple';
  
  // 🔥 DYNAMIC AVATAR LOGIC 🔥
  const avatarSrc = profileUser.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${profileUser.username}&backgroundColor=transparent`;

  return (
    <div className="min-h-screen bg-[#050505] text-[#ebebe6] overflow-y-auto custom-scrollbar relative">
      
      {/* 🌟 Cinematic Cover Header */}
      <div className="relative h-80 w-full overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-b from-${accentColor}-600/20 to-[#050505] z-0`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-${accentColor}-500/10 blur-[150px] rounded-full pointer-events-none animate-pulse`} style={{animationDuration: '6s'}}></div>
        
        <button onClick={() => navigate(-1)} className="absolute top-8 left-8 z-20 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black hover:scale-105 transition-all shadow-xl">
          ←
        </button>
      </div>

      {/* 👤 Profile Identity Section */}
      <div className="max-w-5xl mx-auto px-8 relative z-10 -mt-28">
        <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
          
          <div className="flex items-end gap-8">
            {/* 🔥 THE BIG PREMIUM AVATAR 🔥 */}
            <div className={`w-48 h-48 rounded-[3rem] bg-[#0a0a0a] border-4 border-[#050505] shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center relative overflow-hidden group shrink-0 transition-transform hover:scale-105 duration-500`}>
               <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none`}></div>
               <img 
                 src={avatarSrc} 
                 alt={profileUser.username} 
                 className="w-full h-full object-cover p-1 scale-110" 
               />
            </div>

            <div className="pb-4 animate-in slide-in-from-bottom-4 duration-700">
              {/* 🔥 NAME + VERIFIED BADGE 🔥 */}
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl md:text-6xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-2xl">
                  {profileUser.username}
                </h1>
                {profileUser.isVerified && (
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.5)]" title="Verified Artist">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2">
                <span className={`px-4 py-1.5 bg-${accentColor}-500/10 border border-${accentColor}-500/30 text-${accentColor}-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-[inset_0_0_15px_rgba(var(--${accentColor}-500),0.1)]`}>
                  {profileUser.role}
                </span>
                <span className="text-neutral-500 font-mono text-xs uppercase tracking-widest">Joined {new Date(profileUser.createdAt).getFullYear()}</span>
              </div>
              
              {profileUser.bio && (
                <p className="mt-6 text-sm text-neutral-300 font-light max-w-lg leading-relaxed italic border-l-2 border-white/10 pl-4">
                  "{profileUser.bio}"
                </p>
              )}
            </div>
          </div>

          <div className="pb-4 flex gap-4 animate-in slide-in-from-right-4 duration-700">
            {!isMe && (
              <button 
                onClick={handleFollowToggle}
                className={`px-10 py-3.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 ${isFollowing ? 'bg-white/5 text-white border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' : `bg-white text-black hover:bg-${accentColor}-400 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]`}`}
              >
                {isFollowing ? 'Following' : 'Follow Artist'}
              </button>
            )}
            {isMe && (
              <button 
                onClick={() => setShowEditModal(true)}
                className="px-10 py-3.5 bg-black/40 backdrop-blur-md border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                Edit Identity
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex items-center gap-16 border-y border-white/5 py-8 mb-16 bg-white/[0.01] backdrop-blur-sm rounded-3xl px-12">
          <div className="flex flex-col gap-1">
             <span className="text-4xl font-serif italic text-white drop-shadow-md">{profileUser.followers?.length || 0}</span>
             <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Followers</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-4xl font-serif italic text-white drop-shadow-md">{profileUser.following?.length || 0}</span>
             <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Following</span>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-4xl font-serif italic text-white drop-shadow-md">{userPosts.length}</span>
             <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-black">Total Drops</span>
          </div>
        </div>

        {/* 🎵 Artist's Portfolio / Drops */}
        <div className="pb-32">
          <h3 className="text-3xl font-serif italic text-white mb-10 flex items-center gap-4">
            The Catalog
            <span className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></span>
          </h3>
          
          {userPosts.length === 0 ? (
            <div className="text-center py-24 border border-white/5 rounded-[3rem] bg-black/40 backdrop-blur-xl">
               <span className="text-4xl opacity-50 block mb-4">📭</span>
               <p className="text-neutral-500 font-mono text-sm uppercase tracking-widest">No drops in the global network yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {userPosts.map((post, index) => {
                const isThisPlaying = currentTrack?._id === post._id;

                return (
                  <div 
                    key={post._id} 
                    className={`bg-[#0a0a0a]/80 backdrop-blur-2xl border ${isThisPlaying ? `border-${accentColor}-500/50 shadow-[0_0_40px_rgba(var(--${accentColor}-500),0.1)]` : 'border-white/5 hover:border-white/10'} p-8 rounded-[2.5rem] transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-8`}
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h4 className={`text-2xl font-serif italic transition-colors ${isThisPlaying ? `text-${accentColor}-400` : 'text-white group-hover:text-white/80'}`}>{post.title}</h4>
                      <span className="text-[9px] uppercase tracking-widest font-black text-neutral-500 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{post.genre}</span>
                    </div>
                    
                    <p className="text-sm text-neutral-400 font-light line-clamp-2 mb-8 h-10 leading-relaxed group-hover:text-neutral-300 transition-colors">{post.description}</p>

                    {/* ✨ AUDIO PLAYER WITH SCRUBBER ✨ */}
                    {post.contentUrl && (
                      <div onClick={(e) => e.stopPropagation()} className={`mb-6 rounded-3xl p-4 border transition-all duration-500 ${isThisPlaying ? `bg-${accentColor}-500/10 border-${accentColor}-500/50` : 'bg-black/60 border-white/5'} flex flex-col gap-3 relative`}>
                         <div className="flex items-center gap-5 z-10">
                           <button onClick={() => handlePlayClick(post)} className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${isThisPlaying && isPlaying ? `bg-${accentColor}-500 text-black shadow-[0_0_20px_rgba(var(--${accentColor}-500),0.5)] scale-105` : 'bg-white text-black hover:scale-110'}`}>
                             {isThisPlaying && isPlaying ? '⏸' : '▶'}
                           </button>
                           <span className={`text-[9px] uppercase tracking-[0.3em] font-black ${isThisPlaying && isPlaying ? `text-${accentColor}-400` : 'text-neutral-500'}`}>
                             {isThisPlaying && isPlaying ? 'Transmitting' : 'Preview Audio'}
                           </span>
                         </div>
                         
                         {/* Scrubber Bar */}
                         {isThisPlaying && (
                           <div className="flex items-center gap-3 w-full px-1 mt-1 z-10">
                              <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={progress || 0} 
                                onChange={handleSeek}
                                className={`w-full h-1.5 bg-black/50 rounded-lg appearance-none cursor-pointer accent-${accentColor}-500 hover:h-2 transition-all`}
                              />
                           </div>
                         )}
                      </div>
                    )}

                    {post.lyricsText && (
                      <div className="bg-emerald-500/[0.03] border-l-2 border-emerald-500/30 p-5 rounded-2xl rounded-l-none mb-6 max-h-32 overflow-hidden relative group/lyrics hover:bg-emerald-500/[0.05] transition-colors">
                         <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>
                         <p className="text-xs font-serif italic text-emerald-100/70 whitespace-pre-wrap leading-loose">"{post.lyricsText}"</p>
                      </div>
                    )}

                    <div className="flex gap-6 text-sm font-mono text-neutral-500 pt-6 border-t border-white/5 mt-auto">
                      <span className="flex items-center gap-2">❤️ {post.likes?.length || 0}</span>
                      <span className="flex items-center gap-2">💬 {post.comments?.length || 0}</span>
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