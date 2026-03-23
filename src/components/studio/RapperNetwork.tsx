import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import gsap from 'gsap';

let socket: Socket;

export default function RapperNetwork({ setIsDawOpen }: { setIsDawOpen?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
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
      } catch (err) { console.error("Error loading user context", err); }
    };
    loadUserContext();
  }, [selectedUser, currentUser.token]);

  // 🔥 HEIGHT BUG PREVENTER
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

  // Hardcoded Hex for roles to ensure Tailwind compliance (Adjusted for Light Theme)
  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'text-[#E63946]';
    if (r === 'lyricist') return 'text-[#10B981]';
    return 'text-[#D4AF37]';
  };

  // 🔥 GSAP ENTRANCE ANIMATION 🔥
  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(containerRef.current, 
        { opacity: 0, y: 40 }, 
        { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    // 🔥 PREMIUM LIGHT BASE (#F4F3EF) WITH EDITORIAL BORDERS 🔥
    <div ref={containerRef} className="h-[75vh] min-h-[600px] w-full bg-white border border-[#111]/10 rounded-[1rem] flex overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative select-none mt-2">
      
      {/* 🌟 LEFT PANE: THE GLOBAL DIRECTORY */}
      <div className="w-80 shrink-0 border-r border-[#111]/10 bg-[#F4F3EF] flex flex-col z-10 relative">
        {/* Subtle top noise pattern */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
        
        <div className="p-8 border-b border-[#111]/10 bg-white relative z-10">
            <h2 className="text-3xl font-serif italic text-[#111]">Network<span className="text-[#E63946]">.</span></h2>
            <p className="text-[9px] text-[#111]/50 uppercase font-black tracking-[0.4em] mt-2">Global Directory</p>
        </div>
        
        <div className="p-5 border-b border-[#111]/10 bg-white relative z-10">
            <div className="relative flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 text-[#111]/40"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search network..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F4F3EF] border border-[#111]/10 rounded-full pl-10 pr-4 py-2.5 text-xs text-[#111] font-mono outline-none focus:border-[#E63946] focus:bg-white transition-all placeholder:text-[#111]/40 shadow-inner" 
              />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10" data-lenis-prevent="true">
            {filteredUsers.length === 0 && (
                <div className="text-center text-[10px] text-[#111]/40 mt-10 font-mono uppercase tracking-widest">No signals found.</div>
            )}
            
            {filteredUsers.map((u: any) => {
              const isActive = selectedUser?._id === u._id;
              return (
                <div 
                  key={u._id} 
                  onClick={() => { setSelectedUser(u); setChatMessages([]); setPlayingTrackId(null); }} 
                  className={`group flex items-center gap-4 p-4 rounded-[1rem] cursor-pointer transition-all duration-300 ${isActive ? 'bg-white border border-[#E63946] shadow-[0_5px_15px_rgba(230,57,70,0.15)] -translate-y-0.5' : 'bg-transparent border border-transparent hover:bg-white hover:border-[#111]/10 hover:shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full border bg-white overflow-hidden transition-all duration-300 ${isActive ? 'border-[#E63946]' : 'border-[#111]/10 group-hover:border-[#111]/30'}`}>
                    <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt="dp"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <h4 className={`text-sm font-bold truncate transition-colors duration-300 ${isActive ? 'text-[#E63946]' : 'text-[#111] group-hover:text-[#111]'}`}>{u.username}</h4>
                      <p className={`text-[9px] uppercase tracking-widest mt-1 font-black ${isActive ? getRoleColor(u.role) : 'text-[#111]/40 group-hover:text-[#111]/60'}`}>{u.role}</p>
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
                
                {/* 🗂️ MIDDLE: ARTIST DOSSIER (Portfolio - Editorial Layout) */}
                <div className="w-80 shrink-0 border-r border-[#111]/10 bg-[#F4F3EF] p-8 flex flex-col h-full">
                    <div className="text-center mb-8 border-b border-[#111]/10 pb-8 relative group">
                        <div className="absolute inset-0 bg-[#E63946]/5 blur-[30px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-24 h-24 rounded-full mx-auto border border-[#111]/10 p-1 mb-4 relative z-10 bg-white shadow-sm">
                          <img src={selectedUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser._id}`} className="w-full h-full rounded-full object-cover" alt="dp"/>
                        </div>
                        <h3 className="text-2xl font-serif italic text-[#111] relative z-10">{selectedUser.username}</h3>
                        <span className="bg-white border border-[#111]/10 px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.3em] font-black text-[#111]/50 mt-3 inline-block relative z-10 shadow-sm">
                          Identity Dossier
                        </span>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#E63946] font-black mb-5">Public Assets</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" data-lenis-prevent="true">
                        {userPortfolio.length > 0 ? userPortfolio.map(track => {
                          const isPlaying = playingTrackId === track._id;
                          return (
                            <div key={track._id} className={`flex justify-between p-4 rounded-[1rem] items-center transition-all duration-300 border ${isPlaying ? 'bg-white border-[#E63946] shadow-[0_5px_15px_rgba(230,57,70,0.1)]' : 'bg-white border-[#111]/5 hover:border-[#111]/20 hover:shadow-sm'}`}>
                                <div className="overflow-hidden pr-3">
                                    <h4 className={`text-xs truncate w-32 font-bold transition-colors duration-300 ${isPlaying ? 'text-[#E63946]' : 'text-[#111]'}`}>{track.title}</h4>
                                    <p className="text-[8px] uppercase tracking-widest text-[#111]/40 mt-1 font-mono">{track.trackType}</p>
                                </div>
                                <button 
                                  onClick={() => togglePlay(track._id)} 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${isPlaying ? 'bg-[#E63946] text-white border-[#E63946] shadow-[0_5px_10px_rgba(230,57,70,0.3)]' : 'bg-[#F4F3EF] text-[#111] border-[#111]/10 hover:border-[#111] hover:bg-[#111] hover:text-white'}`}
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
                            <div className="text-[10px] font-mono text-[#111]/40 uppercase tracking-widest text-center mt-10 border border-dashed border-[#111]/10 py-10 rounded-xl bg-white">
                              Vault is Empty
                            </div>
                        )}
                    </div>
                </div>

                {/* 💬 THE SECURE DIRECT LINE (Clean Chat) */}
                <div className="flex-1 flex flex-col relative bg-white h-full">
                    <div className="h-20 border-b border-[#111]/10 bg-white/80 flex justify-between items-center px-8 z-20 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[#E63946] rounded-full animate-pulse shadow-[0_0_8px_#E63946]"></div>
                            <div>
                                <h4 className="text-lg font-serif italic text-[#111] leading-none mb-1">
                                    {selectedUser.username}
                                </h4>
                                <p className="text-[7px] font-mono text-[#111]/40 uppercase tracking-[0.3em]">Encrypted Channel Active</p>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[#111]/50 font-black border border-[#111]/10 px-3 py-1 rounded-full bg-[#F4F3EF]">
                          RSA-2048
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[#FAF9F6]/50" data-lenis-prevent="true">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center opacity-60 select-none">
                              <span className="text-[3rem] mb-6 opacity-30">📡</span>
                              <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-[#111]/40 text-center max-w-[200px] leading-relaxed">
                                Connection Established. Awaiting transmission.
                              </span>
                          </div>
                        ) : (
                          chatMessages.map((msg: any, i: number) => {
                            const isMe = String(msg.senderId) === String(safeUserId);
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 flex flex-col gap-2 transition-all shadow-sm ${isMe ? 'bg-[#E63946] text-white rounded-[1rem] rounded-tr-sm' : 'bg-white border border-[#111]/10 text-[#111] rounded-[1rem] rounded-tl-sm'}`}>
                                  <p className="text-[13px] font-medium leading-relaxed tracking-wide">{msg.text}</p>
                                  <p className={`text-[8px] uppercase tracking-widest font-mono text-right ${isMe ? 'text-white/70' : 'text-[#111]/40'}`}>
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    <div className="p-6 bg-white border-t border-[#111]/10 flex gap-4 relative z-20 shrink-0">
                       <input 
                         type="text" 
                         placeholder="Transmit encrypted message..." 
                         value={replyText} 
                         onChange={(e) => setReplyText(e.target.value)} 
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                         className="flex-1 bg-[#F4F3EF] border border-transparent rounded-full px-8 py-3.5 text-sm text-[#111] font-medium outline-none focus:border-[#E63946] focus:bg-white transition-all placeholder:text-[#111]/30 shadow-inner" 
                       />
                       <button 
                         onClick={handleSendMessage} 
                         disabled={!replyText.trim()}
                         className="w-12 h-12 bg-[#111] border border-transparent hover:border-[#E63946] rounded-full text-white hover:bg-[#E63946] active:scale-95 shadow-[0_5px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_5px_15px_rgba(230,57,70,0.4)] transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                       >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                       </button>
                    </div>
                </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#FAF9F6] p-12 text-center relative overflow-hidden">
             {/* Subtle background element */}
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 mix-blend-multiply"></div>
             
             <div className="w-24 h-24 rounded-full border border-[#111]/10 flex items-center justify-center mb-8 relative z-10 bg-white shadow-sm">
                <div className="absolute inset-0 rounded-full border border-[#E63946]/30 animate-[ping_3s_infinite]"></div>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111]/40"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
             </div>
             <h2 className="text-3xl font-serif italic text-[#111] tracking-tight relative z-10">Select an Architect</h2>
             <p className="text-[9px] font-mono text-[#111]/40 uppercase tracking-[0.4em] mt-3 relative z-10">To establish a secure connection</p>
          </div>
        )}
      </div>

      {/* 🔥 THE CSS FOR THE SCROLLBAR INJECTION 🔥 */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px !important;
          display: block !important;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FAF9F6 !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E5E5 !important;
          border-radius: 10px !important;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #E63946 !important;
        }
      `}</style>
    </div>
  );
}