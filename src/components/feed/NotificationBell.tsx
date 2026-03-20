import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  
  const loggedInUser = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');

  const fetchNotifications = async () => {
    if (!loggedInUser.token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${loggedInUser.token}` }
      });
      setNotifications(res.data);
      const unread = res.data.filter((n: any) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleOpenDrawer = async () => {
    setIsOpen(true);
    if (unreadCount > 0) {
      try {
        await axios.put('http://localhost:5000/api/notifications/mark-read', {}, {
          headers: { Authorization: `Bearer ${loggedInUser.token}` }
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Error marking read", err);
      }
    }
  };

  // 🔥 THE PREMIUM LIGHT-MODE GLASSMORPHIC DRAWER 🔥
  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end font-sans select-none text-[#111111]">
      
      {/* Background Overlay (Soft blur fade) */}
      <div 
        className="absolute inset-0 bg-[#111111]/30 backdrop-blur-md transition-opacity duration-700 animate-in fade-in" 
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Slide-out Drawer */}
      <div className="relative w-full md:w-[480px] h-full bg-[#F4F5F7]/95 backdrop-blur-3xl border-l border-white/50 flex flex-col shadow-[-40px_0_80px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#2563EB]/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>

        {/* 🎩 Header */}
        <div className="p-10 border-b border-[#111111]/5 flex items-center justify-between bg-white/50 relative z-10 shrink-0">
          <div>
             <h3 className="text-3xl font-serif italic text-[#111111] tracking-tight leading-none mb-2">Network Alerts</h3>
             <p className="text-[9px] uppercase tracking-[0.4em] text-[#111111]/40 font-black font-mono flex items-center gap-2">
               <span className="w-1.5 h-1.5 bg-[#2563EB] rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.4)]"></span> Live Activity
             </p>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="w-12 h-12 rounded-full border border-[#111111]/10 bg-white flex items-center justify-center text-[#111111]/40 hover:text-[#111111] hover:shadow-[0_10px_20px_rgba(0,0,0,0.05)] hover:border-[#111111]/20 transition-all duration-300 active:scale-95 group"
            title="Close Panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 📜 Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-5 custom-scrollbar" data-lenis-prevent="true">
          
          {/* EMPTY STATE */}
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-60">
               <div className="w-28 h-28 rounded-[2rem] border border-[#111111]/10 flex items-center justify-center mb-8 bg-white shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 rounded-[2rem] border border-[#2563EB]/20 animate-[ping_3s_infinite]"></div>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#111111]/30"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
               </div>
               <h3 className="text-2xl font-serif italic text-[#111111] mb-3">No Active Signals</h3>
               <p className="font-mono text-[9px] uppercase tracking-[0.3em] font-black text-[#111111]/40 text-center leading-relaxed">
                 The network is currently quiet.<br/>Transmit assets to generate activity.
               </p>
            </div>
          ) : (
            
            // ALERT CARDS
            notifications.map((notif: any) => {
              const avatarSrc = notif.sender?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender?.username || 'User'}&backgroundColor=transparent`;
              const isUnread = !notif.isRead;
              
              return (
                <div 
                  key={notif._id} 
                  className={`p-6 rounded-[2rem] flex items-start gap-6 transition-all duration-500 cursor-pointer group border ${isUnread ? 'bg-white border-[#2563EB]/20 shadow-[0_15px_30px_rgba(37,99,235,0.06)] hover:shadow-[0_20px_40px_rgba(37,99,235,0.1)] hover:-translate-y-1' : 'bg-white/50 border-[#111111]/5 hover:bg-white hover:border-[#111111]/10 hover:shadow-sm hover:-translate-y-1'}`}
                  onClick={() => {
                    setIsOpen(false);
                    if(notif.type === 'follow') navigate(`/profile/${notif.sender._id}`);
                  }}
                >
                  {/* Sender Avatar */}
                  <div 
                    className={`w-14 h-14 rounded-[1.2rem] overflow-hidden shrink-0 border bg-[#F4F5F7] shadow-inner transition-all duration-500 ${isUnread ? 'border-[#2563EB]/50' : 'border-[#111111]/10 group-hover:border-[#111111]/20'}`}
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`); setIsOpen(false); }}
                  >
                    <img src={avatarSrc} alt="avt" className={`w-full h-full object-cover scale-105 group-hover:scale-110 ${isUnread ? 'grayscale-0' : 'grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100'} transition-all duration-700`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="text-[13px] text-[#111111]/60 font-medium leading-relaxed">
                      <span 
                        className="font-bold text-[#111111] cursor-pointer hover:text-[#2563EB] transition-colors mr-1" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`); setIsOpen(false); }}
                      >
                        {notif.sender?.username}
                      </span>
                      
                      {notif.type === 'like' && 'amplified your transmission '}
                      {notif.type === 'follow' && 'initiated a network sync with you.'}
                      {notif.type === 'comment' && 'left feedback on your asset: '}
                      
                      {notif.post && <span className="font-serif italic text-[#111111] ml-1 transition-colors block mt-1">"{notif.post.title}"</span>}
                    </p>
                    
                    {/* Comment Block */}
                    {notif.type === 'comment' && notif.text && (
                      <div className="mt-4 p-5 rounded-2xl bg-[#F9F9FB] border border-[#111111]/5 text-xs text-[#111111]/80 italic leading-relaxed shadow-inner font-serif border-l-2 border-l-[#2563EB]/50">
                        "{notif.text}"
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <span className={`text-[8px] font-mono mt-4 block uppercase tracking-[0.3em] font-black ${isUnread ? 'text-[#2563EB]' : 'text-[#111111]/30'}`}>
                      {new Date(notif.createdAt).toLocaleDateString()} <span className="text-[#111111]/10 mx-1">•</span> {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #2563EB; }
      `}</style>
    </div>
  );

  return (
    <>
      {/* 🔔 THE TRIGGER BUTTON (In Header) */}
      <button 
        onClick={handleOpenDrawer}
        className="relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border border-[#111111]/10 flex items-center justify-center text-[#111111]/40 hover:text-[#111111] hover:border-[#2563EB]/50 hover:bg-[#2563EB]/5 hover:shadow-[0_10px_20px_rgba(37,99,235,0.15)] transition-all duration-500 group active:scale-95 shadow-sm"
        title="System Alerts"
      >
        {/* Premium SVG Bell */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-300">
           <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
           <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Neon Unread Dot */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-[#2563EB] rounded-full border-[2px] border-white animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.8)]"></span>
        )}
      </button>

      {/* 🚀 THE PORTAL */}
      {isOpen && createPortal(drawerContent, document.body)}
    </>
  );
}