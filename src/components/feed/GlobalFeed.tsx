import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../../context/AudioContext'; 
import CommentsDrawer from './CommentsDrawer'; 
import PitchModal from './PitchModal'; 

export default function GlobalFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentingPost, setCommentingPost] = useState<any>(null);
  const [pitchingPost, setPitchingPost] = useState<any>(null);
  
  // 🔥 STATE TO TRACK EXPANDED LYRICS 🔥
  const [expandedLyrics, setExpandedLyrics] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, progress, seek } = useAudio();
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const currentUserId = loggedInUser.id || loggedInUser._id;
  const myRole = loggedInUser.role?.toLowerCase() || 'listener';
  const isListener = myRole === 'listener';
  const isAdmin = myRole === 'admin'; 

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        setPosts(res.data.reverse()); // Show latest first
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handlePlayClick = (e: React.MouseEvent, post: any) => {
    e.stopPropagation();
    if (currentTrack?._id === post._id) {
      togglePlayPause();
    } else {
      playTrack({
        _id: post._id,
        title: post.title,
        contentUrl: post.contentUrl || post.audioUrl,
        creatorName: post.creatorName,
        creatorRole: post.creatorRole,
        creatorId: post.creatorId,
        coverImage: post.coverImage || post.creatorProfileImage
      });
    }
  };

  const handleLike = async (post: any, e: React.MouseEvent) => {
    e.stopPropagation(); 
    const isLiked = post.likes?.includes(currentUserId);

    setPosts(posts.map(p => {
      if (p._id === post._id) {
        let newLikes = p.likes ? [...p.likes] : [];
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
      await axios.post(`http://localhost:5000/api/feed/${post._id}/like`, {}, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
    } catch (err) { console.error(err); }
  };

  const handleCommentAdded = (postId: string, updatedComments: any[]) => {
    setPosts(posts.map(p => p._id === postId ? { ...p, comments: updatedComments } : p));
    if (commentingPost?._id === postId) {
      setCommentingPost({ ...commentingPost, comments: updatedComments });
    }
  };

  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!window.confirm("⚠️ SYSTEM OVERRIDE: Are you sure you want to permanently delete this asset?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Error deleting post.");
    }
  };

  const toggleLyrics = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLyrics(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // 🔥 DYNAMIC HEX MAPPER FOR PREMIUM GLOWS
  const getRoleColor = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return '#E63946';
    if (r === 'lyricist') return '#52B788';
    if (r === 'listener') return '#8ECAE6';
    return '#D4AF37'; // Producer Gold
  };

  return (
    <div className="h-full w-full bg-transparent overflow-y-auto custom-scrollbar flex justify-center py-6 relative scroll-smooth" data-lenis-prevent="true">
      
      {/* Cinematic Ambient Background */}
      <div className="fixed top-[10%] left-[-10%] w-[600px] h-[600px] bg-[#52B788]/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '8s' }}></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#D4AF37]/5 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '12s' }}></div>

      <div className="w-full max-w-3xl px-4 md:px-8 z-10 flex flex-col gap-8 pb-40">
        
        {/* HEADER */}
        <div className="mb-4 px-2 shrink-0 flex items-end justify-between border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-serif italic text-[#F0F0EB] tracking-tight">{isAdmin ? 'Content Moderation' : 'Global Network'}</h1>
            <div className="flex items-center gap-3 mt-3">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#52B788] opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-[#52B788]"></span>
               </span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-[#52B788] font-black">Syncing Live</span>
            </div>
          </div>
        </div>

        {/* LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-40">
             <div className="w-12 h-12 border-[3px] border-white/10 border-t-[#F0F0EB] rounded-full animate-spin mb-6"></div>
             <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#888888]">Fetching Signals...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-white/10 rounded-[2rem] bg-[#010101]/50">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#888888] mx-auto mb-6 opacity-50"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
             <p className="text-[#888888] font-mono text-[10px] uppercase tracking-widest">No transmissions found in the network.</p>
          </div>
        ) : (
          posts.map((post) => {
            const roleColor = getRoleColor(post.creatorRole);
            const isThisPlaying = currentTrack?._id === post._id;
            const iLikedThis = post.likes?.includes(currentUserId);
            const avatarSrc = post.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorId || post.creatorName}`;
            
            const isAudioPost = !!post.contentUrl;
            const isExpanded = expandedLyrics[post._id];

            return (
              <div 
                key={post._id} 
                className="shrink-0 group bg-[#010101]/80 backdrop-blur-xl border rounded-[2rem] transition-all duration-500 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-8"
                style={{ 
                  borderColor: isThisPlaying ? `${roleColor}80` : isAdmin ? 'rgba(230,57,70,0.2)' : 'rgba(255,255,255,0.05)',
                  boxShadow: isThisPlaying ? `0 20px 60px ${roleColor}20` : '0 10px 30px rgba(0,0,0,0.5)'
                }}
              >
                {/* Subtle Ambient Glow for active/hover state */}
                <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none transition-opacity duration-700 ${isThisPlaying ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`} style={{ backgroundColor: roleColor }}></div>
                
                {/* 👤 CREATOR HEADER */}
                <div className="p-6 flex items-start gap-4 relative z-10 border-b border-white/5">
                  <div 
                    onClick={() => navigate(`/profile/${post.creatorId}`)} 
                    className="w-12 h-12 rounded-full border-2 overflow-hidden shrink-0 bg-black cursor-pointer transition-all duration-300 group-hover:scale-105"
                    style={{ borderColor: isThisPlaying && isPlaying ? roleColor : 'rgba(255,255,255,0.1)' }}
                  >
                    <img src={avatarSrc} className={`w-full h-full object-cover scale-110 ${isThisPlaying ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all duration-500`} alt="avatar" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate(`/profile/${post.creatorId}`)}>
                        <h3 className="text-[#F0F0EB] font-bold text-sm hover:underline underline-offset-4 decoration-white/30">{post.creatorName}</h3>
                        <span 
                          className="text-[7px] px-2 py-0.5 rounded-sm border uppercase font-black tracking-widest"
                          style={{ color: roleColor, backgroundColor: `${roleColor}10`, borderColor: `${roleColor}30` }}
                        >
                          {post.creatorRole}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#888888] font-mono tracking-widest uppercase">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h4 className="text-xl font-serif italic text-[#F0F0EB] mt-2 leading-tight">{post.title}</h4>
                    {post.description && <p className="text-[#888888] text-xs font-light mt-1.5 line-clamp-2">{post.description}</p>}
                  </div>
                </div>

                <div className="p-6 relative z-10">
                  {/* 🎵 BEAT / AUDIO SECTION */}
                  {isAudioPost && (
                    <div className="p-4 rounded-[1.5rem] border flex flex-col sm:flex-row items-center gap-5 transition-all duration-500 mb-6" style={{ backgroundColor: isThisPlaying ? `${roleColor}10` : 'rgba(0,0,0,0.4)', borderColor: isThisPlaying ? `${roleColor}40` : 'rgba(255,255,255,0.05)' }}>
                       {/* Play Button & Cover */}
                       <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-[#0A0A0C] border border-white/10 group/playbtn cursor-pointer" onClick={(e) => handlePlayClick(e, post)}>
                           <img src={post.coverImage || avatarSrc} className={`w-full h-full object-cover transition-all duration-500 ${isThisPlaying ? 'opacity-50 scale-110' : 'opacity-30 group-hover/playbtn:opacity-60'}`} alt="Track Cover" />
                           <div className="absolute inset-0 flex items-center justify-center">
                              {isThisPlaying && isPlaying ? (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill={roleColor}><rect x="6" y="4" width="4" height="16" rx="1"></rect><rect x="14" y="4" width="4" height="16" rx="1"></rect></svg>
                              ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill={isThisPlaying ? roleColor : "#F0F0EB"} className="ml-1 transition-transform group-hover/playbtn:scale-110"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              )}
                           </div>
                       </div>
                       
                       {/* Scrubber */}
                       <div className="flex-1 w-full">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-[8px] uppercase tracking-widest text-[#888888] font-black">{isThisPlaying && isPlaying ? 'Transmitting' : 'Audio Asset'}</p>
                             <p className="text-[8px] uppercase tracking-widest text-[#888888] font-mono">{post.genre || 'Beat'}</p>
                          </div>
                          {isThisPlaying ? (
                            <input 
                              type="range" min="0" max="100" 
                              value={progress || 0} 
                              onChange={(e) => seek?.(Number(e.target.value))} 
                              className="w-full h-1.5 bg-black/50 rounded-full appearance-none cursor-pointer transition-all" 
                              style={{ accentColor: roleColor }}
                            />
                          ) : (
                            <div className="w-full h-1.5 bg-white/5 rounded-full"></div>
                          )}
                       </div>
                    </div>
                  )}

                  {/* 📝 LYRICS SECTION (Truncated & Expandable) */}
                  {post.lyricsText && (
                    <div className="relative border-l-2 pl-5 py-2 mb-2 transition-colors duration-500" style={{ borderColor: `${roleColor}50` }}>
                       <span className="absolute top-0 right-0 text-[8px] font-black uppercase tracking-[0.3em] italic opacity-40" style={{ color: roleColor }}>Written Draft</span>
                       
                       <div className={`relative transition-all duration-500 ${isExpanded ? '' : 'max-h-[120px] overflow-hidden'}`}>
                         <p className="text-sm font-serif italic text-[#888888] whitespace-pre-wrap leading-[2.2] tracking-wide group-hover:text-[#F0F0EB] transition-colors">
                           "{post.lyricsText}"
                         </p>
                         
                         {/* Fade out gradient if not expanded */}
                         {!isExpanded && (
                           <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#010101] to-transparent pointer-events-none"></div>
                         )}
                       </div>
                       
                       {/* Expand/Collapse Toggle */}
                       {post.lyricsText.length > 200 && (
                         <button 
                           onClick={(e) => toggleLyrics(post._id, e)} 
                           className="mt-3 text-[9px] uppercase tracking-widest font-black transition-colors hover:underline"
                           style={{ color: roleColor }}
                         >
                           {isExpanded ? 'Collapse Text ↑' : 'Read Full Verse ↓'}
                         </button>
                       )}
                    </div>
                  )}
                </div>

                {/* ⚡ INTERACTION FOOTER */}
                <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                   <div className="flex gap-6 text-[#888888]">
                      {/* Like Button */}
                      <button onClick={(e) => handleLike(post, e)} className="flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group/btn">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={iLikedThis ? '#E63946' : 'none'} stroke={iLikedThis ? '#E63946' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-colors"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span className={`text-[11px] font-mono font-bold ${iLikedThis ? 'text-[#E63946]' : 'group-hover/btn:text-[#F0F0EB]'}`}>{post.likes?.length || 0}</span>
                      </button>
                      
                      {/* Comment Button */}
                      <button onClick={() => setCommentingPost(post)} className="flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group/btn hover:text-[#8ECAE6]">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span className="text-[11px] font-mono font-bold group-hover/btn:text-[#F0F0EB]">{post.comments?.length || 0}</span>
                      </button>
                   </div>

                   <div className="flex items-center gap-3">
                     {/* PITCH BUTTON (If allowed) */}
                     {!isListener && !isAdmin && (
                       <button 
                         onClick={() => setPitchingPost(post)}
                         className="px-5 py-2 bg-white/5 border border-white/10 hover:border-white/30 text-[#F0F0EB] hover:bg-[#F0F0EB] hover:text-[#010101] text-[9px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg flex items-center gap-1.5 active:scale-95"
                       >
                          Pitch <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                       </button>
                     )}

                     {/* ADMIN DELETE BUTTON */}
                     {isAdmin && (
                       <button 
                         onClick={(e) => handleDeletePost(post._id, e)}
                         className="px-5 py-2 bg-[#E63946]/10 border border-[#E63946]/30 text-[#E63946] hover:bg-[#E63946] hover:text-white text-[9px] font-black uppercase tracking-widest rounded-full transition-all shadow-lg flex items-center gap-1.5 active:scale-95"
                       >
                          Delete <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                       </button>
                     )}
                   </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {commentingPost && <CommentsDrawer post={commentingPost} onClose={() => setCommentingPost(null)} onCommentAdded={handleCommentAdded} />}
      {pitchingPost && <PitchModal post={pitchingPost} onClose={() => setPitchingPost(null)} />}
    </div>
  );
}