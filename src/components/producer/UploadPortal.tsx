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
      }, 2000); 

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
    // 🔥 PREMIUM EDITORIAL UPLOAD TERMINAL
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative w-full rounded-[1.5rem] p-12 lg:p-20 flex flex-col items-center justify-center overflow-hidden transition-all duration-500 font-sans ${isDragging ? 'bg-[#D4AF37]/5 border-2 border-[#D4AF37] shadow-[0_20px_60px_rgba(212,175,55,0.15)] scale-[0.99]' : 'bg-[#F4F3EF]/50 border border-dashed border-[#001433]/20 hover:border-solid hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 hover:shadow-[0_15px_40px_rgba(0,20,51,0.05)]'}`}
    >
      
      {/* Background soft glow on hover */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white blur-[80px] rounded-full pointer-events-none opacity-50"></div>

      {uploadStatus === 'idle' && (
        <div 
            className="flex flex-col items-center cursor-pointer relative z-10 w-full group"
            onClick={() => fileInputRef.current?.click()}
        >
          {/* Elegant Upload Icon Box */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 border ${isDragging ? 'bg-[#D4AF37] border-[#D4AF37] text-white shadow-[0_10px_30px_rgba(212,175,55,0.4)]' : 'bg-white border-[#001433]/10 text-[#001433] group-hover:bg-[#001433] group-hover:text-white shadow-sm group-hover:shadow-[0_15px_40px_rgba(0,20,51,0.2)]'}`}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          
          <h3 className="mt-8 text-3xl md:text-4xl font-serif italic text-[#001433] leading-none transition-colors duration-300 text-center tracking-tight">
             {isDragging ? <span className="text-[#D4AF37]">Release to Deploy</span> : 'Deploy Audio Asset'}
          </h3>
          
          <p className="mt-4 text-[10px] text-[#001433]/60 font-black uppercase tracking-[0.3em] font-mono flex items-center gap-2">
            Drag & Drop or <span className="bg-[#001433] text-white px-3 py-1.5 rounded-full hover:bg-[#D4AF37] transition-colors ml-1 shadow-sm">Browse</span>
          </p>
          
          <div className="mt-10 flex items-center gap-4 text-[9px] text-[#001433]/50 font-black font-mono uppercase tracking-[0.2em]">
             <span className="px-4 py-2 border border-[#001433]/10 rounded-full bg-white shadow-sm">WAV</span>
             <span className="px-4 py-2 border border-[#001433]/10 rounded-full bg-white shadow-sm">MP3</span>
             <span className="px-4 py-2 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full bg-[#D4AF37]/5 shadow-sm">MAX 20MB</span>
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

      {/* ⏳ EDITORIAL UPLOADING STATE */}
      {uploadStatus === 'uploading' && (
        <div className="flex flex-col items-center relative z-10 w-full max-w-md animate-in fade-in duration-500">
          
          <div className="flex justify-between items-end w-full mb-6 pb-4 border-b border-[#001433]/10">
             <h3 className="text-2xl font-serif italic text-[#001433] m-0">Transmitting...</h3>
             <span className="text-2xl font-light font-mono text-[#D4AF37] tracking-tighter">{progress}%</span>
          </div>
          
          {/* Sleek Progress Bar */}
          <div className="w-full h-3 bg-[#001433]/5 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-[#D4AF37] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
          
          <span className="mt-8 text-[9px] text-[#001433]/60 font-bold font-mono uppercase tracking-[0.3em] bg-white px-4 py-2 rounded-full shadow-sm border border-[#001433]/5">Encrypting & Uploading</span>
        </div>
      )}

      {/* ✅ SUCCESS STATE */}
      {uploadStatus === 'success' && (
        <div className="flex flex-col items-center relative z-10 w-full animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-[#D4AF37] rounded-full flex items-center justify-center mb-6 text-white shadow-[0_15px_40px_rgba(212,175,55,0.4)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
           </div>
           <h3 className="text-4xl md:text-5xl font-serif italic text-[#001433] leading-none text-center">Asset Forged.</h3>
           <p className="mt-6 text-[10px] text-[#D4AF37] uppercase tracking-[0.3em] font-black bg-[#D4AF37]/10 rounded-full px-5 py-2.5">Vault Synchronized Successfully</p>
        </div>
      )}

      {/* ❌ ERROR STATE */}
      {uploadStatus === 'error' && (
        <div className="flex flex-col items-center relative z-10 w-full animate-in shake duration-500">
           <div className="w-24 h-24 bg-[#E63946] rounded-full flex items-center justify-center mb-6 text-white shadow-[0_15px_40px_rgba(230,57,70,0.3)]">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
           </div>
           <h3 className="text-4xl md:text-5xl font-serif italic text-[#001433] leading-none text-center">Transmission Failed.</h3>
           <p className="mt-6 text-[10px] text-[#E63946] bg-[#E63946]/10 rounded-full uppercase tracking-[0.3em] font-black px-5 py-2.5">Invalid Format or Server Error</p>
        </div>
      )}

    </div>
  );
}