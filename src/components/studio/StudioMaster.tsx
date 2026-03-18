import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import TopTransportBar from './TopTransportBar';
import TimelineGrid from './TimelineGrid';
import DAWBottomPanel from './DAWBottomPanel';
import DraggableWebcam from './DraggableWebcam'; 
import LyricPad from './LyricPad';             

export default function StudioMaster() {
  const playheadRef = useRef<HTMLDivElement>(null);
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const liveRecordBlockRef = useRef<HTMLDivElement>(null); 
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // --- AUDIO FX REFS ---
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<{ [key: string]: MediaElementAudioSourceNode }>({});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean, type: 'save' | 'new' }>({ isOpen: false, type: 'save' });
  const [tempProjectName, setTempProjectName] = useState("Untitled Project");
  const [currentProjectName, setCurrentProjectName] = useState("Untitled Project");
  
  // 🔥 NEW: FEEDBACK STATE
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
          axios.get(`http://localhost:5000/api/tracks/user/${userId}`),
          axios.get(`http://localhost:5000/api/tracks/type/beat`),
          axios.get(`http://localhost:5000/api/projects/my-vault`, { headers: { Authorization: `Bearer ${user.token}` }}) 
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

        // Apply FX Presets
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

  // --- 🔥 EXPORT MIXDOWN LOGIC 🔥 ---
  const handleExport = async () => {
    const activeAudios = tracks.filter(t => t.audioUrl && !t.isMuted);
    if (activeAudios.length === 0) {
      alert("No audio to export!");
      return;
    }

    alert("Mixing down your session... Please wait.");
    
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
    const downloadUrl = window.URL.createObjectURL(wavBlob);
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${currentProjectName.replace(/\s+/g, '_')}_Final_Master.wav`;
    link.click();
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

  const toggleRecord = async () => {
    if (isRecording) { stopEngine(); } 
    else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: 44100
            } 
        });
        mediaRecorderRef.current = new MediaRecorder(stream);
        mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
        mediaRecorderRef.current.onstop = handleUploadTrack;

        pausedTimeRef.current = 0; 
        setIsRecording(true);
        setIsPlaying(true);
        mediaRecorderRef.current.start();
      } catch (err) { alert("Mic required!"); }
    }
  };

  const stopRecordingProcess = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop();
  };

  const handleUploadTrack = async () => {
    setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, isProcessing: true } : t));
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'studio_take.wav');
    formData.append('title', `Take_${Math.floor(Math.random()*1000)}`);
    formData.append('creator', userId || 'guest');
    formData.append('trackType', 'vocal');
    
    try {
      const res = await axios.post('http://localhost:5000/api/tracks/upload', formData);
      setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, isProcessing: false, audioUrl: res.data.audioUrl, title: res.data.title, startTime: 0, trimStart: 0, duration: 15 } : t));
    } catch (e) { 
      setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, isProcessing: false } : t)); 
    }
    audioChunksRef.current = [];
  };

  const handleModalAction = async () => {
    if (modalConfig.type === 'save') {
      if (!tempProjectName.trim()) return;
      setCurrentProjectName(tempProjectName);
      const projectData = { id: `proj_${Date.now()}`, name: tempProjectName, creator: userId, tracks: tracks };
      const updatedProjects = [projectData, ...savedProjects];
      setSavedProjects(updatedProjects);
      localStorage.setItem('beatflow_projects', JSON.stringify(updatedProjects));
      try { 
          await axios.post('http://localhost:5000/api/projects/save', projectData, {
              headers: { Authorization: `Bearer ${user.token}` }
          }); 
      } catch (e) {}
    } else if (modalConfig.type === 'new') {
      stopEngine();
      setCurrentProjectName("Untitled Project");
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

  return (
    // 🔥 HIGH-END DARK STUDIO WRAPPER 🔥
    <div className="h-screen w-full bg-[#030305] text-[#F0F0EB] flex flex-col font-sans overflow-hidden relative select-none">
      
      {/* Subtle Studio Noise Overlay */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.02] mix-blend-screen pointer-events-none z-0"></div>

      <DraggableWebcam />
      <LyricPad />

      {/* 👑 PREMIUM PRODUCER FEEDBACK PANEL (Studio Terms) */}
      {producerNotes && (
        <div className="absolute top-24 right-10 z-[100] w-80 animate-in slide-in-from-right duration-700">
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/30 backdrop-blur-3xl p-6 rounded-[1.5rem] shadow-[0_20px_50px_rgba(212,175,55,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-[40px] rounded-full pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-4 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Producer Notes</span>
                </div>
                <p className="text-[13px] text-[#F0F0EB] font-serif italic leading-relaxed relative z-10 border-l-2 border-[#D4AF37]/50 pl-4">"{producerNotes}"</p>
                <button onClick={() => setProducerNotes("")} className="mt-5 text-[9px] font-mono uppercase tracking-[0.2em] text-[#888888] hover:text-[#F0F0EB] transition-colors relative z-10 border-b border-transparent hover:border-[#888888] pb-0.5">Dismiss Notes</button>
            </div>
        </div>
      )}

      {/* 🎬 CINEMATIC SAVE/NEW MODAL (Studio Terms) */}
      {modalConfig.isOpen && (
        <div className="absolute inset-0 z-[9999] bg-[#030305]/80 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-[#0A0A0C]/95 border border-white/10 p-10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] w-[450px] flex flex-col gap-6 relative overflow-hidden">
             
             {/* Glow */}
             <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 blur-[60px] rounded-full pointer-events-none ${modalConfig.type === 'save' ? 'bg-[#D4AF37]/10' : 'bg-[#E63946]/10'}`}></div>
             
             <h2 className="text-3xl font-serif italic text-[#F0F0EB] relative z-10">
               {modalConfig.type === 'save' ? 'Save Studio Project' : 'New Studio Session?'}
             </h2>
             
             {modalConfig.type === 'save' ? (
               <div className="relative z-10">
                 <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#888888] mb-3">Project Name</p>
                 <input 
                   type="text" 
                   value={tempProjectName} 
                   onChange={(e) => setTempProjectName(e.target.value)} 
                   autoFocus 
                   className="w-full bg-[#010101] border border-white/10 p-4 rounded-xl text-[#F0F0EB] outline-none focus:border-[#D4AF37] transition-all font-mono text-sm placeholder:text-[#888888]/50" 
                   placeholder="Name your track..." 
                 />
               </div>
             ) : (
               <p className="text-sm text-[#888888] font-light leading-relaxed relative z-10">
                 Starting a new studio session will clear all unsaved vocal takes and beat layers. Are you sure?
               </p>
             )}
             
             <div className="flex justify-end gap-4 mt-6 relative z-10">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, type: 'save' })} 
                  className="px-6 py-3 text-[#888888] hover:text-[#F0F0EB] text-[10px] uppercase tracking-[0.3em] font-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleModalAction} 
                  className={`px-8 py-3 text-[#010101] rounded-full text-[10px] uppercase tracking-[0.3em] font-black shadow-lg hover:scale-105 active:scale-95 transition-all ${modalConfig.type === 'save' ? 'bg-[#F0F0EB] hover:bg-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.2)]' : 'bg-[#E63946] text-white shadow-[0_0_20px_rgba(230,57,70,0.3)]'}`}
                >
                  {modalConfig.type === 'save' ? 'Save Project' : 'Clear Studio'}
                </button>
             </div>
          </div>
        </div>
      )}

      {tracks.map(track => track.audioUrl && (
        <audio key={track.id} ref={el => { if(el) audioRefs.current[track.id] = el }} src={track.audioUrl} crossOrigin="anonymous" onLoadedMetadata={(e:any) => { if(track.duration === 0 || track.duration === 20) updateTrack(track.id, 'duration', e.target.duration); }} />
      ))}

      {/* 🔥 CHILD COMPONENTS 🔥 */}
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
  );
}