import React, { useEffect, useState } from 'react';
import axios from 'axios';
import gsap from 'gsap';

export default function AnalyticsHeader() {
  const [stats, setStats] = useState({
    totalBeats: 0,
    activeSessions: 0,
    totalRappers: 0,
    storageUsed: "0%"
  });

  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  // Multiple fallbacks for ID
  const userId = user.id || user._id || user.uid;

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const [beatsRes, sessionsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/tracks/user/${userId}`),
          axios.get(`http://localhost:5000/api/projects/all`)
        ]);

        // Bulletproof parsing
        const beatsData = Array.isArray(beatsRes.data) ? beatsRes.data : [];
        const sessionsData = Array.isArray(sessionsRes.data) ? sessionsRes.data : [];

        const myBeatsCount = beatsData.filter((t: any) => t.trackType === 'beat').length;
        const totalSessions = sessionsData.length;
        
        // Safe mapping for unique rappers
        const uniqueRappers = new Set(
          sessionsData.map((s: any) => {
            if (typeof s.creator === 'string') return s.creator;
            return s.creator?._id || s.creator?.id;
          }).filter(Boolean)
        ).size;

        setStats({
          totalBeats: myBeatsCount,
          activeSessions: totalSessions,
          totalRappers: uniqueRappers,
          storageUsed: `${Math.min(myBeatsCount * 12, 100)}%` 
        });

        // Smooth GSAP counter animation
        gsap.from(".stat-value", {
          textContent: 0,
          duration: 1.5,
          ease: "power2.out",
          snap: { textContent: 1 },
          stagger: 0.1
        });

      } catch (err) {
        console.error("Critical Stats Sync Error:", err);
      }
    };

    fetchStats();
    // Auto-sync stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const cards = [
    { label: 'Beats in Vault', value: stats.totalBeats, icon: '🎹', color: 'from-blue-600 to-indigo-700' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: '🔥', color: 'from-purple-600 to-pink-700' },
    { label: 'Total Collaborators', value: stats.totalRappers, icon: '🎤', color: 'from-orange-600 to-red-700' },
    { label: 'Cloud Capacity', value: stats.storageUsed, icon: '☁️', color: 'from-cyan-600 to-blue-700' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <div key={i} className="analytics-card group relative bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
          {/* Hardware Glow Effect */}
          <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-5 blur-3xl group-hover:opacity-15 transition-opacity`}></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-600 font-black">{card.label}</span>
              <div className="flex items-baseline gap-2">
                <span className="stat-value text-3xl font-mono font-black text-white">{card.value}</span>
                {i === 1 && stats.activeSessions > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg border border-white/5 shadow-inner">
              {card.icon}
            </div>
          </div>

          {/* Dynamic Progress Bar */}
          <div className="mt-6 w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
             <div 
               className={`h-full bg-gradient-to-r ${card.color} transition-all duration-1000`} 
               style={{ 
                 width: typeof card.value === 'string' ? card.value : `${Math.min((Number(card.value) || 0) * 10, 100)}%` 
               }}
             ></div>
          </div>
        </div>
      ))}
    </div>
  );
}