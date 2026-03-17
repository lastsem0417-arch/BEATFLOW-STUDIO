import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  // 💀 ULTRA SMOOTH PHYSICS
  const springConfig = { damping: 30, stiffness: 500, mass: 0.2 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      if (target.closest('button, a, input, [role="button"], .trending-card')) {
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
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* 🔥 MAIN DOT */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999999] rounded-full bg-white mix-blend-difference"
        style={{
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          width: isHovering ? 20 : 10,
          height: isHovering ? 20 : 10,
          scale: isClicking ? 0.7 : 1,
        }}
        transition={{ duration: 0.2 }}
      />

      {/* 💥 OUTER RING */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999998] rounded-full border border-white/30"
        style={{
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          width: isHovering ? 80 : 30,
          height: isHovering ? 80 : 30,
          opacity: isHovering ? 0.6 : 0.3,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* ✨ GLOW EFFECT */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[999997] rounded-full bg-emerald-500/20 blur-2xl"
        style={{
          left: smoothX,
          top: smoothY,
          x: '-50%',
          y: '-50%',
        }}
        animate={{
          width: isHovering ? 120 : 40,
          height: isHovering ? 120 : 40,
          opacity: isHovering ? 0.4 : 0.15,
        }}
        transition={{ duration: 0.4 }}
      />

      {/* 💣 CLICK RIPPLE */}
      {isClicking && (
        <motion.div
          className="fixed top-0 left-0 pointer-events-none z-[999996] rounded-full border border-white"
          style={{
            left: smoothX,
            top: smoothY,
            x: '-50%',
            y: '-50%',
          }}
          initial={{ width: 0, height: 0, opacity: 0.8 }}
          animate={{ width: 100, height: 100, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
    </>
  );
}