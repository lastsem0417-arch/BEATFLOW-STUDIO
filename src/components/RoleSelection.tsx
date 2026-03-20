import React, { useRef, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    id: "producer",
    title: "PRODUCER",
    number: "01",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop",
    hex: "#D4AF37", // Champagne Gold
    desc: "Build Sonic Infrastructure. Manage stems, monitor analytics."
  },
  {
    id: "rapper",
    title: "RAPPER",
    number: "02",
    image: "https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=1887&auto=format&fit=crop", 
    hex: "#E63946", // Carmine Red
    desc: "Vocal Tracking. Auto-mix, and scout for exclusive drops."
  },
  {
    id: "lyricist",
    title: "LYRICIST",
    number: "03",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
    hex: "#10B981", // Emerald Green
    desc: "The Poet. Writing pads, rhythm analysis, pitch verses."
  },
  {
    id: "listener",
    title: "LISTENER",
    number: "04",
    image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop",
    hex: "#0000FF", // Royal Blue
    desc: "Experience 5D Zen Mode. Discover unreleased global gems."
  }
];

export default function RoleSelection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // 1. Cinematic Entry
      gsap.fromTo(".header-item", 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1, ease: "power2.out", stagger: 0.1 }
      );

      gsap.fromTo(".role-list-item",
        { y: 100, opacity: 0, rotateX: 10 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.1, duration: 1.2, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
      );

      // 2. Constrained Y-Axis Follower for Right Image
      if (followerRef.current) {
        const yTo = gsap.quickTo(followerRef.current, "y", { duration: 0.8, ease: "power3" });

        const moveFollower = (e: MouseEvent) => {
          const bounds = window.innerHeight;
          const followerHeight = followerRef.current?.offsetHeight || 500;
          const maxTravel = bounds - followerHeight - 80; 
          
          let constrainedY = (e.clientY / bounds) * maxTravel;
          if (constrainedY < 0) constrainedY = 0;
          
          yTo(constrainedY);
        };

        window.addEventListener("mousemove", moveFollower);
        return () => window.removeEventListener("mousemove", moveFollower);
      }
    }, containerRef);
    
    return () => ctx.revert();
  }, []);

  const handleRoleClick = (roleTitle: string) => {
    setSelectedRole(roleTitle);
    setShowAuth(true);
  };

  const handleAuthSuccess = (data: any) => {
    const userData = { ...(data.user || data), token: data.token };
    login(userData);
    setShowAuth(false);
    
    gsap.to(containerRef.current, { 
      opacity: 0, scale: 1.05, filter: "blur(10px)", duration: 0.8, ease: "power2.inOut", 
      onComplete: () => {
        const roleStr = (userData.role || selectedRole).toLowerCase();
        if (roleStr === "listener") navigate("/feed");
        else navigate(`/studio/${roleStr}`);
      }
    });
  };

  return (
    // 🔥 PREMIUM LIGHT BACKGROUND (#FAF9F6) WITH DARK TEXT (#0A0A0C)
    <div ref={containerRef} className="min-h-screen w-full bg-[#FAF9F6] text-[#0A0A0C] relative overflow-hidden select-none font-sans flex items-center">
      
      {/* Cinematic Noise Vignette (Light Mode Version) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#EAE9E6_120%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.04] mix-blend-multiply pointer-events-none z-0"></div>

      {/* 🔐 AUTH MODAL POPUP (Dark overlay for premium contrast) */}
      {showAuth && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#0A0A0C]/80 backdrop-blur-xl">
           <AuthModal role={selectedRole} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
        </div>
      )}

      {/* 🗂️ THE MASSIVE AWWARDS INTERACTIVE LIST */}
      <div className="relative w-full max-w-[1800px] mx-auto h-screen flex flex-col md:flex-row z-10 pt-20 md:pt-0">
        
        {/* LEFT 60%: The Typography-Led Focus Area */}
        <div className="w-full md:w-[60%] h-full flex flex-col justify-center px-8 md:pl-20 md:pr-16 relative z-20">
           
           {/* HEADER */}
           <div className="mb-12 md:mb-16 flex flex-col">
              <p className="header-item font-mono text-[9px] md:text-[10px] tracking-[0.5em] text-[#0A0A0C]/40 uppercase mb-4">
                Ecosystem Initialization
              </p>
              <h2 className="header-item font-serif italic text-4xl md:text-5xl text-[#0A0A0C] m-0 tracking-tight font-light">
                Choose Your Domain
              </h2>
           </div>

           <ul className="flex flex-col gap-4 md:gap-6 m-0 p-0" onMouseLeave={() => setHoveredIndex(null)}>
              {roles.map((role, i) => {
                const isHovered = hoveredIndex === i;
                const isAnyHovered = hoveredIndex !== null;
                
                return (
                  <li 
                    key={role.id}
                    onMouseEnter={() => setHoveredIndex(i)}
                    onClick={() => handleRoleClick(role.title)}
                    className="group relative cursor-pointer flex flex-col border-b border-[#0A0A0C]/10 pb-4 transition-colors duration-500 hover:border-[#0A0A0C]/30"
                  >
                     <div className="flex items-center justify-between overflow-hidden">
                        <div className="role-list-item flex items-center gap-6 md:gap-10 w-full transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:translate-x-6">
                          {/* Role Number */}
                          <span 
                            className="font-mono text-sm md:text-xl font-bold transition-colors duration-500"
                            style={{ color: isHovered ? role.hex : '#A3A3A3' }}
                          >
                             {role.number}
                          </span>
                          
                          {/* Role Title (Premium Typography Fix) */}
                          <h1 
                            className="text-[12vw] md:text-[8vw] font-black uppercase tracking-tighter m-0 leading-none transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]"
                            style={{ 
                              WebkitTextStroke: isAnyHovered && !isHovered ? '1px rgba(10,10,12,0.1)' : '0px',
                              color: isHovered ? role.hex : (isAnyHovered ? 'transparent' : '#0A0A0C'),
                              letterSpacing: isHovered ? '0.02em' : '-0.02em',
                              textShadow: isHovered ? `0 20px 50px ${role.hex}50` : 'none'
                            }}
                          >
                             {role.title}
                          </h1>
                        </div>
                        
                        {/* Right side description text inside the Typography line */}
                        <div 
                           className="hidden lg:block w-[220px] text-right transition-all duration-700 font-mono tracking-widest text-[10px] uppercase text-[#0A0A0C]/50 pr-4 leading-relaxed"
                           style={{ opacity: isHovered ? 1 : 0, transform: isHovered ? 'translateX(0)' : 'translateX(-20px)'}}
                        >
                           {role.desc}
                        </div>
                     </div>
                  </li>
                );
              })}
           </ul>
        </div>

        {/* RIGHT 40%: The Cinematic Canvas (Constrained Bounds) */}
        <div className="hidden md:block w-[40%] h-full relative overflow-hidden px-10 py-10 z-10 pointer-events-none">
            {/* Ambient Shadow to separate from text (Light Mode) */}
            <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#FAF9F6] to-transparent z-10"></div>
            
            {/* The Constrained GSAP Follower */}
            <div 
               ref={followerRef}
               className="relative w-full h-[60vh] rounded-[2.5rem] overflow-hidden bg-[#EAE9E6] transition-all duration-700 ease-[cubic-bezier(0.76,0,0.24,1)] shadow-[0_30px_60px_rgba(0,0,0,0.08)]"
               style={{ 
                  opacity: hoveredIndex !== null ? 1 : 0,
                  scale: hoveredIndex !== null ? 1 : 0.9, 
                  boxShadow: hoveredIndex !== null ? `0 40px 100px -20px ${roles[hoveredIndex].hex}40` : 'none'
               }}
            >
               {roles.map((role, i) => (
                  <img 
                     key={i}
                     src={role.image}
                     alt={role.title}
                     onError={(e) => { e.currentTarget.style.display = "none" }}
                     className="absolute inset-0 w-full h-full object-cover grayscale transition-all duration-[1.2s] ease-[cubic-bezier(0.76,0,0.24,1)] origin-center"
                     style={{ 
                        opacity: hoveredIndex === i ? 1 : 0, 
                        transform: hoveredIndex === i ? 'scale(1)' : 'scale(1.15)',
                        filter: hoveredIndex === i ? 'grayscale(0%) contrast(105%)' : 'grayscale(100%) blur(10px)'
                     }}
                  />
               ))}
               
               {/* Soft dark gradient at the bottom so it doesn't look washed out */}
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/60 via-transparent to-transparent opacity-80"></div>
            </div>
        </div>

      </div>
    </div>
  );
}