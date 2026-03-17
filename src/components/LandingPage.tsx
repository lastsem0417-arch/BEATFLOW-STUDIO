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

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/tracks/all');
        setTrendingPosts(Array.isArray(res.data) ? res.data.slice(0, 6) : []);
      } catch {
        setTrendingPosts([]);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchTrending();
  }, []);

  // 💀 TEXT SPLIT
  const splitText = (selector: string) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      const text = el.textContent || "";
      el.innerHTML = text
        .split("")
        .map((char) => `<span class="char inline-block">${char}</span>`)
        .join("");
    });
  };

  // 🧲 MAGNETIC
  const magnetic = (e: any) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    gsap.to(el, { x: x * 0.2, y: y * 0.2, duration: 0.3 });
  };

  const resetMagnetic = (e: any) => {
    gsap.to(e.currentTarget, { x: 0, y: 0, duration: 0.5 });
  };

  // 💀 GSAP
  useLayoutEffect(() => {
    if (!preloaderDone) return;

    splitText(".hero-text-line");

    let ctx = gsap.context(() => {

      gsap.from(".nav-element", {
        y: -60,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: "power4.out"
      });

      gsap.from(".char", {
        y: 120,
        opacity: 0,
        stagger: 0.03,
        duration: 1.4,
        ease: "power4.out"
      });

      gsap.from(".hero-subtext", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        delay: 0.5
      });

      gsap.from(".about-section", {
        y: 100,
        opacity: 0,
        duration: 1.5,
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 80%"
        }
      });

      gsap.from(".trending-card", {
        y: 120,
        opacity: 0,
        stagger: 0.2,
        duration: 1.4,
        scrollTrigger: {
          trigger: ".trending-section",
          start: "top 80%"
        }
      });

      gsap.from(".role-card", {
        y: 100,
        opacity: 0,
        stagger: 0.2,
        duration: 1.2,
        scrollTrigger: {
          trigger: ".roles-section",
          start: "top 80%"
        }
      });

    }, containerRef);

    return () => ctx.revert();
  }, [preloaderDone, trendingPosts]);

  return (
    <>
      {!preloaderDone && (
        <CinematicPreloader onComplete={() => setPreloaderDone(true)} />
      )}

      <div ref={containerRef} className="bg-black text-white">

        {/* NAV */}
        <nav className="flex justify-between px-10 py-8">
          <h1 className="nav-element text-2xl font-serif italic">
            RapVerse<span className="text-emerald-500">.</span>
          </h1>

          <button
            onClick={() => navigate('/roles')}
            onMouseMove={magnetic}
            onMouseLeave={resetMagnetic}
            className="nav-element px-6 py-2 bg-white text-black rounded-full text-xs font-bold"
          >
            Enter
          </button>
        </nav>

        {/* HERO */}
        <section className="hero-section text-center py-32 px-6">
          <p className="hero-text-line text-xs text-emerald-500 mb-6 uppercase tracking-widest">
            Welcome to RapVerse
          </p>

          <h1 className="hero-text-line text-6xl md:text-9xl font-serif italic">
            RapVerse
          </h1>

          <h2 className="hero-text-line text-3xl md:text-5xl text-neutral-500 italic">
            Where Artists Become Legends
          </h2>

          <p className="hero-subtext mt-8 text-neutral-400 max-w-xl mx-auto">
            Discover beats, lyrics, collaborations and build your identity.
          </p>
        </section>

        {/* ABOUT */}
        <section className="about-section text-center py-32 px-6">
          <h2 className="text-5xl font-serif italic mb-10">
            The Future of Music
          </h2>

          <p className="text-neutral-400 max-w-3xl mx-auto">
            RapVerse connects rappers, producers and listeners into one powerful ecosystem.
          </p>
        </section>

        {/* TRENDING */}
        <section className="trending-section py-32">
          <h2 className="text-5xl font-serif italic mb-10 px-6">
            Trending Drops
          </h2>

          <div className="overflow-x-auto px-6">
            <div className="flex gap-6 w-max">
              {trendingPosts.map((post) => (
                <div
                  key={post._id}
                  className="trending-card min-w-[280px] bg-[#111] p-6 rounded-2xl"
                >
                  <h3>{post.title}</h3>
                  <p className="text-neutral-400 text-sm">{post.creatorName}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROLES */}
        <section className="roles-section py-32 px-6 text-center">
          <h2 className="text-5xl font-serif italic mb-16">
            Choose Your Role
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {["Rapper","Producer","Lyricist","Listener"].map(role => (
              <div key={role} className="role-card bg-[#111] p-10 rounded-2xl">
                <h3 className="text-xl mb-3">{role}</h3>
                <p className="text-neutral-400 text-sm">
                  Build your journey in RapVerse.
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-40">
          <h2 className="text-6xl font-serif italic mb-10">
            Enter RapVerse
          </h2>

          <button
            onClick={() => navigate('/roles')}
            className="px-10 py-4 bg-white text-black rounded-full"
          >
            Start Now
          </button>
        </section>

      </div>
    </>
  );
}