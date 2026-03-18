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

  // 🔥 THE PREMIUM GLASSMORPHIC DRAWER 🔥
  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end font-sans select-none">
      
      {/* Background Overlay (Dark cinematic fade) */}
      <div 
        className="absolute inset-0 bg-[#010101]/60 backdrop-blur-sm transition-opacity duration-500 animate-in fade-in" 
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Slide-out Drawer */}
      <div className="relative w-full md:w-[450px] h-full bg-[#030305]/95 backdrop-blur-3xl border-l border-white/5 flex flex-col shadow-[-30px_0_60px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-500 ease-out">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#6366F1]/5 blur-[100px] rounded-full pointer-events-none -z-10"></div>

        {/* 🎩 Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-transparent relative z-10 shrink-0">
          <div>
             <h3 className="text-2xl font-serif italic text-[#F0F0EB] tracking-tight">System Alerts<span className="text-[#6366F1]">.</span></h3>
             <p className="text-[9px] uppercase tracking-[0.4em] text-[#888888] font-black mt-1 font-mono">Live Network Activity</p>
          </div>
          
          <button 
            onClick={() => setIsOpen(false)} 
            className="w-12 h-12 rounded-full border border-white/10 bg-[#010101] flex items-center justify-center text-[#888888] hover:text-[#F0F0EB] hover:bg-white/5 hover:border-white/30 transition-all duration-300 active:scale-95 group shadow-inner"
            title="Close Panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-90 transition-transform duration-500"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {/* 📜 Notifications List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar" data-lenis-prevent="true">
          
          {/* EMPTY STATE */}
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center opacity-40">
               <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center mb-6 bg-[#010101] shadow-inner relative">
                  <div className="absolute inset-0 rounded-full border border-white/5 animate-[ping_3s_infinite]"></div>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#888888]"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
               </div>
               <h3 className="text-xl font-serif italic text-[#F0F0EB] mb-2">No active signals</h3>
               <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-[#888888] text-center leading-relaxed">The network is currently quiet.<br/>Transmit assets to generate activity.</p>
            </div>
          ) : (
            
            // ALERT CARDS
            notifications.map((notif: any) => {
              const avatarSrc = notif.sender?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${notif.sender?.username || 'User'}&backgroundColor=transparent`;
              const isUnread = !notif.isRead;
              
              return (
                <div 
                  key={notif._id} 
                  className={`p-5 rounded-[1.5rem] flex items-start gap-5 transition-all duration-500 cursor-pointer group border ${isUnread ? 'bg-[#6366F1]/10 border-[#6366F1]/30 shadow-[0_10px_30px_rgba(99,102,241,0.15)] hover:border-[#6366F1]/50 hover:-translate-y-1' : 'bg-[#010101] border-white/5 hover:border-white/20 hover:-translate-y-1'}`}
                  onClick={() => {
                    setIsOpen(false);
                    if(notif.type === 'follow') navigate(`/profile/${notif.sender._id}`);
                  }}
                >
                  {/* Sender Avatar */}
                  <div 
                    className={`w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 bg-[#010101] shadow-inner transition-colors duration-500 ${isUnread ? 'border-[#6366F1]/80 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'border-[#030305] group-hover:border-white/30'}`}
                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`); setIsOpen(false); }}
                  >
                    <img src={avatarSrc} alt="avt" className={`w-full h-full scale-110 object-cover ${isUnread ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'} transition-all duration-500`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#888888] font-light leading-relaxed">
                      <span 
                        className="font-bold text-[#F0F0EB] cursor-pointer hover:underline underline-offset-4 transition-all mr-1" 
                        onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`); setIsOpen(false); }}
                      >
                        {notif.sender?.username}
                      </span>
                      
                      {notif.type === 'like' && 'amplified your transmission '}
                      {notif.type === 'follow' && 'initiated a network sync with you.'}
                      {notif.type === 'comment' && 'left feedback on your asset: '}
                      
                      {notif.post && <span className="font-serif italic text-[#F0F0EB] ml-1 transition-colors">"{notif.post.title}"</span>}
                    </p>
                    
                    {/* Comment Block */}
                    {notif.type === 'comment' && notif.text && (
                      <div className="mt-3 p-4 rounded-xl bg-[#030305] border border-white/5 text-[11px] text-[#F0F0EB] italic leading-relaxed shadow-inner font-serif border-l-2 border-l-[#6366F1]/50">
                        "{notif.text}"
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <span className="text-[8px] text-[#6366F1] font-mono mt-4 block uppercase tracking-[0.3em] font-black">
                      {new Date(notif.createdAt).toLocaleDateString()} <span className="text-white/20 mx-1">•</span> {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 🔔 THE TRIGGER BUTTON (In Header) */}
      <button 
        onClick={handleOpenDrawer}
        className="relative w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#010101]/80 backdrop-blur-md border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#F0F0EB] hover:border-[#6366F1]/50 hover:bg-[#6366F1]/10 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all duration-500 group active:scale-95 shadow-inner"
        title="System Alerts"
      >
        {/* Premium SVG Bell */}
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-12 transition-transform duration-300">
           <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
           <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        
        {/* Neon Unread Dot */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#6366F1] rounded-full border-[2.5px] border-[#030305] animate-pulse shadow-[0_0_10px_#6366F1]"></span>
        )}
      </button>

      {/* 🚀 THE PORTAL */}
      {isOpen && createPortal(drawerContent, document.body)}
    </>
  );
}