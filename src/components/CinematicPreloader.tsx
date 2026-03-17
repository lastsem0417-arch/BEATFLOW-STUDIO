import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicPreloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let current = 0;

    const timer = setInterval(() => {
      current += Math.floor(Math.random() * 10) + 2;

      if (current >= 100) {
        current = 100;
        clearInterval(timer);

        setTimeout(() => {
          setIsExiting(true);
          setTimeout(onComplete, 1400);
        }, 400);
      }

      setProgress(current);
    }, 80);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black overflow-hidden"
          exit={{ opacity: 0, transition: { duration: 1.2 } }}
        >

          {/* 🌌 SPACE BG */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0a0a0a,black)]"></div>

          {/* ✨ LIGHT BURST */}
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full bg-emerald-500/20 blur-[120px]"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* 🌑 CORE */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 30,
              opacity: 0,
              filter: "blur(40px)",
              transition: { duration: 1.2, ease: [0.76, 0, 0.24, 1] }
            }}
          >
            <div className="w-52 h-52 rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_80px_rgba(0,255,150,0.15)]">

              {/* 🔥 PROGRESS TEXT */}
              <motion.span
                key={progress}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-white/60 text-sm tracking-[0.4em]"
              >
                {progress}%
              </motion.span>

            </div>
          </motion.div>

          {/* TEXT */}
          <motion.p
            className="absolute bottom-12 text-[10px] tracking-[0.6em] text-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            ENTERING RAPVERSE
          </motion.p>

        </motion.div>
      )}
    </AnimatePresence>
  );
}