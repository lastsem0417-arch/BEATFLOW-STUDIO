export default function DAWTimeline({ tracks, activeTrackId, setActiveTrackId, onTrackUpdate, onAddTrack, currentTime, duration, onSeek }: any) {
  
  const updateTrack = (id: string, key: string, value: any) => {
    onTrackUpdate(tracks.map((t:any) => t.id === id ? { ...t, [key]: value } : t));
  };

  const handleTimelineClick = (e: any) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="flex-1 flex border-b border-[#282828] bg-[#1a1a1a] relative overflow-hidden select-none">
      
      {/* PLAYHEAD */}
      <div className="absolute top-0 bottom-0 w-[1px] bg-white z-50 pointer-events-none" style={{ left: `calc(280px + ${(currentTime / duration) * 100}%)` }}>
          <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 bg-white rotate-45 shadow-[0_0_10px_white]"></div>
      </div>

      {/* LEFT: TRACK HEADERS */}
      <div className="w-[280px] bg-[#222] border-r border-[#333] flex flex-col z-20 overflow-y-auto">
          <div className="h-10 border-b border-[#333] flex justify-between items-center px-4 bg-[#181818] sticky top-0">
              <span className="text-[9px] text-neutral-400 uppercase font-bold tracking-widest">+ Add Track</span>
              <button onClick={onAddTrack} className="text-white bg-[#333] hover:bg-white hover:text-black w-5 h-5 rounded flex items-center justify-center font-bold transition-colors">+</button>
          </div>
          
          <div>
            {tracks.map((track: any) => (
              <div key={track.id} onClick={() => setActiveTrackId(track.id)} 
                   className={`h-24 border-b border-[#333] p-3 flex flex-col justify-between transition-all cursor-pointer ${activeTrackId === track.id ? 'bg-[#2a2a2a] border-l-4 border-l-blue-500' : 'bg-[#1f1f1f]'}`}>
                  <div className="flex justify-between items-start">
                     <div className="flex flex-col">
                        <span className="text-[8px] text-neutral-500 uppercase font-bold mb-1">{track.type === 'beat' ? '🎹 MIDI / Beat' : '🎤 Voice / Audio'}</span>
                        <input type="text" value={track.title} onChange={(e) => updateTrack(track.id, 'title', e.target.value)} className="bg-transparent border-none outline-none text-[12px] font-bold text-white w-28 truncate" />
                     </div>
                     <div className="flex gap-1">
                        <button onClick={(e)=>{e.stopPropagation(); updateTrack(track.id, 'isMuted', !track.isMuted)}} className={`w-6 h-6 text-[9px] rounded font-bold transition-colors ${track.isMuted ? 'bg-red-500 text-white' : 'bg-[#111] text-neutral-500 border border-[#333]'}`}>M</button>
                        <button onClick={(e)=>{e.stopPropagation(); updateTrack(track.id, 'isSolo', !track.isSolo)}} className={`w-6 h-6 text-[9px] rounded font-bold transition-colors ${track.isSolo ? 'bg-yellow-500 text-black' : 'bg-[#111] text-neutral-500 border border-[#333]'}`}>S</button>
                     </div>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                     <span className="text-[8px] text-neutral-500">VOL</span>
                     <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={(e)=>updateTrack(track.id, 'volume', parseFloat(e.target.value))} className="w-full h-1 accent-white bg-[#111] appearance-none" />
                  </div>
              </div>
            ))}
          </div>
      </div>

      {/* RIGHT: TIMELINE GRID & AUDIO BLOCKS */}
      <div className="flex-1 relative overflow-x-auto overflow-y-auto bg-[#1a1a1a] custom-scrollbar">
          {/* Ruler */}
          <div onClick={handleTimelineClick} className="h-10 border-b border-[#333] bg-[#181818] sticky top-0 z-10 cursor-text flex items-end pb-1 w-[2000px]" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #333 0px, #333 1px, transparent 1px, transparent 50px)' }}>
              {[...Array(40)].map((_, i) => <span key={i} className="absolute text-[9px] text-neutral-500 font-mono" style={{left: `${(i*5)/duration*100}%`}}>{i*5}s</span>)}
          </div>

          {/* Grid Lanes */}
          <div className="relative w-[2000px] pb-32" style={{ backgroundImage: 'linear-gradient(90deg, #222 1px, transparent 1px)', backgroundSize: '50px 100%' }}>
              {tracks.map((track: any) => (
                <div key={track.id} className="h-24 border-b border-[#333] relative flex items-center group px-2">
                    
                    {/* The Waveform Block */}
                    {track.audioUrl && (
                        <div className={`absolute h-16 rounded-md flex items-center px-4 shadow-lg overflow-hidden group/block ${track.type === 'beat' ? 'bg-[#ff4f2a]/80 border border-[#ff4f2a]' : 'bg-[#3b82f6]/80 border border-[#2563eb]'}`} 
                             style={{ left: `0%`, width: '400px' }}> {/* Width logic will depend on audio duration, hardcoded for visual */}
                            
                            {/* Trimming Handles */}
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-white/20 hover:bg-white cursor-col-resize z-20 opacity-0 group-hover/block:opacity-100"></div>
                            
                            <div className="w-full h-full absolute inset-0 opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)' }}></div>
                            <span className="text-[10px] font-bold text-white z-10 truncate">{track.title}</span>
                            
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/20 hover:bg-white cursor-col-resize z-20 opacity-0 group-hover/block:opacity-100"></div>
                        </div>
                    )}
                </div>
              ))}
          </div>
      </div>
    </div>
  );
}