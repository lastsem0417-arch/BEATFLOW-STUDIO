import React, { useState } from 'react';
import WaveformBlock from './WaveformBlock'; 

// 🔥 NAYA: onDeleteTrack prop ko destructure karo yahan
export default function TimelineGrid({ 
  duration, 
  pixelsPerSecond, 
  playheadRef, 
  liveRecordBlockRef, 
  onScrub, 
  tracks, 
  activeTrackId, 
  setActiveTrackId, 
  isRecording, 
  pausedTimeRef, 
  onUpdateBlock, 
  updateTrack, 
  onAddTrack, 
  onDeleteTrack 
}: any) {
  
  const totalWidth = duration * pixelsPerSecond;
  
  const [interaction, setInteraction] = useState<{ type: 'drag' | 'resize-left' | 'resize-right' | null, trackId: string | null }>({ type: null, trackId: null });

  const handleMouseDown = (e: React.MouseEvent, trackId: string, track: any, type: 'drag' | 'resize-left' | 'resize-right') => {
    e.stopPropagation();
    if (isRecording) return;
    
    setInteraction({ type, trackId });
    const startX = e.clientX;
    const initialStartTime = track.startTime;
    const initialDuration = track.duration;
    const initialTrimStart = track.trimStart || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaSeconds = deltaX / pixelsPerSecond;
      
      if (type === 'drag') {
        let newTime = initialStartTime + deltaSeconds;
        if (newTime < 0) newTime = 0; 
        onUpdateBlock(trackId, newTime, initialDuration, initialTrimStart);
      } 
      else if (type === 'resize-left') {
        let newStartTime = initialStartTime + deltaSeconds;
        let newDuration = initialDuration - deltaSeconds;
        let newTrimStart = initialTrimStart + deltaSeconds;
        if (newDuration < 0.5 || newTrimStart < 0) return; 
        onUpdateBlock(trackId, newStartTime, newDuration, newTrimStart);
      }
      else if (type === 'resize-right') {
        let newDuration = initialDuration + deltaSeconds;
        if (newDuration < 0.5) return;
        onUpdateBlock(trackId, initialStartTime, newDuration, initialTrimStart);
      }
    };

    const handleMouseUp = () => {
      setInteraction({ type: null, trackId: null });
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isRecording || interaction.type) return; 
    const rect = e.currentTarget.getBoundingClientRect();
    onScrub((e.clientX - rect.left) / pixelsPerSecond);
  };

  return (
    <div className="flex-1 flex border-t border-white/5 bg-[#0a0a0a] relative overflow-hidden select-none" id="timeline-container">
      
      {/* --- LEFT SIDEBAR (TRACK HEADERS) --- */}
      <div className="w-[320px] bg-[#0c0c0c] border-r border-white/5 flex flex-col z-30 shadow-[10px_0_20px_rgba(0,0,0,0.5)] overflow-y-auto custom-scrollbar">
          <div className="h-12 border-b border-white/5 flex justify-between items-center px-6 bg-[#0a0a0a] sticky top-0 z-40">
              <span className="text-[9px] text-neutral-500 uppercase font-bold tracking-[0.2em]">Track Layers</span>
              <button onClick={onAddTrack} className="text-white hover:text-blue-500 font-bold">+</button>
          </div>
          
          {tracks.map((track: any) => (
            <div key={track.id} onClick={() => setActiveTrackId(track.id)} className={`h-28 border-b border-white/5 p-4 flex flex-col justify-center cursor-pointer transition-colors ${activeTrackId === track.id ? 'bg-[#151515] border-l-4 border-l-red-500' : 'bg-[#0c0c0c] hover:bg-[#111]'}`}>
                <div className="flex justify-between items-center w-full">
                   <div className="flex flex-col">
                       <span className="text-[7px] text-red-500 uppercase font-bold mb-1 tracking-widest">{track.preset && track.preset !== 'clean' ? `FX: ${track.preset}` : 'NO FX'}</span>
                       <input type="text" value={track.title} onChange={(e) => updateTrack(track.id, 'title', e.target.value)} className="bg-transparent border-none outline-none text-[11px] font-bold text-neutral-300 uppercase tracking-widest w-24 truncate" />
                   </div>
                   <div className="flex gap-1">
                      {/* Mute Button */}
                      <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, 'isMuted', !track.isMuted); }} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all ${track.isMuted ? 'bg-red-500 text-white' : 'bg-[#222] text-neutral-500 hover:text-white'}`}>M</button>
                      
                      {/* Solo Button */}
                      <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, 'isSolo', !track.isSolo); }} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-bold transition-all ${track.isSolo ? 'bg-yellow-500 text-black' : 'bg-[#222] text-neutral-500 hover:text-white'}`}>S</button>

                      {/* 🔥 NEW: THE DELETE BUTTON 🔥 */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }} 
                        className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all ml-1"
                        title="Delete Track"
                      >
                        🗑️
                      </button>
                   </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                   <span className="text-[8px] text-neutral-600">VOL</span>
                   <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={(e)=>updateTrack(track.id, 'volume', parseFloat(e.target.value))} className="w-full h-1 accent-white bg-[#222] appearance-none" />
                </div>
            </div>
          ))}
      </div>

      {/* --- RIGHT SIDEBAR (THE TIMELINE/CANVAS) --- */}
      <div className="flex-1 relative overflow-x-auto bg-[#0a0a0a] custom-scrollbar">
        <div onClick={handleTimelineClick} className="h-12 border-b border-white/10 bg-[#0c0c0c] sticky top-0 z-20 cursor-text flex items-end pb-1" style={{ width: `${totalWidth}px`, backgroundImage: `repeating-linear-gradient(90deg, #333 0px, #333 1px, transparent 1px, transparent ${pixelsPerSecond}px)` }}>
            {[...Array(duration)].map((_, i) => (i % 2 === 0 ? <span key={i} className="absolute text-[9px] text-neutral-500 font-mono tracking-widest" style={{left: `${i * pixelsPerSecond + 4}px`}}>00:{i.toString().padStart(2, '0')}</span> : null))}
        </div>
        <div className="absolute top-12 bottom-0 pointer-events-none" style={{ width: `${totalWidth}px`, backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`, backgroundSize: `${pixelsPerSecond}px 100%` }}></div>
        <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-red-500 z-50 pointer-events-none flex flex-col items-center" style={{ left: '0px' }}>
            <div className="w-3 h-3 bg-red-500 rotate-45 -mt-1 shadow-[0_0_10px_red]"></div>
            <div className="w-[1px] h-full bg-gradient-to-b from-red-500/80 to-transparent"></div>
        </div>

        <div className="relative pt-2" style={{ width: `${totalWidth}px` }}>
            {tracks.map((track: any) => (
              <div key={track.id} className="h-28 border-b border-white/5 relative flex items-center px-4 group/lane">
                  
                  {/* AUDIO BLOCK WITH REAL WAVEFORMS */}
                  {track.audioUrl && !track.isProcessing && (
                    <div className={`absolute h-20 rounded-lg flex items-center shadow-lg overflow-hidden transition-colors ${interaction.trackId === track.id ? 'brightness-150' : 'hover:brightness-125'} ${track.type === 'beat' ? 'bg-[#ff4f2a]/20 border border-[#ff4f2a]' : 'bg-[#3b82f6]/20 border border-[#3b82f6]'}`}
                         style={{ left: `${track.startTime * pixelsPerSecond}px`, width: `${track.duration * pixelsPerSecond}px` }}>
                        
                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'resize-left')} className="absolute left-0 top-0 bottom-0 w-3 bg-white/10 hover:bg-white cursor-col-resize z-20 transition-colors border-r border-white/20"></div>

                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'drag')} className={`w-full h-full absolute inset-0 z-10 ${interaction.type === 'drag' ? 'cursor-grabbing' : 'cursor-grab'}`}></div>
                        
                        {/* 🔥 THE REAL WAVEFORM INJECTED HERE 🔥 */}
                        <WaveformBlock audioUrl={track.audioUrl} color={track.type === 'beat' ? '#ff4f2a' : '#3b82f6'} />
                        
                        <span className="absolute left-4 text-[10px] font-bold text-white z-10 truncate pointer-events-none bg-black/40 px-2 py-0.5 rounded">{track.title}</span>

                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'resize-right')} className="absolute right-0 top-0 bottom-0 w-3 bg-white/10 hover:bg-white cursor-col-resize z-20 transition-colors border-l border-white/20"></div>
                    </div>
                  )}

                  {track.isProcessing && (
                    <div className="absolute h-20 bg-neutral-800/50 border border-neutral-600 rounded-lg flex items-center justify-center px-4" style={{ left: '0px', width: '200px' }}>
                        <span className="text-[9px] font-mono text-neutral-400 animate-pulse uppercase tracking-widest">Processing...</span>
                    </div>
                  )}

                  {isRecording && activeTrackId === track.id && (
                    <div ref={liveRecordBlockRef} className="absolute h-20 bg-red-600/20 border border-red-500 rounded-r-lg flex items-center overflow-hidden" style={{ left: `${pausedTimeRef.current * pixelsPerSecond}px`, width: '0px' }}>
                        <div className="w-full h-full absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 10px)' }}></div>
                        <span className="text-[10px] font-bold text-red-500 z-10 ml-4 animate-pulse uppercase tracking-widest drop-shadow-md">Recording</span>
                    </div>
                  )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}