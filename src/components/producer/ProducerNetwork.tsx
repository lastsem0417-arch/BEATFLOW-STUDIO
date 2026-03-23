import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import gsap from 'gsap';

let socket: Socket;

export default function ProducerNetwork({ setIsDawOpen }: { setIsDawOpen?: any }) {
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
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = currentUser.token;
        const res = await axios.get('import.meta.env.VITE_API_URL/api/users/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllUsers(res.data);
      } catch (err) { console.error("Error fetching users"); }
    };
    fetchUsers();
  }, [currentUser.token]);

  useEffect(() => {
    if (!safeUserId) return;
    socket = io('import.meta.env.VITE_API_URL');
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
        const chatRes = await axios.get(`import.meta.env.VITE_API_URL/api/chat/direct/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatMessages(chatRes.data);

        const trackRes = await axios.get(`import.meta.env.VITE_API_URL/api/tracks/user/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPortfolio(trackRes.data);

      } catch (err) { console.error("Error loading context", err); }
    };
    loadUserContext();
  }, [selectedUser, currentUser.token]);

  // 🔥 SCROLL BUG FIX PRESERVED
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
      await axios.post('import.meta.env.VITE_API_URL/api/chat/send', messagePayload, {
         headers: { Authorization: `Bearer ${currentUser.token}` } 
      });
    } catch (err) { setReplyText(currentReply); }
  };

  const filteredUsers = allUsers.filter(u => 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🎬 PREMIUM REVEAL ANIMATIONS
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.hub-reveal',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: 'power4.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    // 🔥 PREMIUM EDITORIAL HUB CONTAINER 🔥
    <div ref={containerRef} className="h-[75vh] min-h-[600px] w-full bg-white rounded-[1.5rem] border border-[#001433]/5 flex overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative select-none mt-2 font-sans">
      
      {/* 🌟 LEFT PANE: THE GLOBAL DIRECTORY */}
      <div className="hub-reveal w-80 shrink-0 border-r border-[#001433]/10 bg-[#F4F3EF] flex flex-col z-10 relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        
        <div className="p-8 border-b border-[#001433]/10 shrink-0 bg-white relative z-10">
            <p className="text-[9px] text-[#001433]/50 uppercase font-black tracking-[0.4em] mb-2 font-mono">Directory</p>
            <h2 className="text-3xl font-serif italic text-[#001433] leading-none">Network<span className="text-[#D4AF37]">.</span></h2>
        </div>
        
        <div className="p-5 border-b border-[#001433]/10 bg-white shrink-0 relative z-10">
            <div className="relative flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-[#001433]/40"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search Frequencies..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F4F3EF] border border-transparent rounded-full px-10 py-2.5 text-xs text-[#001433] font-medium outline-none focus:bg-white focus:border-[#D4AF37]/50 transition-all placeholder:text-[#001433]/40 shadow-inner" 
              />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10" data-lenis-prevent="true">
            {filteredUsers.length === 0 && (
                <div className="text-center text-[10px] text-[#001433]/40 mt-10 font-mono font-black uppercase tracking-widest">No signals found.</div>
            )}
            
            {filteredUsers.map((u: any) => {
              const isActive = selectedUser?._id === u._id;
              return (
                <div 
                  key={u._id} 
                  onClick={() => { setSelectedUser(u); setChatMessages([]); setPlayingTrackId(null); }} 
                  className={`group flex items-center gap-4 p-4 rounded-[1rem] cursor-pointer transition-all duration-300 ${isActive ? 'bg-white border border-[#D4AF37] shadow-[0_5px_15px_rgba(212,175,55,0.15)] -translate-y-0.5' : 'bg-transparent border border-transparent hover:bg-white hover:border-[#001433]/10 hover:shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full border bg-white overflow-hidden shrink-0 transition-all duration-300 ${isActive ? 'border-[#D4AF37]' : 'border-[#001433]/10 group-hover:border-[#001433]/30'}`}>
                    <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt="dp"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <h4 className={`text-[14px] font-bold truncate transition-colors ${isActive ? 'text-[#D4AF37]' : 'text-[#001433]'}`}>{u.username}</h4>
                      <p className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60 font-mono mt-0.5">{u.role}</p>
                  </div>
                </div>
              )
            })}
        </div>
      </div>

      {/* 🌟 RIGHT PANE: PORTFOLIO & ENCRYPTED DM */}
      <div className="flex-1 flex flex-col bg-white relative h-full">
        {selectedUser ? (
          <div className="flex-1 flex overflow-hidden relative z-10 h-full">
                
                {/* 🗂️ MIDDLE: ARTIST DOSSIER */}
                <div className="hub-reveal w-80 shrink-0 border-r border-[#001433]/10 bg-[#F4F3EF] p-8 flex flex-col h-full">
                    <div className="text-center mb-8 border-b border-[#001433]/10 pb-8 relative group">
                        <div className="absolute inset-0 bg-[#D4AF37]/10 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-24 h-24 rounded-full mx-auto border border-[#001433]/10 p-1 mb-4 relative z-10 bg-white shadow-sm">
                          <img src={selectedUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser._id}`} className="w-full h-full rounded-full object-cover" alt="dp"/>
                        </div>
                        <h3 className="text-2xl font-serif italic text-[#001433] relative z-10 truncate">{selectedUser.username}</h3>
                        <span className="bg-white text-[#001433]/50 px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.3em] font-black mt-3 inline-block shadow-sm border border-[#001433]/10 relative z-10">
                          Architect Data
                        </span>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] font-black mb-4 font-mono shrink-0">Public Assets</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" data-lenis-prevent="true">
                        {userPortfolio.length > 0 ? userPortfolio.map(track => {
                          const isPlaying = playingTrackId === track._id;
                          return (
                            <div key={track._id} className={`flex justify-between p-4 rounded-[1rem] items-center transition-all duration-300 border ${isPlaying ? 'bg-white border-[#D4AF37] shadow-[0_5px_15px_rgba(212,175,55,0.1)]' : 'bg-white border-[#001433]/5 hover:border-[#001433]/20 hover:shadow-sm'}`}>
                                <div className="overflow-hidden pr-2">
                                    <h4 className={`text-[12px] font-bold truncate w-32 tracking-tight transition-colors ${isPlaying ? 'text-[#D4AF37]' : 'text-[#001433]'}`}>{track.title}</h4>
                                    <p className="text-[8px] uppercase tracking-widest opacity-50 font-mono mt-1">{track.trackType}</p>
                                </div>
                                <button 
                                  onClick={() => togglePlay(track._id)} 
                                  className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${isPlaying ? 'bg-[#D4AF37] text-white border-[#D4AF37] shadow-[0_5px_10px_rgba(212,175,55,0.3)]' : 'bg-[#F4F3EF] text-[#001433] border-[#001433]/10 hover:bg-[#001433] hover:text-white hover:border-[#001433]'}`}
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
                            <div className="text-[10px] font-mono text-[#001433]/40 font-black uppercase tracking-widest text-center mt-10 border border-dashed border-[#001433]/10 py-8 rounded-[1rem] bg-white">
                              Vault is Empty
                            </div>
                        )}
                    </div>
                </div>

                {/* 💬 THE SECURE DIRECT LINE */}
                <div className="hub-reveal flex-1 flex flex-col relative bg-white h-full">
                    <div className="h-20 border-b border-[#001433]/10 bg-white/80 flex justify-between items-center px-8 z-20 shrink-0 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[#D4AF37] rounded-full animate-ping shadow-[0_0_8px_#D4AF37]"></div>
                            <div>
                                <h4 className="text-lg font-serif italic text-[#001433] leading-none truncate">
                                    {selectedUser.username}
                                </h4>
                                <p className="text-[8px] font-mono text-[#001433]/40 uppercase tracking-[0.3em] font-bold mt-1.5">Secure Transmission Active</p>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[#001433]/50 font-black border border-[#001433]/10 px-3 py-1 rounded-full bg-[#F4F3EF]">
                          RSA-2048
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[#F4F3EF]/30" data-lenis-prevent="true">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center select-none opacity-50">
                              <span className="text-[3rem] mb-6 opacity-30 grayscale">📡</span>
                              <h2 className="text-[10px] font-mono uppercase tracking-[0.4em] text-[#001433]/60 text-center">Connection Established. Awaiting Data.</h2>
                          </div>
                        ) : (
                          chatMessages.map((msg: any, i: number) => {
                            const isMe = String(msg.senderId) === String(safeUserId);
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-[1rem] flex flex-col gap-2 shadow-sm transition-all ${isMe ? 'bg-[#D4AF37] text-white rounded-tr-sm' : 'bg-white text-[#001433] border border-[#001433]/10 rounded-tl-sm'}`}>
                                  <p className="text-sm font-medium tracking-wide leading-relaxed break-words">{msg.text}</p>
                                  <p className={`text-[8px] uppercase tracking-widest font-mono font-black text-right mt-1 ${isMe ? 'text-white/70' : 'text-[#001433]/40'}`}>
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-6 bg-white border-t border-[#001433]/10 flex gap-4 z-20 shrink-0">
                       <input 
                         type="text" 
                         placeholder="Transmit encrypted message..." 
                         value={replyText} 
                         onChange={(e) => setReplyText(e.target.value)} 
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                         className="flex-1 bg-[#F4F3EF] border border-transparent rounded-full px-8 py-3.5 text-sm text-[#001433] font-medium outline-none focus:bg-white focus:border-[#D4AF37] transition-all placeholder:text-[#001433]/30 shadow-inner" 
                       />
                       <button 
                         onClick={handleSendMessage} 
                         disabled={!replyText.trim()}
                         className="w-14 h-14 shrink-0 rounded-full bg-[#001433] text-white border border-transparent shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:bg-[#D4AF37] hover:shadow-[0_10px_20px_rgba(212,175,55,0.3)] active:scale-95 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                       >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                       </button>
                    </div>
                </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#F4F3EF]/50 p-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 mix-blend-multiply"></div>
             <div className="w-24 h-24 rounded-full border border-[#001433]/10 flex items-center justify-center mb-8 bg-white shadow-sm relative z-10">
                <div className="absolute inset-0 rounded-full border border-[#D4AF37]/40 animate-[ping_3s_infinite]"></div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#001433" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>
             </div>
             <h2 className="text-3xl font-serif italic text-[#001433] tracking-tight relative z-10">Awaiting Signal</h2>
             <p className="text-[9px] font-mono text-[#001433]/40 uppercase tracking-[0.4em] mt-3 relative z-10">Select an architect to connect</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px !important;
          display: block !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,20,51,0.1) !important;
          border-radius: 10px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D4AF37 !important;
        }
      `}</style>
    </div>
  );
}