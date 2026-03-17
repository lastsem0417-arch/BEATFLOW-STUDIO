import React, { useEffect } from 'react';
import Lenis from 'lenis'; // 🔥 Core package import kiya

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis directly
    const lenis = new Lenis({
      lerp: 0.08, // Buttery momentum
      duration: 1.5,
      smoothWheel: true,
    });

    // Request Animation Frame hook
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup on unmount
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}