import React, { useState } from 'react';
import axios from 'axios';

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

  // 🔥 DYNAMIC ROLE COLORS 🔥
  const getRoleTheme = () => {
    if (role === 'rapper') return { color: '#E63946', tailwind: 'text-[#E63946]', border: 'border-[#E63946]', bg: 'bg-[#E63946]' };
    if (role === 'lyricist') return { color: '#52B788', tailwind: 'text-[#52B788]', border: 'border-[#52B788]', bg: 'bg-[#52B788]' };
    return { color: '#D4AF37', tailwind: 'text-[#D4AF37]', border: 'border-[#D4AF37]', bg: 'bg-[#D4AF37]' }; // Gold for Producer
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
      
      if (role === 'lyricist') {
        data.append('lyricsText', formData.lyricsText);
      }

      if (file) {
        data.append('file', file); 
      }

      await axios.post('http://localhost:5000/api/feed/upload', data, {
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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 font-sans select-none overflow-hidden">
      
      {/* 🌑 Lighter Frosted Glass Background (Not pure black) */}
      <div 
        className="absolute inset-0 bg-[#030305]/60 backdrop-blur-2xl animate-in fade-in duration-500"
        onClick={uploading ? undefined : onClose}
      ></div>

      <div className="w-full max-w-2xl bg-[#010101]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] animate-in zoom-in-95 fade-in duration-500">
        
        {/* Dynamic Ambient Glow inside the modal */}
        <div className="absolute top-0 right-0 w-80 h-80 blur-[100px] rounded-full pointer-events-none -z-10 opacity-10 transition-colors duration-500" style={{ backgroundColor: theme.color }}></div>

        {/* ✕ Close Button */}
        <button 
          onClick={onClose} 
          disabled={uploading}
          className="absolute top-8 right-8 w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-[#888888] hover:text-[#F0F0EB] hover:bg-white/10 transition-all duration-300 active:scale-95 disabled:opacity-50 group"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {/* 🎩 Header */}
        <div className="mb-10 pr-12">
          <h2 className="text-4xl font-serif italic text-[#F0F0EB] leading-tight tracking-tight mb-2">Publish Asset</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] font-black flex items-center gap-2 font-mono" style={{ color: theme.color }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse shadow-lg" style={{ backgroundColor: theme.color, boxShadow: `0 0 10px ${theme.color}` }}></span>
            Broadcast to Network
          </p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-6 relative z-10">
          
          {/* 🎵 FILE UPLOAD FOR PRODUCERS/RAPPERS */}
          {role !== 'lyricist' && (
            <div className="relative group cursor-pointer">
              <input 
                type="file" accept="audio/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={uploading}
              />
              <div 
                className="p-8 border-2 border-dashed border-white/10 rounded-[1.5rem] bg-white/[0.02] text-center transition-all duration-300 group-hover:bg-white/[0.05]"
                style={{ borderColor: file ? theme.color : 'rgba(255,255,255,0.1)' }}
              >
                <div className="flex justify-center mb-4 text-[#888888] group-hover:text-white transition-colors" style={{ color: file ? theme.color : undefined }}>
                  {file ? (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="14 2 18 6 7 17 3 17 3 13 14 2"></polygon><line x1="3" y1="22" x2="21" y2="22"></line></svg>
                  ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                  )}
                </div>
                <p className="text-[10px] text-[#888888] uppercase tracking-[0.2em] font-mono transition-colors" style={{ color: file ? '#F0F0EB' : undefined }}>
                  {file ? file.name : 'Select Audio Transmission (.mp3, .wav)'}
                </p>
              </div>
            </div>
          )}

          {/* 📝 LYRICS BOX FOR LYRICISTS */}
          {role === 'lyricist' && (
            <div className="relative group">
              <span className="absolute top-3 right-4 text-[8px] uppercase tracking-widest font-black font-mono opacity-50" style={{ color: theme.color }}>Draft</span>
              <textarea 
                required
                placeholder="Paste your lyrical composition here..."
                className="w-full bg-[#0A0A0C] border border-white/10 rounded-[1.5rem] px-6 py-5 text-sm text-[#F0F0EB] font-mono h-40 outline-none transition-all resize-none shadow-inner placeholder:text-[#888888]/40"
                style={{ ':focus': { borderColor: theme.color } } as any} // using styled trick for dynamic focus
                onChange={(e) => setFormData({...formData, lyricsText: e.target.value})}
                disabled={uploading}
                onFocus={(e) => e.target.style.borderColor = theme.color}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          )}

          {/* 🗂️ METADATA INPUTS */}
          <div className="space-y-5">
            <input 
              type="text" required placeholder="Asset Title" 
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-5 py-4 text-sm text-[#F0F0EB] font-mono outline-none transition-all shadow-inner placeholder:text-[#888888]/40" 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              disabled={uploading}
              onFocus={(e) => e.target.style.borderColor = theme.color}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
            
            <textarea 
              required
              placeholder="Describe the sonic vision... (Required)"
              className="w-full bg-[#0A0A0C] border border-white/10 rounded-xl px-5 py-4 text-sm text-[#F0F0EB] font-mono h-24 outline-none resize-none transition-all shadow-inner placeholder:text-[#888888]/40" 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              disabled={uploading}
              onFocus={(e) => e.target.style.borderColor = theme.color}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />

            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" placeholder="Genre (e.g. Trap)" 
                className="bg-[#0A0A0C] border border-white/10 rounded-xl px-5 py-4 text-sm text-[#F0F0EB] font-mono outline-none transition-all shadow-inner placeholder:text-[#888888]/40" 
                onChange={(e) => setFormData({...formData, genre: e.target.value})} 
                disabled={uploading}
                onFocus={(e) => e.target.style.borderColor = theme.color}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <input 
                type="text" placeholder="Looking For (e.g. Rapper)" 
                className="bg-[#0A0A0C] border border-white/10 rounded-xl px-5 py-4 text-sm text-[#F0F0EB] font-mono outline-none transition-all shadow-inner placeholder:text-[#888888]/40" 
                onChange={(e) => setFormData({...formData, lookingFor: e.target.value})} 
                disabled={uploading}
                onFocus={(e) => e.target.style.borderColor = theme.color}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>
          </div>

          {/* ⚡ ACTION BUTTON */}
          <button 
            type="submit"
            disabled={uploading}
            className="w-full mt-4 py-4 rounded-full font-black uppercase tracking-[0.3em] text-[10px] transition-all duration-500 flex items-center justify-center gap-3 relative overflow-hidden group active:scale-95 disabled:opacity-50 disabled:scale-100"
            style={{ 
              backgroundColor: uploading ? 'transparent' : `${theme.color}15`, 
              color: theme.color,
              borderColor: uploading ? 'rgba(255,255,255,0.1)' : `${theme.color}40`,
              borderWidth: '1px'
            }}
            onMouseEnter={(e) => { if(!uploading) { e.currentTarget.style.backgroundColor = theme.color; e.currentTarget.style.color = '#010101'; } }}
            onMouseLeave={(e) => { if(!uploading) { e.currentTarget.style.backgroundColor = `${theme.color}15`; e.currentTarget.style.color = theme.color; } }}
          >
            {uploading ? (
              <>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-[#888888]"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                 <span className="text-[#888888]">Transmitting Payload...</span>
              </>
            ) : (
              <>
                 Publish Asset 
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}