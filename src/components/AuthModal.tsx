import { useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  role: string;
  onClose: () => void;
  onSuccess: (userData: any) => void;
}

export default function AuthModal({ role, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  // 🎨 DYNAMIC LUXURY THEME ENGINE (WITH YOUR EXACT IMAGES)
  const getTheme = (r: string) => {
    const roleKey = r.toLowerCase();
    if (roleKey === 'producer') return { hex: '#D4AF37', shadow: 'rgba(212,175,55,0.4)', img: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=800&auto=format&fit=crop', title: 'The Architect' };
    if (roleKey === 'rapper') return { hex: '#E63946', shadow: 'rgba(230,57,70,0.4)', img: 'https://images.unsplash.com/photo-1525362081669-2b476bb628c3?q=80&w=800&auto=format&fit=crop', title: 'The Voice' };
    if (roleKey === 'lyricist') return { hex: '#10B981', shadow: 'rgba(16,185,129,0.4)', img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop', title: 'The Poet' };
    if (roleKey === 'listener') return { hex: '#2563EB', shadow: 'rgba(37,99,235,0.4)', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop', title: 'The Audiophile' };
    return { hex: '#111111', shadow: 'rgba(17,17,17,0.4)', img: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop', title: 'The Guest' };
  };

  const theme = getTheme(role);

  // 🎬 GSAP CINEMATIC REVEAL
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Background Blur Fade In
      gsap.fromTo('.modal-backdrop', 
        { opacity: 0, backdropFilter: 'blur(0px)' }, 
        { opacity: 1, backdropFilter: 'blur(15px)', duration: 0.8, ease: "power2.out" }
      );

      // Modal Wrapper scales and fades in smoothly
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.95, y: 40 }, 
        { opacity: 1, scale: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.1 }
      );

      // Image Cinematic Reveal
      gsap.fromTo(imageRef.current,
        { scale: 1.15, filter: "blur(10px)" },
        { scale: 1, filter: "blur(0px)", duration: 1.5, ease: "power3.out", delay: 0.2 }
      );

      // Staggered Form Elements
      gsap.fromTo(".form-element",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", delay: 0.3 }
      );
    }, modalRef);

    return () => ctx.revert();
  }, [isLogin]); 

  // 🚀 SMOOTH CLOSE ANIMATION
  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.95, y: 20, duration: 0.4, ease: "power3.in",
    });
    gsap.to('.modal-backdrop', {
      opacity: 0, duration: 0.4, ease: "power3.in",
      onComplete: onClose
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    setLoading(true);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/${endpoint}`, 
        { ...formData, role: role.toLowerCase() },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      
      const token = res.data.token;
      const userObj = res.data.user || res.data; 
      
      const dbRole = userObj.role ? userObj.role.toLowerCase() : '';
      const portalRole = role.toLowerCase();

      // 🔥 STRICT ROLE LOCK
      if (isLogin && dbRole !== portalRole) {
        setLoading(false);
        gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", clearProps: "x" });
        alert(`ACCESS DENIED 🛑: Identity mismatch. Registered as [${dbRole.toUpperCase()}].`);
        return; 
      }

      const userDataToSave = { ...userObj, token };
      login(userDataToSave);
      
      // Success Exit Animation
      gsap.to(modalRef.current, {
        opacity: 0, scale: 1.02, filter: 'blur(5px)', duration: 0.5, ease: "power4.inOut",
        onComplete: () => {
          onSuccess(res.data);
          if (dbRole === 'rapper') navigate('/studio/rapper');
          else if (dbRole === 'producer') navigate('/studio/producer');
          else if (dbRole === 'lyricist') navigate('/studio/lyricist');
          else if (dbRole === 'admin') navigate('/admin');
          else navigate('/'); 
        }
      });

    } catch (err: any) {
      setLoading(false);
      gsap.fromTo(formRef.current, { x: -10 }, { x: 10, duration: 0.1, yoyo: true, repeat: 5, ease: "linear", clearProps: "x" });
      alert(err.response?.data?.message || "Authentication Failed. Check credentials.");
    }
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-10 font-sans select-none overflow-hidden text-[#111111]">
      
      {/* 🌑 CINEMATIC BACKDROP (Dark blur to make the white modal pop) */}
      <div 
        className="modal-backdrop absolute inset-0 bg-[#111111]/40"
        onClick={loading ? undefined : handleClose}
      ></div>

      {/* 🏛️ THE OFF-WHITE EXECUTIVE MODAL */}
      <div 
        ref={modalRef} 
        className="w-full max-w-5xl h-[650px] flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden bg-[#F4F5F7] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative z-10"
      >
        
        {/* ✕ CLOSE BUTTON (Now visible on white background) */}
        <button 
          onClick={handleClose} 
          disabled={loading}
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white border border-[#111111]/10 flex items-center justify-center text-[#111111]/40 hover:text-[#E63946] hover:border-[#E63946]/30 hover:shadow-md transition-all duration-300 active:scale-95 disabled:opacity-50 group"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* 📸 LEFT SIDE: Cinematic Media Panel */}
        <div className="hidden md:flex w-1/2 h-full relative overflow-hidden bg-[#111111] group/image">
           
           {/* High-End Original Image */}
           <img 
              ref={imageRef}
              src={theme.img} 
              alt={role} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-[10s] group-hover/image:scale-110"
           />
           
           {/* Subtle Dark Gradient Overlay for text readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/40 to-transparent opacity-90"></div>
           
           {/* Color Tint based on Role */}
           <div 
              className="absolute inset-0 mix-blend-color opacity-40"
              style={{ backgroundColor: theme.hex }}
           ></div>
           
           {/* Typography over image */}
           <div className="absolute bottom-12 left-12 z-10">
              <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/60 mb-3 flex items-center gap-2 font-black form-element">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}></span>
                System Initialization
              </p>
              <h1 className="text-5xl lg:text-6xl font-serif italic tracking-tight text-white m-0 leading-[0.9] drop-shadow-2xl form-element">
                 {role}.
              </h1>
           </div>
        </div>

        {/* 🎛️ RIGHT SIDE: The Premium White Form */}
        <div className="w-full md:w-1/2 h-full flex flex-col justify-center px-10 md:px-16 relative overflow-hidden bg-white">
          
          {/* Ambient Glow behind the form */}
          <div className="absolute top-[-10%] right-[-10%] w-80 h-80 blur-[120px] rounded-full pointer-events-none opacity-10 transition-colors duration-1000" style={{ backgroundColor: theme.hex }}></div>

          {/* Form Header */}
          <div className="form-element mb-12 relative z-10">
            <h2 className="font-serif italic text-4xl md:text-5xl text-[#111111] m-0 tracking-tight leading-none mb-3">
              {isLogin ? 'Welcome Back.' : 'Join the Network.'}
            </h2>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#111111]/40 font-bold">
              Identity: <span className="transition-colors duration-500" style={{ color: theme.hex }}>{theme.title}</span>
            </p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6 w-full relative z-10">
            
            {/* Username Input (Only for Signup) */}
            {!isLogin && (
              <div className="form-element relative group">
                <label className="text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/40 block mb-3 ml-2 transition-colors group-focus-within:text-[#111111]">Username</label>
                <input 
                  type="text" required
                  placeholder="Creative Alias"
                  className="w-full bg-[#F4F5F7] border border-[#111111]/5 rounded-2xl py-4 px-6 text-sm outline-none text-[#111111] transition-all duration-300 focus:bg-white shadow-inner placeholder:text-[#111111]/30"
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  onFocus={(e) => { e.target.style.borderColor = theme.hex; e.target.style.boxShadow = `0 0 0 3px ${theme.hex}15`; }}
                  onBlur={(e) => { e.target.style.borderColor = 'rgba(17,17,17,0.05)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'; }}
                />
              </div>
            )}
            
            {/* Email Input */}
            <div className="form-element relative group">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/40 block mb-3 ml-2 transition-colors group-focus-within:text-[#111111]">Email Address</label>
              <input 
                type="email" required
                placeholder="studio@beatflow.com"
                className="w-full bg-[#F4F5F7] border border-[#111111]/5 rounded-2xl py-4 px-6 text-sm outline-none text-[#111111] transition-all duration-300 focus:bg-white shadow-inner placeholder:text-[#111111]/30"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                onFocus={(e) => { e.target.style.borderColor = theme.hex; e.target.style.boxShadow = `0 0 0 3px ${theme.hex}15`; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(17,17,17,0.05)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'; }}
              />
            </div>
            
            {/* Password Input */}
            <div className="form-element relative group">
              <label className="text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/40 block mb-3 ml-2 transition-colors group-focus-within:text-[#111111]">Security Passcode</label>
              <input 
                type="password" required
                placeholder="••••••••"
                className="w-full bg-[#F4F5F7] border border-[#111111]/5 rounded-2xl py-4 px-6 text-lg tracking-[0.3em] outline-none text-[#111111] transition-all duration-300 focus:bg-white shadow-inner placeholder:text-[#111111]/30"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                onFocus={(e) => { e.target.style.borderColor = theme.hex; e.target.style.boxShadow = `0 0 0 3px ${theme.hex}15`; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(17,17,17,0.05)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'; }}
              />
            </div>
            
            {/* The Submit Button (Black changes to Theme Color on Hover) */}
            <button 
               type="submit" 
               disabled={loading}
               className="form-element mt-6 w-full rounded-full py-5 text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 transform active:scale-95 flex items-center justify-center gap-3 relative overflow-hidden group disabled:opacity-70 disabled:scale-100"
               style={{ 
                 backgroundColor: '#111111', 
                 color: 'white',
                 boxShadow: `0 10px 20px rgba(0,0,0,0.1)` 
               }}
               onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = theme.hex; e.currentTarget.style.boxShadow = `0 15px 30px ${theme.shadow}`; } }}
               onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = '#111111'; e.currentTarget.style.boxShadow = `0 10px 20px rgba(0,0,0,0.1)`; } }}
            >
              {loading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">{isLogin ? 'Access Studio' : 'Establish Profile'}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Signup */}
          <div className="form-element mt-10 text-center relative z-10">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#111111]/40 font-bold">
              {isLogin ? "New to the network?" : "Existing entity?"} 
            </span>
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[10px] font-mono uppercase tracking-[0.2em] font-black ml-2 transition-colors hover:underline underline-offset-4"
              style={{ color: theme.hex }}
            >
              {isLogin ? "Create Profile" : "Authenticate"}
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}