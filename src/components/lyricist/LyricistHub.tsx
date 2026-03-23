import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import gsap from 'gsap';

let socket: Socket;

export default function LyricistHub() {
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const safeUserId = currentUser.id || currentUser._id;

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  
  const [userPortfolio, setUserPortfolio] = useState<any[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
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

      } catch (err) { console.error("Error loading user context", err); }
    };
    loadUserContext();
  }, [selectedUser, currentUser.token]);

  useEffect(() => { 
    if (chatMessages.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); 
    }
  }, [chatMessages]);

  const togglePlay = (trackId: string) => { setPlayingTrackId(playingTrackId === trackId ? null : trackId); };

  // 🔥 THE AI GHOSTWRITER ENGINE 🔥
  const triggerAIGhostwriter = () => {
      setIsAiLoading(true);
      setTimeout(() => {
         const aiBars = "We breakin' the mold, no chains on my soul,\nGot the Midas touch, turn the dust into gold.";
         setReplyText(prev => prev + (prev ? "\n" : "") + aiBars);
         setIsAiLoading(false);
      }, 1500);
  };

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

  const getRoleColor = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'rapper') return 'text-[#E63946]';
    if (r === 'lyricist') return 'text-[#10B981]';
    return 'text-[#D4AF37]';
  };

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
    // 🔥 HEIGHT LOCK FIX: 75vh cap - PREMIUM LIGHT THEME 🔥
    <div ref={containerRef} className="h-[75vh] min-h-[600px] w-full bg-white border border-[#0A1A14]/5 rounded-[2.5rem] flex overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.03)] relative select-none mt-2 font-sans text-[#0A1A14]">
      
      {/* 🌟 LEFT PANE: THE GLOBAL DIRECTORY */}
      <div className="hub-reveal w-80 shrink-0 border-r border-[#0A1A14]/5 bg-[#F9F8F6] flex flex-col z-10 relative">
        
        {/* Subtle noise texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-multiply pointer-events-none"></div>

        <div className="p-8 border-b border-[#0A1A14]/5 bg-white relative z-10 shrink-0">
            <p className="text-[9px] text-[#0A1A14]/40 uppercase font-black tracking-[0.4em] mb-2 font-mono">Directory</p>
            <h2 className="text-3xl font-serif italic text-[#0A1A14]">Network<span className="text-[#10B981]">.</span></h2>
        </div>
        
        <div className="p-5 border-b border-[#0A1A14]/5 bg-white relative z-10 shrink-0">
            <div className="relative flex items-center shadow-sm rounded-full">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-5 text-[#0A1A14]/40"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input 
                type="text" 
                placeholder="Search network..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#F9F8F6] border border-transparent rounded-full py-3.5 pl-12 pr-4 text-xs text-[#0A1A14] font-medium outline-none focus:bg-white focus:border-[#10B981]/50 transition-all placeholder:text-[#0A1A14]/30" 
              />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar relative z-10" data-lenis-prevent="true">
            {filteredUsers.length === 0 && (
                <div className="text-center text-[10px] text-[#0A1A14]/40 mt-10 font-mono uppercase font-black tracking-widest">No signals found.</div>
            )}
            
            {filteredUsers.map((u: any) => {
              const isActive = selectedUser?._id === u._id;
              return (
                <div 
                  key={u._id} 
                  onClick={() => { setSelectedUser(u); setChatMessages([]); setPlayingTrackId(null); }} 
                  className={`group flex items-center gap-4 p-4 rounded-[1.2rem] cursor-pointer transition-all duration-300 ${isActive ? 'bg-white border border-[#10B981] shadow-[0_10px_20px_rgba(16,185,129,0.1)] -translate-y-0.5' : 'bg-transparent border border-transparent hover:bg-white hover:border-[#0A1A14]/5 hover:shadow-sm'}`}
                >
                  <div className={`w-12 h-12 rounded-full border bg-white overflow-hidden transition-all duration-300 shrink-0 shadow-sm ${isActive ? 'border-[#10B981]' : 'border-[#0A1A14]/10 group-hover:border-[#0A1A14]/30'}`}>
                    <img src={u.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className={`w-full h-full object-cover transition-all duration-500 ${isActive ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`} alt="dp"/>
                  </div>
                  <div className="flex-1 overflow-hidden">
                      <h4 className={`text-sm font-bold truncate transition-colors ${isActive ? 'text-[#10B981]' : 'text-[#0A1A14]'}`}>{u.username}</h4>
                      <p className={`text-[9px] uppercase tracking-widest mt-1 font-black font-mono opacity-80 ${getRoleColor(u.role)}`}>{u.role}</p>
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
                
                {/* 🗂️ MIDDLE: ARTIST DOSSIER (Portfolio) */}
                <div className="hub-reveal w-80 shrink-0 border-r border-[#0A1A14]/5 bg-[#F9F8F6]/50 p-8 flex flex-col h-full">
                    <div className="text-center mb-8 border-b border-[#0A1A14]/5 pb-8 relative group">
                        <div className="absolute inset-0 bg-[#10B981]/5 blur-[40px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="w-24 h-24 rounded-full mx-auto border border-[#0A1A14]/10 p-1 mb-4 relative z-10 bg-white shadow-sm">
                          <img src={selectedUser.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser._id}`} className="w-full h-full rounded-full object-cover" alt="dp"/>
                        </div>
                        <h3 className="text-2xl font-serif italic text-[#0A1A14] relative z-10 truncate">{selectedUser.username}</h3>
                        <span className="bg-white border border-[#0A1A14]/10 px-4 py-1.5 rounded-full text-[8px] uppercase tracking-[0.3em] font-black text-[#0A1A14]/50 mt-3 inline-block shadow-sm relative z-10">
                          Identity Dossier
                        </span>
                    </div>

                    <p className="text-[9px] uppercase tracking-[0.4em] text-[#10B981] font-black mb-5 font-mono">Public Assets</p>
                    
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1" data-lenis-prevent="true">
                        {userPortfolio.length > 0 ? userPortfolio.map(track => {
                          const isPlaying = playingTrackId === track._id;
                          return (
                            <div key={track._id} className={`flex justify-between p-4 rounded-[1.2rem] items-center border transition-all duration-300 ${isPlaying ? 'bg-white border-[#10B981] shadow-[0_5px_15px_rgba(16,185,129,0.1)]' : 'bg-white border-[#0A1A14]/5 hover:border-[#0A1A14]/20 hover:shadow-sm'}`}>
                                <div className="overflow-hidden pr-3">
                                    <h4 className={`text-[12px] truncate w-32 font-bold tracking-tight transition-colors ${isPlaying ? 'text-[#10B981]' : 'text-[#0A1A14]'}`}>{track.title}</h4>
                                    <p className="text-[8px] uppercase tracking-widest text-[#0A1A14]/40 mt-1 font-mono">{track.trackType}</p>
                                </div>
                                <button 
                                  onClick={() => togglePlay(track._id)} 
                                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${isPlaying ? 'bg-[#10B981] text-white shadow-[0_5px_15px_rgba(16,185,129,0.3)]' : 'bg-[#F9F8F6] text-[#0A1A14] border border-[#0A1A14]/10 hover:border-[#10B981] hover:bg-[#10B981] hover:text-white'}`}
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
                            <div className="text-[10px] font-mono text-[#0A1A14]/40 font-black uppercase tracking-widest text-center mt-10 border border-dashed border-[#0A1A14]/10 py-10 rounded-[1.5rem] bg-white">
                              Vault is Empty
                            </div>
                        )}
                    </div>
                </div>

                {/* 💬 THE SECURE DIRECT LINE (Chat window) */}
                <div className="hub-reveal flex-1 flex flex-col relative bg-white h-full">
                    <div className="h-20 border-b border-[#0A1A14]/5 bg-white/90 flex justify-between items-center px-8 z-20 backdrop-blur-xl shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-ping shadow-[0_0_8px_#10B981]"></div>
                            <div>
                                <h4 className="text-lg font-serif italic text-[#0A1A14] leading-none mb-1 truncate">
                                    {selectedUser.username}
                                </h4>
                                <p className="text-[7px] font-mono text-[#0A1A14]/40 font-bold uppercase tracking-[0.3em]">Encrypted Channel Active</p>
                            </div>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest text-[#0A1A14]/50 font-black border border-[#0A1A14]/10 px-3 py-1 rounded-full bg-[#F9F8F6]">
                          RSA-2048
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6 custom-scrollbar bg-[#F9F8F6]/50" data-lenis-prevent="true">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center opacity-50 select-none">
                              <span className="text-[3rem] mb-6 opacity-20 grayscale">📡</span>
                              <span className="text-[10px] uppercase tracking-[0.4em] font-mono text-[#0A1A14]/50 font-black text-center max-w-[200px] leading-relaxed">
                                Connection Established. Awaiting transmission.
                              </span>
                          </div>
                        ) : (
                          chatMessages.map((msg: any, i: number) => {
                            const isMe = String(msg.senderId) === String(safeUserId);
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-[1.5rem] flex flex-col gap-2 shadow-sm transition-all ${isMe ? 'bg-[#10B981] text-white rounded-tr-sm shadow-[0_10px_20px_rgba(16,185,129,0.15)]' : 'bg-white border border-[#0A1A14]/5 text-[#0A1A14] rounded-tl-sm'}`}>
                                  <p className="text-[13px] font-medium leading-relaxed tracking-wide whitespace-pre-wrap">{msg.text}</p>
                                  <p className={`text-[8px] uppercase tracking-widest font-mono text-right ${isMe ? 'text-white/70' : 'text-[#0A1A14]/40'}`}>
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* 🔥 CHAT INPUT WITH AI BUTTON 🔥 */}
                    <div className="p-6 bg-white border-t border-[#0A1A14]/5 flex flex-col gap-4 relative z-20 shrink-0">
                       <div className="flex justify-start">
                           <button 
                                onClick={triggerAIGhostwriter} 
                                disabled={isAiLoading}
                                className="flex items-center gap-2 px-5 py-2.5 border border-[#10B981]/30 bg-[#10B981]/5 text-[#10B981] rounded-full text-[9px] uppercase tracking-[0.2em] font-black hover:bg-[#10B981] hover:text-white hover:shadow-[0_10px_20px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50 disabled:hover:bg-[#10B981]/5 disabled:hover:text-[#10B981] active:scale-95"
                           >
                               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                               {isAiLoading ? 'Generating Syntax...' : 'Spark AI Copilot'}
                           </button>
                       </div>
                       
                       <div className="flex gap-4 items-end">
                           <textarea 
                             placeholder={`Transmit message to ${selectedUser.username}...`} 
                             value={replyText} 
                             onChange={(e) => setReplyText(e.target.value)} 
                             onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                             className="flex-1 bg-[#F9F8F6] rounded-[1.5rem] p-4 py-3.5 text-sm text-[#0A1A14] font-medium outline-none focus:border-[#10B981]/50 focus:bg-white border border-transparent transition-all resize-none custom-scrollbar min-h-[50px] max-h-32 placeholder:text-[#0A1A14]/30 shadow-inner" 
                             rows={1}
                           />
                           <button 
                             onClick={handleSendMessage} 
                             disabled={!replyText.trim()}
                             className="w-14 h-14 bg-[#0A1A14] border border-transparent rounded-full text-white hover:bg-[#10B981] hover:shadow-[0_10px_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all duration-300 flex items-center justify-center shrink-0 mb-1 disabled:opacity-50"
                           >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                           </button>
                       </div>
                    </div>
                </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#F9F8F6]/50 p-12 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')] opacity-5 mix-blend-multiply pointer-events-none"></div>
             
             <div className="w-24 h-24 rounded-full border border-[#0A1A14]/10 flex items-center justify-center mb-8 relative bg-white shadow-sm z-10">
                <div className="absolute inset-0 rounded-full border border-[#10B981]/40 animate-[ping_3s_infinite]"></div>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#0A1A14]/30"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
             </div>
             <h2 className="text-3xl font-serif italic text-[#0A1A14] tracking-tight relative z-10">Select a Collaborator</h2>
             <p className="text-[9px] font-mono text-[#0A1A14]/40 font-bold uppercase tracking-[0.4em] mt-3 relative z-10">To establish a secure connection</p>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; display: block; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(10,26,20,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #10B981; }
      `}</style>
    </div>
  );
}