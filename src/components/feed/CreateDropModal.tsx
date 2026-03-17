import React, { useState } from 'react';
import axios from 'axios';

export default function CreateDropModal({ onClose, onSuccess }: any) {
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const role = user.role?.toLowerCase();
  
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Client-side check
    if (!formData.description.trim()) {
      alert("Please add a description!");
      return;
    }

    setUploading(true);
    
    try {
      const data = new FormData();
      
      // 🔥 TEXT FIELDS KO PEHLE APPEND KARO (Multer preference)
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('genre', formData.genre);
      data.append('lookingFor', formData.lookingFor);
      data.append('bounty', formData.bounty || 'Not specified');
      
      if (role === 'lyricist') {
        data.append('lyricsText', formData.lyricsText);
      }

      // 🔥 FILE KO LAST MEIN APPEND KARO
      if (file) {
        data.append('file', file); 
      }

      console.log("🚀 Sending Data to Backend...");

      await axios.post('http://localhost:5000/api/feed/upload', data, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}` 
        }
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("❌ Upload Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed! Make sure all fields are filled.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl px-4">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
        
        {/* Header */}
        <div className="mb-8">
          <button onClick={onClose} className="absolute top-8 right-8 text-neutral-500 hover:text-white transition-colors">✕</button>
          <h2 className="text-3xl font-serif italic text-white leading-tight">Drop to Global Feed</h2>
          <p className="text-[10px] uppercase tracking-[0.4em] text-emerald-500 font-black mt-2">Broadcast your craft</p>
        </div>

        <form onSubmit={handleUpload} className="flex flex-col gap-5">
          {/* File Selector for Producers/Rappers */}
          {role !== 'lyricist' && (
            <div className="relative group">
              <input 
                type="file" accept="audio/*" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl bg-white/[0.02] text-center group-hover:border-emerald-500/50 transition-all">
                <span className="text-2xl block mb-2">{file ? '🎵' : '📁'}</span>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
                  {file ? file.name : 'Select Beat / Vocals (.mp3, .wav)'}
                </p>
              </div>
            </div>
          )}

          {/* Lyrics Box for Lyricists */}
          {role === 'lyricist' && (
            <textarea 
              required
              placeholder="Paste your fire bars here..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm text-emerald-400 font-mono h-40 focus:border-emerald-500 outline-none transition-all"
              onChange={(e) => setFormData({...formData, lyricsText: e.target.value})}
            />
          )}

          <div className="space-y-4">
            <input 
              type="text" required placeholder="Project Title" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500 outline-none" 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
            />
            
            {/* 🔥 DESCRIPTION BOX (THE FIX) 🔥 */}
            <textarea 
              required
              placeholder="Describe the vibe... (Required)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white h-24 focus:border-emerald-500 outline-none resize-none" 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Genre (e.g. Trap)" className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500 outline-none" onChange={(e) => setFormData({...formData, genre: e.target.value})} />
              <input type="text" placeholder="Looking For (e.g. Rapper)" className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-sm text-white focus:border-emerald-500 outline-none" onChange={(e) => setFormData({...formData, lookingFor: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={uploading}
            className={`w-full py-4 font-black uppercase tracking-[0.2em] rounded-2xl transition-all ${uploading ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
          >
            {uploading ? 'Uploading your fire...' : 'Publish Drop 🚀'}
          </button>
        </form>
      </div>
    </div>
  );
}