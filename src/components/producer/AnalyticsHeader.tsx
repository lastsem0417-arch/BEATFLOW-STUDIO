import React, { useEffect, useState } from 'react';
import axios from 'axios';
import gsap from 'gsap';

export default function AnalyticsHeader() {
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
        // Fetch ALL tracks created by this Producer
        const res = await axios.get(`http://localhost:5000/api/tracks/user/${userId}`);
        const userTracks = Array.isArray(res.data) ? res.data : [];

        const myBeatsCount = userTracks.filter((t: any) => t.trackType === 'beat').length;
        
        // Calculate Total Likes across all beats
        const myTotalLikes = userTracks.reduce((acc: number, track: any) => acc + (track.likes || 0), 0);

        setStats({
          totalBeats: myBeatsCount,
          globalDrops: userTracks.length, // Total uploads by producer
          totalLikes: myTotalLikes,
          storageUsed: `${Math.min(userTracks.length * 5, 100)}%` // Fake 5% per track logic
        });

        // Smooth GSAP counter animation
        gsap.fromTo(".stat-value", 
          { textContent: 0, opacity: 0, y: 10 },
          {
            textContent: (index, target) => target.getAttribute('data-val'),
            opacity: 1,
            y: 0,
            duration: 1.5,
            ease: "power3.out",
            snap: { textContent: 1 },
            stagger: 0.1
          }
        );

      } catch (err) {
        console.error("Critical Stats Sync Error:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const cards = [
    { label: 'Beats in Vault', value: stats.totalBeats, icon: '🎹', glow: 'producer' },
    { label: 'Global Drops', value: stats.globalDrops, icon: '🌍', glow: 'producer' },
    { label: 'Network Likes', value: stats.totalLikes, icon: '❤️', glow: 'producer' },
    { label: 'Cloud Capacity', value: stats.storageUsed, icon: '☁️', glow: 'producer' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card, i) => {
        // Safe check for string values (like '15%') vs numbers
        const rawValue = typeof card.value === 'string' ? parseFloat(card.value) : card.value;
        
        return (
          <div key={i} className="analytics-card group relative bg-brand-dark border border-white/5 rounded-[2rem] p-8 overflow-hidden hover:border-producer/30 transition-all duration-700 shadow-2xl hover:-translate-y-1">
            
            {/* Cinematic Background Glow (Reveals on Hover) */}
            <div className={`absolute -bottom-10 -right-10 w-32 h-32 bg-${card.glow}/20 opacity-0 blur-[40px] group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}></div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-brand-muted font-bold group-hover:text-brand-pearl transition-colors">
                  {card.label}
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span 
                    className="stat-value text-4xl md:text-5xl font-serif italic text-brand-pearl group-hover:text-producer transition-colors" 
                    data-val={typeof card.value === 'string' ? parseFloat(card.value) : card.value}
                  >
                    {card.value}
                  </span>
                  {typeof card.value === 'string' && card.value.includes('%') && (
                     <span className="text-xl font-serif italic text-brand-pearl group-hover:text-producer transition-colors">%</span>
                  )}
                  {i === 1 && stats.globalDrops > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-producer shadow-[0_0_10px_#D4AF37] animate-pulse mb-2 ml-2"></span>
                  )}
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border border-white/5 bg-[#010101] flex items-center justify-center text-xl group-hover:scale-110 group-hover:border-producer/50 transition-all duration-500 shadow-inner">
                {card.icon}
              </div>
            </div>

            {/* Premium Minimal Progress Line */}
            <div className="mt-8 w-full h-[1px] bg-white/10 overflow-hidden group-hover:bg-white/20 transition-colors">
               <div 
                 className={`h-full bg-producer transition-all duration-1000 origin-left scale-x-0 group-hover:scale-x-100`} 
                 style={{ 
                   width: typeof card.value === 'string' ? card.value : `${Math.min((rawValue || 0) * 10, 100)}%` 
                 }}
               ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}