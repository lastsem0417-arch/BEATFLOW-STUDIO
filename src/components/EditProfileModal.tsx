import React, { useState } from 'react';
import axios from 'axios';

export default function EditProfileModal({ user, onClose, onSuccess }: any) {
  const [bio, setBio] = useState(user.bio || '');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user.profileImage || null);
  const [loading, setLoading] = useState(false);

  // Dynamic Theme based on Role (Consistent with UserProfile)
  const getTheme = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return { hex: '#E63946' };
    if (r === 'lyricist') return { hex: '#10B981' };
    if (r === 'producer') return { hex: '#D4AF37' };
    return { hex: '#2563EB' }; // Default / Listener
  };
  const theme = getTheme(user.role);

  // File Selection Magic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('bio', bio);
    if (file) {
      formData.append('profileImage', file);
    }

    try {
      const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
      const res = await axios.put('{import.meta.env.VITE_API_URL/api/users/update-profile', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${loggedInUser.token}` 
        }
      });
      onSuccess(res.data); // Pass updated data back to UserProfile
    } catch (error) {
      console.error("Error updating profile", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4 md:px-0 font-sans text-[#111111] select-none">
      
      {/* 🌫️ Premium Backdrop Blur */}
      <div className="absolute inset-0 bg-[#111111]/60 backdrop-blur-xl transition-all duration-500" onClick={onClose}></div>

      {/* 📝 THE LUXURY MODAL */}
      <div className="relative w-full max-w-lg bg-[#F4F5F7] border border-white/20 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-[0.98] fade-in duration-500">
        
        {/* Subtle top ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 blur-[60px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: theme.hex }}></div>

        {/* Header */}
        <div className="px-10 py-8 border-b border-[#111111]/5 flex items-center justify-between relative z-10 bg-white/50 backdrop-blur-md">
          <div className="flex flex-col">
             <h3 className="text-3xl font-serif italic text-[#111111] leading-none">Edit Identity</h3>
             <p className="text-[9px] uppercase tracking-[0.4em] font-mono text-[#111111]/40 mt-2 font-black">System Preferences</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full bg-white border border-[#111111]/10 flex items-center justify-center text-[#111111]/40 hover:text-[#E63946] hover:border-[#E63946]/30 hover:bg-[#E63946]/5 transition-all duration-300 shadow-sm active:scale-95"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8 relative z-10 bg-white/80">
          
          {/* Avatar Upload (Editorial UI) */}
          <div className="flex flex-col items-center justify-center">
            <label className="relative cursor-pointer group mb-4">
              <div className="w-32 h-32 rounded-full border border-[#111111]/10 flex items-center justify-center overflow-hidden transition-all duration-500 bg-[#F4F5F7] shadow-inner group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#111111]/30"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                )}
                
                {/* Frosted Hover Overlay */}
                <div className="absolute inset-0 bg-[#111111]/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-[9px] uppercase font-black tracking-widest text-white">Update</span>
                </div>
              </div>

              {/* Glowing decorative ring on hover */}
              <div 
                className="absolute inset-0 rounded-full border border-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 scale-110"
                style={{ borderColor: theme.hex, boxShadow: `0 0 20px ${theme.hex}20` }}
              ></div>
              
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
            <p className="text-[9px] uppercase tracking-[0.3em] text-[#111111]/40 font-mono font-bold">Tap to configure visual data</p>
          </div>

          {/* Bio Input */}
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase tracking-[0.3em] text-[#111111]/50 font-black ml-2 font-mono flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.hex }}></span> Your Bio
            </label>
            <div className="relative group">
                <textarea 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Define your artistic vision..."
                  className="w-full bg-[#F4F5F7] border border-[#111111]/10 rounded-[1.5rem] p-5 text-sm md:text-base text-[#111111] font-serif italic outline-none transition-all duration-300 h-32 resize-none placeholder:text-[#111111]/30 shadow-inner focus:bg-white"
                  style={{ '--tw-ring-color': theme.hex } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = theme.hex}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(17,17,17,0.1)'}
                />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 py-5 rounded-full bg-[#111111] text-white text-[10px] font-black uppercase tracking-[0.4em] transition-all duration-500 transform active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.15)] disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: theme.hex }}></div>
            <span className="relative z-10">{loading ? 'Encrypting Identity...' : 'Confirm Changes'}</span>
            {!loading && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 group-hover:translate-x-1 transition-transform"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
          </button>
        </form>
      </div>

      <style>{`
        textarea::-webkit-scrollbar { width: 6px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
        textarea::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.3); }
      `}</style>
    </div>
  );
}