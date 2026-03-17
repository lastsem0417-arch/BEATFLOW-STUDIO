import React, { useEffect, useRef, useState } from 'react';

export default function DraggableWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [position, setPosition] = useState({ x: 30, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // 🔥 BULLETPROOF DYNAMIC COLORS
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const role = user.role?.toLowerCase() || 'rapper';
  // Producer = Blue, Lyricist = Emerald, Rapper/Default = Purple
  const glowHex = role === 'producer' ? '#3b82f6' : role === 'lyricist' ? '#10b981' : '#a855f7';

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) { console.error("Webcam blocked", err); }
    }
    setupCamera();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Offset calculate kar rahe hain current click aur div ki position ke hisaab se
    offset.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault(); // Drag karte waqt text select hone se rokega
      setPosition({ x: e.clientX - offset.current.x, y: e.clientY - offset.current.y });
    };
    
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove, { passive: false });
      window.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      onMouseDown={handleMouseDown}
      style={{ 
        // 🔥 GPU Accelerated Smooth Dragging
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        borderColor: isDragging ? glowHex : 'rgba(255,255,255,0.1)',
        boxShadow: isDragging ? `0 20px 40px rgba(0,0,0,0.8), 0 0 30px ${glowHex}40` : '0 10px 30px rgba(0,0,0,0.5)'
      }}
      className={`fixed top-0 left-0 z-[9999] w-48 md:w-56 aspect-video bg-[#050505] rounded-2xl overflow-hidden border-[1.5px] will-change-transform group select-none transition-[border-color,box-shadow,transform] duration-75 ${isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:border-white/30'}`}
    >
      {/* 🎥 Cinematic Video Feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full h-full object-cover grayscale-[40%] contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-110 transition-all duration-700 pointer-events-none" 
      />
      
      {/* 🌑 Deep Inner Shadow for Aesthetic */}
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)] pointer-events-none transition-opacity duration-500 group-hover:opacity-70"></div>

      {/* 🟢 Floating Live Badge */}
      <div className="absolute top-2.5 left-2.5 flex gap-1.5 items-center bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/5 shadow-lg pointer-events-none transition-all group-hover:bg-black/80">
          <div 
            className="w-1.5 h-1.5 rounded-full animate-pulse shadow-lg" 
            style={{ backgroundColor: glowHex, boxShadow: `0 0 10px ${glowHex}` }}
          ></div>
          <div className="text-[7px] text-white/90 uppercase font-black tracking-widest">Cam</div>
      </div>

      {/* 🖱️ Minimalist Drag Handle Hint (Bottom Center) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20 group-hover:bg-white/60 transition-colors pointer-events-none"></div>
    </div>
  );
}