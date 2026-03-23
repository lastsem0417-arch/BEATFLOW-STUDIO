import React, { useState } from 'react';
import axios from 'axios';

// 🔥 VITE ENV API URL FETCH 🔥
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function CreateDropModal({ onClose, onSuccess }: any) {
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const role = user.role?.toLowerCase() || 'producer';
  
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '', 
    description: '', 
    genre: '', 
    lookingFor: '', 
    bounty: '', 
    lyricsText: ''
  });
  const [uploading, setUploading] = useState(false);

  // 🔥 DYNAMIC ROLE THEME 🔥
  const getRoleTheme = () => {
    if (role === 'rapper') return { hex: '#E63946', shadow: 'rgba(230,57,70,0.3)' }; 
    if (role === 'lyricist') return { hex: '#10B981', shadow: 'rgba(16,185,129,0.3)' }; 
    return { hex: '#D4AF37', shadow: 'rgba(212,175,55,0.3)' }; 
  };
  const theme = getRoleTheme();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      alert("System Alert: A description is mandatory.");
      return;
    }

    setUploading(true);
    
    try {
      const data = new FormData();
      
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('genre', formData.genre);
      data.append('lookingFor', formData.lookingFor);
      data.append('bounty', formData.bounty || 'Open terms');
      
      // 🔥 FIX 1: Backend ko batana zaroori hai ki trackType kya hai 🔥
      const trackType = role === 'producer' ? 'beat' : (role === 'rapper' ? 'vocal' : 'lyrics');
      data.append('trackType', trackType);

      if (role === 'lyricist') {
        data.append('lyricsText', formData.lyricsText);
      }

      // 🔥 Multer sirf 'file' field accept karta hai 🔥
      if (file) {
        data.append('file', file); 
      }

      // 🔥 FIX 2: Hardcoded localhost ki jagah BACKEND_URL use kiya 🔥
      await axios.post(`${BACKEND_URL}/api/feed/upload`, data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        }
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Upload Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed! Verify connection and payload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-8 font-sans select-none overflow-hidden text-[#111111]">
      <div 
        className="absolute inset-0 bg-[#111111]/40 backdrop-blur-md animate-in fade-in duration-500 transition-opacity"
        onClick={uploading ? undefined : onClose}
      ></div>

      <div className="w-full max-w-2xl bg-white border border-[#111111]/5 rounded-[3rem] p-10 md:p-14 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.2)] animate-in zoom-in-[0.98] slide-in-from-bottom-8 fade-in duration-700">
        
        <div 
          className="absolute top-[-20%] right-[-10%] w-96 h-96 blur-[100px] rounded-full pointer-events-none -z-10 opacity-15 transition-colors duration-1000" 
          style={{ backgroundColor: theme.hex }}
        ></div>

        <button 
          onClick={onClose} 
          disabled={uploading}
          className="absolute top-10 right-10 w-12 h-12 rounded-full border border-[#111111]/10 bg-[#F4F5F7] flex items-center justify-center text-[#111111]/40 hover:text-[#E63946] hover:bg-white hover:border-[#E63946]/30 hover:shadow-sm transition-all duration-300 active:scale-95 disabled:opacity-50 group z-20"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="mb-12 pr-12 relative z-10">
          <h2 className="text-4xl md:text-5xl font-serif italic text-[#111111] leading-tight tracking-tight mb-3">Publish Asset</h2>
          <p className="text-[9px] uppercase tracking-[0.4em] font-black flex items-center gap-2 font-mono text-[#111111]/50">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: theme.hex, boxShadow: `0 0 10px ${theme.hex}` }}></span>
            Broadcast to Network
          </p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-6 relative z-10">
          
          {role !== 'lyricist' && (
            <div className="relative group cursor-pointer mb-2">
              <input 
                type="file" accept="audio/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={uploading}
              />
              <div 
                className="p-10 border-2 border-dashed rounded-[2rem] bg-[#F4F5F7]/50 text-center transition-all duration-500 group-hover:bg-[#F4F5F7]"
                style={{ borderColor: file ? theme.hex : 'rgba(17,17,17,0.1)' }}
              >
                <div className="flex justify-center mb-4 transition-transform duration-500 group-hover:-translate-y-1" style={{ color: file ? theme.hex : 'rgba(17,17,17,0.3)' }}>
                  {file ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  )}
                </div>
                <p className="text-[10px] text-[#111111]/40 uppercase tracking-[0.2em] font-mono font-bold transition-colors" style={{ color: file ? '#111111' : undefined }}>
                  {file ? file.name : 'Select Audio Transmission (.mp3, .wav)'}
                </p>
              </div>
            </div>
          )}

          {role === 'lyricist' && (
            <div className="relative group mb-2">
              <span className="absolute top-4 right-5 text-[8px] uppercase tracking-widest font-black font-mono opacity-60" style={{ color: theme.hex }}>Draft</span>
              <textarea 
                required
                placeholder="Paste your lyrical composition here..."
                className="w-full bg-[#F4F5F7] border border-[#111111]/10 rounded-[2rem] px-8 py-6 text-sm text-[#111111] font-serif italic h-40 outline-none transition-all duration-500 resize-none shadow-inner placeholder:text-[#111111]/30 focus:bg-white"
                onChange={(e) => setFormData({...formData, lyricsText: e.target.value})}
                disabled={uploading}
                onFocus={(e) => { e.target.style.borderColor = theme.hex; e.target.style.boxShadow = `0 0 0 4px ${theme.hex}15`; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(17,17,17,0.1)'; e.target.style.boxShadow = 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)'; }}
              />
            </div>
          )}

          <div className="space-y-5">
            <input 
              type="text" required placeholder="Asset Title" 
              className="w-full bg-[#F4F5F7] border border-[#111111]/10 rounded-[1.2rem] px-6 py-4 text-sm text-[#111111] font-medium outline-none transition-all duration-300 shadow-inner placeholder:text-[#111111]/40 focus:bg-white" 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              disabled={uploading}
            />
            
            <textarea 
              required
              placeholder="Describe the sonic vision... (Required)"
              className="w-full bg-[#F4F5F7] border border-[#111111]/10 rounded-[1.2rem] px-6 py-4 text-sm text-[#111111] font-medium h-24 outline-none resize-none transition-all duration-300 shadow-inner placeholder:text-[#111111]/40 focus:bg-white custom-scrollbar" 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={uploading}
            />

            <div className="grid grid-cols-2 gap-5">
              <input 
                type="text" placeholder="Genre (e.g. Trap)" 
                className="bg-[#F4F5F7] border border-[#111111]/10 rounded-[1.2rem] px-6 py-4 text-sm text-[#111111] font-medium outline-none transition-all duration-300 shadow-inner placeholder:text-[#111111]/40 focus:bg-white" 
                onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                disabled={uploading}
              />
              <input 
                type="text" placeholder="Looking For (e.g. Rapper)" 
                className="bg-[#F4F5F7] border border-[#111111]/10 rounded-[1.2rem] px-6 py-4 text-sm text-[#111111] font-medium outline-none transition-all duration-300 shadow-inner placeholder:text-[#111111]/40 focus:bg-white" 
                onChange={(e) => setFormData({...formData, lookingFor: e.target.value})} 
                disabled={uploading}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading}
            className="w-full mt-6 py-5 rounded-full font-black uppercase tracking-[0.4em] text-[10px] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 disabled:opacity-70 disabled:scale-100"
            style={{ 
              backgroundColor: uploading ? '#F4F5F7' : theme.hex, 
              color: uploading ? '#111111' : 'white',
              boxShadow: uploading ? 'none' : `0 15px 30px ${theme.shadow}`
            }}
          >
            {uploading ? (
              <>
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-[#111111]/50"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                 <span className="text-[#111111]/50">Encrypting & Transmitting...</span>
              </>
            ) : (
              <>
                 Publish Asset 
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </>
            )}
          </button>
        </form>

        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(17,17,17,0.3); }
        `}</style>
      </div>
    </div>
  );
}