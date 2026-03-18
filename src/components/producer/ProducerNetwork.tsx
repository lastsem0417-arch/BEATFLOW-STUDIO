import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function LiveNetwork({ setIsDawOpen }: { setIsDawOpen?: any }) {
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const safeUserId = currentUser.id || currentUser._id;

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [userPortfolio, setUserPortfolio] = useState<any[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = currentUser.token;
        const res = await axios.get('http://localhost:5000/api/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllUsers(res.data);
      } catch (err) { console.error("Error fetching users"); }
    };
    fetchUsers();
  }, [currentUser.token]);

  useEffect(() => {
    if (!safeUserId) return;
    socket = io('http://localhost:5000');
    socket.emit('join_room', safeUserId);
    
    socket.on('receive_message', (data) => {
      if (String(data.senderId) === String(selectedUserRef.current?._id) || String(data.receiverId) === String(selectedUserRef.current?._id)) {
        setChatMessages((prev) => [...prev, data]);
      }
    });
    return () => { socket.disconnect(); };
  }, [safeUserId]);

  useEffect(() => {
    const loadUserContext = async () => {
      if (!selectedUser) return;
      try {
        const token = currentUser.token;
        const chatRes = await axios.get(`http://localhost:5000/api/chat/direct/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatMessages(chatRes.data);

        const trackRes = await axios.get(`http://localhost:5000/api/tracks/user/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPortfolio(trackRes.data);

      } catch (err) { console.error("Error loading context", err); }
    };
    loadUserContext();
  }, [selectedUser, currentUser.token]);

  // 🔥 THE SCROLL BUG FIX: Only scroll if there are messages, and use 'nearest' block
  useEffect(() => { 
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [chatMessages]);

  const togglePlay = (trackId: string) => { setPlayingTrackId(playingTrackId === trackId ? null : trackId); };

  const handleSendMessage = async () => {
    if(!replyText.trim() || !selectedUser) return;
    
    const messagePayload = {
        senderId: safeUserId,
        receiverId: selectedUser._id, 
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentReply = replyText;
    setReplyText(""); 

    setChatMessages(prev => [...prev, { ...messagePayload, id: Date.now().toString() }]);
    socket.emit('send_message', messagePayload);
    
    try {
      await axios.post('http://localhost:5000/api/chat/send', messagePayload, {
         headers: { Authorization: `Bearer ${currentUser.token}` } 
      });
    } catch (err) { setReplyText(currentReply); }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'text-rapper';
    if (r === 'lyricist') return 'text-lyricist';
    return 'text-producer';
  };

  return (
    // 🔥 THE HEIGHT LOCK FIX: 75vh maximum, strict overflow control
    <div className="h-[75vh] min-h-[600px] w-full bg-brand-dark border border-white/5 rounded-[2rem] flex overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] relative select-none mt-2">
      
      {/* 🌟 LEFT PANE: THE GLOBAL DIRECTORY */}
      <div className="w-80 shrink-0 border-r border-white/5 bg-brand-onyx/90 flex flex-col z-10 backdrop-blur-2xl">
        <div className="p-8 border-b border-white/5">
            <h2 className="text-3xl font-serif italic text-brand-pearl">Network<span className="text-producer">.</span></h2>
            <p className="text-[9px] text-brand-muted uppercase font-black tracking-[0.4em] mt-2">Global Directory</p>
        </div>
        
        <div className="p-5 border-b border-white/5 bg-[#010101]">
            <div className="relative flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-brand-muted"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search encrypted network..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-brand-pearl font-mono outline-none focus:border-producer/50 transition-all placeholder:text-brand-muted/50" 
              />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar" data-lenis-prevent="true">
            {filteredUsers.length === 0 && (
                <div className="text-center text-[10px] text-brand-muted mt-10 font-mono uppercase tracking-widest">No signals found.</div>
            )}
            
            {filteredUsers.map((u: any) => {
              const isActive = selectedUser?._id === u._id;
              return (
                <div 
                  key={u._id} 
                  onClick={() => { setSelectedUser(u); setChatMessages([]); setPlayingTrackId(null); }} 
                  className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${isActive ? 'bg-producer/10 border border-producer/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'hover:bg-white/[0.03] border border-transparent hover:border-white/5'}`}
                >
                  <div className={`w-12 h-12 rounded-full border bg-[#010101] overflow-hidden transition-all ${isActive ? 'border-producer shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'border-white/10 group-hover:border-white/30'}`}>
                    <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt="dp"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <h4 className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-brand-pearl' : 'text-brand-muted group-hover:text-brand-pearl'}`}>{u.username}</h4>
                      <p className={`text-[9px] uppercase tracking-widest mt-1 font-black ${getRoleColor(u.role)}`}>{u.role}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* 🌟 RIGHT PANE: PORTFOLIO & ENCRYPTED DM */}
      <div className="flex-1 flex flex-col bg-brand-dark relative h-full">
        {selectedUser ? (
          <div className="flex-1 flex overflow-hidden relative z-10 h-full">
                
                {/* 🗂️ MIDDLE: ARTIST DOSSIER */}
                <div className="w-80 shrink-0 border-r border-white/5 bg-brand-onyx/50 p-8 flex flex-col h-full">
                    <div className="text-center mb-8 border-b border-white/5 pb-8 relative group">
                        <div className="absolute inset-0 bg-producer/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-24 h-24 rounded-full mx-auto border border-white/10 p-1 mb-4 relative z-10 bg-[#010101]">
                          <img src={selectedUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser._id}`} className="w-full h-full rounded-full object-cover" alt="dp"/>
                        </div>
                        <h3 className="text-2xl font-serif italic text-brand-pearl relative z-10">{selectedUser.username}</h3>
                        <span className="bg-[#010101] border border-white/10 px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.3em] font-black text-brand-muted mt-3 inline-block relative z-10">
                          Identity Dossier
                        </span>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.4em] text-producer font-black mb-5">Public Assets</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" data-lenis-prevent="true">
                        {userPortfolio.length > 0 ? userPortfolio.map(track => {
                          const isPlaying = playingTrackId === track._id;
                          return (
                            <div key={track._id} className={`flex justify-between p-4 rounded-2xl items-center border transition-all duration-300 ${isPlaying ? 'bg-producer/5 border-producer/30' : 'bg-[#010101] border-white/5 hover:border-producer/20'}`}>
                                <div className="overflow-hidden pr-3">
                                    <h4 className={`text-xs truncate w-32 font-bold transition-colors ${isPlaying ? 'text-producer' : 'text-brand-pearl'}`}>{track.title}</h4>
                                    <p className="text-[8px] uppercase tracking-widest text-brand-muted mt-1 font-mono">{track.trackType}</p>
                                </div>
                                <button 
                                  onClick={() => togglePlay(track._id)} 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-producer text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-brand-pearl border border-white/10 hover:border-producer hover:text-producer'}`}
                                >
                                    {isPlaying ? (
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                                    ) : (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                    )}
                                </button>
                                {isPlaying && track.audioUrl && <audio src={track.audioUrl} autoPlay onEnded={() => setPlayingTrackId(null)} className="hidden" />}
                            </div>
                          )
                        }) : (
                            <div className="text-[10px] font-mono text-brand-muted uppercase tracking-widest text-center mt-10 border border-dashed border-white/10 py-10 rounded-2xl">
                              Vault is Empty
                            </div>
                        )}
                    </div>
                </div>

                {/* 💬 THE SECURE DIRECT LINE */}
                <div className="flex-1 flex flex-col relative bg-[#010101] h-full">
                    <div className="h-20 border-b border-white/5 bg-brand-onyx/80 flex justify-between items-center px-8 z-20 backdrop-blur-3xl shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-producer rounded-full animate-pulse shadow-[0_0_10px_#D4AF37]"></div>
                            <div>
                                <h4 className="text-lg font-serif italic text-brand-pearl leading-none mb-1">
                                    {selectedUser.username}
                                </h4>
                                <p className="text-[7px] font-mono text-brand-muted uppercase tracking-[0.3em]">Encrypted Channel Active</p>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-brand-muted font-black border border-white/10 px-3 py-1 rounded-full bg-white/5">
                          RSA-2048
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar" data-lenis-prevent="true">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center opacity-30 select-none">
                              <span className="text-[4rem] mb-6 opacity-20">📡</span>
                              <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-brand-muted text-center max-w-[200px] leading-relaxed">
                                Connection Established. Awaiting transmission.
                              </span>
                          </div>
                        ) : (
                          chatMessages.map((msg: any, i: number) => {
                            const isMe = String(msg.senderId) === String(safeUserId);
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-[1.5rem] flex flex-col gap-2 shadow-lg backdrop-blur-md transition-all ${isMe ? 'bg-producer/10 border border-producer/30 text-brand-pearl rounded-tr-sm' : 'bg-white/[0.03] border border-white/10 text-brand-pearl rounded-tl-sm'}`}>
                                  <p className="text-[13px] font-light leading-relaxed tracking-wide">{msg.text}</p>
                                  <p className={`text-[8px] uppercase tracking-widest font-mono text-right ${isMe ? 'text-producer/70' : 'text-brand-muted'}`}>
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-6 bg-brand-onyx border-t border-white/5 flex gap-4 backdrop-blur-3xl relative z-20 shrink-0">
                       <input 
                         type="text" 
                         placeholder="Transmit encrypted message..." 
                         value={replyText} 
                         onChange={(e) => setReplyText(e.target.value)} 
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                         className="flex-1 bg-white/5 rounded-full px-8 text-sm text-brand-pearl font-mono outline-none focus:border-producer focus:bg-white/10 border border-transparent transition-all placeholder:text-brand-muted/50" 
                       />
                       <button 
                         onClick={handleSendMessage} 
                         className="w-14 h-14 bg-brand-pearl border border-transparent hover:border-producer rounded-full text-black hover:text-producer hover:bg-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center"
                       >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                       </button>
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full opacity-40 select-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-screen">
             <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border border-producer/30 animate-[ping_3s_infinite]"></div>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-brand-muted"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
             </div>
             <h2 className="text-4xl font-serif italic text-brand-pearl tracking-tight">Select an Architect</h2>
             <p className="text-[10px] font-mono text-brand-muted uppercase tracking-[0.4em] mt-3">To establish a secure connection</p>
          </div>
        )}
      </div>
    </div>
  );
}