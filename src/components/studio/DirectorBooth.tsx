import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useAudio } from '../../context/AudioContext'; 

interface StreamState {
  video: boolean;
  audio: boolean;
}

export default function DirectorBooth() {
  const navigate = useNavigate();
  const { currentTrack } = useAudio();
  
  // 🔥 STREAMS & MEDIA 🔥
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  
  // UI & STATE
  const boothRef = useRef<HTMLDivElement>(null);
  const [recordingStatus, setRecordingStatus] = useState<'idle' | 'recording' | 'preview'>('idle');
  const [streamState, setStreamState] = useState<StreamState>({ video: false, audio: false });
  const [timer, setTimer] = useState(0);

  // User Role Theme (Hardcoded for Booth as Red/Graphite)
  const theme = { hex: '#E63946', shadow: 'rgba(230,57,70,0.4)' }; // Rapper Carmine Red

  // 🛑 START WEBCAM & MIC (Viewfinder)
  useEffect(() => {
    const startStreams = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true // Capturing Microphone
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Setup MediaRecorder
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8,opus' });
        mediaRecorderRef.current = recorder;
        
        setStreamState({ video: true, audio: true });
        
        // Setup cinematic reveal
        gsap.fromTo('.booth-console', 
          { y: 50, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" }
        );

      } catch (err) {
        console.error("DirectorBooth: Permissions denied.", err);
        setStreamState({ video: false, audio: false });
      }
    };

    startStreams();

    // Cleanup: Stop streams on unmount
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  // 🔴 RECORDING LOGIC
  const handleStartRecording = () => {
    if (!mediaRecorderRef.current || !currentTrack) return;
    
    setRecordedChunks([]);
    setRecordingStatus('recording');
    setTimer(0);
    
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };
    
    // Play the beat as recording starts
    // (Ensure playTrack is available from your context)
    // playTrack(currentTrack); 
    
    mediaRecorderRef.current.start();
    
    // Pulsing REC glow animation
    gsap.fromTo('.rec-dot', 
      { opacity: 0.2 }, { opacity: 1, repeat: -1, yoyo: true, duration: 0.8 }
    );
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    mediaRecorderRef.current.stop();
    setRecordingStatus('preview');
    gsap.killTweensOf('.rec-dot'); // Stop pulsing
  };

  // 🎬 EXPORT LOGIC (Save to Vault)
  const handleExportVideo = useCallback(() => {
    if (recordedChunks.length === 0) return;
    
    // 🔥 CONVERT CHUNKS TO SYNCED MP4/WEBM BLOB 🔥
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    
    // Setup Download for client-side export
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = `BEATFLOW_SESSION_${new Date().toISOString()}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // MOCK SAVE TO VAULT:
    // This is where you would upload the blob to Cloudinary/AWS S3
    // and save the resulting link to your backend MongoDB/Vault
    console.log("Saving video blob to backend vault...");
    setRecordingStatus('idle');
    navigate('/vault'); 

  }, [recordedChunks, navigate]);

  // TIMER LOGIC
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (recordingStatus === 'recording') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [recordingStatus]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    // 🔥 IMMERSIVE DARK GRAFHITE BOOTH 🔥
    <div ref={boothRef} className="fixed inset-0 z-[10000] bg-[#0F0F11] flex flex-col items-center justify-center p-6 md:p-10 text-white font-sans overflow-hidden cursor-none select-none">
      
      {/* Dynamic Backlight Glow based on Role (Red for Rapper) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] blur-[150px] rounded-full pointer-events-none opacity-10 transition-colors duration-1000" style={{ backgroundColor: theme.hex }}></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] mix-blend-screen pointer-events-none"></div>

      {/* ✕ Close Booth */}
      <button onClick={() => navigate('/')} className="absolute top-10 right-10 z-50 w-12 h-12 rounded-full border border-white/10 bg-[#0A0A0C] flex items-center justify-center text-white/40 hover:text-[#E63946] hover:bg-white hover:border-[#E63946]/30 hover:shadow-md transition-all duration-300 active:scale-95 group">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      {/* 🎥 THE BOOTH CONSOLE */}
      <div className="booth-console relative w-full h-full flex flex-col items-center justify-center bg-[#0A0A0C] border border-white/5 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden">
         
         {/* 1. THE VIEWSCREEN (Webcam) */}
         <div className="relative flex-1 w-full bg-black group/viewfinder overflow-hidden">
             
             {/* Dynamic Glowing Border Pulse while Recording */}
             {recordingStatus === 'recording' && (
                <div className="absolute inset-0 z-10 rounded-[1rem] border-4 opacity-50 transition-colors animate-pulse" style={{ borderColor: theme.hex }}></div>
             )}

             <video 
               ref={videoRef} 
               autoPlay playsInline muted
               className="w-full h-full object-cover grayscale mix-blend-screen opacity-90 transition-all duration-700"
               style={{ transform: recordingStatus === 'recording' ? 'scale(1.05)' : 'scale(1)' }}
             />
             
             {/* IMAGES & OVERLAYS */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             
             {/* Camera Viewfinder Corners */}
             <div className="absolute inset-10 border-2 border-white/10 rounded-2xl pointer-events-none">
                 <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/60"></div>
                 <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/60"></div>
                 <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/60"></div>
                 <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/60"></div>
             </div>

             {/* 🔴 REC Indicator */}
             <div className="absolute top-10 left-10 flex items-center gap-3 z-20">
                 <span className={`rec-dot w-3 h-3 rounded-full ${recordingStatus === 'recording' ? 'animate-pulse' : 'opacity-30'}`} style={{ backgroundColor: theme.hex, boxShadow: recordingStatus === 'recording' ? `0 0 10px ${theme.hex}` : '' }}></span>
                 <span className={`text-[10px] uppercase tracking-[0.4em] font-black ${recordingStatus === 'recording' ? 'text-white' : 'text-white/30'}`}>
                    {recordingStatus === 'recording' ? `REC ${formatTime(timer)}` : 'System Standby'}
                 </span>
             </div>
             
             <div className="absolute top-10 right-10 text-[10px] uppercase tracking-[0.3em] font-mono text-white/30 font-black z-20">
               Director's Booth | Session Sync
             </div>

             {/* Dynamic Waveform Visualizer Placeholder (Needs JS to animate) */}
             <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[70%] h-12 flex items-end gap-1 px-4 z-20">
                 {/* MOCK Waveform bars */}
                 {Array(50).fill(0).map((_, i) => (
                    <div key={i} className="flex-1 bg-white animate-[bounce_1.5s_infinite] shadow-[0_0_10px_white]" style={{ height: recordingStatus === 'recording' ? `${Math.random() * 80}%` : '10%', animationDelay: `${i * 0.05}s` }}></div>
                 ))}
             </div>
         </div>

         {/* 🎛️ RECORDING CONTROLS */}
         <div className="p-8 md:p-12 w-full flex items-center justify-between bg-[#0A0A0C]">
             <div className="flex flex-col flex-1">
                 <p className="text-[10px] uppercase tracking-[0.3em] font-black text-white/30 mb-2">Selected Asset (Beat)</p>
                 <h2 className="text-3xl font-serif italic text-white mb-2 leading-none">{currentTrack?.title || 'No Drop Loaded'}</h2>
                 <p className="text-[9px] uppercase tracking-[0.2em] font-mono text-[#E63946] font-black flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E63946]"></span> Rapper Recording
                 </p>
             </div>
             
             <div className="flex items-center gap-6">
                
                {recordingStatus === 'idle' && (
                    <button 
                       onClick={handleStartRecording} 
                       disabled={!streamState.video || !currentTrack}
                       className="px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all disabled:opacity-50 group flex items-center gap-3"
                       style={{ 
                         backgroundColor: theme.hex,
                         boxShadow: `0 15px 30px ${theme.shadow}`,
                         color: 'white'
                       }}
                    >
                        <span className="group-hover:scale-110 transition-transform">Init Rec Booth</span> 
                        <span className="rec-dot w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    </button>
                )}

                {recordingStatus === 'recording' && (
                    <button 
                       onClick={handleStopRecording} 
                       className="px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3"
                       style={{ 
                         backgroundColor: 'white',
                         color: '#111111'
                       }}
                    >
                        Save Studio Session 
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#111111"><rect x="6" y="6" width="12" height="12"></rect></svg>
                    </button>
                )}
                
                {recordingStatus === 'preview' && (
                    <button 
                       onClick={handleExportVideo} 
                       className="px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-3"
                       style={{ 
                         backgroundColor: '#10B981', // Emerald for success
                         color: 'white'
                       }}
                    >
                        Export Video to Vault 
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                )}

             </div>
         </div>
      </div>
    </div>
  );
}