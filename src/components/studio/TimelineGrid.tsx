import React, { useState } from 'react';
import WaveformBlock from './WaveformBlock'; 

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
    <div className="flex-1 flex border-t border-white/5 bg-[#0A0A0C] relative overflow-hidden select-none" id="timeline-container">
      
      {/* ========================================================= */}
      {/* 🎛️ LEFT SIDEBAR: TRACK MIXER CONSOLE                        */}
      {/* ========================================================= */}
      <div className="w-[320px] bg-[#030305] border-r border-white/5 flex flex-col z-30 shadow-[10px_0_30px_rgba(0,0,0,0.8)] overflow-y-auto custom-scrollbar shrink-0">
          
          {/* Header */}
          <div className="h-[46px] border-b border-white/5 flex justify-between items-center px-6 bg-[#010101] sticky top-0 z-40">
              <span className="text-[9px] text-[#888888] uppercase font-black tracking-[0.4em]">Console Layers</span>
              <button 
                onClick={onAddTrack} 
                className="w-6 h-6 rounded bg-white/5 hover:bg-[#D4AF37] text-white hover:text-black font-bold flex items-center justify-center transition-all"
                title="Add New Layer"
              >
                +
              </button>
          </div>
          
          {/* Track Headers */}
          {tracks.map((track: any) => (
            <div 
              key={track.id} 
              onClick={() => setActiveTrackId(track.id)} 
              className={`h-[120px] border-b border-white/5 p-5 flex flex-col justify-center cursor-pointer transition-all duration-300 ${activeTrackId === track.id ? 'bg-[#0A0A0C] border-l-[3px] border-l-[#D4AF37] shadow-[inset_10px_0_20px_rgba(212,175,55,0.05)]' : 'bg-transparent hover:bg-white/[0.02] border-l-[3px] border-l-transparent'}`}
            >
                <div className="flex justify-between items-start w-full mb-3">
                   <div className="flex flex-col">
                       <span className="text-[7px] text-[#D4AF37] uppercase font-black mb-1.5 tracking-[0.3em]">{track.preset && track.preset !== 'clean' ? `FX: ${track.preset}` : 'RAW SIGNAL'}</span>
                       <input 
                         type="text" 
                         value={track.title} 
                         onChange={(e) => updateTrack(track.id, 'title', e.target.value)} 
                         className="bg-transparent border-none outline-none text-[13px] font-sans font-bold text-[#F0F0EB] uppercase tracking-wide w-28 truncate placeholder:text-[#888888]/30 focus:border-b focus:border-white/20" 
                       />
                   </div>
                   
                   <div className="flex gap-1.5 bg-[#010101] p-1.5 rounded-lg border border-white/5">
                      {/* Mute Button */}
                      <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, 'isMuted', !track.isMuted); }} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${track.isMuted ? 'bg-[#E63946] text-white shadow-[0_0_10px_rgba(230,57,70,0.4)]' : 'bg-white/5 text-[#888888] hover:text-white'}`}>M</button>
                      
                      {/* Solo Button */}
                      <button onClick={(e) => { e.stopPropagation(); updateTrack(track.id, 'isSolo', !track.isSolo); }} className={`w-6 h-6 rounded flex items-center justify-center text-[9px] font-black transition-all ${track.isSolo ? 'bg-[#D4AF37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' : 'bg-white/5 text-[#888888] hover:text-white'}`}>S</button>

                      {/* Delete Button */}
                      <button onClick={(e) => { e.stopPropagation(); onDeleteTrack(track.id); }} className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all ml-1" title="Purge Track">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                   </div>
                </div>
                
                {/* Volume Slider (Premium minimal look) */}
                <div className="flex items-center gap-4 mt-auto">
                   <span className="text-[8px] text-[#888888] font-black uppercase tracking-widest">VOL</span>
                   <div className="relative flex-1 h-1.5 bg-[#010101] rounded-full border border-white/5 overflow-hidden">
                       <div className="absolute top-0 left-0 h-full bg-white/20 transition-all" style={{ width: `${track.volume * 100}%` }}></div>
                       <input type="range" min="0" max="1" step="0.01" value={track.volume} onChange={(e)=>updateTrack(track.id, 'volume', parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   </div>
                   <span className="text-[8px] text-[#888888] font-mono w-6 text-right">{Math.round(track.volume * 100)}%</span>
                </div>
            </div>
          ))}
      </div>

      {/* ========================================================= */}
      {/* 📏 RIGHT SIDEBAR: THE TIMELINE GRID & BLOCKS               */}
      {/* ========================================================= */}
      <div className="flex-1 relative overflow-x-auto bg-[#0A0A0C] custom-scrollbar">
        
        {/* Timeline Ruler (Timecodes) */}
        <div 
          onClick={handleTimelineClick} 
          className="h-[46px] border-b border-white/10 bg-[#030305] sticky top-0 z-20 cursor-text flex items-end pb-1" 
          style={{ 
              width: `${totalWidth}px`, 
              backgroundImage: `repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent ${pixelsPerSecond}px)` 
          }}
        >
            {[...Array(duration)].map((_, i) => (
                i % 2 === 0 ? <span key={i} className="absolute text-[9px] text-[#888888] font-mono tracking-[0.2em]" style={{left: `${i * pixelsPerSecond + 6}px`}}>00:{i.toString().padStart(2, '0')}</span> : null
            ))}
        </div>
        
        {/* Subtle Vertical Grid Lines behind tracks */}
        <div className="absolute top-[46px] bottom-0 pointer-events-none z-0" style={{ width: `${totalWidth}px`, backgroundImage: `linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`, backgroundSize: `${pixelsPerSecond}px 100%` }}></div>
        
        {/* 🔻 THE PLAYHEAD (Aggressive Red Line) */}
        <div ref={playheadRef} className="absolute top-0 bottom-0 w-[1px] bg-[#E63946] z-50 pointer-events-none flex flex-col items-center" style={{ left: '0px' }}>
            <div className="w-3 h-3 bg-[#E63946] rotate-45 -mt-1.5 shadow-[0_0_10px_#E63946]"></div>
            <div className="w-[1px] h-full bg-gradient-to-b from-[#E63946] to-transparent opacity-80"></div>
        </div>

        {/* 🎛️ TRACK LANES AND BLOCKS */}
        <div className="relative pt-0 z-10" style={{ width: `${totalWidth}px` }}>
            {tracks.map((track: any) => (
              <div key={track.id} className={`h-[120px] border-b border-white/5 relative flex items-center px-4 group/lane transition-colors ${activeTrackId === track.id ? 'bg-white/[0.01]' : ''}`}>
                  
                  {/* AUDIO BLOCK WITH REAL WAVEFORMS */}
                  {track.audioUrl && !track.isProcessing && (
                    <div 
                        className={`absolute h-[80px] rounded-[1rem] flex items-center shadow-[0_10px_20px_rgba(0,0,0,0.4)] overflow-hidden transition-colors ${interaction.trackId === track.id ? 'brightness-125' : 'hover:brightness-110'} ${track.type === 'beat' ? 'bg-[#D4AF37]/15 border border-[#D4AF37]/50' : 'bg-[#F0F0EB]/10 border border-[#F0F0EB]/30'}`}
                        style={{ left: `${track.startTime * pixelsPerSecond}px`, width: `${track.duration * pixelsPerSecond}px` }}
                    >
                        
                        {/* Left Trim Handle */}
                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'resize-left')} className="absolute left-0 top-0 bottom-0 w-4 hover:w-6 bg-gradient-to-r from-black/60 to-transparent hover:from-white/20 cursor-col-resize z-20 transition-all border-r border-white/10 flex items-center justify-start pl-1">
                            <div className="w-0.5 h-4 bg-white/50 rounded-full"></div>
                        </div>

                        {/* Drag Area */}
                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'drag')} className={`w-full h-full absolute inset-0 z-10 ${interaction.type === 'drag' ? 'cursor-grabbing' : 'cursor-grab'}`}></div>
                        
                        {/* 🔥 THE REAL WAVEFORM INJECTED HERE 🔥 */}
                        <WaveformBlock audioUrl={track.audioUrl} color={track.type === 'beat' ? '#D4AF37' : '#F0F0EB'} />
                        
                        {/* Audio Block Info Overlay */}
                        <div className="absolute top-2 left-6 text-[9px] font-black text-white z-10 truncate pointer-events-none bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md uppercase tracking-widest border border-white/10 shadow-lg flex items-center gap-2">
                           <span className={`w-1.5 h-1.5 rounded-full ${track.type === 'beat' ? 'bg-[#D4AF37]' : 'bg-white'}`}></span>
                           {track.title}
                        </div>

                        {/* Right Trim Handle */}
                        <div onMouseDown={(e) => handleMouseDown(e, track.id, track, 'resize-right')} className="absolute right-0 top-0 bottom-0 w-4 hover:w-6 bg-gradient-to-l from-black/60 to-transparent hover:from-white/20 cursor-col-resize z-20 transition-all border-l border-white/10 flex items-center justify-end pr-1">
                             <div className="w-0.5 h-4 bg-white/50 rounded-full"></div>
                        </div>
                    </div>
                  )}

                  {/* Processing State Block */}
                  {track.isProcessing && (
                    <div className="absolute h-[80px] bg-[#010101] border border-dashed border-[#888888]/40 rounded-[1rem] flex items-center justify-center px-4" style={{ left: '0px', width: '200px' }}>
                        <span className="text-[9px] font-mono text-[#D4AF37] animate-pulse uppercase tracking-[0.3em]">Processing Audio...</span>
                    </div>
                  )}

                  {/* 🔴 LIVE RECORDING BLOCK */}
                  {isRecording && activeTrackId === track.id && (
                    <div ref={liveRecordBlockRef} className="absolute h-[80px] bg-[#E63946]/15 border border-[#E63946] rounded-r-[1rem] flex items-center overflow-hidden shadow-[0_0_20px_rgba(230,57,70,0.2)]" style={{ left: `${pausedTimeRef.current * pixelsPerSecond}px`, width: '0px' }}>
                        {/* Recording Stripes Pattern */}
                        <div className="w-full h-full absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.5) 5px, rgba(255,255,255,0.5) 10px)' }}></div>
                        <span className="text-[10px] font-black text-[#E63946] z-10 ml-4 animate-pulse uppercase tracking-[0.3em] bg-black/60 px-3 py-1 rounded-md border border-[#E63946]/50">REC Signal</span>
                    </div>
                  )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}