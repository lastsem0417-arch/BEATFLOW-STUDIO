import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';
import TopTransportBar from './TopTransportBar';
import TimelineGrid from './TimelineGrid';
import DAWBottomPanel from './DAWBottomPanel';
import DraggableWebcam from './DraggableWebcam'; 
import LyricPad from './LyricPad';             

export default function StudioMaster() {
  const containerRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const liveRecordBlockRef = useRef<HTMLDivElement>(null); 
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // 🔥 VIDEO RECORDING STATES 🔥
  const [sessionVideoUrl, setSessionVideoUrl] = useState<string | null>(null); // Local Download Link
  const [cloudVideoUrl, setCloudVideoUrl] = useState<string | null>(null); // Vault Database Link
  const [isWebcamActive, setIsWebcamActive] = useState(false);

  // --- AUDIO FX REFS ---
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<{ [key: string]: MediaElementAudioSourceNode }>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'save' | 'new' }>({ isOpen: false, type: 'save' });
  const [tempProjectName, setTempProjectName] = useState("Untitled Project");
  const [currentProjectName, setCurrentProjectName] = useState("Untitled Project");
  
  // 🔥 FEEDBACK STATE
  const [producerNotes, setProducerNotes] = useState("");

  const [tracks, setTracks] = useState<any[]>([
    { id: 'track_1', title: 'Main Vocals', type: 'vocal', audioUrl: null, startTime: 0, trimStart: 0, duration: 15, isProcessing: false, volume: 0.8, isMuted: false, isSolo: false, preset: 'clean' },
    { id: 'track_2', title: 'Beat Audio', type: 'beat', audioUrl: null, startTime: 0, trimStart: 0, duration: 15, isProcessing: false, volume: 0.7, isMuted: false, isSolo: false, preset: 'clean' }
  ]);
  const [activeTrackId, setActiveTrackId] = useState<string>('track_1');

  const duration = 180; 
  const pixelsPerSecond = 50;
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const userId = user.id || user._id;

  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const [libraryBeats, setLibraryBeats] = useState<any[]>([]);
  const [savedProjects, setSavedProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchLibraryAndProjects = async () => {
      const localProjects = JSON.parse(localStorage.getItem('beatflow_projects') || '[]');
      setSavedProjects(localProjects);
      try {
        const [vocalRes, beatRes, projectRes] = await Promise.all([
          axios.get(`import.meta.env.VITE_API_URL/api/tracks/user/${userId}`),
          axios.get(`import.meta.env.VITE_API_URL/api/tracks/type/beat`),
          axios.get(`import.meta.env.VITE_API_URL/api/projects/my-vault`, { headers: { Authorization: `Bearer ${user.token}` }}) 
        ]);
        setVaultTracks(vocalRes.data.filter((t: any) => t.trackType === 'vocal'));
        setLibraryBeats(beatRes.data);
        if(projectRes.data.length > 0) setSavedProjects(projectRes.data);
      } catch (err) {}
    };
    if(userId) fetchLibraryAndProjects();
  }, [userId, user.token]);

  useEffect(() => {
    const isAnySolo = tracks.some(t => t.isSolo);
    tracks.forEach(track => {
      const audioEl = audioRefs.current[track.id];
      if (audioEl) audioEl.volume = (track.isMuted || (isAnySolo && !track.isSolo)) ? 0 : track.volume;
    });
  }, [tracks]);

  // --- THE DSP FX ENGINE ---
  useEffect(() => {
    if (isPlaying && !audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;

    tracks.forEach(track => {
        const audioEl = audioRefs.current[track.id];
        if (!audioEl || !track.audioUrl) return;

        if (!sourceNodesRef.current[track.id]) {
            try { sourceNodesRef.current[track.id] = ctx.createMediaElementSource(audioEl); } 
            catch (e) { /* Ignore if already connected */ }
        }

        const source = sourceNodesRef.current[track.id];
        if (!source) return;

        source.disconnect();
        let outputNode: AudioNode = source;

        if (track.preset === 'bass') {
            const bassEQ = ctx.createBiquadFilter();
            bassEQ.type = 'lowshelf';
            bassEQ.frequency.value = 150;
            bassEQ.gain.value = 15;
            source.connect(bassEQ);
            outputNode = bassEQ;
        } else if (track.preset === 'radio') {
            const hpFilter = ctx.createBiquadFilter();
            hpFilter.type = 'highpass';
            hpFilter.frequency.value = 1000;
            const lpFilter = ctx.createBiquadFilter();
            lpFilter.type = 'lowpass';
            lpFilter.frequency.value = 3000;
            source.connect(hpFilter);
            hpFilter.connect(lpFilter);
            outputNode = lpFilter;
        } else if (track.preset === 'reverb') {
            const delay = ctx.createDelay();
            delay.delayTime.value = 0.2;
            const feedback = ctx.createGain();
            feedback.gain.value = 0.4;
            const reverbMix = ctx.createGain();
            
            source.connect(delay);
            delay.connect(feedback);
            feedback.connect(delay);
            
            source.connect(reverbMix);
            delay.connect(reverbMix);
            outputNode = reverbMix;
        }

        outputNode.connect(ctx.destination);
    });
  }, [tracks, isPlaying]);

  // THE PLAYBACK SYNC 
  useEffect(() => {
    const updateEngine = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp - (pausedTimeRef.current * 1000);
      const elapsedSeconds = (timestamp - startTimeRef.current) / 1000;

      if (elapsedSeconds >= duration) { stopEngine(); return; }

      if (playheadRef.current) playheadRef.current.style.transform = `translateX(${elapsedSeconds * pixelsPerSecond}px)`;
      if (isRecording && liveRecordBlockRef.current) liveRecordBlockRef.current.style.width = `${(elapsedSeconds - pausedTimeRef.current) * pixelsPerSecond}px`;
      
      if (timeDisplayRef.current) {
        const mins = Math.floor(elapsedSeconds / 60).toString().padStart(2, '0');
        const secs = Math.floor(elapsedSeconds % 60).toString().padStart(2, '0');
        const ms = Math.floor((elapsedSeconds % 1) * 100).toString().padStart(2, '0');
        timeDisplayRef.current.innerText = `${mins}:${secs}.${ms}`;
      }

      if (isPlaying || isRecording) {
          tracks.forEach(t => {
              const audio = audioRefs.current[t.id];
              if (audio && t.audioUrl) {
                  if (elapsedSeconds >= t.startTime && elapsedSeconds < (t.startTime + t.duration)) {
                      if (audio.paused) {
                          audio.currentTime = (t.trimStart || 0) + (elapsedSeconds - t.startTime);
                          audio.play().catch(()=>{});
                      }
                  } else {
                      if (!audio.paused) audio.pause();
                  }
              }
          });
      }
      animationRef.current = requestAnimationFrame(updateEngine);
    };

    if (isPlaying || isRecording) {
      startTimeRef.current = performance.now() - (pausedTimeRef.current * 1000);
      animationRef.current = requestAnimationFrame(updateEngine);
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [isPlaying, isRecording, tracks]);

  // --- 🔥 THE BULLETPROOF EXPORT ENGINE 🔥 ---
  const handleExport = async () => {
    const activeAudios = tracks.filter(t => t.audioUrl && !t.isMuted);
    if (activeAudios.length === 0) {
      alert("System Alert: No audio to export!");
      return;
    }

    alert("Mixing down your session & packaging video... Please wait.");
    
    // 1. RENDER AUDIO
    const offlineCtx = new OfflineAudioContext(2, 44100 * duration, 44100);

    for (const track of tracks) {
      if (!track.audioUrl || track.isMuted) continue;
      try {
        const response = await fetch(track.audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await offlineCtx.decodeAudioData(arrayBuffer);

        const source = offlineCtx.createBufferSource();
        source.buffer = audioBuffer;

        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = track.volume;

        let lastNode: AudioNode = gainNode;
        if (track.preset === 'bass') {
            const b = offlineCtx.createBiquadFilter(); b.type = 'lowshelf'; b.frequency.value = 150; b.gain.value = 15;
            gainNode.connect(b); lastNode = b;
        } else if (track.preset === 'radio') {
            const hp = offlineCtx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1000;
            const lp = offlineCtx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3000;
            gainNode.connect(hp); hp.connect(lp); lastNode = lp;
        }
        
        source.connect(gainNode);
        lastNode.connect(offlineCtx.destination);
        source.start(track.startTime, track.trimStart || 0, track.duration);
      } catch (e) { console.error("Export error on track:", track.title); }
    }

    const renderedBuffer = await offlineCtx.startRendering();
    const wavBlob = bufferToWave(renderedBuffer, renderedBuffer.length);
    const downloadAudioUrl = window.URL.createObjectURL(wavBlob);
    
    // 🔥 FIX: APPEND LINK TO DOM TO FORCE BROWSER DOWNLOAD 🔥
    const audioLink = document.createElement('a');
    audioLink.style.display = 'none';
    audioLink.href = downloadAudioUrl;
    audioLink.download = `${currentProjectName.replace(/\s+/g, '_')}_Final_Master.wav`;
    document.body.appendChild(audioLink);
    audioLink.click();
    document.body.removeChild(audioLink);

    // 2. EXPORT SESSION VIDEO (With Delay and DOM Append)
    if (sessionVideoUrl) {
      setTimeout(() => {
        const videoLink = document.createElement('a');
        videoLink.style.display = 'none';
        videoLink.href = sessionVideoUrl;
        videoLink.download = `${currentProjectName.replace(/\s+/g, '_')}_Booth_Footage.webm`;
        document.body.appendChild(videoLink);
        videoLink.click();
        document.body.removeChild(videoLink);
      }, 1500); // 1.5 seconds delay so the browser doesn't block it as a popup
    }
  };

  function bufferToWave(abuffer: AudioBuffer, len: number) {
    let numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample, offset = 0, pos = 0;

    const setUint16 = (data: any) => { view.setUint16(pos, data, true); pos += 2; };
    const setUint32 = (data: any) => { view.setUint32(pos, data, true); pos += 4; };

    setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
    setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
    setUint32(abuffer.sampleRate); setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);

    for(i = 0; i < numOfChan; i++) channels.push(abuffer.getChannelData(i));
    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {
            sample = Math.max(-1, Math.min(1, channels[i][offset]));
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
            view.setInt16(pos, sample, true); pos += 2;
        }
        offset++;
    }
    return new Blob([buffer], {type: "audio/wav"});
  }

  // --- ACTIONS ---
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      tracks.forEach(t => audioRefs.current[t.id]?.pause());
      if (playheadRef.current) {
        const match = playheadRef.current.style.transform.match(/translateX\(([^px]+)/);
        if (match) pausedTimeRef.current = parseFloat(match[1]) / pixelsPerSecond;
      }
    } else {
      setIsPlaying(true);
    }
  };

  const stopEngine = () => {
    setIsPlaying(false);
    if (isRecording) stopRecordingProcess();
    pausedTimeRef.current = 0;
    startTimeRef.current = 0;
    if (playheadRef.current) playheadRef.current.style.transform = `translateX(0px)`;
    if (timeDisplayRef.current) timeDisplayRef.current.innerText = `00:00.00`;
    tracks.forEach(t => {
      const audio = audioRefs.current[t.id];
      if (audio) { audio.pause(); audio.currentTime = 0; }
    });
  };

  const handleScrub = (time: number) => {
    if (isRecording) return;
    pausedTimeRef.current = time;
    startTimeRef.current = performance.now() - (time * 1000);
    if (playheadRef.current) playheadRef.current.style.transform = `translateX(${time * pixelsPerSecond}px)`;
    
    tracks.forEach(t => {
      const audio = audioRefs.current[t.id];
      if (audio && t.audioUrl) {
          if (time >= t.startTime && time <= t.startTime + t.duration) {
              audio.currentTime = (t.trimStart || 0) + (time - t.startTime);
          } else {
              audio.pause();
          }
      }
    });
  };

  // 🔥 TOGGLE RECORD (ROBUST MIME TYPE HANDLING) 🔥
  const toggleRecord = async () => {
    if (isRecording) { stopEngine(); } 
    else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 1280, height: 720 }, 
            audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false, sampleRate: 44100 } 
        });
        
        setIsWebcamActive(true);
        audioChunksRef.current = [];

        // Check browser compatibility for video format
        let options = { mimeType: 'video/webm' };
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp9,opus')) {
            options = { mimeType: 'video/webm; codecs=vp9,opus' };
        } else if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8,opus')) {
            options = { mimeType: 'video/webm; codecs=vp8,opus' };
        }

        mediaRecorderRef.current = new MediaRecorder(stream, options);
        
        mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mediaRecorderRef.current.onstop = handleUploadTrack;

        pausedTimeRef.current = 0; 
        setIsRecording(true);
        setIsPlaying(true);
        mediaRecorderRef.current.start();
        
      } catch (err) { 
        alert("Camera and Mic permissions are required for Director Booth!"); 
      }
    }
  };

  const stopRecordingProcess = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsWebcamActive(false);
    }
  };

  // 🔥 UPLOAD TO CLOUDINARY 🔥
  const handleUploadTrack = async () => {
    setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, isProcessing: true } : t));
    
    // Create Blob from chunks
    const mime = mediaRecorderRef.current?.mimeType || 'video/webm';
    const mediaBlob = new Blob(audioChunksRef.current, { type: mime });
    
    // Set for local download immediately
    const videoUrl = URL.createObjectURL(mediaBlob);
    setSessionVideoUrl(videoUrl);

    // Upload to Backend/Cloudinary
    const formData = new FormData();
    formData.append('audio', mediaBlob, 'studio_take.webm'); 
    formData.append('title', `Take_${Math.floor(Math.random()*1000)}`);
    formData.append('creator', userId || 'guest');
    formData.append('trackType', 'vocal');
    
    try {
      const res = await axios.post('import.meta.env.VITE_API_URL/api/tracks/upload', formData);
      
      if (res.data.videoUrl) {
        setCloudVideoUrl(res.data.videoUrl); // Set global cloud URL
      }

      setTracks(prev => prev.map(t => t.id === activeTrackId ? { 
        ...t, 
        isProcessing: false, 
        audioUrl: res.data.audioUrl, 
        videoUrl: res.data.videoUrl, // Keep link directly on the track
        title: res.data.title, 
        startTime: 0, 
        trimStart: 0, 
        duration: 15 
      } : t));
    } catch (e) { 
      setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, isProcessing: false } : t)); 
      alert("Failed to sync video to cloud. You can still export locally.");
    }
    audioChunksRef.current = [];
  };

  // 🔥 BULLETPROOF SAVE TO VAULT 🔥
  const handleModalAction = async () => {
    if (modalConfig.type === 'save') {
      if (!tempProjectName.trim()) return;
      setCurrentProjectName(tempProjectName);
      
      // Grab Video URL securely (from state OR directly from the uploaded tracks)
      const finalVideoUrl = cloudVideoUrl || tracks.find(t => t.videoUrl)?.videoUrl || null;

      const projectData = { 
        id: `proj_${Date.now()}`, 
        name: tempProjectName, 
        creator: userId, 
        tracks: tracks,
        videoUrl: finalVideoUrl // THIS SAVES TO MONGODB!
      };
      
      const updatedProjects = [projectData, ...savedProjects];
      setSavedProjects(updatedProjects);
      localStorage.setItem('beatflow_projects', JSON.stringify(updatedProjects));
      try { 
          await axios.post('import.meta.env.VITE_API_URL/api/projects/save', projectData, {
              headers: { Authorization: `Bearer ${user.token}` }
          }); 
      } catch (e) {}
    } else if (modalConfig.type === 'new') {
      stopEngine();
      setCurrentProjectName("Untitled Project");
      setSessionVideoUrl(null); 
      setCloudVideoUrl(null);
      setTracks([
        { id: `track_${Date.now()}_1`, title: 'Main Vocals', type: 'vocal', audioUrl: null, startTime: 0, trimStart: 0, duration: 15, isProcessing: false, volume: 0.8, isMuted: false, isSolo: false, preset: 'clean' },
        { id: `track_${Date.now()}_2`, title: 'Beat Audio', type: 'beat', audioUrl: null, startTime: 0, trimStart: 0, duration: 15, isProcessing: false, volume: 0.7, isMuted: false, isSolo: false, preset: 'clean' }
      ]);
      setActiveTrackId(`track_${Date.now()}_1`);
    }
    setModalConfig({ isOpen: false, type: 'save' });
  };

  const loadProject = (project: any) => {
    stopEngine();
    setCurrentProjectName(project.name);
    setTracks(project.tracks); 
    
    setSessionVideoUrl(project.videoUrl || null); 
    setCloudVideoUrl(project.videoUrl || null); 
    
    setProducerNotes(project.producerNotes || "");
    if(project.tracks.length > 0) setActiveTrackId(project.tracks[0].id);
  };

  const handleBlockUpdate = (id: string, newStartTime: number, newDuration: number, newTrimStart: number) => {
      setTracks(tracks.map(t => t.id === id ? { ...t, startTime: newStartTime, duration: newDuration, trimStart: newTrimStart } : t));
  };

  const updateTrack = (id: string, key: string, value: any) => setTracks(tracks.map(t => t.id === id ? { ...t, [key]: value } : t));
  const addTrack = () => setTracks([...tracks, { id: `track_${Date.now()}`, title: `New Track`, type: 'vocal', audioUrl: null, startTime: 0, trimStart: 0, duration: 0, isProcessing: false, volume: 0.8, isMuted: false, isSolo: false, preset: 'clean' }]);
  const deleteTrack = (trackIdToDelete: string) => setTracks(tracks.filter(t => t.id !== trackIdToDelete));
  const loadTrackFromLibrary = (url: string, title: string, type: string) => setTracks(tracks.map(t => t.id === activeTrackId ? { ...t, audioUrl: url, title: title, type: type, startTime: 0, trimStart: 0, duration: 20 } : t));
  const applyPreset = (presetId: string) => setTracks(tracks.map(t => t.id === activeTrackId ? { ...t, preset: presetId } : t));

  // 🔥 GSAP ENTRANCE ANIMATION 🔥
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, scale: 0.98, filter: "blur(5px)" },
        { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.2, ease: "power4.out" }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Determine if we have footage ready to save/view
  const hasFootage = sessionVideoUrl || cloudVideoUrl || tracks.some(t => t.videoUrl);

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#080808] text-[#F4F3EF] flex flex-col font-sans overflow-hidden relative select-none">
      
      {/* Subtle Studio Lighting */}
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(230,57,70,0.06)_0%,transparent_70%)] pointer-events-none z-0"></div>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-screen pointer-events-none z-0"></div>

      {/* RECORDING INDICATOR */}
      {isRecording && (
        <div className="absolute top-24 right-6 z-[999] flex items-center gap-3 bg-red-500/10 border border-red-500/30 px-4 py-2 rounded-full backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_red]"></span>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Camera Active</span>
        </div>
      )}

      {/* SESSION FOOTAGE SAVED INDICATOR */}
      {hasFootage && !isRecording && (
        <div className="absolute top-24 right-6 z-[999] flex items-center gap-3 bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-full backdrop-blur-md animate-in slide-in-from-right duration-500">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2"><path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">Booth Footage Ready</span>
        </div>
      )}

      <DraggableWebcam />
      <LyricPad />

      {/* PRODUCER FEEDBACK PANEL */}
      {producerNotes && (
        <div className="absolute top-36 right-6 z-[100] w-80 animate-in slide-in-from-right duration-700">
            <div className="bg-[#121212]/80 backdrop-blur-3xl border border-[#D4AF37]/20 p-6 rounded-[1rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Producer Note</span>
                </div>
                <p className="text-[13px] text-[#F4F3EF] font-serif italic leading-relaxed relative z-10 border-l-[2px] border-[#D4AF37]/50 pl-4">"{producerNotes}"</p>
                <button onClick={() => setProducerNotes("")} className="mt-5 text-[9px] font-mono uppercase tracking-[0.2em] text-[#888888] hover:text-[#F4F3EF] transition-colors relative z-10">Dismiss</button>
            </div>
        </div>
      )}

      {/* 🎬 CINEMATIC SAVE/NEW MODAL (Studio Terms) */}
      {modalConfig.isOpen && (
        <div className="absolute inset-0 z-[9999] bg-[#080808]/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#121212] border border-white/5 p-10 rounded-[1.5rem] shadow-[0_40px_80px_rgba(0,0,0,1)] w-[450px] flex flex-col gap-6 relative overflow-hidden">
             
             <div className={`absolute top-[-20%] left-1/2 -translate-x-1/2 w-40 h-40 blur-[80px] rounded-full pointer-events-none ${modalConfig.type === 'save' ? 'bg-[#D4AF37]/10' : 'bg-[#E63946]/15'}`}></div>
             
             <h2 className="text-3xl font-serif italic text-[#F4F3EF] relative z-10 tracking-tight">
               {modalConfig.type === 'save' ? 'Save Session.' : 'Clear Booth?'}
             </h2>
             
             {modalConfig.type === 'save' ? (
               <div className="relative z-10">
                 <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-[#888888] mb-3">Project Title</p>
                 <input 
                   type="text" 
                   value={tempProjectName} 
                   onChange={(e) => setTempProjectName(e.target.value)} 
                   autoFocus 
                   className="w-full bg-[#080808] border border-white/5 p-4 rounded-xl text-[#F4F3EF] outline-none focus:border-[#E63946]/50 transition-all font-mono text-sm placeholder:text-[#888888]/40 shadow-inner" 
                   placeholder="Name your track..." 
                 />
                 
                 {/* 🔥 SHOW USER IF VIDEO WILL BE SAVED TO VAULT 🔥 */}
                 {hasFootage && (
                   <p className="text-[9px] text-[#10B981] uppercase tracking-widest mt-4 font-black flex items-center gap-2">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                     Video Footage Attached to Vault
                   </p>
                 )}
               </div>
             ) : (
               <p className="text-sm text-[#888888] font-light leading-relaxed relative z-10">
                 Starting a new session will wipe all unsaved vocal takes, booth footage, and beat layers. Proceed?
               </p>
             )}
             
             <div className="flex justify-end gap-4 mt-6 relative z-10">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, type: 'save' })} 
                  className="px-6 py-3 text-[#888888] hover:text-[#F4F3EF] text-[10px] uppercase tracking-[0.3em] font-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleModalAction} 
                  className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 ${modalConfig.type === 'save' ? 'bg-white text-[#080808] hover:bg-[#D4AF37] hover:text-white shadow-[0_10px_20px_rgba(255,255,255,0.1)]' : 'bg-[#E63946] text-white shadow-[0_10px_20px_rgba(230,57,70,0.3)] hover:bg-[#DC143C]'}`}
                >
                  {modalConfig.type === 'save' ? 'Commit to Vault' : 'Purge Studio'}
                </button>
             </div>
          </div>
        </div>
      )}

      {tracks.map(track => track.audioUrl && (
        <audio key={track.id} ref={el => { if(el) audioRefs.current[track.id] = el }} src={track.audioUrl} crossOrigin="anonymous" onLoadedMetadata={(e:any) => { if(track.duration === 0 || track.duration === 20) updateTrack(track.id, 'duration', e.target.duration); }} />
      ))}

      {/* THE CORE DAW COMPONENTS */}
      <div className="relative z-10 flex flex-col h-full w-full mt-2">
          <TopTransportBar 
            isPlaying={isPlaying} isRecording={isRecording} togglePlay={togglePlay} stopEngine={stopEngine} toggleRecord={toggleRecord} 
            onSaveProject={() => { setTempProjectName(currentProjectName); setModalConfig({ isOpen: true, type: 'save' }); }} 
            onNewProject={() => setModalConfig({ isOpen: true, type: 'new' })} 
            onExport={handleExport}
            timeDisplayRef={timeDisplayRef} projectName={currentProjectName} 
          />

          <TimelineGrid 
            duration={duration} pixelsPerSecond={pixelsPerSecond} playheadRef={playheadRef} liveRecordBlockRef={liveRecordBlockRef}
            onScrub={handleScrub} tracks={tracks} activeTrackId={activeTrackId} setActiveTrackId={setActiveTrackId} isRecording={isRecording} pausedTimeRef={pausedTimeRef}
            onUpdateBlock={handleBlockUpdate} updateTrack={updateTrack} onAddTrack={addTrack} onDeleteTrack={deleteTrack}
          />

          <DAWBottomPanel 
            tracks={tracks} activeTrackId={activeTrackId} beats={libraryBeats} vault={vaultTracks} projects={savedProjects} 
            onLoadTrack={loadTrackFromLibrary} onLoadProject={loadProject} onApplyPreset={applyPreset} 
          />
      </div>
    </div>
  );
}