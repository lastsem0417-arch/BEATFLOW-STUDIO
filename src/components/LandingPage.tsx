import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Scene3D from './Scene3D'; // Make sure this path is correct

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP Animations Entry
  useEffect(() => {
    let ctx = gsap.context(() => {
      // Navbar Fade In
      gsap.fromTo('.nav-element', 
        { y: -20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' }
      );

      // Hero Text Reveal
      gsap.fromTo('.hero-text', 
        { y: 50, opacity: 0, filter: 'blur(10px)' }, 
        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.5, stagger: 0.2, ease: 'power4.out', delay: 0.3 }
      );

      // 3D Box Floating Effect
      gsap.to('.model-container', {
        y: -15,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5
      });

      // Trending Cards Staggered Entry
      gsap.fromTo('.trending-card',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          scrollTrigger: {
            trigger: '.trending-section',
            start: 'top 80%', // Triggers when section is 80% in view
          },
          ease: 'power3.out',
        }
      );

    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Public Dummy Data for Landing Page
  const trendingPosts = [
    {
      id: 1,
      creator: { name: 'Metro Boomin', role: 'Producer', avatar: 'M' },
      type: 'beat',
      content: { title: 'Dark Trap Banger', bpm: '142 BPM', genre: 'Trap / Hip-Hop' },
      likes: '3.2k',
      comments: 450,
      glow: 'blue'
    },
    {
      id: 2,
      creator: { name: 'Aryanlyrici', role: 'Writer', avatar: 'A' },
      type: 'lyrics',
      content: { text: "Walking through the shadows, neon on my face,\nIndustry is a marathon, I'm setting up the pace." },
      likes: '8.9k',
      comments: '1.2k',
      glow: 'emerald'
    },
    {
      id: 3,
      creator: { name: 'Kendrick L.', role: 'Rapper', avatar: 'K' },
      type: 'track',
      content: { title: 'Untitled Flow', status: 'Looking for Mix/Master' },
      likes: '12k',
      comments: '3k',
      glow: 'purple'
    }
  ];

  // 🔥 UPDATE: Navigate to Roles, not Login
  const handleProtectedAction = () => {
    alert("🔥 You need to define your space to collab! Join the movement.");
    navigate('/roles'); 
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white overflow-y-auto overflow-x-hidden custom-scrollbar font-sans relative">
      
      {/* 🌟 CINEMATIC BACKGROUND GLOWS */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/10 blur-[150px] rounded-full pointer-events-none opacity-50 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none opacity-50 animate-pulse"></div>
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none"></div>

      {/* 🚀 NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-6 relative z-20 border-b border-white/5 bg-[#050505]/50 backdrop-blur-xl sticky top-0">
        <div className="nav-element flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-black rounded flex items-center justify-center border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="font-serif italic font-bold text-white text-lg leading-none">I</span>
          </div>
          <span className="text-xl font-serif italic tracking-wider">Iconic<span className="text-emerald-500">.</span></span>
        </div>
        
        <button 
          onClick={() => navigate('/roles')} // 🔥 Fixed: Now goes to Roles
          className="nav-element px-8 py-3 bg-white text-black hover:bg-emerald-500 hover:text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transform hover:-translate-y-1"
        >
          Enter Studio →
        </button>
      </nav>

      {/* 🧊 HERO SECTION */}
      <div className="relative flex flex-col items-center justify-center pt-24 pb-32 px-4 z-10 text-center min-h-[85vh]">
        <p className="hero-text text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-black mb-6 animate-pulse">
          The Future of Music Collaboration
        </p>
        <h1 className="hero-text text-6xl md:text-8xl lg:text-9xl font-serif italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-600 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-6 leading-tight">
          Where Global Creators <br/> <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">Unite.</span>
        </h1>
        <p className="hero-text text-neutral-400 font-mono max-w-2xl mx-auto mb-16 text-sm md:text-base leading-relaxed">
          Listen to trending beats, read ghostwritten bars, and discover the next big star. Step into the ecosystem designed exclusively for visionary Producers, Lyricists, Rappers, and true Fans.
        </p>

        {/* 3D Model Container (Floating) */}
        <div className="hero-text model-container w-full max-w-5xl h-[400px] md:h-[500px] border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent rounded-[2.5rem] flex items-center justify-center relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
            
            <div className="absolute inset-0 z-0">
               {/* 🔥 TERA 3D SCENE YAHAN HAI 🔥 */}
               <Scene3D /> 
            </div>
            
            <div className="absolute bottom-4 right-6 pointer-events-none z-10">
                <p className="font-mono text-white/20 text-[10px] uppercase tracking-widest bg-black/50 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md">
                  Interactive Preview
                </p>
            </div>
            
            {/* Glowing inner border effect */}
            <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none shadow-[inset_0_0_50px_rgba(16,185,129,0.1)]"></div>
        </div>
      </div>

      {/* 🔥 TRENDING DROPS (Public Feed Preview) */}
      <div className="trending-section max-w-6xl mx-auto px-6 pb-40 relative z-10">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 border-b border-white/10 pb-6 gap-4">
            <div>
                <h2 className="text-5xl font-serif italic text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">Trending Drops</h2>
                <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500 font-black mt-3">Listen • Read • Vibe</p>
            </div>
            <button 
                onClick={() => navigate('/roles')} 
                className="text-xs font-mono text-emerald-400 hover:text-white transition-all border-b border-emerald-500/30 hover:border-white pb-1 group flex items-center gap-2"
            >
                View Network <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trendingPosts.map((post) => (
                <div key={post.id} className={`trending-card relative bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/5 hover:border-${post.glow}-500/50 rounded-3xl overflow-hidden transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(var(--${post.glow}-rgb),0.2)] group flex flex-col hover:-translate-y-2 cursor-pointer`} onClick={handleProtectedAction}>
                    
                    {/* Glowing Accent Top Border */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${post.glow}-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                    {/* Header */}
                    <div className="p-5 flex items-center gap-4 border-b border-white/5 bg-gradient-to-b from-white/[0.03] to-transparent">
                        <div className={`w-12 h-12 bg-gradient-to-br from-neutral-800 to-black rounded-full flex items-center justify-center border border-white/10 group-hover:border-${post.glow}-500/30 transition-colors shadow-inner`}>
                            <span className="font-serif italic text-white text-lg">{post.creator.avatar}</span>
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-sm group-hover:text-white transition-colors">{post.creator.name}</h3>
                            <span className={`text-[9px] uppercase tracking-widest text-${post.glow}-500 font-black`}>{post.creator.role}</span>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="p-8 flex-1 flex flex-col justify-center min-h-[200px] relative z-10">
                        {post.type === 'beat' && (
                            <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                <span className="text-5xl drop-shadow-[0_0_20px_rgba(59,130,246,0.3)] block mb-4">🎹</span>
                                <h4 className="text-white font-serif italic mt-2 text-base">{post.content.title}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-2 bg-blue-500/10 inline-block px-3 py-1 rounded-full border border-blue-500/20">{post.content.bpm}</p>
                            </div>
                        )}
                        {post.type === 'lyrics' && (
                            <div className="text-left relative">
                                <span className="absolute -top-6 -left-4 text-5xl text-emerald-500/20 font-serif group-hover:text-emerald-500/40 transition-colors">"</span>
                                <p className="text-neutral-300 font-mono text-xs leading-loose italic border-l-2 border-emerald-500/30 group-hover:border-emerald-500 pl-4 transition-colors">
                                    {post.content.text}
                                </p>
                            </div>
                        )}
                        {post.type === 'track' && (
                            <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                <span className="text-5xl drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] block mb-4">🎙️</span>
                                <h4 className="text-white font-serif italic mt-2 text-base">{post.content.title}</h4>
                                <p className="text-[10px] uppercase tracking-widest text-purple-400 mt-2 bg-purple-500/10 inline-block px-3 py-1 rounded-full border border-purple-500/20">{post.content.status}</p>
                            </div>
                        )}
                    </div>

                    {/* Protected Actions / Footer */}
                    <div className="px-6 py-4 border-t border-white/5 bg-black/60 flex justify-between items-center group-hover:bg-black/80 transition-colors">
                        <div className="flex gap-5">
                            <div className="text-neutral-500 group-hover:text-red-400 text-sm transition-colors flex items-center gap-1.5">
                                ❤️ <span className="text-xs font-mono">{post.likes}</span>
                            </div>
                            <div className="text-neutral-500 group-hover:text-blue-400 text-sm transition-colors flex items-center gap-1.5">
                                💬 <span className="text-xs font-mono">{post.comments}</span>
                            </div>
                        </div>
                        <div className={`text-[10px] uppercase tracking-widest font-black text-neutral-500 group-hover:text-${post.glow}-400 transition-colors flex items-center gap-2`}>
                            Listen <span className="text-sm">→</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      
    </div>
  );
}