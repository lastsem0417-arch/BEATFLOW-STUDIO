import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicPreloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      const rand = Math.random();
      if (current < 35) current += rand * 3;
      else if (current >= 35 && current < 40) current += rand * 0.5;
      else if (current >= 40 && current < 85) current += rand * 5;
      else current += rand * 1.5;

      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        
        // 🔥 SET SESSION STORAGE WHEN DONE 🔥
        sessionStorage.setItem('beatflow_preloader_done', 'true');
        
        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 1200); 
        }, 800);
      }
      setProgress(current);
    }, 50);

    return () => clearInterval(interval);
  }, [onComplete]);

  const displayProgress = Math.min(Math.floor(progress), 100);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          // 🔥 PREMIUM GRAPHITE BACKGROUND 🔥
          className="fixed inset-0 z-[999999] bg-[#111111] flex flex-col items-center justify-center overflow-hidden select-none"
          exit={{ 
            y: "-100dvh", 
            opacity: 0,
            transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] } 
          }}
        >
          <motion.div 
            className="relative w-full max-w-7xl px-4 flex flex-col items-center"
            exit={{ scale: 1.5, opacity: 0, filter: "blur(10px)", transition: { duration: 0.8, ease: "easeIn" } }}
          >
            {/* Subtle backlight glow for extra depth */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-white/5 blur-[100px] rounded-full pointer-events-none"></div>

            <svg className="w-full h-auto drop-shadow-2xl relative z-10" viewBox="0 0 1000 300">
              <defs>
                {/* YOUR ORIGINAL MULTICOLOR PREMIUM FILL */}
                <linearGradient id="premiumFill" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="50%" stopColor="#E63946" />
                  <stop offset="100%" stopColor="#52B788" />
                </linearGradient>

                <clipPath id="textMask">
                  <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="font-black" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontSize: '190px', letterSpacing: '-4px' }}>
                    BeatFlow
                  </text>
                </clipPath>
              </defs>

              <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fill="#222222" className="font-black" style={{ fontFamily: 'Impact, "Arial Black", sans-serif', fontSize: '190px', letterSpacing: '-4px' }}>
                BeatFlow
              </text>

              <g clipPath="url(#textMask)">
                <motion.path 
                  d="M 0 50 Q 100 0 200 50 T 400 50 T 600 50 T 800 50 T 1000 50 T 1200 50 T 1400 50 V 400 H 0 Z" 
                  fill="url(#premiumFill)" 
                  animate={{ x: [0, -400], y: 250 - (progress / 100) * 300 }} 
                  transition={{ x: { repeat: Infinity, duration: 2, ease: "linear" }, y: { duration: 0.1, ease: "easeOut" } }} 
                />
              </g>
            </svg>

            <div className="w-full max-w-[850px] flex justify-end -mt-4 md:-mt-8 pr-4 relative z-10">
              <span className="text-[#F4F5F7] font-bold text-sm md:text-xl tracking-wide font-sans opacity-70">
                Loading... {displayProgress} %
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}