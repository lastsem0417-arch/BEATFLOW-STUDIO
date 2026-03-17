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

  const navigate = useNavigate();
  const { currentTrack, isPlaying, playTrack, togglePlayPause, progress, seek } = useAudio();
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const currentUserId = loggedInUser.id || loggedInUser._id;
  const myRole = loggedInUser.role?.toLowerCase() || 'listener';
  const isListener = myRole === 'listener';
  const isAdmin = myRole === 'admin'; // 🔥 ADMIN CHECK

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/feed');
        setPosts(res.data);
      } catch (error) {
        console.error("Feed error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handlePlayClick = (post: any) => {
    if (currentTrack?._id === post._id) {
      togglePlayPause();
    } else {
      playTrack(post);
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

  // 🔥 ADMIN DELETE FUNCTION 🔥
  const handleDeletePost = async (postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Card click na ho jaye isliye
    if (!window.confirm("⚠️ SYSTEM OVERRIDE: Are you sure you want to permanently delete this post?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/posts/${postId}`, {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      
      // UI se post hata do instantly
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post:", err);
      alert("Error deleting post.");
    }
  };

  return (
    <div className="h-full w-full bg-transparent overflow-y-auto custom-scrollbar flex justify-center py-6 relative scroll-smooth">
      
      <div className="fixed top-[10%] left-[-10%] w-[600px] h-[600px] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none -z-10 animate-pulse"></div>

      <div className="w-full max-w-2xl px-4 z-10 flex flex-col gap-8 pb-40">
        
        <div className="mb-2 px-2 shrink-0 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h1 className="text-3xl font-serif italic text-white tracking-tight">{isAdmin ? 'Content Moderation' : 'Global Network'}</h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
               </span>
               <span className="text-[9px] uppercase tracking-[0.4em] text-emerald-500 font-black">Syncing Live</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-40">
             <div className="w-10 h-10 border-2 border-white/10 border-t-white rounded-full animate-spin"></div>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-neutral-500 font-mono text-sm">No transmissions found in the network.</div>
        ) : (
          posts.map((post, index) => {
            const isProducer = post.creatorRole.toLowerCase() === 'producer';
            const accentColor = isProducer ? 'blue' : post.creatorRole.toLowerCase() === 'lyricist' ? 'emerald' : 'purple';
            const isThisPlaying = currentTrack?._id === post._id;
            const iLikedThis = post.likes?.includes(currentUserId);
            const avatarSrc = post.creatorProfileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${post.creatorName}`;

            return (
              <div key={post._id} className={`shrink-0 group bg-[#0a0a0a]/80 backdrop-blur-3xl border ${isAdmin ? 'border-red-500/10 hover:border-red-500/30' : 'border-white/5 hover:border-white/20'} rounded-[2.5rem] transition-all duration-500 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8`}>
                
                <div onClick={() => navigate(`/profile/${post.creatorId}`)} className="p-7 flex items-start gap-5 cursor-pointer relative z-10">
                  <div className={`w-14 h-14 rounded-full border-2 ${isThisPlaying && isPlaying ? `border-${accentColor}-500 animate-pulse` : 'border-white/10'} overflow-hidden shrink-0 bg-black`}>
                    <img src={avatarSrc} className="w-full h-full object-cover scale-110" alt="avatar" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-bold">{post.creatorName}</h3>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full bg-${accentColor}-500/10 text-${accentColor}-400 border border-${accentColor}-500/20 uppercase font-black`}>{post.creatorRole}</span>
                      </div>
                      <span className="text-[10px] text-neutral-600 font-mono">{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className={`text-2xl font-serif italic mt-3 mb-2 ${isThisPlaying && isPlaying ? `text-${accentColor}-400` : 'text-white'}`}>{post.title}</h4>
                    <p className="text-neutral-400 text-sm font-light mb-6 line-clamp-3">{post.description}</p>

                    {post.contentUrl && (
                      <div onClick={(e) => e.stopPropagation()} className={`p-5 rounded-3xl border transition-all ${isThisPlaying ? `bg-${accentColor}-500/10 border-${accentColor}-500/30` : 'bg-black/60 border-white/5'} mb-6`}>
                        <div className="flex items-center gap-5">
                           <button onClick={() => handlePlayClick(post)} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isThisPlaying && isPlaying ? `bg-${accentColor}-500 text-black` : 'bg-white text-black'}`}>
                             {isThisPlaying && isPlaying ? '⏸' : '▶'}
                           </button>
                           <div className="flex-1">
                              <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-2">Seek Frequency</p>
                              {isThisPlaying && (
                                <input 
                                  type="range" min="0" max="100" 
                                  value={progress || 0} 
                                  onChange={(e) => seek?.(Number(e.target.value))} 
                                  className={`w-full h-1 bg-white/10 rounded-full appearance-none accent-${accentColor}-500 cursor-pointer`} 
                                />
                              )}
                           </div>
                        </div>
                      </div>
                    )}

                    {post.lyricsText && (
                      <div onClick={(e) => e.stopPropagation()} className="mb-5 bg-gradient-to-br from-emerald-500/[0.05] to-transparent border-l-2 border-emerald-500/50 p-6 rounded-2xl rounded-l-none italic font-serif text-emerald-100/90 relative">
                         <span className="absolute top-3 right-5 text-[8px] font-black text-emerald-500/30 uppercase tracking-[0.3em] italic">Written Bars</span>
                         <p className="text-[15px] whitespace-pre-wrap leading-loose tracking-wide">
                           "{post.lyricsText}"
                         </p>
                      </div>
                    )}

                    {/* INTERACTION BAR */}
                    <div onClick={(e) => e.stopPropagation()} className="pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex gap-8 text-neutral-500">
                          <button onClick={(e) => handleLike(post, e)} className={`flex items-center gap-2 ${iLikedThis ? 'text-red-500' : ''}`}>
                            {iLikedThis ? '❤️' : '🤍'} <span className="text-sm font-mono">{post.likes?.length || 0}</span>
                          </button>
                          <button onClick={() => setCommentingPost(post)} className="flex items-center gap-2 hover:text-blue-500">
                            💬 <span className="text-sm font-mono">{post.comments?.length || 0}</span>
                          </button>
                       </div>

                       <div className="flex items-center gap-3">
                         {/* PITCH BUTTON (Sirf Normal Creators ke liye) */}
                         {!isListener && !isAdmin && (
                           <button 
                             onClick={() => setPitchingPost(post)}
                             className="px-6 py-2 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-white transition-all shadow-xl"
                           >
                              Pitch ⚡
                           </button>
                         )}

                         {/* 🔥 ADMIN DELETE BUTTON 🔥 */}
                         {isAdmin && (
                           <button 
                             onClick={(e) => handleDeletePost(post._id, e)}
                             className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-600 hover:text-white transition-all shadow-xl flex items-center gap-2"
                           >
                              Delete 🗑️
                           </button>
                         )}
                       </div>
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