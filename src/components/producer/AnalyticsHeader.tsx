import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import axios from 'axios';
import gsap from 'gsap';

export default function AnalyticsHeader() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    totalBeats: 0,
    globalDrops: 0,
    totalLikes: 0,
    storageUsed: "0%"
  });

  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id || user.uid;

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // 🚨 FIX: URL Syntax
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/tracks/user/${userId}`);
        const userTracks = Array.isArray(res.data) ? res.data : [];

        const myBeatsCount = userTracks.filter((t: any) => t.trackType === 'beat').length;
        const myTotalLikes = userTracks.reduce((acc: number, track: any) => acc + (track.likes || 0), 0);

        setStats({
          totalBeats: myBeatsCount,
          globalDrops: userTracks.length,
          totalLikes: myTotalLikes,
          storageUsed: `${Math.min(userTracks.length * 5, 100)}%` 
        });

      } catch (err) {
        console.error("Critical Stats Sync Error:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  // 🎬 PREMIUM EDITORIAL ANIMATION
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Smooth, high-end counter
      gsap.fromTo(".stat-value", 
        { textContent: 0, y: 20, opacity: 0 },
        {
          textContent: (index, target) => target.getAttribute('data-val'),
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: "power4.out",
          snap: { textContent: 1 },
          stagger: 0.1,
          delay: 0.2
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [stats]);

  const cards = [
    { label: 'BEATS IN VAULT', value: stats.totalBeats },
    { label: 'GLOBAL DROPS', value: stats.globalDrops },
    { label: 'NETWORK LIKES', value: stats.totalLikes },
    { label: 'CLOUD CAPACITY', value: stats.storageUsed },
  ];

  return (
    // 🔥 PREMIUM LIGHT BASE CARDS
    <div ref={containerRef} className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8 mb-8 relative z-10">
      {cards.map((card, i) => (
        <div 
          key={i} 
          className="group relative bg-white border border-[#001433]/5 rounded-[1rem] p-8 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(212,175,55,0.08)] hover:border-[#D4AF37]/30 transition-all duration-500 overflow-hidden"
        >
          {/* Subtle hover glow */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {/* Editorial Label */}
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-[#001433]/60 mb-10 flex items-center gap-2">
             {i === 1 && stats.globalDrops > 0 ? (
               <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
             ) : (
               <span className="w-1 h-1 rounded-full bg-[#001433]/20"></span>
             )}
            {card.label}
          </span>
          
          <div className="flex items-baseline mt-auto relative z-10">
            <span 
              className="stat-value text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#001433] leading-none group-hover:text-[#D4AF37] transition-colors duration-500" 
              data-val={typeof card.value === 'string' ? parseFloat(card.value) : card.value}
            >
              {card.value}
            </span>
            
            {typeof card.value === 'string' && card.value.includes('%') && (
               <span className="text-3xl md:text-4xl font-light font-serif italic text-[#001433]/50 ml-1">%</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}