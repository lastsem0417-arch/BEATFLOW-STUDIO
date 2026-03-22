import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import axios from 'axios';
import gsap from 'gsap';

export default function CollabLobby({ onEnterRoom }: { onEnterRoom?: (roomId: string, role: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Safe parsing for User data and Token
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{"username": "Guest", "role": "listener", "token": ""}');
  const myRole = user.role?.toLowerCase() || 'listener';

  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState<{ isOpen: boolean, room: any | null }>({ isOpen: false, room: null });
  
  // Form States
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPasscode, setNewRoomPasscode] = useState('');
  const [joinPasscode, setJoinPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 DYNAMIC PREMIUM LIGHT THEME ENGINE 🔥
  const getTheme = () => {
    switch(myRole) {
      case 'producer': return { bg: 'transparent', card: '#FFFFFF', text: '#001433', accent: '#D4AF37', glow: 'rgba(212,175,55,0.2)' }; // Navy & Gold
      case 'rapper': return { bg: 'transparent', card: '#FFFFFF', text: '#111111', accent: '#E63946', glow: 'rgba(230,57,70,0.2)' }; // Charcoal & Red
      case 'lyricist': return { bg: 'transparent', card: '#FFFFFF', text: '#0A2F1D', accent: '#10B981', glow: 'rgba(16,185,129,0.2)' }; // Dark Green & Emerald
      default: return { bg: 'transparent', card: '#FFFFFF', text: '#0A1128', accent: '#6B7AE5', glow: 'rgba(107,122,229,0.2)' }; // Navy & Blue
    }
  };
  const theme = getTheme();

  // 🌐 FETCH ACTIVE ROOMS FROM BACKEND 🌐
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Hit your backend route (You need to create this in your Node.js)
        const res = await axios.get('http://localhost:5000/api/collab/rooms', config);
        setRooms(res.data || []);
      } catch (err) {
        console.error("Error fetching rooms from DB. Please ensure backend route exists.", err);
        // Fallback clear if backend fails
        setRooms([]); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, [user.token]);

  // GSAP Entry Animations
  useLayoutEffect(() => {
    if (isLoading) return;
    let ctx = gsap.context(() => {
      gsap.fromTo('.lobby-header', { opacity: 0, y: -30 }, { opacity: 1, y: 0, duration: 1, ease: 'power3.out' });
      const cards = gsap.utils.toArray('.room-card');
      if (cards.length > 0) {
        gsap.fromTo(cards, { opacity: 0, scale: 0.95, y: 40 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)' });
      }
    }, containerRef);
    return () => ctx.revert();
  }, [rooms, isLoading]);

  // 🟢 CREATE ROOM TO BACKEND 🟢
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoomName.length < 3 || newRoomPasscode.length !== 6) {
      setErrorMsg("Name needs 3+ chars & Passcode must be exactly 6 digits.");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = {
        name: newRoomName,
        passcode: newRoomPasscode,
        creatorRole: myRole
      };

      // Create room in Database
      const res = await axios.post('http://localhost:5000/api/collab/rooms', payload, config);
      
      const newlyCreatedRoom = res.data;
      setRooms([newlyCreatedRoom, ...rooms]); // Add to top of list
      
      setShowCreateModal(false);
      setNewRoomName('');
      setNewRoomPasscode('');
      
      alert(`System: Secure Room Minted! You are Admin. Code: ${newRoomPasscode}`);
      if (onEnterRoom) onEnterRoom(newlyCreatedRoom._id, 'admin');

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Server Error. Failed to create room.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔴 JOIN ROOM VIA BACKEND AUTH 🔴
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (joinPasscode.length !== 6) {
      setErrorMsg("Passcode must be exactly 6 digits.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Send passcode to backend for verification
      const res = await axios.post('http://localhost:5000/api/collab/rooms/join', {
        roomId: showJoinModal.room?._id,
        passcode: joinPasscode
      }, config);

      if (res.data.success) {
        setShowJoinModal({ isOpen: false, room: null });
        setJoinPasscode('');
        alert(`System: Authentication Complete. Entering [${showJoinModal.room?.name}]`);
        if (onEnterRoom) onEnterRoom(showJoinModal.room?._id, 'participant');
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || "Access Denied: Invalid Passcode.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role?.toLowerCase() || 'creator';
    if (r === 'producer') return <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black border border-[#D4AF37]/30 text-[#D4AF37] bg-[#D4AF37]/5">Producer</span>;
    if (r === 'rapper') return <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black border border-[#E63946]/30 text-[#E63946] bg-[#E63946]/5">Rapper</span>;
    return <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-black border border-[#10B981]/30 text-[#10B981] bg-[#10B981]/5">{role}</span>;
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] select-none">
         <div className="w-12 h-12 rounded-full border-[3px] border-[#111111]/10 animate-spin mb-6" style={{ borderTopColor: theme.accent }}></div>
         <span className="text-[10px] uppercase font-mono tracking-[0.4em] font-black opacity-50">Syncing Network...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full min-h-full font-sans select-none relative overflow-hidden" style={{ backgroundColor: theme.bg, color: theme.text }}>
      
      {/* Subtle Background Accent Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] blur-[150px] rounded-full pointer-events-none opacity-10 -z-10" style={{ backgroundColor: theme.accent }}></div>

      {/* --- HEADER --- */}
      <div className="lobby-header flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-16 px-2">
         <div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">Sync <span className="font-serif italic" style={{ color: theme.accent }}>Forge.</span></h1>
            <p className="text-xs font-mono uppercase tracking-[0.4em] font-black opacity-40 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.accent }}></span> Live Collaboration Network
            </p>
         </div>

         <button 
           onClick={() => setShowCreateModal(true)}
           className="px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-3 text-white"
           style={{ backgroundColor: theme.accent, boxShadow: `0 15px 30px ${theme.glow}` }}
         >
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
           Initialize Session
         </button>
      </div>

      {/* --- ACTIVE ROOMS GRID --- */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-[3rem] text-center" style={{ borderColor: `${theme.text}20`, backgroundColor: theme.card }}>
           <span className="text-5xl mb-6 opacity-30 grayscale">🎙️</span>
           <h3 className="text-2xl font-serif italic mb-2">Network is silent.</h3>
           <p className="text-[10px] font-mono uppercase tracking-[0.3em] font-black opacity-40">Initialize a session to begin transmitting.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {rooms.map((room: any) => (
            <div 
              key={room._id} 
              onClick={() => setShowJoinModal({ isOpen: true, room })}
              className="room-card p-8 rounded-[2rem] border transition-all duration-500 group cursor-pointer hover:-translate-y-2 relative overflow-hidden"
              style={{ backgroundColor: theme.card, borderColor: `${theme.text}10`, boxShadow: `0 15px 40px rgba(0,0,0,0.03)` }}
            >
               <div className="absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: theme.accent }}></div>
               
               <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="w-12 h-12 rounded-[1rem] flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: `${theme.text}05`, color: theme.accent }}>
                     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z"></path></svg>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-white shadow-sm" style={{ borderColor: `${theme.text}10` }}>
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                     <span className="text-[9px] font-mono font-black opacity-60">SECURE</span>
                  </div>
               </div>

               <h3 className="text-2xl font-serif italic tracking-tight mb-2 relative z-10 group-hover:text-opacity-80 transition-opacity truncate" style={{ color: theme.text }}>{room.name}</h3>
               
               <div className="flex items-center justify-between mt-8 relative z-10 pt-6 border-t" style={{ borderColor: `${theme.text}05` }}>
                  <div className="flex flex-col gap-1.5 w-[70%]">
                     <p className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-40 font-bold">Created By</p>
                     <div className="flex items-center gap-2 overflow-hidden w-full">
                       <span className="font-bold text-sm tracking-tight truncate max-w-[100px]">{room.creatorName || room.creator}</span>
                       {getRoleBadge(room.creatorRole)}
                     </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                     <p className="text-[9px] font-mono uppercase tracking-[0.3em] opacity-40 font-bold">Members</p>
                     <div className="flex items-center gap-1.5" style={{ color: theme.accent }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        <span className="text-sm font-black font-mono">{room.headcount || 1}</span>
                     </div>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* 🟢 CREATE ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[9999] bg-[#111]/40 backdrop-blur-md flex items-center justify-center p-4">
           <div className="w-full max-w-md rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border shadow-2xl animate-in zoom-in duration-300" style={{ backgroundColor: theme.card, borderColor: `${theme.text}10`, color: theme.text }}>
              
              <button disabled={isSubmitting} onClick={() => {setShowCreateModal(false); setErrorMsg('');}} className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity bg-black/5 p-2 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <h2 className="text-3xl font-black mb-2 tracking-tight">Initialize Room</h2>
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mb-8 font-bold">Admin Privileges Granted</p>

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Session Name</label>
                    <input 
                      type="text" required maxLength={30} disabled={isSubmitting}
                      value={newRoomName} onChange={e => setNewRoomName(e.target.value)}
                      placeholder="e.g. Studio Cookup"
                      className="w-full bg-[#F4F5F7] border border-[#111]/5 rounded-xl p-4 text-sm font-bold outline-none transition-all disabled:opacity-50"
                      style={{ focusRingColor: theme.accent }}
                    />
                 </div>

                 <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-50">Set 6-Digit Passcode</label>
                    <input 
                      type="text" required maxLength={6} pattern="\d{6}" disabled={isSubmitting}
                      value={newRoomPasscode} onChange={e => setNewRoomPasscode(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full bg-[#F4F5F7] border border-[#111]/5 rounded-xl p-4 text-2xl font-mono tracking-[1em] text-center font-black outline-none transition-all placeholder:tracking-normal disabled:opacity-50"
                    />
                 </div>

                 {errorMsg && <p className="text-xs text-red-500 font-bold text-center bg-red-50 p-2 rounded-lg">{errorMsg}</p>}

                 <button disabled={isSubmitting} type="submit" className="w-full py-4 mt-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-transform active:scale-95 text-white shadow-lg disabled:opacity-50 flex items-center justify-center" style={{ backgroundColor: theme.accent, boxShadow: `0 10px 20px ${theme.glow}` }}>
                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Generate & Enter'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* 🔴 JOIN ROOM MODAL */}
      {showJoinModal.isOpen && (
        <div className="fixed inset-0 z-[9999] bg-[#111]/40 backdrop-blur-md flex items-center justify-center p-4">
           <div className="w-full max-w-sm rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden border shadow-2xl animate-in zoom-in duration-300" style={{ backgroundColor: theme.card, borderColor: `${theme.text}10`, color: theme.text }}>
              
              <button disabled={isSubmitting} onClick={() => {setShowJoinModal({isOpen: false, room: null}); setErrorMsg('');}} className="absolute top-6 right-6 opacity-40 hover:opacity-100 transition-opacity bg-black/5 p-2 rounded-full">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <div className="w-16 h-16 rounded-[1rem] flex items-center justify-center mb-6 mx-auto bg-black/5" style={{ color: theme.accent }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>

              <h2 className="text-2xl font-serif italic mb-1 text-center truncate px-4">{showJoinModal.room?.name}</h2>
              <p className="text-[9px] font-mono uppercase tracking-widest opacity-40 mb-8 text-center font-bold">Authentication Required</p>

              <form onSubmit={handleJoinRoom} className="flex flex-col gap-6">
                 <input 
                   type="text" required maxLength={6} pattern="\d{6}" disabled={isSubmitting}
                   value={joinPasscode} onChange={e => setJoinPasscode(e.target.value.replace(/\D/g, ''))}
                   placeholder="000000" autoFocus
                   className="w-full bg-[#F4F5F7] border-2 border-transparent focus:border-current rounded-2xl p-4 text-3xl font-mono tracking-[0.5em] text-center font-black outline-none transition-all placeholder:opacity-20 disabled:opacity-50"
                 />

                 {errorMsg && <p className="text-xs text-red-500 font-bold text-center bg-red-50 py-2 rounded-lg">{errorMsg}</p>}

                 <button disabled={isSubmitting} type="submit" className="w-full py-4 mt-2 rounded-xl font-black uppercase tracking-widest text-[10px] transition-transform active:scale-95 text-white shadow-lg flex items-center justify-center" style={{ backgroundColor: theme.text }}>
                    {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Authenticate & Join'}
                 </button>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}