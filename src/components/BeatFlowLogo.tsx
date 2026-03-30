import React from 'react';

export default function BeatFlowLogo({ className = "w-14 h-14" }) {
  return (
    <svg 
      viewBox="0 0 120 120" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={`transform transition-all duration-300 hover:scale-105 drop-shadow-xl ${className}`}
    >
      <defs>
        <linearGradient id="premiumGlow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#001433" /> {/* Theme Navy */}
          <stop offset="100%" stopColor="#D4AF37" /> {/* Theme Gold */}
        </linearGradient>
        
        <filter id="premiumShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Outer Rotating Audio Spectrum Ring */}
      <circle 
        cx="60" 
        cy="60" 
        r="55" 
        stroke="url(#premiumGlow)" 
        strokeWidth="1.5" 
        strokeDasharray="10 10" 
        opacity="0.4" 
        className="animate-[spin_10s_linear_infinite] origin-center"
      />

      {/* Interior Static Base */}
      <circle 
        cx="60" 
        cy="60" 
        r="48" 
        stroke="#001433" 
        strokeWidth="1" 
        opacity="0.1" 
      />

      {/* The Letter 'B' (Dominant Navy) */}
      <path 
        d="M 45 90 L 45 30 H 60 C 70 30 70 60 45 60 C 75 60 75 90 45 90 Z" 
        stroke="#001433" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#premiumShadow)" 
      />

      {/* 🔥 THE FIX: The Letter 'F' is now PREMIUM GOLD so it doesn't vanish! */}
      <path 
        d="M 70 90 L 70 30 L 95 30 M 70 60 L 90 60" 
        stroke="#D4AF37" 
        strokeWidth="10" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#premiumShadow)" 
      />
      
      {/* Pulse Dot (Indicating Live Studio) */}
      <circle cx="95" cy="80" r="5" fill="#10B981" className="animate-pulse" />
    </svg>
  );
}