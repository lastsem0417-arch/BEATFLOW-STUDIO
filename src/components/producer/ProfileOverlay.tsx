import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function ProfileOverlay({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(JSON.parse(sessionStorage.getItem('beatflow_user') || '{}'));
  
  // Basic settings form
  const [formData, setFormData] = useState({
    name: user.name || "",
    username: user.username || "",
    bio: user.bio || "BeatFlow Executive Producer"
  });

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(".overlay-bg", { opacity: 0 }, { opacity: 1, duration: 0.5 });
      gsap.fromTo(".profile-card", { scale: 0.8, opacity: 0, y: 50 }, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power4.out" });
    }
  }, [isOpen]);

  const handleLogout = () => {
    // 🔥 FIX: Beatflow uses sessionStorage, not localStorage
    sessionStorage.removeItem('beatflow_user');
    window.location.href = '/roles';
  };

  const handleUpdate = () => {
    // Ye baad me backend se link karenge, abhi sirf local simulate kar rahe hain
    const updatedUser = { ...user, ...formData };
    sessionStorage.setItem('beatflow_user', JSON.stringify(updatedUser));
    alert("Identity Re-calibrated! ⚡");
    onClose();
  };

  const goToCinematicProfile = () => {
      onClose();
      navigate('/profile');
  };

  if (!isOpen) return null;

  return (
    <div className="overlay-bg fixed inset-0 z-[1000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6">
      <div className="profile-card w-full max-w-2xl bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-[10px] uppercase tracking-widest text-neutral-600 hover:text-white transition-colors">[ Close ]</button>

        <div className="flex flex-col items-center gap-10">
          <div className="relative group cursor-pointer" onClick={goToCinematicProfile} title="View Cinematic Identity">
            <div className="w-32 h-32 rounded-full border-2 border-blue-500/30 p-1 group-hover:border-blue-500 transition-colors duration-500">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.username}`} className="w-full h-full rounded-full grayscale group-hover:grayscale-0 transition-all duration-500" alt="Avatar" />
            </div>
            <div className="absolute -bottom-2 right-0 bg-blue-600 text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-[0_0_10px_rgba(37,99,235,0.8)]">Verified</div>
          </div>

          <div className="w-full space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-black ml-2">Public Alias</p>
                <input type="text" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-black ml-2">DNA Seed (Avatar)</p>
                <input type="text" value={formData.username} onChange={(e)=>setFormData({...formData, username:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white outline-none focus:border-blue-500/50 transition-all" />
              </div>
            </div>

            <div className="space-y-1">
                <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-black ml-2">Studio Bio</p>
                <textarea value={formData.bio} onChange={(e)=>setFormData({...formData, bio:e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white h-24 resize-none outline-none focus:border-blue-500/50 transition-all" />
            </div>

            <div className="flex flex-col gap-4 pt-6">
              
              <div className="grid grid-cols-2 gap-4">
                  <button onClick={handleUpdate} className="w-full py-4 bg-white/10 border border-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95">Save Settings</button>
                  {/* 🔥 NEW: Button to go to the Cinematic Profile 🔥 */}
                  <button onClick={goToCinematicProfile} className="w-full py-4 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all active:scale-95">View Hologram</button>
              </div>

              <button onClick={handleLogout} className="w-full py-4 border border-red-500/20 text-red-500/70 hover:text-white hover:bg-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all rounded-xl text-[10px] font-black uppercase tracking-[0.3em] mt-2">[ Terminate Session ]</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}