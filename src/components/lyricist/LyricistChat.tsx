import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';

let socket: Socket;

export default function LyricistChat({ selectedUser, currentUser }: any) {
  const safeUserId = currentUser.id || currentUser._id;
  const [replyText, setReplyText] = useState("");
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const selectedUserRef = useRef(selectedUser);
  useEffect(() => { selectedUserRef.current = selectedUser; }, [selectedUser]);

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

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedUser) return;
      try {
        // 🔥 DM ROUTE USE KIYA HAI
        const res = await axios.get(`http://localhost:5000/api/chat/direct/${selectedUser._id}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` }
        });
        setChatMessages(res.data);
      } catch (err) {}
    };
    fetchChatHistory();
  }, [selectedUser, currentUser.token]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleSendReply = async () => {
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

  return (
    <div className="w-[320px] flex flex-col relative bg-[#020202] border-l border-white/5">
        <div className="h-20 border-b border-white/5 bg-[#050505] flex items-center px-6 z-20">
            <div>
                <h3 className="text-white font-serif italic text-md flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
                   {selectedUser.username}
                </h3>
                <p className="text-[8px] uppercase tracking-widest text-emerald-500 font-black mt-1">Direct Encrypted DM</p>
            </div>
        </div>

        {/* 🔥 FIX: data-lenis-prevent="true" add kiya taaki scroll hijack na ho 🔥 */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar bg-transparent" data-lenis-prevent="true">
            {chatMessages.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
                   <span className="text-3xl mb-2">💬</span>
                   <span className="text-[9px] uppercase tracking-widest font-bold">Say hi to {selectedUser.username}</span>
               </div>
            ) : (
              chatMessages.map((msg: any, i: number) => {
                const isMe = String(msg.senderId) === String(safeUserId);
                return (
                  <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#111] border border-white/10 text-white rounded-tl-sm'}`}>
                      {/* 🔥 Preserve whitespace for formatted lyrics injection */}
                      <p className="text-xs font-light leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-[7px] mt-1 text-right tracking-widest font-bold opacity-50`}>{msg.timestamp}</p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={chatEndRef} />
        </div>

        <div className="p-4 bg-[#050505] border-t border-white/5 flex gap-3">
            <input type="text" placeholder="Message..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendReply()} className="flex-1 bg-white/5 rounded-full px-4 text-xs text-white outline-none focus:border-emerald-500 border border-transparent transition-all" />
            <button onClick={handleSendReply} className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white hover:bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)] active:scale-95 transition-all">↑</button>
        </div>
    </div>
  );
}