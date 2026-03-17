import React, { useState } from 'react';

export default function DAWBottomPanel({ tracks, activeTrackId, beats, vault, projects, onLoadTrack, onLoadProject, onApplyPreset }: any) {
  const [activeTab, setActiveTab] = useState('library');

  const PRESETS = [
    { id: 'clean', name: 'Studio Clean', color: '#3b82f6' },
    { id: 'reverb', name: 'Pro Reverb', color: '#ff4f2a' },
    { id: 'bass', name: 'Deep Bass', color: '#8b5cf6' },
    { id: 'radio', name: 'Lo-Fi Radio', color: '#eab308' }
  ];

  return (
    <div className="h-64 bg-[#111] flex flex-col z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)] border-t border-white/5 select-none">
      
      <div className="h-10 border-b border-white/5 flex items-center px-4 gap-2 bg-[#0a0a0a]">
        {['library', 'projects', 'presets', 'lyrics'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} 
            className={`text-[9px] font-bold h-full px-6 uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-[#1a1a1a] text-white border-t-2 border-red-500' : 'text-neutral-500 hover:text-neutral-300'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#1a1a1a]">
        
        {activeTab === 'library' && (
          <div className="flex gap-10 h-full">
            <div className="flex-1 border-r border-white/5 pr-6">
                <h3 className="text-[10px] text-neutral-500 font-bold mb-4 uppercase tracking-widest">🎹 Loop / Beats</h3>
                <div className="grid grid-cols-2 gap-3">
                  {beats.map((b: any) => (
                    <div key={b._id} onClick={() => onLoadTrack(b.audioUrl, b.title, 'beat')} className="p-4 rounded-xl bg-[#222] border border-white/5 hover:border-blue-500 cursor-pointer group transition-all">
                      <p className="text-[11px] font-bold text-white truncate">{b.title}</p>
                      <p className="text-[8px] text-neutral-500 mt-2 group-hover:text-blue-400 uppercase tracking-widest">Load to Active Track</p>
                    </div>
                  ))}
                  {beats.length === 0 && <p className="text-[10px] text-neutral-600 italic">No beats found.</p>}
                </div>
            </div>
            <div className="flex-1 pl-4">
                <h3 className="text-[10px] text-neutral-500 font-bold mb-4 uppercase tracking-widest">🎤 My Takes (Vault)</h3>
                <div className="grid grid-cols-2 gap-3">
                  {vault.map((t: any) => (
                    <div key={t._id} onClick={() => onLoadTrack(t.audioUrl, t.title, 'vocal')} className="p-4 rounded-xl bg-[#222] border border-white/5 hover:border-red-500 cursor-pointer group transition-all">
                      <p className="text-[11px] font-bold text-white truncate">{t.title}</p>
                      <p className="text-[8px] text-neutral-500 mt-2 group-hover:text-red-400 uppercase tracking-widest">Load to Active Track</p>
                    </div>
                  ))}
                  {vault.length === 0 && <p className="text-[10px] text-neutral-600 italic">Record something to see it here.</p>}
                </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="h-full">
             <h3 className="text-[10px] text-neutral-500 font-bold mb-4 uppercase tracking-widest">💾 Saved Sessions</h3>
             <div className="grid grid-cols-4 gap-4">
                {projects.map((p: any, idx: number) => (
                  <div key={idx} onClick={() => onLoadProject(p)} className="p-5 rounded-xl bg-[#222] border border-white/5 hover:border-green-500 cursor-pointer group transition-all">
                    <p className="text-[12px] font-bold text-white truncate mb-1">{p.name}</p>
                    <p className="text-[9px] text-neutral-500">{p.tracks?.length || 0} Tracks included</p>
                    <p className="text-[8px] text-neutral-600 mt-3 group-hover:text-green-400 uppercase tracking-widest font-bold">Open Project</p>
                  </div>
                ))}
                {projects.length === 0 && <p className="text-[10px] text-neutral-600 italic col-span-4">No saved projects found.</p>}
             </div>
          </div>
        )}

        {/* THE NEW FX PRESETS TAB */}
        {activeTab === 'presets' && (
          <div className="flex gap-4 h-full">
            {PRESETS.map(preset => (
              <div key={preset.id} onClick={() => onApplyPreset(preset.id)} 
                className={`w-40 rounded-xl border p-4 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${tracks.find((t:any)=>t.id===activeTrackId)?.preset === preset.id ? 'border-white bg-[#222] shadow-[0_0_20px_rgba(255,255,255,0.1)]' : 'border-white/5 bg-[#1a1a1a] hover:bg-[#222]'}`}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg" style={{backgroundColor: preset.color}}>{preset.name.charAt(0)}</div>
                <span className="text-[10px] font-bold text-white uppercase text-center">{preset.name}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'lyrics' && <textarea className="w-full h-full bg-transparent border-none outline-none resize-none font-serif text-2xl italic text-neutral-300 placeholder:text-neutral-700 leading-relaxed" placeholder="Drop bars here..." />}
      </div>
    </div>
  );
}