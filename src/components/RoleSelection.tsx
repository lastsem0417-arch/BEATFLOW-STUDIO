import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";

const roles = [
  {
    id: "producer",
    title: "PRODUCER",
    number: "01",
    image: "/images/producer.jpg",
    glow: "from-[#D4AF37]/50", // Champagne Gold Glow
    textColor: "group-hover:text-[#D4AF37]",
    desc: "The Architect. Upload beats, manage stems, and build the foundation."
  },
  {
    id: "rapper",
    title: "RAPPER",
    number: "02",
    image: "/images/rapper.jpg",
    glow: "from-[#E63946]/50", // Carmine Red Glow
    textColor: "group-hover:text-[#E63946]",
    desc: "The Voice. Vocal tracking, AI auto-mix, and exclusive beat discovery."
  },
  {
    id: "lyricist",
    title: "LYRICIST",
    number: "03",
    image: "/images/lyricist.jpg",
    glow: "from-[#52B788]/50", // Sage Green Glow
    textColor: "group-hover:text-[#52B788]",
    desc: "The Poet. Writing pads, rhythm analysis, and vocal matching."
  },
  {
    id: "listener",
    title: "LISTENER",
    number: "04",
    image: "/images/listener.jpg",
    glow: "from-[#8ECAE6]/50", // Ice Blue Glow
    textColor: "group-hover:text-[#8ECAE6]",
    desc: "The Fan. Discover tracks, support artists, and vibe in 5D Zen."
  }
];

export default function RoleSelection() {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showAuth, setShowAuth] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Clean elegant fade in for header
      gsap.fromTo(".role-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 1.5, ease: "power3.out" }
      );

      // Smooth slide up for cards
      gsap.fromTo(".role-card",
        { y: 80, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.15, duration: 1.5, ease: [0.76, 0, 0.24, 1], delay: 0.2 }
      );
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
    
    // Smooth Transition Out Before Navigating
    gsap.to(containerRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut", onComplete: () => {
      const roleStr = (userData.role || selectedRole).toLowerCase();
      if (roleStr === "listener") navigate("/feed");
      else navigate(`/studio/${roleStr}`);
    }});
  };

  return (
    <div ref={containerRef} className="min-h-screen w-full flex flex-col items-center justify-center bg-brand-onyx px-6 md:px-12 relative overflow-hidden select-none">

      {/* Subtle Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none z-0"></div>

      {showAuth && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
           <AuthModal role={selectedRole} onClose={() => setShowAuth(false)} onSuccess={handleAuthSuccess} />
        </div>
      )}

      {/* 🎩 CLEAN HEADER (No massive cringe fonts) */}
      <div className="relative z-10 w-full flex flex-col items-center mb-10 md:mb-16 mt-8 md:mt-0">
         <p className="role-header font-mono text-[9px] md:text-[10px] tracking-[0.5em] text-brand-muted uppercase mb-4">
           Ecosystem Initialization
         </p>
         <h2 className="role-header font-serif italic text-3xl md:text-5xl text-brand-pearl font-light tracking-wide text-center">
           Choose Your Domain
         </h2>
      </div>

      {/* 🗂️ THE SLEEK MONOLITH ACCORDION */}
      <div className="flex w-full max-w-[1400px] flex-col md:flex-row gap-3 md:gap-4 h-[75vh] md:h-[60vh] relative z-10">
        
        {roles.map((role) => (
          <div
            key={role.id}
            onClick={() => handleRoleClick(role.title)}
            onMouseEnter={() => setHoveredRole(role.title)}
            onMouseLeave={() => setHoveredRole(null)}
            className={`role-card group relative flex-1 cursor-pointer overflow-hidden rounded-2xl transition-all duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${hoveredRole === role.title ? 'md:flex-[1.8]' : hoveredRole ? 'md:flex-[0.8]' : ''} border border-white/5 hover:border-white/20 shadow-2xl bg-black`}
          >

            {/* 📸 CINEMATIC IMAGE BACKGROUND */}
            <img
              src={role.image}
              alt={role.title}
              onError={(e) => { e.currentTarget.style.display = "none" }}
              className="absolute inset-0 h-full w-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-70 group-hover:scale-105 transition-all duration-[1200ms]"
            />

            {/* 🌑 DARK GRADIENT OVERLAY (Always readable) */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-[#030305] group-hover:via-black/20 transition-all duration-700" />

            {/* ✨ ROLE SPECIFIC PREMIUM GLOW (Reveals from bottom on hover) */}
            <div className={`absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-t ${role.glow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-screen`} />

            {/* 📝 CONTENT LAYER */}
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between z-10">
               
               {/* Index Number */}
               <div className="font-mono text-[10px] tracking-[0.3em] text-white/40 group-hover:text-white transition-colors duration-500">
                  {role.number}
               </div>

               {/* Title & Desc */}
               <div className="flex flex-col justify-end h-32 md:h-40 relative">
                  
                  {/* Clean Sans-Serif Title (No more cringe italics) */}
                  <h3 className={`font-sans text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.2em] uppercase text-white/80 ${role.textColor} transition-all duration-700 origin-bottom-left transform group-hover:-translate-y-4 md:group-hover:-translate-y-6`}>
                    {role.title}
                  </h3>
                  
                  {/* Description */}
                  <div className="absolute bottom-0 left-0 w-full opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100">
                    <p className="max-w-[95%] md:max-w-[85%] text-[10px] md:text-xs text-brand-pearl font-mono leading-relaxed border-l border-white/20 pl-4">
                      {role.desc}
                    </p>
                  </div>

               </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}