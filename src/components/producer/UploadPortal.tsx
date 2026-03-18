import React, { useState, useRef } from 'react';
import axios from 'axios';

export default function UploadPortal({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file || !file.type.startsWith('audio/')) {
        setUploadStatus('error');
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
    }

    setIsUploading(true);
    setUploadStatus('uploading');
    setProgress(0);

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
      
      setUploadStatus('success');
      setTimeout(() => {
          setIsUploading(false);
          setUploadStatus('idle');
          setProgress(0);
          onUploadSuccess();
      }, 2000); // 2 second ka cinematic delay before refreshing table

    } catch (err) {
      console.error("Upload Error:", err);
      setUploadStatus('error');
      setTimeout(() => {
          setIsUploading(false);
          setUploadStatus('idle');
      }, 3000);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // 🔥 DRAG AND DROP HANDLERS 🔥
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative bg-brand-dark border rounded-[2rem] p-12 lg:p-20 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${isDragging ? 'border-producer/50 bg-producer/5 scale-[1.02]' : 'border-white/5 hover:border-producer/30'}`}
    >
      
      {/* 🌌 AMBIENT UPLOAD GLOW */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-producer/10 blur-[100px] rounded-full pointer-events-none transition-all duration-700 ${isDragging || uploadStatus === 'uploading' ? 'opacity-100 scale-150' : 'opacity-0'}`}></div>
      <div className={`absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none z-0 transition-opacity ${uploadStatus === 'uploading' ? 'animate-pulse' : ''}`}></div>

      {uploadStatus === 'idle' && (
        <div 
            className="flex flex-col items-center cursor-pointer relative z-10 w-full"
            onClick={() => fileInputRef.current?.click()}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center border transition-all duration-500 ${isDragging ? 'bg-producer text-black border-producer shadow-[0_0_30px_rgba(212,175,55,0.4)] scale-110' : 'bg-[#010101] text-brand-pearl border-white/10 group-hover:border-producer/50 group-hover:text-producer'}`}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          
          <h3 className="mt-8 text-2xl font-serif italic tracking-wide text-brand-pearl transition-colors duration-300">
             {isDragging ? <span className="text-producer">Drop the masterpiece</span> : 'Deploy Audio Asset'}
          </h3>
          <p className="mt-3 text-[9px] text-brand-muted uppercase tracking-[0.4em] font-mono">
            Drag & Drop or <span className="text-producer underline decoration-producer/30 underline-offset-4 cursor-pointer ml-1">Browse</span>
          </p>
          <div className="mt-6 flex items-center gap-4 text-[8px] text-brand-muted/70 font-mono uppercase tracking-widest">
             <span className="px-2 py-1 border border-white/5 rounded-md bg-white/5">WAV</span>
             <span className="px-2 py-1 border border-white/5 rounded-md bg-white/5">MP3</span>
             <span className="px-2 py-1 border border-white/5 rounded-md bg-white/5">MAX 20MB</span>
          </div>

          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload} 
            accept="audio/*" 
          />
        </div>
      )}

      {uploadStatus === 'uploading' && (
        <div className="flex flex-col items-center relative z-10 w-full max-w-md animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full border border-producer/20 flex items-center justify-center mb-6 relative">
             <div className="absolute inset-0 rounded-full border border-producer/40 animate-[ping_2s_infinite]"></div>
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-producer animate-pulse"><polyline points="16 16 12 12 8 16"></polyline><line x1="12" y1="12" x2="12" y2="21"></line><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path><polyline points="16 16 12 12 8 16"></polyline></svg>
          </div>
          <h3 className="text-lg font-serif italic text-producer mb-2">Transmitting to Cloud...</h3>
          <div className="text-[12px] font-mono text-brand-pearl mb-6 uppercase tracking-[0.3em]">{progress}%</div>
          
          <div className="w-full h-[2px] bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-producer shadow-[0_0_15px_#D4AF37] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex flex-col items-center relative z-10 w-full animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 rounded-full bg-producer/10 border border-producer/30 flex items-center justify-center mb-6 text-producer shadow-[0_0_40px_rgba(212,175,55,0.2)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
           <h3 className="text-3xl font-serif italic text-brand-pearl">Asset Forged.</h3>
           <p className="mt-2 text-[10px] text-brand-muted uppercase tracking-[0.4em] font-mono">Vault Synchronized Successfully</p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex flex-col items-center relative z-10 w-full animate-in shake duration-500">
           <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.2)]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </div>
           <h3 className="text-3xl font-serif italic text-brand-pearl">Transmission Failed.</h3>
           <p className="mt-2 text-[10px] text-red-500/70 uppercase tracking-[0.4em] font-mono">Invalid Format or Server Error</p>
        </div>
      )}

    </div>
  );
}