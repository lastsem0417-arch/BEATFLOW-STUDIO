import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function LyricistHub() {
  const currentUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const safeUserId = currentUser.id || currentUser._id;

  // 🔥 THE GLOBAL DIRECTORY STATES 🔥
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // 🔥 PORTFOLIO & CHAT STATES 🔥
  const [userPortfolio, setUserPortfolio] = useState<any[]>([]);
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Ref for active chat user to prevent socket leaks
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

  // 1. FETCH ALL USERS (Global Directory)
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

  // 2. 24/7 UNBREAKABLE DM SOCKET CONNECTION
  useEffect(() => {
    if (!safeUserId) return;
    socket = io('http://localhost:5000');
    socket.emit('join_room', safeUserId);
    
    socket.on('receive_message', (data) => {
      // 🔥 PURE 1-ON-1 LOGIC
      if (String(data.senderId) === String(selectedUserRef.current?._id) || String(data.receiverId) === String(selectedUserRef.current?._id)) {
        setChatMessages((prev) => [...prev, data]);
      }
    });
    return () => { socket.disconnect(); };
  }, [safeUserId]);

  // 3. FETCH DMs & PORTFOLIO WHEN A USER IS CLICKED
  useEffect(() => {
    const loadUserContext = async () => {
      if (!selectedUser) return;
      try {
        const token = currentUser.token;
        
        // Fetch 1-on-1 Chat History
        const chatRes = await axios.get(`http://localhost:5000/api/chat/direct/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChatMessages(chatRes.data);

        // Fetch User's Public Tracks (Portfolio)
        const trackRes = await axios.get(`http://localhost:5000/api/tracks/user/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserPortfolio(trackRes.data);

      } catch (err) { console.error("Error loading user context", err); }
    };
    loadUserContext();
  }, [selectedUser, currentUser.token]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const togglePlay = (trackId: string) => { setPlayingTrackId(playingTrackId === trackId ? null : trackId); };

  // 🔥 THE AI GHOSTWRITER ENGINE 🔥
  const triggerAIGhostwriter = () => {
      setIsAiLoading(true);
      // Fake delay to simulate AI thinking (Backend judne ke baad asli AI aayega)
      setTimeout(() => {
         const aiBars = "We breakin' the mold, no chains on my soul,\nGot the Midas touch, turn the dust into gold.";
         // AI ke bars seedha input box mein daal do!
         setReplyText(prev => prev + (prev ? "\n" : "") + aiBars);
         setIsAiLoading(false);
      }, 1500);
  };

  // 🔥 SEND DIRECT MESSAGE 🔥
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

    // Local UI update instantly
    setChatMessages(prev => [...prev, { ...messagePayload, id: Date.now().toString() }]);

    // Blast it through sockets
    socket.emit('send_message', messagePayload);
    
    // Save to DB
    try {
      await axios.post('http://localhost:5000/api/chat/send', messagePayload, {
         headers: { Authorization: `Bearer ${currentUser.token}` } 
      });
    } catch (err) { setReplyText(currentReply); }
  };

  return (
    <div className="h-[75vh] bg-[#0a0a0a] border border-white/5 rounded-[3rem] flex overflow-hidden shadow-[0_0_80px_rgba(16,185,129,0.15)] relative">
      
      {/* LEFT PANE: THE GLOBAL DIRECTORY */}
      <div className="w-80 border-r border-white/5 bg-[#050505]/90 flex flex-col z-10 backdrop-blur-xl">
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-emerald-900/10 to-transparent">
            <h2 className="text-xl font-serif italic text-white">Ghost Hub</h2>
            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mt-1">Global Network</p>
        </div>
        
        <div className="p-4 border-b border-white/5 bg-[#0a0a0a]">
            <input type="text" placeholder="Search artists..." className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-emerald-500 transition-all" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {allUsers.map((u: any) => (
              <div key={u._id} onClick={() => { setSelectedUser(u); setChatMessages([]); setPlayingTrackId(null); }} className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${selectedUser?._id === u._id ? 'bg-emerald-600/20 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'hover:bg-white/5 border border-transparent'}`}>
                   <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u._id}`} className="w-12 h-12 rounded-full bg-white/5" alt="dp"/>
                <div className="flex-1 overflow-hidden">
                    <h4 className="text-sm font-bold text-white truncate">{u.username}</h4>
                    <p className={`text-[9px] uppercase tracking-widest mt-1 font-black ${u.role === 'lyricist' ? 'text-emerald-500' : u.role === 'producer' ? 'text-blue-500' : 'text-purple-500'}`}>{u.role}</p>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* RIGHT PANE: PORTFOLIO & DM CHAT */}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] relative">
        {selectedUser ? (
          <div className="flex-1 flex overflow-hidden relative z-10">
                
                {/* MIDDLE: ARTIST PORTFOLIO */}
                <div className="w-72 border-r border-white/5 bg-[#050505]/40 p-6 flex flex-col">
                    <div className="text-center mb-6 border-b border-white/5 pb-6">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser._id}`} className="w-20 h-20 rounded-full mx-auto border-2 border-emerald-500/50 mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]" alt="dp"/>
                        <h3 className="text-lg font-serif italic text-white">{selectedUser.username}</h3>
                        <span className="bg-white/5 px-3 py-1 rounded-full text-[8px] uppercase tracking-widest text-neutral-400 mt-2 inline-block">Artist Portfolio</span>
                    </div>

                    <p className="text-[10px] uppercase text-emerald-500 font-black mb-4">Public Uploads</p>
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {userPortfolio.length > 0 ? userPortfolio.map(track => (
                            <div key={track._id} className="flex justify-between bg-white/5 p-3 rounded-xl items-center border border-white/5 hover:border-emerald-500/30 transition-all">
                                <div className="overflow-hidden pr-2">
                                    <h4 className="text-xs text-white truncate w-28 font-bold">{track.title}</h4>
                                    <p className="text-[8px] uppercase tracking-widest text-neutral-500 mt-1">{track.trackType}</p>
                                </div>
                                <button onClick={() => togglePlay(track._id)} className="text-emerald-400 w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all">
                                    {playingTrackId === track._id ? '⏸' : '▶'}
                                </button>
                                {playingTrackId === track._id && track.audioUrl && <audio src={track.audioUrl} autoPlay onEnded={() => setPlayingTrackId(null)} className="hidden" />}
                            </div>
                        )) : (
                            <div className="text-xs text-neutral-600 italic text-center mt-5">No tracks uploaded yet.</div>
                        )}
                    </div>
                </div>

                {/* THE WHATSAPP-STYLE DM WINDOW */}
                <div className="flex-1 flex flex-col relative">
                    <div className="h-16 border-b border-white/5 bg-[#050505]/80 flex items-center px-8 z-20 backdrop-blur-md">
                        <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                {selectedUser.username}
                            </h4>
                            <p className="text-[8px] text-neutral-500 uppercase tracking-widest mt-0.5">End-to-end Encrypted Direct Line</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4 custom-scrollbar">
                        {chatMessages.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
                              <span className="text-4xl mb-4">💬</span>
                              <span className="text-[10px] uppercase tracking-widest font-black text-center">Start a conversation with {selectedUser.username}</span>
                          </div>
                        ) : (
                          chatMessages.map((msg: any, i: number) => {
                            const isMe = String(msg.senderId) === String(safeUserId);
                            return (
                              <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] p-3 px-5 rounded-2xl ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-[#1a1a1a] border border-white/5 text-white rounded-tl-sm shadow-md'}`}>
                                  {/* whitespace-pre-wrap ensures multi-line lyrics format correctly */}
                                  <p className="text-sm font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                  <p className={`text-[8px] mt-1 text-right tracking-widest font-bold opacity-70`}>{msg.timestamp}</p>
                                </div>
                              </div>
                            )
                          })
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    
                    {/* 🔥 CHAT INPUT WITH AI BUTTON 🔥 */}
                    <div className="p-4 bg-[#050505]/90 border-t border-white/5 flex flex-col gap-3 backdrop-blur-md">
                       {/* AI Spark Button Row */}
                       <div className="flex justify-start">
                           <button 
                                onClick={triggerAIGhostwriter} 
                                disabled={isAiLoading}
                                className="flex items-center gap-2 px-3 py-1 bg-emerald-600/10 border border-emerald-500/50 text-emerald-400 rounded-full text-[9px] uppercase tracking-widest font-black hover:bg-emerald-600 hover:text-white transition-all disabled:opacity-50"
                           >
                               {isAiLoading ? 'Generating Bars...' : '✨ Spark AI Lyrics'}
                           </button>
                       </div>
                       
                       {/* Input Row */}
                       <div className="flex gap-4 items-end">
                           <textarea 
                             placeholder={`Message ${selectedUser.username}...`} 
                             value={replyText} 
                             onChange={(e) => setReplyText(e.target.value)} 
                             onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} 
                             className="flex-1 bg-white/5 rounded-2xl p-3 text-sm text-white outline-none focus:border-emerald-500 border border-transparent transition-all resize-none custom-scrollbar min-h-[44px] max-h-32" 
                             rows={1}
                           />
                           <button onClick={handleSendMessage} className="w-11 h-11 bg-emerald-600 rounded-full text-white hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all active:scale-95 flex items-center justify-center text-lg mb-0.5">↑</button>
                       </div>
                    </div>
                </div>
            </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-30 text-2xl font-serif italic text-white drop-shadow-2xl select-none">
             <span className="text-6xl mb-6">🌐</span>
             Select an Artist from the Network
          </div>
        )}
      </div>
    </div>
  );
}