import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DraggableWebcam from './studio/DraggableWebcam';
import DAWTimeline from './DAW/DAWTimeline';
import DAWBottomPanel from './studio/DAWBottomPanel';

export default function StudioCanvas() {
  const navigate = useNavigate();
  
  // -- AUDIO REFS (Safe Playback Engine) --
  const audioElements = useRef<{ [key: string]: HTMLAudioElement }>({});
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // -- DAWS STATE --
  const [tracks, setTracks] = useState<any[]>([
    { id: 'track_1', title: 'Beat Audio', type: 'beat', audioUrl: null, volume: 0.8, isMuted: false, isSolo: false, preset: 'clean' },
    { id: 'track_2', title: 'Vocals', type: 'vocal', audioUrl: null, volume: 0.9, isMuted: false, isSolo: false, preset: 'clean' }
  ]);
  const [activeTrackId, setActiveTrackId] = useState<string>('track_2');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const duration = 120; // 2 minutes timeline

  // Library
  const [vaultTracks, setVaultTracks] = useState<any[]>([]);
  const [libraryBeats, setLibraryBeats] = useState<any[]>([]);
  const userId = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}').id;

  const fetchLibrary = async () => {
    try {
      const [vocalRes, beatRes] = await Promise.all([
        axios.get(`import.meta.env.VITE_API_URL/api/tracks/user/${userId}`),
        axios.get(`import.meta.env.VITE_API_URL/api/tracks/type/beat`)
      ]);
      setVaultTracks(vocalRes.data.filter((t: any) => t.trackType === 'vocal'));
      setLibraryBeats(beatRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchLibrary(); }, []);

  // -- PLAYBACK ENGINE (Syncing Audio to State) --
  useEffect(() => {
    let interval: any;
    if (isPlaying || isRecording) {
      interval = setInterval(() => setCurrentTime((p) => p >= duration ? (stopAll(), p) : p + 0.1), 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isRecording]);

  useEffect(() => {
    const isAnySolo = tracks.some(t => t.isSolo);
    tracks.forEach(track => {
      const audio = audioElements.current[track.id];
      if (audio) audio.volume = (track.isMuted || (isAnySolo && !track.isSolo)) ? 0 : track.volume;
    });
  }, [tracks]);

  // -- TRANSPORT CONTROLS --
  const togglePlay = () => {
    if (isPlaying) {
      stopAll();
    } else {
      setIsPlaying(true);
      tracks.forEach(t => {
        const audio = audioElements.current[t.id];
        if (audio && t.audioUrl) {
          audio.currentTime = currentTime;
          audio.play().catch(e => console.log("Playback prevented:", e));
        }
      });
    }
  };

  const stopAll = () => {
    setIsPlaying(false);
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
    Object.values(audioElements.current).forEach(audio => audio && audio.pause());
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
    tracks.forEach(t => {
        const audio = audioElements.current[t.id];
        if (audio && t.audioUrl) audio.currentTime = time;
    });
  };

  // -- RECORDING LOGIC (BandLab Style) --
  const handleRecord = async () => {
    if (isRecording) return stopAll();
    if (!activeTrackId) return alert("Select a track lane to record into!");

    setCurrentTime(0);
    togglePlay(); // Play backing tracks
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'take.wav');
      formData.append('title', `Vocal_Take_${Math.floor(Math.random()*100)}`);
      formData.append('creator', userId);
      formData.append('trackType', 'vocal');
      
      try {
        const res = await axios.post('import.meta.env.VITE_API_URL/api/tracks/upload', formData);
        await fetchLibrary();
        // Load recorded audio into the selected track
        setTracks(prev => prev.map(t => t.id === activeTrackId ? { ...t, audioUrl: res.data.audioUrl, title: res.data.title } : t));
      } catch (e) { console.error(e); }
      audioChunksRef.current = [];
    };
    mediaRecorderRef.current.start();
  };

  // -- HELPERS --
  const addTrack = () => setTracks([...tracks, { id: `track_${Date.now()}`, title: `Track ${tracks.length + 1}`, type: 'vocal', audioUrl: null, volume: 0.8, isMuted: false, isSolo: false, preset: 'clean' }]);
  const loadToActiveTrack = (url: string, title: string, type: string) => setTracks(tracks.map(t => t.id === activeTrackId ? { ...t, audioUrl: url, title: title, type: type } : t));
  const applyPreset = (preset: string) => setTracks(tracks.map(t => t.id === activeTrackId ? { ...t, preset } : t));
  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${Math.floor(s%60).toString().padStart(2,'0')}.${Math.floor((s%1)*10)}`;

  return (
    <div className="h-screen w-full bg-[#181818] text-[#EBEBE6] flex flex-col font-sans">
      <DraggableWebcam />

      {/* Hidden Audio Elements for playback Engine */}
      {tracks.map(track => track.audioUrl && (
        <audio key={track.id} ref={el => { if(el) audioElements.current[track.id] = el }} src={track.audioUrl} crossOrigin="anonymous" />
      ))}

      {/* TOP BAR */}
      <div className="h-16 bg-[#111] border-b border-[#282828] flex items-center justify-between px-6 z-20">
         <div className="flex items-center gap-4">
             <button className="text-[10px] font-bold uppercase tracking-widest text-white border border-[#333] px-4 py-2 rounded-md hover:bg-[#222]">New Project</button>
             <button className="text-[10px] font-bold uppercase tracking-widest bg-white text-black px-6 py-2 rounded-md">Save</button>
         </div>
         
         <div className="flex items-center gap-6 bg-[#1a1a1a] px-8 py-2 rounded-lg border border-[#333]">
            <button onClick={() => handleSeek(0)} className="w-8 h-8 flex items-center justify-center hover:bg-[#333] rounded">⏮</button>
            <button onClick={togglePlay} className="w-8 h-8 flex items-center justify-center hover:bg-[#333] rounded text-green-500">{isPlaying && !isRecording ? '⏸' : '▶'}</button>
            <button onClick={handleRecord} className={`w-8 h-8 rounded-full border-2 transition-all ${isRecording ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-red-500 border-transparent hover:bg-red-400'}`}></button>
            <div className="w-px h-6 bg-[#444] mx-2"></div>
            <div className="font-mono text-xl text-white w-24 text-center">{formatTime(currentTime)}</div>
         </div>

         <button onClick={() => navigate('/roles')} className="text-[10px] text-neutral-400 hover:text-white uppercase">Exit</button>
      </div>

      <DAWTimeline 
        tracks={tracks} activeTrackId={activeTrackId} setActiveTrackId={setActiveTrackId} 
        onTrackUpdate={setTracks} onAddTrack={addTrack} currentTime={currentTime} duration={duration} onSeek={handleSeek}
      />

      <DAWBottomPanel 
        tracks={tracks} activeTrackId={activeTrackId} beats={libraryBeats} vault={vaultTracks}
        onLoadTrack={loadToActiveTrack} onApplyPreset={applyPreset}
      />
    </div>
  );
}