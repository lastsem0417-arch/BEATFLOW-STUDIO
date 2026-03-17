import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAudio } from '../context/AudioContext';

export default function GlobalAudioPlayer() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying, progress, togglePlayPause, seek } = useAudio();

  // Agar koi gaana select nahi hua hai, toh player hide rakho
  if (!currentTrack) return null;

  // 🔥 Smart Fallbacks: Agar private beat hai aur role nahi aaya, toh default blue (Producer) lo
  const rawRole = currentTrack.creatorRole?.toLowerCase() || 'producer';
  const roleColor = rawRole === 'producer' ? 'blue' : rawRole === 'lyricist' ? 'emerald' : 'purple';
  
  // Image fallback
  const coverImage = currentTrack.coverImage || currentTrack.creatorProfileImage || `https://api.dicebear.com/7.x/micah/svg?seed=${currentTrack.creatorName || 'Beat'}`;

  // Drag function
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (seek) seek(Number(e.target.value));
  };

  return (
    // Outer wrapper: pointer-events-none taaki background pe click ho sake
    <div className="fixed bottom-0 left-0 w-full z-[9999] px-4 pb-6 pointer-events-none animate-in slide-in-from-bottom-10 duration-700">
      
      {/* Inner Player Pill: pointer-events-auto taaki ispe click kaam kare */}
      <div className="max-w-5xl mx-auto bg-[#0a0a0a]/85 backdrop-blur-3xl border border-white/10 rounded-[1.5rem] p-3 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] pointer-events-auto relative group transition-all duration-300 hover:border-white/20 hover:bg-[#0a0a0a]/95">
        
        {/* 🔥 THE INTERACTIVE SCRUBBER (Spotify Style) 🔥 */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 group-hover:h-2 transition-all cursor-pointer z-10">
          {/* Invisible Range Input for Dragging */}
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={progress || 0} 
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
          />
          {/* Visible Glowing Progress Fill */}
          <div 
            className={`h-full bg-${roleColor}-500 shadow-[0_0_15px_rgba(var(--${roleColor}-500),0.8)] transition-all duration-100 ease-linear rounded-r-full relative`} 
            style={{ width: `${progress}%` }}
          >
            {/* Playhead Dot (Appears on hover) */}
            <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-x-1/2 pointer-events-none`}></div>
          </div>
        </div>

        <div className="flex items-center justify-between w-full pt-1 px-2">
          
          {/* 🎵 LEFT: Track Info (CLICKABLE -> Goes to Profile) */}
          <div 
            onClick={() => currentTrack.creatorId && navigate(`/profile/${currentTrack.creatorId}`)}
            className="flex items-center gap-4 w-1/3 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-xl transition-colors group/info"
          >
            <div className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 ${isPlaying ? `shadow-[0_0_15px_rgba(var(--${roleColor}-500),0.4)] animate-pulse` : ''} bg-black`}>
               <img src={coverImage} alt="Cover" className="w-full h-full object-cover scale-110" />
            </div>
            <div className="flex flex-col truncate">
              <h4 className="text-white text-sm font-bold truncate group-hover/info:text-blue-400 transition-colors">
                {currentTrack.title || 'Untitled Drop'}
              </h4>
              <p className={`text-[9px] uppercase tracking-widest text-${roleColor}-400 font-black truncate mt-1 flex items-center gap-1`}>
                {currentTrack.creatorName || 'Unknown Entity'} 
                {currentTrack.isVerified && <span className="text-blue-400 text-xs">✔️</span>}
              </p>
            </div>
          </div>

          {/* 🎛️ CENTER: Play Controls */}
          <div className="flex items-center justify-center gap-6 w-1/3">
            <button className="text-neutral-500 hover:text-white transition-colors active:scale-95 text-lg">⏮</button>
            
            <button 
              onClick={togglePlayPause} 
              className="w-12 h-12 flex items-center justify-center rounded-full bg-white text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] pl-0.5"
            >
              {isPlaying ? <span className="text-xl leading-none">⏸</span> : <span className="text-xl leading-none">▶</span>}
            </button>
            
            <button className="text-neutral-500 hover:text-white transition-colors active:scale-95 text-lg">⏭</button>
          </div>

          {/* 🔊 RIGHT: Extra Actions */}
          <div className="flex items-center justify-end gap-5 w-1/3 text-neutral-500 pr-2">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[8px] uppercase tracking-[0.3em] font-black text-white/40 mb-1">Time Elapsed</span>
               <span className="text-xs font-mono text-white/80">{(progress || 0).toFixed(0)}%</span>
            </div>
            <button className="hover:text-red-500 transition-colors text-lg hover:scale-110 active:scale-95">❤️</button>
            <button className="hover:text-blue-500 transition-colors text-lg hover:scale-110 active:scale-95">🔀</button>
          </div>
        
        </div>
      </div>
    </div>
  );
}