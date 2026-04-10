/@@ TAILWIND ANIMATION REFACTOR @@/
/* 
  Remove excessive animate-pulse and optimize all transitions
  
  BEFORE: Multiple elements with animate-pulse (duration: 4s default - TOO SLOW)
  AFTER: Selective animate-pulse with optimized durations (2s-3s)
  
  FILES TO UPDATE:
  - GlobalFeed.tsx (line 164-166): Remove or shorten pulse animations
  - StudioMaster.tsx (line 502): Change pulse to subtle indicator
  - ProducerMaster.tsx (line 111): Remove pulse on nav dot
  - And ~10+ other components
*/

/* ============================================================================
  UPDATED: src/index.css
  ============================================================================ */

@import "tailwindcss";

/* 🔥 TAILWIND V4 THEME CONFIGURATION */
@theme {
  --color-brand-onyx: #030305;
  --color-brand-dark: #0A0A0C;
  --color-brand-pearl: #F0F0EB;
  --color-brand-muted: #888888;

  --color-producer: #D4AF37;
  --color-rapper: #E63946;
  --color-lyricist: #52B788;
  --color-listener: #8ECAE6;
}

@layer base {
  html, body {
    background-color: var(--color-brand-onyx);
    color: var(--color-brand-pearl);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  ::selection {
    background: var(--color-producer);
    color: #000000;
  }

  ::-webkit-scrollbar { display: none; }
  * { -ms-overflow-style: none; scrollbar-width: none; }
}

.custom-scrollbar::-webkit-scrollbar {
  display: block;
  width: 2px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.01);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: var(--color-producer);
  border-radius: 10px;
}

/* ✨ REFACTORED: Optimized Tailwind Animations */
@layer utilities {
  
  /* 🔴 CRITICAL: Reduce default transition duration */
  .transition {
    transition-duration: 200ms !important; /* Was default 150ms, now explicit */
  }

  .transition-all {
    transition-duration: 250ms !important;
  }

  /* Remove duration-500 bias - instead use explicit durations */
  @variants group {
    .group-hover\:scale-110 {
      @apply will-change-transform;
    }
  }

  /* 🟢 OPTIMIZED: Premium pulse animation (not excessive)
     USAGE: Use this ONLY for critical status indicators
     DO NOT: Use on multiple elements simultaneously
  */
  @keyframes pulse-premium {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .animate-pulse-premium {
    animation: pulse-premium 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* 🟡 RESTRICTED: pulse-ultra for critical single indicators */
  @keyframes pulse-ultra {
    0%, 100% { opacity: 0.3; box-shadow: 0 0 8px currentColor; }
    50% { opacity: 1; box-shadow: 0 0 15px currentColor; }
  }

  .animate-pulse-ultra {
    animation: pulse-ultra 1.5s ease-in-out infinite;
  }

  /* 🔵 REPLACED: Hover transitions (no heavy shadows)
     BEFORE: hover:shadow-[0_20px_50px_rgba(...)] - Too expensive
     AFTER: Subtle border/opacity changes instead
  */

  /* Hover scale (reduced from 1.05 to 1.01) */
  .group-hover\:scale-101 {
    @apply will-change-transform;
  }

  @group-hover {
    scale: 1.01;
  }

  /* Hover opacity (cleaner than shadow) */
  .group-hover\:opacity-enhanced {
    @apply will-change-opacity;
  }

  @group-hover {
    opacity: 0.95;
  }
}

/* ============================================================================
  COMPONENT-SPECIFIC FIXES
  ============================================================================ */

/* 🟢 FIXED: GlobalFeed ambient glows (use will-change-filter sparingly) */
.ambient-glow {
  will-change: transform;
  animation: none; /* Remove default pulse */
}

/* Selective ambient pulse - only one at a time */
.ambient-glow.active {
  animation: pulse-premium 3s ease-in-out infinite;
}

/* 🟢 OPTIMIZED: Recording indicator (tight, fast pulse) */
.rec-indicator {
  animation: pulse-ultra 1.8s ease-in-out infinite;
  will-change-transform;
}

/* 🟢 REFACTORED: Card hover (no shadow changes, use border/bg instead) */
.premium-card {
  @apply border border-transparent bg-white transition-all duration-200;
}

.premium-card:hover {
  @apply border-[#D4AF37]/20 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.02)];
  /* NO box-shadow transition - just border color */
}

/* 🟢 OPTIMIZED: Smooth scroll transitions (no jank) */
.scroll-smooth {
  scroll-behavior: smooth;
}

/* 🟡 RESTRICTED: 3D transforms (avoid on mobile) */
.perspective-transform {
  @apply will-change-transform;
  /* Only use when absolutely necessary */
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ============================================================================
  DEPRECATED: Animations to REMOVE
  ============================================================================ */

/* ❌ Remove these from codebase:

  1. animate-ping on status dots (except critical one)
  2. duration-700, duration-500 on hover effects
  3. box-shadow transitions on cards
  4. backdrop-filter transitions on modals
  5. Multiple scale transforms on same element
  6. Stagger delays > 0.1s
  7. Continuous rotations (unless hero logo)
  8. blur() transitions  
  9. 3D rotateX/rotateY effects
  10. Linear easing on UI animations
*/

/* ✅ Replace with:
  - duration-200, duration-300 on hovers
  - Border-color transitions
  - Opacity changes instead of shadows
  - Instant interactions + smooth reveals
  - Tight stagger: 0.04-0.08s
  - power2.out, power3.out only
  - transform property only
  - will-change used strategically
*/
