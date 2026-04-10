import React, { useState, useEffect, useRef } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { jsPDF } from 'jspdf';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Collaborator {
  userId: string;
  username: string;
  role: string;
  split: number;
  hasSigned: boolean;
  color: string;
}

// 🔥 VITE ENV API URL FETCH 🔥
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SmartSplitter() {
  const user = JSON.parse(sessionStorage.getItem('beatflow_user') || '{}');
  const socketRef = useRef<Socket | null>(null);
  const activeRoomRef = useRef<string>('');
  
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [platformFee] = useState(20); 
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [contractId, setContractId] = useState<string | null>(null);
  const [contractStatus, setContractStatus] = useState<'draft' | 'pending' | 'completed'>('draft');
  const [isOwner, setIsOwner] = useState(false); 
  const [contractInitiator, setContractInitiator] = useState<string>(''); 

  useEffect(() => {
    activeRoomRef.current = selectedRoomId;
  }, [selectedRoomId]);

  useEffect(() => {
    // 🚨 FIX: Socket Connection Dynamic URL
    socketRef.current = io(BACKEND_URL);

    const fetchRealRooms = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // 🚨 FIX: Axios Dynamic URL
        const res = await axios.get(`${BACKEND_URL}/api/collab/rooms`, config);
        
        const dbRooms = Array.isArray(res.data) ? res.data : [];
        const formattedProjects = dbRooms.map(r => ({
          id: r.roomId || r._id,
          name: r.name || `Session: ${(r.roomId || r._id).substring(0,8)}`, 
          tracks: r.canvasTracks || [],
          creatorId: r.creatorId,
          creatorName: r.creatorName
        }));
        
        setProjects(formattedProjects);
      } catch (err) { console.error("Error fetching real rooms:", err); }
    };
    
    fetchRealRooms();

    socketRef.current.on('contract-updated', (contract) => {
      if (contract.roomId === activeRoomRef.current) {
        setContractId(contract._id);
        setCollaborators(contract.collaborators);
        setContractStatus(contract.status);
        setContractInitiator(contract.initiator);
        
        if (contract.initiator === user.username) {
          setIsOwner(true);
        }
      }
    });

    return () => { socketRef.current?.disconnect(); };
  }, [user.token]);

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    setSelectedRoomId(roomId);
    setContractId(null);
    setContractStatus('draft');

    if (!roomId) {
      setCollaborators([]);
      setIsOwner(false);
      setContractInitiator('');
      return;
    }

    const proj = projects.find(p => (p.id || p.roomId) === roomId);
    
    if (proj) {
      const currentUserId = String(user.id || user._id || '').trim();
      const currentUsername = String(user.username || '').trim().toLowerCase();
      
      const projCreatorId = String(proj.creatorId || '').trim();
      const projCreatorName = String(proj.creatorName || '').trim().toLowerCase();

      let amIOwner = false;
      if (projCreatorId && projCreatorId === currentUserId) amIOwner = true;
      else if (projCreatorName && projCreatorName === currentUsername) amIOwner = true;
      else if (!projCreatorId && (!projCreatorName || projCreatorName === 'architect')) amIOwner = true;

      setIsOwner(amIOwner);
      setContractInitiator(proj.creatorName || 'Owner');

      const uniqueArtists = new Map();
      uniqueArtists.set(user.username, {
        userId: user.id || user._id,
        username: user.username,
        role: user.role || 'Creator',
        split: 0, hasSigned: false, color: '#E63946'
      });

      proj.tracks.forEach((track: any) => {
        if (track.owner && !uniqueArtists.has(track.owner)) {
          uniqueArtists.set(track.owner, {
            userId: track.owner + '_id',
            username: track.owner,
            role: track.type === 'vocal' ? 'Rapper' : 'Artist',
            split: 0, hasSigned: false, color: '#' + Math.floor(Math.random()*16777215).toString(16)
          });
        }
      });

      const collabArray = Array.from(uniqueArtists.values());
      const baseSplit = Math.floor(80 / collabArray.length);
      const remainder = 80 - (baseSplit * collabArray.length);
      
      collabArray.forEach((c, index) => {
         c.split = baseSplit + (index === 0 ? remainder : 0); 
      });

      setCollaborators(collabArray);
    }
    
    socketRef.current?.emit('fetch-contract', roomId);
  };

  const totalAllocated = collaborators.reduce((sum, c) => sum + c.split, 0) + platformFee;
  const remainingSplit = 100 - totalAllocated;

  const handleSplitChange = (userIdToChange: string, newSplit: number) => {
    if (contractStatus !== 'draft' || !isOwner) return; 
    
    setCollaborators(prev => prev.map(c => {
      if (c.userId === userIdToChange) {
        return { ...c, split: newSplit };
      }
      return c;
    }));
  };

  const generateContract = () => {
    if (!isOwner) return alert("Only the session owner can propose the contract.");
    if (remainingSplit !== 0) return alert(`Please balance the splits. Remaining must be 0% (Currently ${remainingSplit}%)`);
    
    const projName = projects.find(p => p.id === selectedRoomId)?.name || 'Unknown Project';
    
    const contractPayload = {
      roomId: selectedRoomId,
      projectName: projName,
      initiator: user.username,
      collaborators: collaborators,
      status: 'pending'
    };

    socketRef.current?.emit('generate-contract', contractPayload);
  };

  const signContract = () => {
    if (!contractId) return;
    const myId = user.id || user._id;
    socketRef.current?.emit('sign-contract', { 
      contractId, 
      userId: myId,
      username: user.username 
    });
  };

  const downloadPDF = () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const projName = projects.find(p => p.id === selectedRoomId)?.name || 'Unknown Project';

      // Header
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(28); pdf.setTextColor(17, 17, 17);
      pdf.text("BeatFlow", 20, 25);
      pdf.setFont("helvetica", "italic"); pdf.setFontSize(16); pdf.setTextColor(212, 175, 55);
      pdf.text("Master Split Agreement", 20, 35);
      
      // Doc ID
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(150, 150, 150);
      pdf.text("DOCUMENT ID:", 140, 25);
      pdf.setFont("helvetica", "bold"); pdf.setTextColor(17, 17, 17);
      pdf.text((contractId || "UNKNOWN").substring(0,12).toUpperCase(), 140, 31);
      
      // Line
      pdf.setDrawColor(220, 220, 220); pdf.setLineWidth(0.5); pdf.line(20, 42, 190, 42);
      
      // Metadata
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(150, 150, 150);
      pdf.text("PROJECT SESSION", 20, 55);
      pdf.setTextColor(17, 17, 17);
      pdf.text(projName.toUpperCase(), 20, 62);
      
      pdf.setTextColor(150, 150, 150);
      pdf.text("DATE OF EXECUTION", 140, 55);
      pdf.setTextColor(17, 17, 17);
      pdf.text(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 140, 62);
      
      // Declaration
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(80, 80, 80);
      const text = "This document serves as a legally binding Smart Split Agreement generated automatically via the BeatFlow platform. All parties listed below have cryptographically and electronically verified their consent to the royalty distributions specified herein. Revenue generated from the masters originating from this session will be autonomously distributed based on these exact percentages.";
      pdf.text(pdf.splitTextToSize(text, 170), 20, 78);
      
      // Table Header
      pdf.setFillColor(17, 17, 17); pdf.rect(20, 105, 170, 10, 'F');
      pdf.setFont("helvetica", "bold"); pdf.setTextColor(255, 255, 255);
      pdf.text("COLLABORATOR", 25, 112); pdf.text("ROLE", 90, 112); pdf.text("SPLIT %", 130, 112); pdf.text("SIGNATURE", 160, 112);
      
      // Table Content
      let y = 130;
      collaborators.forEach((c) => {
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(17, 17, 17);
        pdf.text(c.username, 25, y);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(100, 100, 100);
        pdf.text(c.role.toUpperCase(), 90, y);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(17, 17, 17);
        pdf.text(c.split + "%", 130, y);
        
        if (c.hasSigned) {
          pdf.setTextColor(34, 197, 94); pdf.setFontSize(9);
          pdf.text("Verified Digital Sign", 160, y - 2);
          pdf.setFont("helvetica", "italic"); pdf.text(c.username, 160, y + 3);
        } else {
          pdf.setTextColor(249, 115, 22); pdf.setFont("helvetica", "bold"); pdf.setFontSize(9);
          pdf.text("Pending Signature", 160, y);
        }
        
        pdf.setDrawColor(240, 240, 240); pdf.line(20, y + 8, 190, y + 8);
        y += 18;
      });

      // Platform Fee
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(17, 17, 17);
      pdf.text("BeatFlow Protocol", 25, y);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(10); pdf.setTextColor(100, 100, 100);
      pdf.text("PLATFORM", 90, y);
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(12); pdf.setTextColor(17, 17, 17);
      pdf.text(platformFee + "%", 130, y);
      pdf.setTextColor(34, 197, 94); pdf.setFontSize(9);
      pdf.text("Auto-Deducted", 160, y);
      
      // Footer
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(8); pdf.setTextColor(150, 150, 150);
      pdf.text("Generated securely by BeatFlow Core System", 20, 285);
      
      pdf.save(`BeatFlow_Master_Agreement_${(contractId || "ID").substring(0,6).toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF Native Gen Failed:", err);
      alert("Failed to generate PDF. Check console.");
    }
  };

  const chartData = {
    labels: [...collaborators.map(c => c.username), 'BeatFlow Fee'],
    datasets: [{
      data: [...collaborators.map(c => c.split), platformFee],
      backgroundColor: [...collaborators.map(c => c.color), '#111111'],
      borderWidth: 0, hoverOffset: 10,
    }],
  };

  const myRecord = collaborators.find(c => c.userId === (user.id || user._id) || c.username === user.username);

  return (
    <div className="w-full bg-[#F4F3EF] p-6 lg:p-10 rounded-[3rem] border border-[#111]/5 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
      
      {/* --- 📊 LEFT PANE: DATA & CHART --- */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:sticky lg:top-10">
        <div className="w-full mb-10">
           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111]/50 mb-2 block">Select Room/Project</label>
           <select 
             className="w-full bg-white border border-[#111]/10 rounded-xl p-4 text-sm font-bold text-[#111] outline-none shadow-sm focus:border-[#D4AF37]"
             onChange={handleProjectSelect} value={selectedRoomId}
           >
             <option value="">-- Choose your Collab Workspace --</option>
             {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
           </select>
        </div>

        {selectedRoomId ? (
          <div className="w-[300px] h-[300px] relative drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)]">
             <Pie data={chartData} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 text-[#111]">Status</span>
                <span className={`text-2xl font-serif italic mt-1 ${contractStatus === 'completed' ? 'text-green-600' : contractStatus === 'pending' ? 'text-orange-500' : 'text-[#111]'}`}>
                  {contractStatus.toUpperCase()}
                </span>
             </div>
          </div>
        ) : (
          <div className="w-[300px] h-[300px] rounded-full border-4 border-dashed border-[#111]/10 flex items-center justify-center text-[#111]/30">
            <span className="text-[10px] font-mono uppercase tracking-widest text-center px-10">Select project to visualize</span>
          </div>
        )}
        
        {selectedRoomId && (
          <div className="mt-10 flex flex-wrap justify-center gap-4">
             {collaborators.map(c => (
               <div key={c.userId} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-[#111]/5">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }}></div>
                 <span className="text-[9px] font-black uppercase">{c.username} ({c.split}%)</span>
               </div>
             ))}
             <div className="flex items-center gap-2 bg-[#111] px-4 py-2 rounded-full shadow-sm">
               <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
               <span className="text-[9px] font-black uppercase text-white">Platform (20%)</span>
             </div>
          </div>
        )}
      </div>

      {/* --- ⚙️ RIGHT PANE: CONTROLS & CONTRACT --- */}
      <div className="w-full lg:flex-1 bg-white p-8 lg:p-10 rounded-[2.5rem] shadow-xl border border-[#111]/5 flex flex-col relative">
        
        {!selectedRoomId ? (
          <div className="flex flex-col items-center justify-center opacity-40 py-20">
             <span className="text-6xl mb-4 grayscale">📝</span>
             <h2 className="text-2xl font-serif italic">Awaiting Project</h2>
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-end mb-8">
                <div>
                  <h2 className="text-3xl font-serif italic text-[#111] mb-1">Split Settings</h2>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#111]/40">
                    {isOwner ? "Adjust contributor royalties" : "Only the session creator can adjust splits"}
                  </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors ${remainingSplit === 0 ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200 animate-pulse'}`}>
                  Remaining: {remainingSplit}%
                </div>
              </div>
              
              <div className="space-y-6 w-full">
                {collaborators.map(collab => (
                  <div key={collab.userId} className="p-5 rounded-2xl bg-[#F9F8F6] border border-[#111]/5">
                    <div className="flex justify-between mb-4 items-end">
                      <div>
                        <span className="text-xs font-black uppercase text-[#111] flex items-center gap-2 mb-1">
                          <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: collab.color }}></div>
                          {collab.username} {collab.username === user.username ? '(You)' : ''}
                        </span>
                        <span className="text-[9px] font-mono text-[#111]/50 uppercase tracking-widest">{collab.role}</span>
                      </div>
                      <span className="text-2xl font-serif italic" style={{ color: collab.color }}>{collab.split}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="80" value={collab.split} 
                      onChange={(e) => handleSplitChange(collab.userId, parseInt(e.target.value))}
                      disabled={contractStatus !== 'draft' || !isOwner} 
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${contractStatus !== 'draft' || !isOwner ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={{ accentColor: collab.color, backgroundColor: '#E5E5E5' }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* --- 📝 DIGITAL CONTRACT PREVIEW --- */}
            <div className={`mt-10 p-6 rounded-2xl border-2 border-dashed transition-all duration-500 ${contractStatus !== 'draft' ? 'bg-[#F4F3EF] border-[#111]/20' : 'bg-transparent border-transparent'}`}>
              
              {contractStatus === 'draft' ? (
                 isOwner ? (
                    <button 
                      onClick={generateContract} disabled={remainingSplit !== 0}
                      className="w-full py-4 rounded-xl bg-[#111] text-white text-[10px] font-black uppercase tracking-widest transition-all hover:bg-[#D4AF37] disabled:opacity-40 disabled:hover:bg-[#111] shadow-lg"
                    >
                      Lock Splits & Propose Contract
                    </button>
                 ) : (
                    <div className="text-center py-4 px-6 bg-gray-50 rounded-xl border border-gray-100">
                       <p className="text-[10px] font-bold uppercase text-gray-400 tracking-widest animate-pulse">
                          Waiting for Owner ({contractInitiator || "Creator"}) to propose splits...
                       </p>
                    </div>
                 )
              ) : (
                 <div className="animate-in fade-in zoom-in-95">
                    <div className="flex justify-between items-center mb-4 border-b border-[#111]/10 pb-4">
                       <div className="flex items-center gap-3">
                         <span className="text-2xl">⚖️</span>
                         <div>
                           <h4 className="text-xs font-bold text-[#111] uppercase tracking-widest">Master License Agreement</h4>
                           <p className="text-[9px] font-mono text-[#111]/50">ID: {contractId?.substring(0,8).toUpperCase()}</p>
                         </div>
                       </div>
                       {contractStatus === 'completed' 
                         ? <span className="bg-green-500 text-white px-3 py-1 rounded text-[8px] font-mono uppercase tracking-widest shadow-md">Fully Executed</span>
                         : <span className="bg-[#111] text-white px-3 py-1 rounded text-[8px] font-mono uppercase tracking-widest">Awaiting Signatures</span>
                       }
                    </div>
                    
                    <div className="space-y-3 mb-8">
                       {collaborators.map(c => (
                         <div key={c.userId} className="flex justify-between items-center text-[10px] font-mono p-2 bg-white rounded-lg border border-[#111]/5">
                           <span className="text-[#111]/70">{c.username}</span>
                           <span className="font-bold flex items-center gap-2">
                             {c.split}% - {c.hasSigned ? <span className="text-green-600">Signed ✓</span> : <span className="text-orange-500 animate-pulse">Pending</span>}
                           </span>
                         </div>
                       ))}
                    </div>

                    <div className="flex gap-4">
                      {myRecord?.hasSigned ? (
                         <button disabled className="flex-1 py-3 bg-green-50 text-green-600 border border-green-200 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                           You Signed This ✓
                         </button>
                      ) : (
                         <button onClick={signContract} className="flex-1 py-3 bg-[#E63946] text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#111] transition-colors shadow-md">
                           Sign Electronically
                         </button>
                      )}
                      
                      {/* 🔥 PREMIUM PDF DOWNLOAD BUTTON 🔥 */}
                      {contractStatus === 'completed' && (
                        <button 
                          onClick={downloadPDF} 
                          className="w-full md:w-auto px-6 py-3 flex items-center justify-center gap-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm bg-[#D4AF37] text-white hover:bg-[#111]" 
                          title="Download Official Agreement PDF"
                        >
                          <span>⬇</span> Get PDF
                        </button>
                      )}
                    </div>
                 </div>
              )}
            </div>
          </>
        )}
      </div>
      
    </div>
  );
} 