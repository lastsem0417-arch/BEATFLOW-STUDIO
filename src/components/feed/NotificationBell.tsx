import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 🔥 THE MAGIC FIX
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

  // 🔥 DRAWER CONTENT JO PORTAL KE THROUGH RENDER HOGA 🔥
  const drawerContent = (
    <div className="fixed inset-0 z-[99999] flex justify-end">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={() => setIsOpen(false)}
      ></div>
      
      {/* Slide-out Drawer */}
      <div className="relative w-full md:w-[400px] h-full bg-[#0a0a0a] border-l border-white/10 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.9)] animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <h3 className="text-xl font-serif italic text-white">Live Activity</h3>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/20 transition-all">✕</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 opacity-50">
               <span className="text-4xl mb-4">📭</span>
               <p className="font-mono text-sm">No new alerts.</p>
               <p className="text-[10px] uppercase tracking-widest mt-2">Drop heat to get noticed.</p>
            </div>
          ) : (
            notifications.map((notif: any) => {
              const avatarSrc = notif.sender?.profileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${notif.sender?.username || 'User'}&backgroundColor=transparent`;
              
              return (
                <div 
                  key={notif._id} 
                  className={`p-4 rounded-2xl flex items-start gap-4 transition-all cursor-pointer ${notif.isRead ? 'bg-transparent hover:bg-white/[0.02]' : 'bg-emerald-500/10 border border-emerald-500/20'}`}
                  onClick={() => {
                    setIsOpen(false);
                    if(notif.type === 'follow') navigate(`/profile/${notif.sender._id}`);
                  }}
                >
                  {/* Sender Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[#111] overflow-hidden shrink-0 border border-white/10">
                    <img src={avatarSrc} alt="avt" className="w-full h-full scale-110 object-cover" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <p className="text-sm text-neutral-300 font-light leading-relaxed">
                      <span className="font-bold text-white cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); navigate(`/profile/${notif.sender._id}`); setIsOpen(false); }}>
                        {notif.sender?.username}
                      </span>
                      
                      {notif.type === 'like' && ' liked your drop '}
                      {notif.type === 'follow' && ' started following you! '}
                      {notif.type === 'comment' && ' commented on your drop: '}
                      
                      {notif.post && <span className="font-serif italic text-emerald-400">"{notif.post.title}"</span>}
                    </p>
                    
                    {notif.type === 'comment' && (
                      <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-neutral-400 italic">
                        "{notif.text}"
                      </div>
                    )}
                    
                    <span className="text-[9px] text-neutral-600 font-mono mt-3 block uppercase tracking-widest">
                      {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
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
      {/* 🔔 THE BELL ICON (Ye Header mein rahega) */}
      <button 
        onClick={handleOpenDrawer}
        className="relative w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🔔</span>
        
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-[#050505] animate-pulse"></span>
        )}
      </button>

      {/* 🚀 THE PORTAL (Ye HTML body ke end me render hoga, sabse upar!) */}
      {isOpen && createPortal(drawerContent, document.body)}
    </>
  );
}