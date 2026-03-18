import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import CinematicPreloader from './CinematicPreloader'; 

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // 🔥 1. FETCH REAL DATA
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tracks/all');
        if (Array.isArray(res.data)) {
            setTrendingPosts(res.data.slice(0, 3));
        } else {
            setTrendingPosts([]);
        }
      } catch (err) { 
        console.error("Backend Error 404: Check your Express routes!"); 
        setTrendingPosts([]); 
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchTrending();
  }, []);

  // 🔥 2. THE MASSIVE GSAP SCROLL ENGINE
  useLayoutEffect(() => {
    if (!preloaderDone) return; 

    let ctx = gsap.context(() => {
      
      // --- SECTION 1: HERO ENTRY ---
      gsap.fromTo('.nav-element', { y: -30, opacity: 0 }, { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: 'power4.out' });
      gsap.fromTo('.hero-text-line', { y: '100%', rotateZ: 2, opacity: 0 }, { y: '0%', rotateZ: 0, opacity: 1, duration: 1.8, stagger: 0.15, ease: [0.76, 0, 0.24, 1] });
      gsap.to('.hero-content', {
        yPercent: -50, opacity: 0, ease: 'none',
        scrollTrigger: { trigger: '.hero-section', start: 'top top', end: 'bottom top', scrub: 1 }
      });

      // --- SECTION 2: MANIFESTO TEXT REVEAL (Apple Style) ---
      // Words fade in as you scroll past them
      gsap.fromTo('.manifesto-word', 
        { opacity: 0.1 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.manifesto-section',
            start: 'top 70%',
            end: 'bottom 50%',
            scrub: 1,
          }
        }
      );

      // --- SECTION 3: INFINITE MARQUEE ---
      gsap.to('.marquee-inner', {
        xPercent: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.marquee-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });

      // --- SECTION 4: ECOSYSTEM BENTO BOX PARALLAX ---
      const bentoCards = gsap.utils.toArray('.bento-card');
      if(bentoCards.length > 0){
          gsap.fromTo(bentoCards,
            { y: 150, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 1.5, stagger: 0.2, ease: [0.76, 0, 0.24, 1],
                scrollTrigger: { trigger: '.ecosystem-section', start: 'top 75%' }
            }
          );
      }

      // --- SECTION 5: TRENDING CARDS ---
      const cards = gsap.utils.toArray('.trending-card');
      if (cards.length > 0) {
        gsap.fromTo(cards,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.5, stagger: 0.15, ease: [0.76, 0, 0.24, 1],
            scrollTrigger: { trigger: '.trending-section', start: 'top 80%' }
          }
        );
      }

      // --- SECTION 6: FOOTER REVEAL ---
      gsap.fromTo('.footer-content',
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.5, ease: 'power4.out', scrollTrigger: { trigger: '.footer-section', start: 'top 90%' } }
      );

    }, containerRef);
    
    return () => ctx.revert();
  }, [preloaderDone, trendingPosts]); 

  const handleProtectedAction = () => navigate('/roles'); 

  const getRoleTheme = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'lyricist') return { text: 'text-lyricist', border: 'border-lyricist/30', hoverBorder: 'hover:border-lyricist/50', bg: 'bg-lyricist/10', glow: 'shadow-[0_0_30px_rgba(82,183,136,0.15)]' };
    if (r === 'rapper') return { text: 'text-rapper', border: 'border-rapper/30', hoverBorder: 'hover:border-rapper/50', bg: 'bg-rapper/10', glow: 'shadow-[0_0_30px_rgba(230,57,70,0.15)]' };
    return { text: 'text-producer', border: 'border-producer/30', hoverBorder: 'hover:border-producer/50', bg: 'bg-producer/10', glow: 'shadow-[0_0_30px_rgba(212,175,55,0.15)]' };
  };

  // Helper to split text for Manifesto animation
  const manifestoText = "The music industry is broken. Isolated talent, scattered files, and missed connections. We built BeatFlow to shatter the walls. One unified ecosystem. End-to-end encrypted collaboration. Pure creative freedom.";

  return (
    <>
      {!preloaderDone && <CinematicPreloader onComplete={() => setPreloaderDone(true)} />}

      <div ref={containerRef} className="min-h-screen bg-brand-onyx text-brand-pearl overflow-hidden font-sans relative" style={{ opacity: preloaderDone ? 1 : 0 }}>
        
        {/* AMBIENT GLOWS */}
        <div className="fixed top-[10%] left-[-10%] w-[50vw] h-[50vw] bg-producer/5 blur-[180px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-lyricist/5 blur-[180px] rounded-full pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5 mix-blend-screen pointer-events-none z-0"></div>

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 md:px-12 py-8 relative z-50 mix-blend-difference">
          <div className="nav-element flex items-center gap-3 cursor-pointer">
            <span className="text-xl md:text-2xl font-serif italic tracking-widest font-bold text-brand-pearl">BeatFlow<span className="text-producer">.</span></span>
          </div>
          <button onClick={() => navigate('/roles')} className="nav-element px-6 md:px-8 py-3 bg-brand-pearl text-black hover:bg-producer hover:text-black rounded-full text-[9px] md:text-[10px] uppercase tracking-[0.2em] font-black transition-colors duration-500">
            Enter Studio
          </button>
        </nav>

        {/* 01. HERO SECTION */}
        <div className="hero-section relative flex flex-col items-center justify-center min-h-[90vh] z-10 px-6">
          <div className="hero-content text-center w-full max-w-7xl mx-auto flex flex-col items-center">
             <div className="overflow-hidden mb-6 md:mb-8">
                <p className="hero-text-line text-[9px] md:text-xs uppercase tracking-[0.6em] text-producer font-black">
                  The Premium Era of Collaboration
                </p>
             </div>
             <div className="flex flex-col items-center leading-[0.85] w-full">
               <div className="overflow-hidden w-full pb-2 md:pb-4"><h1 className="hero-text-line text-6xl md:text-[9rem] lg:text-[13rem] font-serif italic text-brand-pearl tracking-tighter">Global</h1></div>
               <div className="overflow-hidden w-full pb-2 md:pb-4"><h1 className="hero-text-line text-6xl md:text-[9rem] lg:text-[13rem] font-serif italic text-brand-muted tracking-tighter">Creators</h1></div>
               <div className="overflow-hidden w-full pb-2 md:pb-4">
                  <h1 className="hero-text-line text-6xl md:text-[9rem] lg:text-[13rem] font-serif italic text-brand-pearl tracking-tighter flex items-center justify-center gap-4 md:gap-8">
                    Unite<span className="w-3 h-3 md:w-6 md:h-6 lg:w-8 lg:h-8 bg-producer rounded-full inline-block mb-2 md:mb-6 lg:mb-10 shadow-[0_0_20px_#D4AF37]"></span>
                  </h1>
               </div>
             </div>
          </div>
        </div>

        {/* 02. THE MANIFESTO (Scroll Reveal Text) */}
        <div className="manifesto-section relative z-20 min-h-screen flex items-center justify-center px-6 md:px-20 py-32 bg-brand-onyx">
            <h2 className="text-3xl md:text-5xl lg:text-7xl font-serif italic leading-tight md:leading-snug max-w-6xl mx-auto text-center">
                {manifestoText.split(" ").map((word, i) => (
                    <span key={i} className="manifesto-word inline-block mr-[0.25em]">{word}</span>
                ))}
            </h2>
        </div>

        {/* 03. INFINITE MARQUEE */}
        <div className="marquee-section relative z-10 w-full overflow-hidden py-20 bg-brand-dark border-y border-white/5 flex items-center">
             <div className="marquee-inner whitespace-nowrap flex text-[10rem] md:text-[15rem] font-serif italic font-black text-white/5 select-none leading-none">
                 <span className="px-10">PRODUCE • WRITE • RAP • LISTEN • </span>
                 <span className="px-10">PRODUCE • WRITE • RAP • LISTEN • </span>
                 <span className="px-10">PRODUCE • WRITE • RAP • LISTEN • </span>
             </div>
        </div>

        {/* 04. THE ECOSYSTEM (Bento Box Parallax) */}
        <div className="ecosystem-section relative z-30 max-w-7xl mx-auto px-6 py-40">
            <div className="mb-20 text-center">
                <p className="text-[10px] uppercase tracking-[0.5em] text-brand-muted font-black mb-4">The Infrastructure</p>
                <h2 className="text-5xl md:text-7xl font-serif italic text-brand-pearl">Choose Your Domain</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                {/* Producer Card */}
                <div className="bento-card bg-brand-dark border border-white/5 hover:border-producer/50 rounded-[2rem] p-10 md:p-14 group cursor-pointer transition-colors" onClick={handleProtectedAction}>
                    <div className="w-16 h-16 rounded-full bg-producer/10 flex items-center justify-center text-producer text-2xl mb-8 group-hover:scale-110 transition-transform">🎹</div>
                    <h3 className="text-3xl md:text-4xl font-serif italic text-brand-pearl mb-4">The Studio Console</h3>
                    <p className="text-brand-muted text-sm leading-relaxed font-mono">For Producers. Upload high-fidelity beats, manage stems, and monitor track analytics in a pure DAW-like environment.</p>
                </div>
                
                {/* Rapper Card */}
                <div className="bento-card bg-brand-dark border border-white/5 hover:border-rapper/50 rounded-[2rem] p-10 md:p-14 group cursor-pointer transition-colors mt-0 md:mt-16" onClick={handleProtectedAction}>
                    <div className="w-16 h-16 rounded-full bg-rapper/10 flex items-center justify-center text-rapper text-2xl mb-8 group-hover:scale-110 transition-transform">🎙️</div>
                    <h3 className="text-3xl md:text-4xl font-serif italic text-brand-pearl mb-4">The Artist Hub</h3>
                    <p className="text-brand-muted text-sm leading-relaxed font-mono">For Rappers. Scout the global feed for beats, secure exclusive rights, and drop encrypted vocals directly to producers.</p>
                </div>

                {/* Lyricist Card */}
                <div className="bento-card bg-brand-dark border border-white/5 hover:border-lyricist/50 rounded-[2rem] p-10 md:p-14 group cursor-pointer transition-colors" onClick={handleProtectedAction}>
                    <div className="w-16 h-16 rounded-full bg-lyricist/10 flex items-center justify-center text-lyricist text-2xl mb-8 group-hover:scale-110 transition-transform">✍️</div>
                    <h3 className="text-3xl md:text-4xl font-serif italic text-brand-pearl mb-4">The Writer's Pad</h3>
                    <p className="text-brand-muted text-sm leading-relaxed font-mono">For Ghostwriters. Draft lyrics with AI spark assistance, pitch verses to artists, and protect your intellectual property.</p>
                </div>

                {/* Listener Card */}
                <div className="bento-card bg-brand-dark border border-white/5 hover:border-listener/50 rounded-[2rem] p-10 md:p-14 group cursor-pointer transition-colors mt-0 md:mt-16" onClick={handleProtectedAction}>
                    <div className="w-16 h-16 rounded-full bg-listener/10 flex items-center justify-center text-listener text-2xl mb-8 group-hover:scale-110 transition-transform">🎧</div>
                    <h3 className="text-3xl md:text-4xl font-serif italic text-brand-pearl mb-4">The 5D Zen Mode</h3>
                    <p className="text-brand-muted text-sm leading-relaxed font-mono">For Fans. Experience unreleased tracks, discover emerging talent, and vibe in an immersive, distraction-free player.</p>
                </div>
            </div>
        </div>

        {/* 05. TRENDING DROPS (Real API Data) */}
        <div className="trending-section max-w-7xl mx-auto px-6 pb-40 relative z-30">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 border-b border-white/5 pb-8 gap-4">
              <div>
                  <h2 className="text-5xl md:text-7xl font-serif italic text-brand-pearl">Trending Drops</h2>
              </div>
              <button onClick={handleProtectedAction} className="text-xs font-mono text-brand-muted hover:text-producer transition-all border-b border-transparent hover:border-producer pb-1 group flex items-center gap-2">
                  View Network <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {isLoadingData ? (
                 <div className="col-span-3 flex justify-center py-20"><div className="w-12 h-12 border border-brand-muted border-t-producer rounded-full animate-spin"></div></div>
              ) : trendingPosts.length === 0 ? (
                 <div className="col-span-3 text-center text-brand-muted py-10 font-mono text-sm uppercase tracking-widest">No global drops found. Backend 404 Error.</div>
              ) : (
                trendingPosts.map((post) => {
                  const theme = getRoleTheme(post.creatorRole);
                  return (
                    <div key={post._id} className={`trending-card relative bg-brand-dark border border-white/5 ${theme.hoverBorder} ${theme.glow} rounded-[2rem] overflow-hidden transition-all duration-700 group flex flex-col cursor-pointer`} onClick={handleProtectedAction}>
                        <div className="p-6 flex items-center gap-4 border-b border-white/5">
                            <div className={`w-12 h-12 bg-black rounded-full flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-white/20 transition-all`}>
                                <img src={post.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorName || 'Artist'}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="creator" />
                            </div>
                            <div>
                                <h3 className="text-brand-pearl font-bold text-sm">{post.creatorName || 'Artist'}</h3>
                                <span className={`text-[8px] uppercase tracking-[0.2em] ${theme.text} font-black`}>{post.creatorRole || 'Creator'}</span>
                            </div>
                        </div>
                        <div className="p-10 flex-1 flex flex-col justify-center min-h-[220px] relative z-10 text-center">
                            <span className={`text-5xl block mb-6 opacity-60 group-hover:opacity-100 transition-opacity`}>{post.trackType === 'lyrics' ? '✍️' : post.trackType === 'beat' ? '🎹' : '🎙️'}</span>
                            <h4 className="text-brand-pearl font-serif italic text-lg truncate px-2">{post.title}</h4>
                        </div>
                        <div className="px-8 py-5 border-t border-white/5 bg-[#010101] flex justify-between items-center group-hover:bg-[#080808] transition-colors">
                            <div className="text-brand-muted group-hover:text-brand-pearl text-xs font-mono transition-colors">{post.likes || Math.floor(Math.random() * 500) + 10} LIKES</div>
                            <div className={`text-[9px] uppercase tracking-[0.2em] font-black text-brand-muted ${theme.text} flex items-center gap-2`}>Explore <span>→</span></div>
                        </div>
                    </div>
                  );
                })
              )}
          </div>
        </div>

        {/* 06. MASSIVE CTA FOOTER */}
        <div className="footer-section relative min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark border-t border-white/5 overflow-hidden px-6">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none z-0"></div>
             
             <div className="footer-content text-center z-10">
                <p className="text-[10px] uppercase tracking-[0.8em] text-producer font-black mb-8">The Stage Is Yours</p>
                <h2 className="text-6xl md:text-8xl lg:text-[10rem] font-serif italic text-brand-pearl mb-12 tracking-tighter">Ready to Drop?</h2>
                <button onClick={handleProtectedAction} className="px-10 py-5 bg-brand-pearl text-black hover:bg-producer rounded-full text-xs uppercase tracking-[0.3em] font-black transition-colors duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(212,175,55,0.5)]">
                   Join The Ecosystem
                </button>
             </div>
             
             <div className="absolute bottom-8 flex w-full justify-between px-12 text-[10px] uppercase tracking-widest font-mono text-brand-muted z-10">
                 <span>© 2026 BeatFlow.</span>
                 <span className="hover:text-brand-pearl cursor-pointer transition-colors">System Admin</span>
             </div>
        </div>

      </div>
    </>
  );
}