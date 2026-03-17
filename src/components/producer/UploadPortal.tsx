import React, { useState } from 'react';
import axios from 'axios';

export default function UploadPortal({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('title', file.name.split('.')[0]);
    formData.append('creator', user.id || user._id);
    formData.append('trackType', 'beat');

    try {
      await axios.post('http://localhost:5000/api/tracks/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          setProgress(percentCompleted);
        }
      });
      alert("Beat Forged Successfully! 🚀");
      setIsUploading(false);
      onUploadSuccess();
    } catch (err) {
      console.error(err);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {!isUploading ? (
        <label className="flex flex-col items-center cursor-pointer relative z-10">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-blue-500/50 group-hover:scale-110 transition-all duration-500">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
          </div>
          <h3 className="mt-6 text-[11px] font-black uppercase tracking-[0.3em] text-white">Upload New Beat</h3>
          <p className="mt-2 text-[9px] text-neutral-500 uppercase tracking-widest">WAV or MP3 (Max 20MB)</p>
          <input type="file" className="hidden" onChange={handleFileUpload} accept="audio/*" />
        </label>
      ) : (
        <div className="flex flex-col items-center relative z-10 w-full max-w-xs">
          <div className="text-[10px] font-mono text-blue-400 mb-4 animate-pulse uppercase tracking-[0.2em]">Uploading to Cloud... {progress}%</div>
          <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}