import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useAudio } from '../../context/AudioContext'; 
import CommentsDrawer from './CommentsDrawer'; 
import PitchModal from './PitchModal'; 

gsap.registerPlugin(ScrollTrigger);

export default function GlobalFeed() {
  const feedRef = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentingPost, setCommentingPost] = useState<any>(null);
  const [pitchingPost, setPitchingPost] = useState<any>(null);
  
  const [expandedLyrics, setExpandedLyrics] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, progress, seek } = useAudio();
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const currentUserId = loggedInUser.id || loggedInUser._id;
  const myRole = loggedInUser.role?.toLowerCase() || 'listener';
  const isListener = myRole === 'listener';
  const isAdmin = myRole === 'admin'; 

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        setPosts(res.data.reverse()); 
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  // 🎬 GSAP SCROLL TRIGGER ENGINE (Premium Scroll)
  useLayoutEffect(() => {
    if (loading || posts.length === 0) return;

    let ctx = gsap.context(() => {
      
      // Header Parallax Fade
      gsap.to('.feed-header', {
        y: -80,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: '.feed-header',
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      });

      // Feed Cards Crisp Reveal
      const cards = gsap.utils.toArray('.feed-card-wrapper');
      cards.forEach((card: any) => {
        gsap.fromTo(card,
          { y: 80, opacity: 0, scale: 0.95 },
          { 
            y: 0, opacity: 1, scale: 1, duration: 1.4, ease: "expo.out",
            scrollTrigger: {
              trigger: card,
              start: "top 85%",
              toggleActions: "play none none none" 
            }
          }
        );
      });
    }, feedRef);

    return () => ctx.revert();
  }, [loading, posts]);

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
        if (isLiked) newLikes = newLikes.filter((id: string) => id !== currentUserId);
        else newLikes.push(currentUserId);
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
    if (!window.confirm("System Warning: Permanently delete this asset?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) { alert("Error deleting post."); }
  };

  const toggleLyrics = (postId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedLyrics(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // 🔥 DYNAMIC COLOR ENGINE FOR VIBRANCY 🔥
  const getRoleColor = (role?: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return '#E63946'; // Carmine Red
    if (r === 'lyricist') return '#10B981'; // Emerald Green
    if (r === 'listener') return '#2563EB'; // Royal Blue
    return '#D4AF37'; // Producer Gold
  };

  const activeColor = currentTrack ? getRoleColor(currentTrack.creatorRole) : '#D4AF37';

  return (
    // 🔥 UNIVERSAL PREMIUM CONTAINER 🔥
    <div ref={feedRef} className="w-full flex flex-col items-center py-6 relative font-sans text-[#111111] bg-[#F4F5F7] min-h-screen">
      
      {/* 🌈 Ambient Prismatic Mesh Background (Blend with dashboards) */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply overflow-hidden">
         <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#D4AF37]/10 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '8s' }}></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-[#2563EB]/10 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: '12s' }}></div>
         <div className="absolute top-[30%] right-[10%] w-[30vw] h-[30vw] bg-[#E63946]/5 blur-[100px] rounded-full"></div>
      </div>
      
      {/* Dynamic Active Track Aura */}
      {isPlaying && (
        <div 
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] blur-[200px] rounded-full pointer-events-none z-0 transition-colors duration-1000 ease-in-out opacity-10" 
          style={{ backgroundColor: activeColor }}
        ></div>
      )}

      <div className="w-full max-w-[900px] px-4 md:px-8 z-10 flex flex-col gap-16 pb-40">
        
        {/* 🎩 MASSIVE COLORFUL EDITORIAL HEADER */}
        <div className="feed-header w-full pt-16 pb-12 flex flex-col items-center justify-center text-center relative z-10">
          
          {/* Status Pill */}
          <div className="flex items-center gap-3 mb-6 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white shadow-[0_10px_20px_rgba(0,0,0,0.03)]">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: activeColor }}></span>
               <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: activeColor }}></span>
             </span>
             <span className="text-[9px] uppercase tracking-[0.4em] font-black text-[#111111]/70">
               {isPlaying ? 'Network Transmitting' : 'Live Ecosystem'}
             </span>
          </div>

          <div className="relative flex flex-col items-center w-full leading-[0.8] select-none perspective-[1000px]">
             {/* Vibrant Gradient Text */}
             <h1 className="text-[12vw] md:text-[9vw] font-black uppercase tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#E63946] to-[#2563EB] drop-shadow-[0_20px_40px_rgba(212,175,55,0.2)]">
               GLOBAL
             </h1>
             <h1 className="text-[14vw] md:text-[11vw] font-serif italic tracking-tighter text-[#111111] -mt-6 md:-mt-10 relative z-10 drop-shadow-sm">
               Soundstage<span className="transition-colors duration-700" style={{ color: activeColor }}>.</span>
             </h1>
          </div>

          {/* Core Pillars */}
          <div className="mt-14 flex items-center gap-6 md:gap-12 text-[10px] font-black uppercase tracking-[0.5em] text-[#111111]/40 bg-white/40 backdrop-blur-md px-10 py-4 rounded-full border border-white">
             <span className="hover:text-[#D4AF37] transition-colors duration-300 cursor-default">BEATS</span>
             <span className="opacity-20">•</span>
             <span className="hover:text-[#E63946] transition-colors duration-300 cursor-default">VOCALS</span>
             <span className="opacity-20">•</span>
             <span className="hover:text-[#10B981] transition-colors duration-300 cursor-default">DRAFTS</span>
          </div>

        </div>

        {/* ⏳ LOADING STATE */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 opacity-50 relative z-10">
             <div className="w-16 h-16 border-[3px] border-[#111111]/10 border-t-[#D4AF37] rounded-full animate-spin mb-6"></div>
             <span className="text-[10px] font-mono uppercase tracking-[0.5em] font-black text-[#111111]/60">Syncing Assets...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-[#111111]/10 rounded-[3rem] bg-white/50 backdrop-blur-md shadow-sm relative z-10">
             <span className="text-6xl opacity-30 block mb-6 grayscale">📡</span>
             <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#111111]/50 font-black">Network is quiet.</p>
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
              <div key={post._id} className="feed-card-wrapper relative z-10">
                {/* Subtle Glow Behind Active Card */}
                {isThisPlaying && (
                  <div className="absolute inset-0 blur-[40px] rounded-[3rem] opacity-20 -z-10 transition-colors duration-500" style={{ backgroundColor: roleColor }}></div>
                )}

                <div 
                  // 🔥 WHITE CARD WITH DYNAMIC ACCENTS 🔥
                  className={`feed-card-item shrink-0 group bg-white border transition-all duration-500 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative overflow-hidden ${isThisPlaying ? 'hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] scale-[1.01]' : 'hover:shadow-[0_30px_60px_rgba(0,0,0,0.06)] hover:-translate-y-2'}`}
                  style={{ 
                    borderColor: isThisPlaying ? roleColor : 'rgba(255,255,255,0.5)',
                  }}
                >
                  {/* Subtle Gradient Top Border Line based on Role */}
                  <div className="absolute top-0 left-0 w-full h-1 opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: roleColor }}></div>
                  
                  {/* 👤 CREATOR HEADER */}
                  <div className="p-8 md:p-10 flex items-start justify-between relative z-10 bg-gradient-to-b from-[#F4F5F7]/30 to-transparent">
                    <div className="flex items-center gap-5">
                      <div 
                        onClick={() => navigate(`/profile/${post.creatorId}`)} 
                        className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 cursor-pointer transition-transform duration-500 group-hover:scale-105 border bg-[#F4F5F7] shadow-sm"
                        style={{ borderColor: isThisPlaying && isPlaying ? roleColor : 'rgba(17,17,17,0.05)' }}
                      >
                        <img src={avatarSrc} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="avatar" />
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-3">
                          <h3 onClick={() => navigate(`/profile/${post.creatorId}`)} className="text-[#111111] font-bold text-xl hover:opacity-70 cursor-pointer transition-colors tracking-tight">
                            {post.creatorName}
                          </h3>
                          <span 
                            className="text-[8px] px-3 py-1.5 rounded-full uppercase font-black tracking-[0.2em] border shadow-sm"
                            style={{ color: roleColor, backgroundColor: `${roleColor}10`, borderColor: `${roleColor}20` }}
                          >
                            {post.creatorRole}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono tracking-[0.2em] uppercase mt-1.5 text-[#111111]/40 font-bold">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 📝 CONTENT BODY */}
                  <div className="px-8 md:px-10 pb-8 relative z-10">
                      <h4 
                        className="text-3xl md:text-4xl font-serif italic text-[#111111] mb-5 leading-tight transition-colors duration-500"
                        style={{ color: isThisPlaying ? roleColor : '#111111' }}
                      >
                        {post.title}
                      </h4>
                      {post.description && <p className="text-[#111111]/60 text-[15px] font-medium mb-10 leading-relaxed max-w-2xl">{post.description}</p>}

                      {/* 🎵 THE COLORFUL AUDIO PLAYER */}
                      {isAudioPost && (
                        <div 
                          className="p-5 md:p-6 rounded-[2rem] border flex flex-col md:flex-row items-center gap-6 transition-all duration-500"
                          style={{ 
                            backgroundColor: isThisPlaying ? `${roleColor}05` : '#F9F9FB',
                            borderColor: isThisPlaying ? `${roleColor}20` : 'rgba(17,17,17,0.05)',
                            boxShadow: isThisPlaying ? `inset 0 0 40px ${roleColor}05` : 'inset 0 2px 10px rgba(0,0,0,0.02)'
                          }}
                        >
                            
                            {/* Play Button & Cover Art */}
                            <div className="relative w-28 h-28 shrink-0 rounded-[1.5rem] overflow-hidden bg-white group/playbtn cursor-pointer shadow-md border border-white" onClick={(e) => handlePlayClick(e, post)}>
                                <img src={post.coverImage || avatarSrc} className={`w-full h-full object-cover transition-all duration-700 ${isThisPlaying ? 'opacity-60 scale-110 blur-[2px]' : 'opacity-90 group-hover/playbtn:opacity-100 group-hover/playbtn:scale-105'}`} alt="Cover" />
                                
                                {/* Dynamic Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center transition-colors duration-500" style={{ backgroundColor: isThisPlaying ? `${roleColor}20` : 'rgba(17,17,17,0.2)' }}>
                                  {isThisPlaying && isPlaying ? (
                                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transform scale-110">
                                      <svg width="24" height="24" viewBox="0 0 24 24" fill={roleColor}><rect x="6" y="4" width="4" height="16" rx="1.5"></rect><rect x="14" y="4" width="4" height="16" rx="1.5"></rect></svg>
                                    </div>
                                  ) : (
                                    <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg transition-transform duration-300 group-hover/playbtn:scale-110">
                                      <svg width="26" height="26" viewBox="0 0 24 24" fill={roleColor} className="ml-1.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    </div>
                                  )}
                                </div>
                            </div>
                            
                            {/* Scrubber Console */}
                            <div className="flex-1 w-full">
                              <div className="flex items-end justify-between mb-5">
                                  <p className="text-[10px] uppercase tracking-[0.3em] font-black text-[#111111]/50 flex items-center gap-2">
                                    {isThisPlaying && isPlaying ? (
                                      <><span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{backgroundColor: roleColor}}></span> Transmitting</>
                                    ) : (
                                      'Audio Asset'
                                    )}
                                  </p>
                                  <span 
                                    className="px-4 py-1.5 bg-white rounded-full text-[9px] font-mono tracking-widest uppercase border font-black shadow-sm"
                                    style={{ borderColor: `${roleColor}30`, color: roleColor }}
                                  >
                                    {post.genre || 'Asset'}
                                  </span>
                              </div>
                              
                              {/* Dynamic Range Slider */}
                              {isThisPlaying ? (
                                <div className="relative w-full h-3 bg-white rounded-full overflow-hidden shadow-inner border border-black/5">
                                  <div className="absolute top-0 left-0 h-full transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${progress}%`, backgroundColor: roleColor }}></div>
                                  <input 
                                    type="range" min="0" max="100" 
                                    value={progress || 0} 
                                    onChange={(e) => seek?.(Number(e.target.value))} 
                                    className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" 
                                  />
                                </div>
                              ) : (
                                <div className="w-full h-3 bg-[#111111]/5 rounded-full shadow-inner border border-[#111111]/5"></div>
                              )}
                            </div>
                        </div>
                      )}

                      {/* ✍️ EDITORIAL LYRICS SECTION */}
                      {post.lyricsText && (
                        <div className="mt-10 relative pt-8 border-t border-[#111111]/5">
                            <span 
                              className="text-[9px] font-mono uppercase tracking-[0.4em] mb-6 block font-black flex items-center gap-2"
                              style={{ color: roleColor }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                              Written Draft Context
                            </span>
                            
                            <div className={`relative transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] pl-4 border-l-[3px] ${isExpanded ? '' : 'max-h-[140px] overflow-hidden'}`} style={{ borderColor: `${roleColor}50` }}>
                              <p className="text-base md:text-lg font-serif italic whitespace-pre-wrap leading-[2.2] tracking-wide text-[#111111]/80">
                                "{post.lyricsText}"
                              </p>
                              
                              {!isExpanded && (
                                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none"></div>
                              )}
                            </div>
                            
                            {post.lyricsText.length > 200 && (
                              <button 
                                onClick={(e) => toggleLyrics(post._id, e)} 
                                className="mt-4 text-[9px] uppercase tracking-[0.3em] font-black transition-opacity hover:opacity-100 opacity-60 ml-4"
                                style={{ color: roleColor }}
                              >
                                {isExpanded ? '[- Collapse Draft]' : '[+ Expand Draft]'}
                              </button>
                            )}
                        </div>
                      )}
                  </div>

                  {/* ⚡ VIBRANT INTERACTION FOOTER */}
                  <div className="px-8 md:px-10 py-6 flex items-center justify-between border-t border-[#111111]/5 relative z-10 bg-[#F9F9FB]">
                      <div className="flex gap-8">
                        
                        {/* Dynamic Like Button */}
                        <button onClick={(e) => handleLike(post, e)} className="flex items-center gap-2 group/btn transition-transform active:scale-95">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill={iLikedThis ? roleColor : 'none'} stroke={iLikedThis ? roleColor : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]/30 transition-colors" style={{ color: iLikedThis ? roleColor : undefined }}>
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          <span className="text-xs font-mono font-black" style={{ color: iLikedThis ? roleColor : 'rgba(17,17,17,0.4)' }}>{post.likes?.length || 0}</span>
                        </button>
                        
                        {/* Comment Button */}
                        <button onClick={() => setCommentingPost(post)} className="flex items-center gap-2 group/btn transition-transform active:scale-95">
                          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]/30 group-hover/btn:text-[#111111]/70 transition-colors"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                          <span className="text-xs font-mono font-black text-[#111111]/40 group-hover/btn:text-[#111111]/70 transition-colors">{post.comments?.length || 0}</span>
                        </button>

                      </div>

                      <div className="flex items-center gap-4">
                        {/* DYNAMIC PITCH BUTTON */}
                        {!isListener && !isAdmin && (
                          <button 
                            onClick={() => setPitchingPost(post)}
                            className="px-6 py-3 bg-white border rounded-full transition-all flex items-center gap-2 shadow-sm hover:shadow-md active:scale-95 group/pitch"
                            style={{ borderColor: `${roleColor}30`, color: roleColor }}
                          >
                            <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pitch Drop</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover/pitch:translate-x-1 group-hover/pitch:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                          </button>
                        )}

                        {/* ADMIN DELETE */}
                        {isAdmin && (
                          <button 
                            onClick={(e) => handleDeletePost(post._id, e)}
                            className="px-5 py-2.5 bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white text-[9px] font-black uppercase tracking-widest rounded-full transition-all active:scale-95 shadow-sm"
                          >
                            Purge
                          </button>
                        )}
                      </div>
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