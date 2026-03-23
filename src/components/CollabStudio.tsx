import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import io, { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import axios from 'axios';
import { RecordBars, DropBeat, WriteBars } from './collab/CollabTools'; 

interface CollabStudioProps { roomId: string; role: string; onLeave: () => void; }

const VideoPeer = ({ peer, userDetails, mediaState, theme }: any) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => { peer.on("stream", (s: MediaStream) => { setStream(s); }); }, [peer]);
  const isCamOff = mediaState?.cam === false;

  useEffect(() => { if (!isCamOff && ref.current && stream) { ref.current.srcObject = stream; } }, [isCamOff, stream]);

  return (
    <div className="w-48 h-full bg-black rounded-2xl overflow-hidden relative shadow-lg shrink-0 border-[3px] transition-colors duration-300" style={{ borderColor: mediaState?.mic ? theme.accent : 'transparent' }}>
      {isCamOff ? (
        <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative">
          <img src={userDetails?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userDetails?.username || 'Peer'}`} className="w-12 h-12 rounded-full grayscale opacity-80 mb-2 border-2 border-white/10 shadow-sm" alt="DP"/>
          <span className="text-[9px] font-mono text-white/50 uppercase tracking-widest">Camera Off</span>
        </div>
      ) : (
        <video playsInline autoPlay ref={ref} className="w-full h-full object-cover"></video>
      )}
      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2 z-10 shadow-md">
         {mediaState?.mic && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></span>}
         <span className="text-[8px] font-black text-white uppercase tracking-widest truncate max-w-[100px]">{userDetails?.username || 'Artist'}</span>
      </div>
    </div>
  );
};

export default function CollabStudio({ roomId, role, onLeave }: CollabStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [user] = useState(() => JSON.parse(sessionStorage.getItem('beatflow_user') || '{"username": "Guest", "role": "listener", "token": ""}'));
  const myRole = user.role?.toLowerCase() || 'listener';

  const [messages, setMessages] = useState<{sender: string, text: string, time: string, isSystem?: boolean}[]>([
    { sender: 'System', text: `Connecting to secure network...`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isSystem: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  
  const [isCamOn, setIsCamOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [peers, setPeers] = useState<any[]>([]);
  const peersRef = useRef<any[]>([]);
  
  const [sharedTracks, setSharedTracks] = useState<any[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<number | null>(null);
  const audioInstanceRef = useRef<HTMLAudioElement | null>(null);

  const theme = (() => {
    switch(myRole) {
      case 'producer': return { bg: '#F4F3EF', card: '#FFFFFF', text: '#001433', accent: '#D4AF37', border: 'rgba(0,20,51,0.05)' }; 
      case 'rapper': return { bg: '#F4F3EF', card: '#FFFFFF', text: '#111111', accent: '#E63946', border: 'rgba(17,17,17,0.05)' }; 
      case 'lyricist': return { bg: '#F9F8F6', card: '#FFFFFF', text: '#0A1A14', accent: '#10B981', border: 'rgba(10,26,20,0.05)' }; 
      default: return { bg: '#F4F5F7', card: '#FFFFFF', text: '#0A1128', accent: '#6B7AE5', border: 'rgba(10,17,40,0.05)' }; 
    }
  })();

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/collab/rooms/${roomId}`, config);
        const roomData = res.data.room || res.data.data || res.data; 
        if (roomData && roomData.chatHistory && roomData.chatHistory.length > 0) {
          setMessages([{ sender: 'System', text: `Restored session history.`, time: '', isSystem: true }, ...roomData.chatHistory]);
          scrollToBottom();
        }
        if (roomData && roomData.canvasTracks && roomData.canvasTracks.length > 0) {
          setSharedTracks(roomData.canvasTracks);
        }
      } catch (err) { console.error("Failed to load session history", err); }
    };
    fetchRoomData();
  }, [roomId, user.token]);

  useEffect(() => {
    let isMounted = true;
    let streamRef: MediaStream | null = null;

    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      if (!isMounted) { stream.getTracks().forEach(t => t.stop()); return; }
      stream.getVideoTracks()[0].enabled = false;
      stream.getAudioTracks()[0].enabled = false;
      streamRef = stream;
      setLocalStream(stream);

      socketRef.current = io(import.meta.env.VITE_API_URL as string);
      socketRef.current.emit("join-room", { roomId, userDetails: user });

      socketRef.current.on("user-connected", (payload) => {
        if (!peersRef.current.find(p => p.peerID === payload.userId)) {
           const peer = createPeer(payload.userId, socketRef.current!.id, stream, user);
           peersRef.current.push({ peerID: payload.userId, peer, userDetails: payload.userDetails, mediaState: { cam: false, mic: false } });
           setPeers([...peersRef.current]);
           setMessages(prev => [...prev, { sender: 'System', text: `${payload.userDetails.username || 'Artist'} joined the studio.`, time: new Date().toLocaleTimeString(), isSystem: true }]);
           scrollToBottom();
        }
      });

      socketRef.current.on("user-joined", payload => {
        if (!peersRef.current.find(p => p.peerID === payload.callerID)) {
           const peer = addPeer(payload.signal, payload.callerID, stream);
           peersRef.current.push({ peerID: payload.callerID, peer, userDetails: payload.userDetails, mediaState: { cam: false, mic: false } });
           setPeers([...peersRef.current]);
        }
      });

      socketRef.current.on("receiving-returned-signal", payload => {
        const item = peersRef.current.find(p => p.peerID === payload.id);
        if(item) item.peer.signal(payload.signal);
      });

      socketRef.current.on("receive-message", (msg) => {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      });

      socketRef.current.on("receive-track", (trackData) => {
        setSharedTracks(prev => [...prev, trackData]);
        setMessages(prev => [...prev, { sender: 'System', text: `${trackData.owner} dropped a new ${trackData.type}.`, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isSystem: true }]);
        scrollToBottom();
      });

      socketRef.current.on("track-deleted", (trackId) => {
        setSharedTracks(prev => prev.filter(t => t.id !== trackId));
      });

      socketRef.current.on("user-disconnected", (id) => {
        const peerObj = peersRef.current.find(p => p.peerID === id);
        if (peerObj) peerObj.peer.destroy();
        const newPeers = peersRef.current.filter(p => p.peerID !== id);
        peersRef.current = newPeers;
        setPeers([...newPeers]);
      });

      socketRef.current.on("peer-media-toggled", (payload) => {
        const peerIndex = peersRef.current.findIndex(p => p.peerID === payload.userId);
        if (peerIndex !== -1) {
          peersRef.current[peerIndex].mediaState = payload.state;
          setPeers([...peersRef.current]); 
        }
      });

    }).catch(err => {
      console.error("Camera error:", err);
      if (isMounted) {
         socketRef.current = io(import.meta.env.VITE_API_URL as string);
         socketRef.current.emit("join-room", { roomId, userDetails: user });
      }
    });

    return () => {
      isMounted = false;
      socketRef.current?.disconnect();
      if (streamRef) streamRef.getTracks().forEach(t => t.stop());
      if (audioInstanceRef.current) {
        audioInstanceRef.current.pause();
        audioInstanceRef.current = null;
      }
    };
  }, [roomId]); 

  useEffect(() => {
    if (isCamOn && localVideoRef.current && localStream) { localVideoRef.current.srcObject = localStream; }
  }, [isCamOn, localStream]);

  // 🔥 THE FIX: ADDING GOOGLE STUN SERVERS FOR LIVE DEPLOYMENT P2P CONNECTION 🔥
  const peerConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:global.stun.twilio.com:3478' }
    ]
  };

  function createPeer(userToSignal: string, callerID: string, stream: MediaStream, userDetails: any) {
    // 🚨 config: peerConfig is CRITICAL for live internet connections
    const peer = new Peer({ initiator: true, trickle: false, stream, config: peerConfig });
    peer.on("signal", signal => { socketRef.current?.emit("sending-signal", { userToSignal, callerID, signal, userDetails }); });
    return peer;
  }
  
  function addPeer(incomingSignal: any, callerID: string, stream: MediaStream) {
    // 🚨 config: peerConfig added here too
    const peer = new Peer({ initiator: false, trickle: false, stream, config: peerConfig });
    peer.on("signal", signal => { socketRef.current?.emit("returning-signal", { signal, callerID }); });
    peer.signal(incomingSignal);
    return peer;
  }

  const scrollToBottom = () => { setTimeout(() => { const chatBox = document.getElementById('studio-chat-box'); if (chatBox) chatBox.scrollTop = chatBox.scrollHeight; }, 50); };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !isCamOn;
      setIsCamOn(!isCamOn);
      socketRef.current?.emit("toggle-media", { roomId, cam: !isCamOn, mic: isMicOn });
    }
  };
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !isMicOn;
      setIsMicOn(!isMicOn);
      socketRef.current?.emit("toggle-media", { roomId, cam: isCamOn, mic: !isMicOn });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const newMsg = { roomId, sender: user.username || 'You', text: chatInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages(prev => [...prev, newMsg]);
    socketRef.current?.emit("send-message", newMsg); 
    setChatInput('');
    scrollToBottom();
  };

  const togglePlayTrack = (trackId: number, audioData: string) => {
    if (!audioData) return alert('Audio file is empty or corrupted.');
    if (playingTrackId === trackId) {
      audioInstanceRef.current?.pause();
      setPlayingTrackId(null);
    } else {
      if (audioInstanceRef.current) audioInstanceRef.current.pause();
      const newAudio = new Audio(audioData);
      newAudio.play();
      audioInstanceRef.current = newAudio;
      setPlayingTrackId(trackId);
      newAudio.onended = () => setPlayingTrackId(null);
    }
  };

  const handleDownloadTrack = (track: any) => {
    if (track.type === 'lyrics') {
      const blob = new Blob([track.textContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `${track.name || 'lyrics'}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else if (track.audioData) {
      const a = document.createElement('a'); a.href = track.audioData; a.download = track.name || 'track_audio'; a.click();
    }
  };

  const handleDeleteTrack = (trackId: number) => {
    const isConfirm = window.confirm("Are you sure you want to remove this asset from the Canvas?");
    if (!isConfirm) return;
    if (playingTrackId === trackId) { audioInstanceRef.current?.pause(); setPlayingTrackId(null); }
    setSharedTracks(prev => prev.filter(t => t.id !== trackId));
    socketRef.current?.emit("delete-track", { roomId, trackId });
  };

  return (
    <div ref={containerRef} className="h-[80vh] min-h-[600px] w-full bg-white border rounded-[2rem] flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative" style={{ borderColor: theme.border, color: theme.text }}>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] blur-[150px] rounded-full pointer-events-none opacity-[0.05] -z-10" style={{ backgroundColor: theme.accent }}></div>

      {/* --- 🎩 MAIN HEADER --- */}
      <header className="h-20 w-full px-8 flex items-center justify-between shrink-0 border-b z-20 bg-white" style={{ borderColor: theme.border }}>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-sm bg-[#F4F3EF] border border-[#111]/10">
               <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent, boxShadow: `0 0 10px ${theme.accent}` }}></span>
               <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Sync Forge Live</span>
            </div>
            <div className="h-6 w-[1px] opacity-20" style={{ backgroundColor: theme.text }}></div>
            <div><h2 className="text-sm font-bold tracking-tight">Session: {roomId.toUpperCase()}</h2></div>
         </div>

         <div className="flex items-center gap-4">
            <button onClick={toggleAudio} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isMicOn ? 'bg-white text-black border border-[#111]/10' : 'bg-red-50 text-red-500 border border-red-200'}`}>{isMicOn ? '🎤' : '🔇'}</button>
            <button onClick={toggleVideo} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm ${isCamOn ? 'bg-white text-black border border-[#111]/10' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>{isCamOn ? '📹' : '🚫'}</button>
            <div className="h-6 w-[1px] opacity-20 mx-2" style={{ backgroundColor: theme.text }}></div>
            <button onClick={onLeave} className="px-6 py-2.5 rounded-full bg-[#111] text-white hover:bg-red-500 text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-md">Leave Studio</button>
         </div>
      </header>

      {/* --- 🖥️ WORKSPACE PANES --- */}
      <div className="flex-1 w-full grid grid-cols-[1fr_320px] overflow-hidden z-10 h-[calc(100%-5rem)]">
         
         {/* 🎨 LEFT PANE: VIDEOS + CANVAS */}
         <div className="h-full flex flex-col border-r bg-[#FAF9F6] overflow-hidden" style={{ borderColor: theme.border }}>
            
            {/* 📹 THE VIDEO CALL MATRIX */}
            <div className="h-36 shrink-0 p-4 flex items-center gap-4 overflow-x-auto custom-scrollbar border-b bg-white relative z-20" style={{ borderColor: theme.border }}>
               <div className="w-48 h-full bg-black rounded-xl overflow-hidden relative shadow-md shrink-0 border-[2px] transition-colors duration-300" style={{ borderColor: isMicOn ? theme.accent : 'transparent' }}>
                 {isCamOn ? (
                   <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]"></video>
                 ) : (
                   <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center relative">
                     <img src={user.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username || 'Me'}`} className="w-10 h-10 rounded-full grayscale opacity-80 mb-2 border border-white/10" alt="DP"/>
                     <span className="text-[8px] font-mono text-white/50 uppercase tracking-widest">Cam Off</span>
                   </div>
                 )}
                 <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center gap-1.5 z-10">
                    {isMicOn && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></span>}
                    <span className="text-[7px] font-black text-white uppercase tracking-widest truncate max-w-[80px]">You</span>
                 </div>
               </div>
               {peers.map((peerObj, index) => (
                  <VideoPeer key={index} peer={peerObj.peer} userDetails={peerObj.userDetails} mediaState={peerObj.mediaState} theme={theme} />
               ))}
            </div>

            {/* 🎼 THE SHARED CANVAS WRAPPER */}
            <div className="h-[calc(100%-9rem)] flex flex-col p-6 overflow-hidden">
               
               {/* Tools Header */}
               <div className="h-12 shrink-0 flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-[#111]">Shared Canvas</h3>
                    <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 font-bold">Real-time stems & drafts</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                     <WriteBars theme={theme} onLyricsDrop={(data: any) => {
                           const trackData = { roomId, ...data, owner: user.username };
                           setSharedTracks(prev => [...prev, trackData]);
                           socketRef.current?.emit("send-track", trackData);
                        }} />
                     {myRole === 'producer' && (
                        <DropBeat accentColor={theme.accent} theme={theme} onBeatDrop={(data: any) => {
                              const trackData = { roomId, ...data, owner: user.username };
                              setSharedTracks(prev => [...prev, trackData]);
                              socketRef.current?.emit("send-track", trackData);
                           }} />
                     )}
                     {(myRole === 'rapper' || myRole === 'lyricist') && (
                        <RecordBars accentColor={theme.accent} theme={theme} onAudioDrop={(data: any) => {
                              const trackData = { roomId, ...data, owner: user.username };
                              setSharedTracks(prev => [...prev, trackData]);
                              socketRef.current?.emit("send-track", trackData);
                           }} />
                     )}
                  </div>
               </div>

               {/* 🔥 BULLETPROOF SCROLL CANVAS BOARD 🔥 */}
               <div className="flex-1 w-full bg-white rounded-2xl border shadow-sm relative overflow-hidden" style={{ borderColor: theme.border }}>
                  
                  <div className="absolute top-0 left-0 right-0 h-8 border-b flex justify-between px-20 bg-[#F4F3EF] z-20" style={{ borderColor: theme.border }}>
                    {[0, 15, 30, 45, 60].map(s => <span key={s} className="text-[8px] font-mono opacity-40 border-l pl-2 pt-2" style={{ borderColor: theme.border }}>0:{s.toString().padStart(2, '0')}</span>)}
                  </div>

                  <div className="absolute top-8 bottom-0 left-0 right-0 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50/30" data-lenis-prevent="true">
                      {sharedTracks.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-40">
                           <span className="text-4xl mb-3 grayscale">🎛️</span>
                           <p className="text-xs font-mono uppercase tracking-widest font-bold text-center">Canvas is empty.</p>
                        </div>
                      ) : (
                         <div className="flex flex-col gap-4 pb-10">
                           {sharedTracks.map((track, i) => (
                             <div key={track.id} className="flex items-center h-24 shrink-0 w-full bg-white rounded-xl border group/track hover:shadow-md transition-all relative overflow-hidden" style={{ borderColor: theme.border }}>
                                
                                <div className="w-40 shrink-0 h-full flex flex-col justify-center px-4 border-r relative z-10 bg-[#F9F9F9]" style={{ borderColor: theme.border }}>
                                  <span className="text-[10px] font-black uppercase tracking-widest mb-1 truncate" style={{ color: track.color }}>{track.type}</span>
                                  <span className="text-[9px] font-mono font-bold opacity-50 truncate">{track.owner}</span>
                                  
                                  {(track.type === 'vocal' || track.type === 'beat') && (
                                    <button onClick={() => togglePlayTrack(track.id, track.audioData)} className="absolute top-1/2 -translate-y-1/2 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#111]/5 hover:bg-[#111]/10 transition-colors shadow-sm cursor-pointer z-50 text-[#111]">
                                      {playingTrackId === track.id ? (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                      ) : (
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                      )}
                                    </button>
                                  )}
                                </div>
                                
                                <div className="flex-1 min-w-0 h-full relative flex items-center px-4 py-3">
                                   {track.type === 'lyrics' ? (
                                     <div className="w-full h-full p-3 bg-white border rounded-lg overflow-y-auto custom-scrollbar text-xs font-serif italic text-gray-700" style={{ borderColor: `${track.color}40` }}>"{track.textContent}"</div>
                                   ) : (
                                     <div className="w-full max-w-[80%] h-12 rounded-lg border flex items-center px-3 gap-[2px] shadow-sm relative overflow-hidden" style={{ backgroundColor: `${track.color}10`, borderColor: `${track.color}30` }}>
                                        {[...Array(50)].map((_, idx) => <div key={idx} className="flex-1 rounded-full opacity-60" style={{ height: `${Math.random() * 60 + 20}%`, backgroundColor: track.color }}></div>)}
                                        <span className="absolute bottom-1.5 left-3 text-[8px] font-black uppercase tracking-widest opacity-90 bg-white/90 px-1.5 py-0.5 rounded shadow-sm truncate max-w-[80%]" style={{ color: track.color }}>{track.name}</span>
                                     </div>
                                   )}

                                   {/* 🔥 DOWNLOAD & DELETE ACTION OVERLAY 🔥 */}
                                   <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-hover/track:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm p-1.5 rounded-lg shadow-md border" style={{ borderColor: theme.border }}>
                                      <button onClick={() => handleDownloadTrack(track)} className="w-7 h-7 flex items-center justify-center rounded-md bg-green-50 text-green-600 hover:bg-green-100 transition-colors" title="Download Asset">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                      </button>
                                      
                                      {(myRole === 'producer' || track.owner === user.username) && (
                                        <button onClick={() => handleDeleteTrack(track.id)} className="w-7 h-7 flex items-center justify-center rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Remove Asset">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                      )}
                                   </div>
                                </div>
                             </div>
                           ))}
                         </div>
                      )}
                  </div>
               </div>
            </div>
         </div>

         {/* 💬 RIGHT PANE: LIVE CHAT */}
         <div className="w-full h-full flex flex-col bg-white overflow-hidden relative border-l" style={{ borderColor: theme.border }}>
            <div className="h-16 shrink-0 w-full border-b flex items-center justify-between px-6 bg-[#F4F3EF] z-10" style={{ borderColor: theme.border }}>
               <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">Group Comms</h3>
               <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></span>
            </div>
            
            <div className="absolute top-16 bottom-20 left-0 right-0 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-white" id="studio-chat-box" data-lenis-prevent="true">
               {messages.map((msg, i) => (
                 msg.isSystem ? (
                   <div key={i} className="w-full text-center my-2">
                     <span className="px-3 py-1 rounded-full text-[8px] font-mono uppercase tracking-[0.2em] font-bold border" style={{ backgroundColor: theme.card, borderColor: theme.border, color: `${theme.text}60` }}>{msg.text}</span>
                   </div>
                 ) : (
                   <div key={i} className={`flex flex-col w-full ${msg.sender === (user.username || 'You') ? 'items-end' : 'items-start'}`}>
                     <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{msg.sender}</span>
                        <span className="text-[7px] font-mono opacity-30">{msg.time}</span>
                     </div>
                     <div className={`px-4 py-2.5 text-xs rounded-xl max-w-[85%] shadow-sm leading-relaxed border break-words ${msg.sender === (user.username || 'You') ? 'text-white rounded-tr-sm' : 'rounded-tl-sm'}`} style={{ 
                         backgroundColor: msg.sender === (user.username || 'You') ? theme.accent : '#F9F8F6',
                         borderColor: msg.sender === (user.username || 'You') ? theme.accent : theme.border,
                         color: msg.sender === (user.username || 'You') ? '#fff' : '#111'
                     }}>
                       {msg.text}
                     </div>
                   </div>
                 )
               ))}
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-20 p-4 border-t bg-[#F4F3EF]" style={{ borderColor: theme.border }}>
               <form onSubmit={handleSendMessage} className="relative h-full flex items-center">
                 <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message..." className="w-full h-full bg-white border border-[#111]/10 rounded-full py-3 pl-5 pr-12 text-xs font-medium outline-none transition-all focus:border-[#E63946] shadow-sm" />
                 <button type="submit" disabled={!chatInput.trim()} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform shadow-md disabled:opacity-50" style={{ backgroundColor: theme.accent }}>
                   <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                 </button>
               </form>
            </div>
         </div>

      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px !important; display: block !important; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.02) !important; border-radius: 10px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #D1D1D1 !important; border-radius: 10px !important; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #A1A1A1 !important; }
      `}</style>
    </div>
  );
}