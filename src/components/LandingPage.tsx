import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
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
  const [activeDomain, setActiveDomain] = useState(0);

  // 1. FETCH EXACTLY 4 TRENDING TRACKS
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tracks/all');
        if (Array.isArray(res.data)) setTrendingPosts(res.data.slice(0, 4));
      } catch (err) { setTrendingPosts([]); }
    };
    fetchTrending();
  }, []);

  // 2. THE FLUID GSAP ENGINE (Premium Physics)
  useLayoutEffect(() => {
    if (!preloaderDone) return;

    let ctx = gsap.context(() => {
      
      // --- A. HERO PARALLAX ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-container",
          start: "top top",
          end: "bottom top",
          scrub: 1.5,
        }
      });
      tl.to(".hero-line-1", { xPercent: -20, opacity: 0 }, 0);
      tl.to(".hero-line-2", { xPercent: 20, opacity: 0 }, 0);
      tl.to(".hero-line-3", { scale: 1.2, yPercent: 50, opacity: 0 }, 0);

      // --- B. MANIFESTO REVEAL ---
      const manifestoLines = gsap.utils.toArray('.manifesto-line-inner');
      gsap.fromTo(manifestoLines, 
        { yPercent: 110, opacity: 0 }, 
        {
          yPercent: 0, opacity: 1, stagger: 0.15, ease: "power4.out",
          scrollTrigger: { trigger: ".manifesto-section", start: "top 80%", end: "center center", scrub: 1 }
        }
      );

      // --- C. TRENDING GRID REVEAL ---
      const trendingCards = gsap.utils.toArray('.trending-card-item');
      if (trendingCards.length > 0) {
        gsap.fromTo(trendingCards,
          { y: 150, opacity: 0 },
          { 
            y: 0, opacity: 1, stagger: 0.15, duration: 1.2, ease: "expo.out",
            scrollTrigger: { trigger: ".trending-wrapper", start: "top 75%" }
          }
        );
      }

      // 🔥 D. FOOTER CTA REVEAL (Awwwards Grade Split Text) 🔥
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".cta-footer",
          start: "top 65%", // Start animation when footer is coming into view
        }
      });

      ctaTl.fromTo('.cta-line-1',
        { yPercent: 120, skewY: 5, opacity: 0 },
        { yPercent: 0, skewY: 0, opacity: 1, duration: 1.5, ease: "expo.out" }
      )
      .fromTo('.cta-line-2',
        { yPercent: 120, skewY: 5, opacity: 0 },
        { yPercent: 0, skewY: 0, opacity: 1, duration: 1.5, ease: "expo.out" },
        "-=1.2" // Smooth overlap
      )
      .fromTo('.magnetic-btn-wrapper',
        { y: 50, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "elastic.out(1, 0.4)" },
        "-=1"
      );

      // --- E. MAGNETIC BUTTON ---
      const magneticBtn = document.querySelector('.magnetic-btn');
      if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (e: any) => {
          const rect = magneticBtn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
          const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
          gsap.to(magneticBtn, { x, y, duration: 0.5, ease: "power2.out" });
        });
        magneticBtn.addEventListener('mouseleave', () => {
          gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
        });
      }

    }, containerRef);
    
    return () => ctx.revert();
  }, [preloaderDone, trendingPosts]);

  const manifestoText = [
    "THE INDUSTRY IS SCATTERED.",
    "WE BUILT BEATFLOW TO",
    "SHATTER THE WALLS.",
    "PURE CREATIVE FREEDOM."
  ];

  const domains = [
    { num: '01', title: 'PRODUCER', hex: '#D4AF37', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop' },
    { num: '02', title: 'RAPPER', hex: '#E63946', img: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=1887&auto=format&fit=crop' },
    { num: '03', title: 'LYRICIST', hex: '#52B788', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop' },
    { num: '04', title: 'LISTENER', hex: '#8ECAE6', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop' }
  ];

  return (
    <>
      {!preloaderDone && <CinematicPreloader onComplete={() => setPreloaderDone(true)} />}

      {/* 🔥 BASE APPLIED HERE 🔥 */}
      <div ref={containerRef} className="relative bg-[#FAF9F6] text-[#111111] font-sans selection:bg-[#D4AF37] selection:text-white cursor-none">
        
        {/* NAV */}
        <nav className="fixed top-0 w-full flex justify-between items-center px-10 py-8 mix-blend-difference z-50 pointer-events-none">
          <span className="text-2xl font-black tracking-widest text-white pointer-events-auto cursor-pointer">BEATFLOW<span className="text-[#D4AF37]">.</span></span>
          <button onClick={() => navigate('/roles')} className="pointer-events-auto px-8 py-3.5 bg-white text-[#111111] hover:bg-[#D4AF37] hover:text-white rounded-full text-[10px] uppercase tracking-[0.2em] font-black transition-colors duration-500">
            Enter Studio
          </button>
        </nav>

        {/* 1. HERO SECTION */}
        <section className="hero-container relative h-screen flex flex-col items-center justify-center pt-20 bg-[#FAF9F6] overflow-hidden">
          {/* Subtle gold aura for luxury feel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-[#D4AF37]/15 blur-[150px] rounded-full pointer-events-none"></div>

          <div className="flex flex-col items-center w-full leading-[0.8] uppercase tracking-tighter relative z-10">
            <div className="overflow-hidden">
                <div className="hero-line-1 text-[13vw] md:text-[16vw] font-black text-transparent" style={{ WebkitTextStroke: '2px #111111' }}>GLOBAL</div>
            </div>
            <div className="overflow-hidden">
                <div className="hero-line-2 text-[13vw] md:text-[16vw] font-black text-transparent" style={{ WebkitTextStroke: '2px #111111' }}>CREATORS</div>
            </div>
            <div className="overflow-hidden">
                <div className="hero-line-3 text-[14vw] md:text-[16vw] font-black bg-clip-text text-transparent bg-gradient-to-r from-[#D4AF37] via-[#E63946] to-[#52B788] drop-shadow-[0_20px_50px_rgba(212,175,55,0.15)]">
                    UNITE
                </div>
            </div>
          </div>
        </section>

        {/* 2. MANIFESTO */}
        <section className="manifesto-section min-h-[80vh] flex items-center justify-center bg-white px-6 py-32 rounded-t-[4rem] z-10 relative">
          <div className="flex flex-col gap-2 md:gap-4 w-full max-w-6xl mx-auto text-center">
            {manifestoText.map((line, index) => (
              <div key={index} className="overflow-hidden py-2">
                <h2 className="manifesto-line-inner text-4xl md:text-6xl lg:text-7xl font-black font-sans uppercase tracking-tighter text-[#111111] leading-[1.1] m-0">
                  {line}
                </h2>
              </div>
            ))}
          </div>
        </section>

        {/* 3. PREMIUM DOMAINS SPLIT SCREEN */}
        <section className="w-full min-h-screen bg-[#FAF9F6] flex flex-col md:flex-row relative z-10 border-y border-[#111111]/5">
            <div className="w-full md:w-1/2 flex flex-col justify-center py-20 px-10 md:pl-20 md:pr-10 z-10">
                <h3 className="text-[10px] uppercase tracking-[0.5em] text-[#666666] font-black mb-12 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span> Select Your Path
                </h3>
                <div className="flex flex-col gap-6">
                    {domains.map((domain, i) => (
                        <div 
                            key={i}
                            onMouseEnter={() => setActiveDomain(i)}
                            onClick={() => navigate('/roles')}
                            className="group flex flex-col cursor-pointer border-b border-[#111111]/10 pb-6 transition-all duration-500"
                        >
                            <span className="text-xs font-mono mb-2 transition-colors duration-500" style={{ color: activeDomain === i ? domain.hex : '#999999' }}>[{domain.num}]</span>
                            <h2 
                                className="text-5xl md:text-7xl font-black uppercase tracking-tighter transition-all duration-500"
                                style={{ 
                                    color: activeDomain === i ? '#111111' : '#CCCCCC',
                                    transform: activeDomain === i ? 'translateX(20px)' : 'translateX(0)',
                                    fontStyle: activeDomain === i ? 'italic' : 'normal',
                                    fontFamily: activeDomain === i ? 'serif' : 'sans-serif'
                                }}
                            >
                                {domain.title}
                            </h2>
                        </div>
                    ))}
                </div>
            </div>
            <div className="hidden md:flex w-1/2 h-screen sticky top-0 items-center justify-center p-20">
                <div className="w-full h-[80%] relative rounded-[2.5rem] overflow-hidden bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                    {domains.map((domain, i) => (
                        <img 
                            key={i}
                            src={domain.img}
                            alt={domain.title}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]"
                            style={{
                                opacity: activeDomain === i ? 1 : 0,
                                scale: activeDomain === i ? 1 : 1.2,
                                filter: activeDomain === i ? 'grayscale(0%)' : 'grayscale(100%) blur(10px)'
                            }}
                        />
                    ))}
                    {/* Light gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] to-transparent opacity-60"></div>
                </div>
            </div>
        </section>

        {/* 4. TRENDING DROPS */}
        <section className="trending-wrapper min-h-screen w-full bg-white flex flex-col justify-center py-32 px-10 md:px-20 relative z-10 rounded-b-[4rem] shadow-[0_30px_60px_rgba(0,0,0,0.05)]">
           <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between border-b border-[#111111]/10 pb-8 gap-4">
              <div>
                 <h2 className="text-5xl md:text-7xl font-serif italic text-[#111111] tracking-tight">Trending Drops</h2>
                 <p className="text-[10px] uppercase tracking-[0.4em] text-[#666666] font-black mt-4 font-mono">Top 4 Global Assets</p>
              </div>
              <button onClick={() => navigate('/roles')} className="text-[10px] font-black uppercase tracking-[0.3em] text-white bg-[#111111] px-8 py-4 rounded-full hover:bg-[#D4AF37] transition-all shadow-xl hover:shadow-[0_15px_30px_rgba(212,175,55,0.3)] flex items-center gap-3 group">
                 Explore Network <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {trendingPosts.length === 0 ? (
                 <div className="col-span-full text-[#666666] uppercase tracking-widest font-mono text-center py-20 font-bold">Scanning Network...</div>
              ) : (
                trendingPosts.map((post, i) => (
                  <div key={post._id || i} className="trending-card-item group cursor-pointer flex flex-col" onClick={() => navigate('/roles')}>
                     <div className="w-full aspect-[3/4] bg-[#FAF9F6] rounded-[2rem] overflow-hidden relative mb-6 border border-[#111111]/5 shadow-inner group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow duration-500">
                        <img 
                          src={post.coverImage || post.creatorProfileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.creatorName || i}`} 
                          alt="Cover" 
                          className="absolute inset-0 w-full h-full object-cover opacity-80 grayscale group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col">
                           <p className="text-[9px] uppercase tracking-widest font-black text-[#D4AF37] mb-2">{post.creatorRole || 'Creator'}</p>
                           <h4 className="text-3xl font-serif italic text-[#111111] leading-tight mb-5 drop-shadow-sm">{post.title || 'Untitled Asset'}</h4>
                           <div className="flex items-center gap-3">
                              <span className="w-10 h-10 rounded-full bg-white border border-[#111111]/10 flex items-center justify-center text-[#111111] shadow-sm group-hover:bg-[#111111] group-hover:text-white transition-colors duration-300">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                              </span>
                              <span className="text-[10px] font-black font-mono text-[#111111]/50 group-hover:text-[#111111] transition-colors uppercase tracking-[0.2em]">Play Track</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 px-2">
                       <span className="text-xs font-bold text-[#111111] tracking-wide">{post.creatorName || 'Artist'}</span>
                       <span className="w-1 h-1 rounded-full bg-[#D4AF37]"></span>
                       <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">{post.genre || 'Audio'}</span>
                     </div>
                  </div>
                ))
              )}
           </div>
        </section>

        {/* 🔥 5. MASSIVE CTA FOOTER (PREMIUM GRAPHITE THEME) 🔥 */}
        <footer className="cta-footer relative w-full h-screen bg-[#0F0F11] flex flex-col items-center justify-center overflow-hidden z-0">
          
          {/* 🔥 Cinematic Backlight (No more colored glows) 🔥 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[40vw] bg-white/5 blur-[160px] rounded-full pointer-events-none"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none"></div>

          {/* Premium noise texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.08] mix-blend-screen pointer-events-none"></div>
          
          <div className="text-center z-10 px-4 flex flex-col items-center perspective-[1000px]">
            
            <div className="overflow-hidden pb-2">
               <h2 className="cta-line-1 text-[13vw] md:text-[11vw] font-black uppercase tracking-tighter leading-[0.9] text-white m-0 drop-shadow-lg">
                 READY TO
               </h2>
            </div>
            
            <div className="overflow-hidden pb-4">
               {/* DROP Typography enhanced */}
               <h2 className="cta-line-2 text-[15vw] md:text-[13vw] font-black uppercase tracking-tighter leading-[0.9] m-0 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E63946] to-[#52B788] drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                 DROP?
               </h2>
            </div>
            
            {/* Magnetic Button - Premium White */}
            <div className="magnetic-btn-wrapper mt-16 md:mt-20 flex justify-center z-20">
              <button 
                onClick={() => navigate('/roles')} 
                className="magnetic-btn px-16 py-6 bg-white text-[#111111] rounded-full font-black uppercase tracking-[0.4em] text-[10px] md:text-xs transition-all duration-300 hover:bg-[#D4AF37] hover:text-white shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.3)] z-20"
              >
                Enter The Studio
              </button>
            </div>
          </div>
          
          {/* Footer Bottom Bar */}
          <div className="absolute bottom-10 w-full flex justify-between px-10 md:px-20 text-[9px] font-mono uppercase tracking-[0.3em] text-[#666666]">
            <span>BeatFlow Ecosystem © 2026</span>
            <span className="hover:text-white transition-colors cursor-pointer">Awwwards Execution</span>
          </div>
        </footer>

      </div>
    </>
  );
}