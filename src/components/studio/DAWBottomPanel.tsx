import React, { useState } from 'react';

export default function DAWBottomPanel({ tracks, activeTrackId, beats, vault, projects, onLoadTrack, onLoadProject, onApplyPreset }: any) {
  const [activeTab, setActiveTab] = useState<'library' | 'projects' | 'presets'>('library');

  return (
    // Height fixed ki hai taaki screen se bahar na bhage
    <div className="h-[30vh] min-h-[250px] bg-[#030305] border-t border-white/5 flex flex-col shrink-0 select-none z-40 relative">
       
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-10 bg-[#D4AF37]/5 blur-[40px] rounded-full pointer-events-none"></div>

       {/* 🗂️ TABS HEADER */}
       <div className="flex items-center border-b border-white/5 px-8 bg-[#010101] shrink-0 h-14">
          {['library', 'projects', 'presets'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`h-full px-6 text-[9px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-[#F0F0EB]' : 'text-[#888888] hover:text-white'}`}
             >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]"></div>}
             </button>
          ))}
       </div>

       {/* 📜 TAB CONTENT WITH LENIS SCROLL FIX */}
       {/* 🔥 FIX 2: data-lenis-prevent="true" lagaya taaki scroll makhhan ho 🔥 */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[#0A0A0C]" data-lenis-prevent="true">
          
          {activeTab === 'library' && (
             <div className="flex flex-col md:flex-row gap-12 h-full">
                
                {/* GLOBAL BEATS SECTION */}
                <div className="flex-1">
                   <h4 className="text-[10px] text-[#D4AF37] uppercase font-black tracking-[0.4em] mb-5 flex items-center gap-2 sticky top-0 bg-[#0A0A0C] z-10 pb-2">
                      <span className="w-1.5 h-1.5 bg-[#D4AF37] rounded-full shadow-[0_0_5px_#D4AF37]"></span> 
                      Global Beats
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {beats.length === 0 ? (
                        <p className="text-[10px] font-mono text-[#888888]">No beats found.</p>
                      ) : (
                        beats.map((beat: any) => (
                          <div 
                            key={beat._id} 
                            onClick={() => onLoadTrack(beat.audioUrl, beat.title, 'beat')} 
                            className="group p-5 bg-[#010101] border border-white/5 rounded-xl hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5 cursor-pointer transition-all active:scale-[0.98]"
                          >
                              <h5 className="text-[13px] font-bold text-[#F0F0EB] group-hover:text-[#D4AF37] truncate">{beat.title}</h5>
                              <p className="text-[8px] text-[#888888] uppercase tracking-widest mt-1.5 font-mono group-hover:text-[#F0F0EB]/70">Load to Active Track →</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* MY VAULT SECTION */}
                <div className="flex-1">
                   <h4 className="text-[10px] text-[#E63946] uppercase font-black tracking-[0.4em] mb-5 flex items-center gap-2 sticky top-0 bg-[#0A0A0C] z-10 pb-2">
                      <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full shadow-[0_0_5px_#E63946]"></span> 
                      My Takes (Vault)
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vault.length === 0 ? (
                        <p className="text-[10px] font-mono text-[#888888]">No saved takes.</p>
                      ) : (
                        vault.map((v: any) => (
                          <div 
                            key={v._id} 
                            onClick={() => onLoadTrack(v.audioUrl, v.title, 'vocal')} 
                            className="group p-5 bg-[#010101] border border-white/5 rounded-xl hover:border-[#E63946]/40 hover:bg-[#E63946]/5 cursor-pointer transition-all active:scale-[0.98]"
                          >
                              <h5 className="text-[13px] font-bold text-[#F0F0EB] group-hover:text-[#E63946] truncate">{v.title}</h5>
                              <p className="text-[8px] text-[#888888] uppercase tracking-widest mt-1.5 font-mono group-hover:text-[#F0F0EB]/70">Load to Active Track →</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'projects' && (
            <div className="h-full">
                <h4 className="text-[10px] text-[#F0F0EB] uppercase font-black tracking-[0.4em] mb-5 sticky top-0 bg-[#0A0A0C] z-10 pb-2">Saved Sessions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {projects.length === 0 ? (
                      <p className="text-[10px] font-mono text-[#888888]">No projects saved yet.</p>
                    ) : (
                      projects.map((proj: any) => (
                        <div 
                          key={proj.id || proj._id} 
                          onClick={() => onLoadProject(proj)} 
                          className="group p-5 bg-[#010101] border border-white/5 rounded-xl hover:border-white/30 cursor-pointer transition-all active:scale-[0.98]"
                        >
                            <h5 className="text-[14px] font-serif italic text-[#F0F0EB] truncate">{proj.name}</h5>
                            <p className="text-[8px] text-[#888888] uppercase tracking-widest mt-2 font-mono">{proj.tracks?.length || 0} Tracks</p>
                        </div>
                      ))
                    )}
                </div>
            </div>
          )}

          {activeTab === 'presets' && (
             <div className="h-full">
                <h4 className="text-[10px] text-purple-400 uppercase font-black tracking-[0.4em] mb-5 sticky top-0 bg-[#0A0A0C] z-10 pb-2">DSP Vocal Chains</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {[
                     { id: 'clean', name: 'Raw Signal', desc: 'No FX applied' },
                     { id: 'reverb', name: 'Cathedral', desc: 'Large room reverb' },
                     { id: 'radio', name: 'Telephone', desc: 'Bandpass filter' },
                     { id: 'bass', name: 'Thick Vocal', desc: 'Low shelf boost' },
                   ].map(preset => (
                     <div 
                        key={preset.id} 
                        onClick={() => onApplyPreset(preset.id)} 
                        className="group p-5 bg-[#010101] border border-white/5 rounded-xl hover:border-purple-500/40 hover:bg-purple-500/10 cursor-pointer transition-all active:scale-[0.98]"
                     >
                        <h5 className="text-[14px] font-bold text-[#F0F0EB] group-hover:text-purple-400">{preset.name}</h5>
                        <p className="text-[8px] text-[#888888] uppercase tracking-widest mt-2 font-mono">{preset.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}