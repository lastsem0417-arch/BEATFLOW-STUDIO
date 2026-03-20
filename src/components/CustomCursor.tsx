import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // Raw Mouse Coordinates
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // 🔥 SPLIT PHYSICS: Core is fast, Ring & Aura are slow (Trailing effect) 🔥
  const smoothOptionsDot = { damping: 40, stiffness: 1000, mass: 0.1 }; // Almost instant
  const smoothOptionsRing = { damping: 30, stiffness: 150, mass: 0.4 }; // Fluid drag
  const smoothOptionsAura = { damping: 40, stiffness: 100, mass: 0.8 }; // Heavy fluid drag

  const dotX = useSpring(mouseX, smoothOptionsDot);
  const dotY = useSpring(mouseY, smoothOptionsDot);
  
  const ringX = useSpring(mouseX, smoothOptionsRing);
  const ringY = useSpring(mouseY, smoothOptionsRing);

  const auraX = useSpring(mouseX, smoothOptionsAura);
  const auraY = useSpring(mouseY, smoothOptionsAura);

  // 🔥 DYNAMIC ROLE THEME FOR THE AURA 🔥
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const role = user.role?.toLowerCase() || 'listener';
  
  const getThemeColor = () => {
    if (role === 'rapper') return '#E63946';    // Crimson
    if (role === 'lyricist') return '#10B981';  // Emerald
    if (role === 'producer') return '#D4AF37';  // Gold
    if (role === 'admin') return '#800020';     // Executive Maroon
    return '#2563EB';                           // Royal Blue
  };
  const themeColor = getThemeColor();

  useEffect(() => {
    // Inject cursor-none globally to body to hide native cursor
    document.body.style.cursor = 'none';

    const moveCursor = (e: MouseEvent) => {
      // Performance optimization: Using x/y transforms instead of top/left
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Identify clickable elements (Links, Buttons, Inputs, or specific classes)
      if (target.closest('button, a, input, textarea, [role="button"], .bento-card, .stagger-card, .group')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.body.style.cursor = 'auto'; // Cleanup
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* 🔮 LAYER 1: HEAVY TRAILING AURA (Colored Glow) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999995] rounded-full blur-[40px] opacity-40 mix-blend-screen"
        style={{
          x: auraX,
          y: auraY,
          translateX: '-50%',
          translateY: '-50%',
          backgroundColor: themeColor
        }}
        animate={{
          width: isHovering ? 0 : 150,
          height: isHovering ? 0 : 150,
          opacity: isHovering ? 0 : 0.15,
        }}
        transition={{ duration: 0.5, ease: "circOut" }}
      />

      {/* 💥 LAYER 2: FLUID TRAILING RING */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999997] rounded-full border border-[#111111]/30 shadow-sm"
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 0 : 40,
          height: isHovering ? 0 : 40,
          opacity: isHovering ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "backOut" }}
      />

      {/* 🔥 LAYER 3: THE CORE LENS (Instant Tracking, Inverted Colors) */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] rounded-full bg-white mix-blend-difference flex items-center justify-center overflow-hidden"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovering ? 80 : 10,
          height: isHovering ? 80 : 10,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
      >
        {/* Subtle dot inside the expanded lens to show exact click center */}
        <motion.div 
          className="w-1 h-1 bg-black rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovering ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
        ></motion.div>
      </motion.div>
    </>
  );
}