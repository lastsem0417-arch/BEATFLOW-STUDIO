import React, { useState, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  role: string;
}

export default function AuthModal({ isOpen, onClose, onSuccess, role }: AuthModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });

  // 🎬 REFACTORED: Premium Modal Entrance (60FPS)
  useLayoutEffect(() => {
    if (!isOpen) return;

    let ctx = gsap.context(() => {
      // Background Blur Fade In (Smooth, not jerky)
      gsap.fromTo('.modal-backdrop', 
        { opacity: 0, backdropFilter: 'blur(0px)' }, 
        { opacity: 1, backdropFilter: 'blur(10px)', duration: 0.4, ease: "power2.out" } // Reduced from 0.8, blur reduced
      );

      // Modal Wrapper scales in smoothly (Subtle scale)
      gsap.fromTo(modalRef.current, 
        { opacity: 0, scale: 0.99, y: 15 }, // Was: scale: 0.95, y: 40
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.05 } // Was: 1.2s
      );

      // Image Cinematic Reveal (Just opacity, no heavy blur)
      gsap.fromTo(imageRef.current,
        { scale: 1.08, filter: "blur(8px)" }, // Was: scale: 1.15, blur: 10
        { scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", delay: 0.1 } // Reduced from 1.5s
      );

      // Staggered Form Elements (Tight wave)
      gsap.fromTo(".form-element",
        { y: 10, opacity: 0 }, // Was: y: 20
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: "power3.out", delay: 0.15 } // Was: 0.8s, stagger 0.1
      );
    }, modalRef);

    return () => ctx.revert();
  }, [isOpen]); 

  // 🎬 REFACTORED: Fast Close Animation
  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0, scale: 0.99, y: 10, duration: 0.3, ease: "power3.in", // Reduced from 0.4s
    });
    gsap.to('.modal-backdrop', {
      opacity: 0, duration: 0.3, ease: "power3.in",
      onComplete: onClose
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'register';
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/${endpoint}`, 
        { ...formData, role: role.toLowerCase() },
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      
      const token = res.data.token;
      const userObj = res.data.user || res.data; 
      const dbRole = userObj.role ? userObj.role.toLowerCase() : role.toLowerCase();
      const portalRole = role.toLowerCase();

      if (isLogin && dbRole !== portalRole) {
        setLoading(false);
        gsap.fromTo(formRef.current, { x: -5 }, { x: 5, duration: 0.08, yoyo: true, repeat: 3, ease: "linear", clearProps: "x" });
        alert(`ACCESS DENIED 🛑: Identity mismatch. Registered as [${dbRole.toUpperCase()}].`);
        return; 
      }

      const userDataToSave = { ...userObj, token, role: dbRole };
      login(userDataToSave);
      
      // 🎬 Success animation (Smooth blur out)
      gsap.to(modalRef.current, {
        opacity: 0, scale: 0.99, filter: 'blur(4px)', duration: 0.4, ease: "power3.inOut", // Reduced from 0.5s
        onComplete: () => {
          onSuccess(res.data);
        }
      });

    } catch (err: any) {
      setLoading(false);
      gsap.fromTo(formRef.current, { x: -5 }, { x: 5, duration: 0.08, yoyo: true, repeat: 3, ease: "linear", clearProps: "x" });
      alert(err.response?.data?.message || "Authentication Failed. Check credentials.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 md:p-10 font-sans select-none overflow-hidden text-[#111111]">
      
      {/* 🌑 CINEMATIC BACKDROP */}
      <div 
        className="modal-backdrop absolute inset-0 bg-[#111111]/40"
        onClick={loading ? undefined : handleClose}
      ></div>

      {/* 🏛️ THE OFF-WHITE EXECUTIVE MODAL */}
      <div 
        ref={modalRef} 
        className="w-full max-w-5xl h-[650px] flex flex-col md:flex-row rounded-[2.5rem] overflow-hidden bg-[#F4F5F7] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] relative z-10"
      >
        
        {/* ✕ CLOSE BUTTON */}
        <button 
          onClick={handleClose} 
          disabled={loading}
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-white border border-[#111111]/10 flex items-center justify-center text-[#111111]/40 hover:text-[#E63946] hover:border-[#E63946]/30 hover:shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 group"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-300"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* LEFT: IMAGE SECTION */}
        <div 
          ref={imageRef}
          className="hidden md:flex w-2/5 bg-gradient-to-br from-[#D4AF37]/20 to-[#E63946]/20 flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
          <div className="relative z-10 text-center">
            <div className="text-8xl mb-6 opacity-80">🎵</div>
            <h2 className="text-3xl font-black text-[#111111] mb-2">BeatFlow</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#111111]/50 font-mono font-black">Premium Music Creation</p>
          </div>
        </div>

        {/* RIGHT: FORM SECTION */}
        <div className="w-full md:w-3/5 p-10 md:p-16 flex flex-col justify-center relative z-10">
          
          {/* Toggle */}
          <div className="flex gap-4 mb-12 bg-[#F4F5F7] p-2 rounded-full w-fit border border-[#111111]/5">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => setIsLogin(tab === 'login')}
                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 ${
                  (tab === 'login' ? isLogin : !isLogin) 
                    ? 'bg-white text-[#111111] shadow-sm border border-[#111111]/10'
                    : 'text-[#111111]/40 border border-transparent'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div className="form-element">
                <label className="text-[9px] uppercase tracking-[0.3em] text-[#111111]/50 font-black ml-1 block mb-2">Username</label>
                <input 
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="w-full bg-white border border-[#111111]/10 rounded-2xl px-6 py-4 text-[#111111] outline-none focus:border-[#D4AF37]/50 focus:bg-[#F9F9FB] transition-all"
                  placeholder="Choose your alias"
                />
              </div>
            )}

            <div className="form-element">
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#111111]/50 font-black ml-1 block mb-2">Email</label>
              <input 
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-[#111111]/10 rounded-2xl px-6 py-4 text-[#111111] outline-none focus:border-[#D4AF37]/50 focus:bg-[#F9F9FB] transition-all"
                placeholder="artist@example.com"
              />
            </div>

            <div className="form-element">
              <label className="text-[9px] uppercase tracking-[0.3em] text-[#111111]/50 font-black ml-1 block mb-2">Password</label>
              <input 
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full bg-white border border-[#111111]/10 rounded-2xl px-6 py-4 text-[#111111] outline-none focus:border-[#D4AF37]/50 focus:bg-[#F9F9FB] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-5 bg-[#111111] text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#D4AF37] hover:text-[#111111] hover:shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all duration-300 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <svg width="16" height="16" className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10" opacity='0.25'></circle><path d="M4 12a8 8 0 0 1 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path></svg> : null}
              {loading ? 'Verifying...' : (isLogin ? 'Sign In' : 'Join BeatFlow')}
            </button>
          </form>

          <p className="text-center text-[9px] text-[#111111]/50 mt-8 font-mono uppercase tracking-[0.2em]">
            {isLogin ? "Don't have an account?" : "Already a member?"} 
            <b  className="ml-2 cursor-pointer hover:text-[#D4AF37] transition-colors" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Join' : 'Sign In'}
            </b>
          </p>
        </div>
      </div>
    </div>
  );
}
