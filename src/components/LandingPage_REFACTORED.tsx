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
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/feed?limit=3`);
        setTrendingPosts(Array.isArray(res.data) ? res.data : (res.data.posts || []));
      } catch (err) { console.error("Trending fetch failed:", err); }
    };
    if (preloaderDone) fetchTrending();
  }, [preloaderDone]);

  useLayoutEffect(() => {
    if (!preloaderDone) return;

    let ctx = gsap.context(() => {
      
      // 🎬 REFACTORED: Premium Smooth Parallax (No yoyo bounce)
      // --- A. HERO PARALLAX ---
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero-container",
          start: "top top",
          end: "bottom top",
          scrub: 0.8, // Reduced from 1.5 for smoother feel
        }
      });
      
      // 🔧 FIX: Reduced travel distances (was xPercent: -20)
      tl.to(".hero-line-1", { xPercent: -8, opacity: 0 }, 0);
      tl.to(".hero-line-2", { xPercent: 8, opacity: 0 }, 0);
      tl.to(".hero-line-3", { scale: 1.05, yPercent: 20, opacity: 0 }, 0); // Was scale: 1.2, y: 50

      // --- B. MANIFESTO REVEAL (Snappy, not sluggish) ---
      const manifestoLines = gsap.utils.toArray('.manifesto-line-inner');
      gsap.fromTo(manifestoLines, 
        { yPercent: 15, opacity: 0 }, // Was yPercent: 110
        {
          yPercent: 0, opacity: 1, stagger: 0.08, ease: "power4.out", // Changed from 0.15
          scrollTrigger: { trigger: ".manifesto-section", start: "top 80%", end: "center center", scrub: 0.5 }
        }
      );

      // --- C. TRENDING GRID REVEAL (Tight wave, not staggered) ---
      const trendingCards = gsap.utils.toArray('.trending-card-item');
      if (trendingCards.length > 0) {
        gsap.fromTo(trendingCards,
          { y: 30, opacity: 0 }, // Was y: 150
          { 
            y: 0, opacity: 1, stagger: 0.06, duration: 0.7, ease: "power4.out", // Was 1.2, stagger 0.15
            scrollTrigger: { trigger: ".trending-wrapper", start: "top 75%" }
          }
        );
      }

      // --- D. FOOTER CTA REVEAL (No skew, premium smooth) ---
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".cta-footer",
          start: "top 65%",
        }
      });

      ctaTl.fromTo('.cta-line-1',
        { yPercent: 15, opacity: 0 }, // Was yPercent: 120, skewY: 5
        { yPercent: 0, opacity: 1, duration: 0.6, ease: "power4.out" }
      )
      .fromTo('.cta-line-2',
        { yPercent: 15, opacity: 0 }, // Was yPercent: 120, skewY: 5
        { yPercent: 0, opacity: 1, duration: 0.6, ease: "power4.out" },
        "-=0.5" // Tighter overlap
      )
      .fromTo('.magnetic-btn-wrapper',
        { y: 15, opacity: 0, scale: 0.99 }, // Was y: 50, scale: 0.8
        { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, // Changed from elastic.out
        "-=0.4"
      );

      // --- E. MAGNETIC BUTTON (No jank, use power2.out) ---
      const magneticBtn = document.querySelector('.magnetic-btn');
      if (magneticBtn) {
        magneticBtn.addEventListener('mousemove', (e: any) => {
          const rect = magneticBtn.getBoundingClientRect();
          const x = (e.clientX - rect.left - rect.width / 2) * 0.3; // Reduced from 0.4
          const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
          gsap.to(magneticBtn, { x, y, duration: 0.4, ease: "power2.out" }); // Changed from 0.5
        });
        magneticBtn.addEventListener('mouseleave', () => {
          gsap.to(magneticBtn, { x: 0, y: 0, duration: 0.3, ease: "power2.out" }); // Changed from elastic
        });
      }

    }, containerRef);
    
    return () => ctx.revert();
  }, [preloaderDone, trendingPosts]);

  return (
    <div ref={containerRef} className="min-h-screen bg-black text-white font-sans select-none will-change-transform">
      {!preloaderDone && <CinematicPreloader onComplete={() => setPreloaderDone(true)} />}
      
      {preloaderDone && (
        <div className="relative z-10">
          {/* HERO SECTION */}
          <div className="hero-container h-screen flex flex-col items-center justify-center gap-6 px-4 md:px-10 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-b from-[#D4AF37] to-transparent pointer-events-none"></div>
            
            <h1 className="hero-line-1 text-7xl md:text-[120px] font-black leading-none tracking-tighter text-center relative z-10">
              The Evolution
            </h1>
            <h2 className="hero-line-2 text-5xl md:text-7xl font-serif italic relative z-10 text-[#D4AF37]">
              of Music Production
            </h2>
            <p className="hero-line-3 text-lg md:text-xl text-white/60 text-center max-w-2xl relative z-10">
              Where producers, rappers, and lyricists collaborate in real-time, powered by premium tools.
            </p>
          </div>

          {/* MANIFESTO SECTION */}
          <div className="manifesto-section py-20 md:py-32 px-6 md:px-16 bg-white text-black relative z-10">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-black mb-20 tracking-tight">Our Manifest.</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {["Seamless Collab", "Sonic Excellence", "Network First"].map((title, i) => (
                  <div key={i} className="manifesto-line-inner">
                    <h3 className="text-2xl font-bold mb-4">{title}</h3>
                    <p className="text-sm text-black/60">Premium tools for creators who demand excellence.</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TRENDING SECTION */}
          <div className="trending-wrapper py-20 md:py-32 px-6 md:px-16 bg-black relative z-10">
            <h2 className="text-5xl md:text-7xl font-black mb-16 text-white">Trending Drops.</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingPosts.slice(0, 3).map((post, i) => (
                <div key={i} className="trending-card-item bg-white/10 border border-white/20 rounded-3xl p-8 hover:border-[#D4AF37]/50 transition-all duration-300 will-change-transform">
                  <h3 className="text-xl font-bold text-white mb-2">{post.title || `Track ${i+1}`}</h3>
                  <p className="text-sm text-white/60">{post.creatorName || "Artist"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA FOOTER */}
          <div className="cta-footer py-20 md:py-32 px-6 md:px-16 bg-gradient-to-r from-[#D4AF37]/10 to-[#E63946]/10 border-t border-white/10 relative z-10 flex flex-col items-center justify-center text-center">
            <h1 className="cta-line-1 text-5xl md:text-7xl font-black text-white mb-8 tracking-tight">Ready?</h1>
            <p className="cta-line-2 text-lg text-white/70 max-w-xl mb-12">Join thousands of creators building the future of music.</p>
            <div className="magnetic-btn-wrapper will-change-transform">
              <button 
                onClick={() => navigate('/roles')} 
                className="magnetic-btn px-10 py-4 bg-white text-black hover:bg-[#D4AF37] rounded-full text-[11px] uppercase tracking-[0.3em] font-black transition-all duration-300 active:scale-95 shadow-lg hover:shadow-[0_20px_40px_rgba(212,175,55,0.3)]"
              >
                Start Creating Today
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
