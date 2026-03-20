import React, { useState } from 'react';

export default function DAWBottomPanel({ tracks, activeTrackId, beats, vault, projects, onLoadTrack, onLoadProject, onApplyPreset }: any) {
  const [activeTab, setActiveTab] = useState<'library' | 'projects' | 'presets'>('library');

  return (
    // 🔥 PREMIUM VANTABLACK BASE (#080808) 🔥
    <div className="h-[30vh] min-h-[250px] bg-[#080808] border-t border-[#111111]/50 flex flex-col shrink-0 select-none z-40 relative">
       
       {/* Ambient Red Glow for the Studio Feel */}
       <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-12 bg-[#E63946]/5 blur-[50px] rounded-full pointer-events-none"></div>

       {/* 🗂️ TABS HEADER */}
       <div className="flex items-center border-b border-[#111111]/40 px-8 bg-[#0A0A0C] shrink-0 h-14">
          {['library', 'projects', 'presets'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`h-full px-6 text-[9px] font-black uppercase tracking-[0.3em] transition-all duration-300 relative ${activeTab === tab ? 'text-[#F4F3EF]' : 'text-[#888888] hover:text-[#F4F3EF]'}`}
             >
                {tab}
                {/* Active Tab Indicator (Carmine Red) */}
                {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E63946] shadow-[0_0_15px_#E63946]"></div>}
             </button>
          ))}
       </div>

       {/* 📜 TAB CONTENT WITH LENIS SCROLL FIX */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:px-12 bg-[#080808] relative z-10" data-lenis-prevent="true">
          
          {activeTab === 'library' && (
             <div className="flex flex-col md:flex-row gap-12 h-full">
                
                {/* GLOBAL BEATS SECTION */}
                <div className="flex-1">
                   <h4 className="text-[10px] text-[#F4F3EF] uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-3 sticky top-0 bg-[#080808] z-10 pb-2">
                      <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span> 
                      Global Beats
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {beats.length === 0 ? (
                        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-[0.2em] border border-dashed border-[#111111] p-4 text-center rounded-xl">No beats found.</p>
                      ) : (
                        beats.map((beat: any) => (
                          <div 
                            key={beat._id} 
                            onClick={() => onLoadTrack(beat.audioUrl, beat.title, 'beat')} 
                            className="group p-5 bg-[#0A0A0C] border border-[#111111]/40 rounded-[1rem] hover:border-[#E63946]/50 hover:bg-[#E63946]/5 hover:shadow-[0_10px_30px_rgba(230,57,70,0.1)] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                          >
                              <h5 className="text-xl font-serif italic text-[#F4F3EF] group-hover:text-[#E63946] transition-colors truncate">{beat.title}</h5>
                              <p className="text-[8px] text-[#888888] uppercase tracking-[0.3em] mt-2 font-mono group-hover:text-[#F4F3EF]/70 transition-colors">Load to Console →</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>

                {/* MY VAULT SECTION */}
                <div className="flex-1">
                   <h4 className="text-[10px] text-[#E63946] uppercase font-black tracking-[0.4em] mb-6 flex items-center gap-3 sticky top-0 bg-[#080808] z-10 pb-2">
                      <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full shadow-[0_0_8px_#E63946] animate-pulse"></span> 
                      My Takes (Vault)
                   </h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vault.length === 0 ? (
                        <p className="text-[10px] font-mono text-[#888888] uppercase tracking-[0.2em] border border-dashed border-[#111111] p-4 text-center rounded-xl">No saved takes.</p>
                      ) : (
                        vault.map((v: any) => (
                          <div 
                            key={v._id} 
                            onClick={() => onLoadTrack(v.audioUrl, v.title, 'vocal')} 
                            className="group p-5 bg-[#0A0A0C] border border-[#111111]/40 rounded-[1rem] hover:border-[#E63946]/50 hover:bg-[#E63946]/5 hover:shadow-[0_10px_30px_rgba(230,57,70,0.1)] cursor-pointer transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                          >
                              <h5 className="text-xl font-serif italic text-[#F4F3EF] group-hover:text-[#E63946] transition-colors truncate">{v.title}</h5>
                              <p className="text-[8px] text-[#888888] uppercase tracking-[0.3em] mt-2 font-mono group-hover:text-[#F4F3EF]/70 transition-colors">Load to Console →</p>
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'projects' && (
            <div className="h-full">
                <h4 className="text-[10px] text-[#F4F3EF] uppercase font-black tracking-[0.4em] mb-6 sticky top-0 bg-[#080808] z-10 pb-2 flex items-center gap-3">
                   <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span> 
                   Saved Sessions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {projects.length === 0 ? (
                      <p className="text-[10px] font-mono text-[#888888] uppercase tracking-[0.2em] border border-dashed border-[#111111] p-4 text-center rounded-xl">No projects saved yet.</p>
                    ) : (
                      projects.map((proj: any) => (
                        <div 
                          key={proj.id || proj._id} 
                          onClick={() => onLoadProject(proj)} 
                          className="group p-6 bg-[#0A0A0C] border border-[#111111]/40 rounded-[1rem] hover:border-[#E63946]/50 hover:shadow-[0_10px_30px_rgba(230,57,70,0.1)] cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                        >
                            <h5 className="text-[18px] font-serif italic text-[#F4F3EF] group-hover:text-[#E63946] transition-colors truncate">{proj.name}</h5>
                            <p className="text-[9px] text-[#888888] uppercase tracking-[0.3em] mt-3 font-mono">{proj.tracks?.length || 0} Tracks</p>
                        </div>
                      ))
                    )}
                </div>
            </div>
          )}

          {activeTab === 'presets' && (
             <div className="h-full">
                <h4 className="text-[10px] text-[#E63946] uppercase font-black tracking-[0.4em] mb-6 sticky top-0 bg-[#080808] z-10 pb-2 flex items-center gap-3">
                   <span className="w-1.5 h-1.5 bg-[#E63946] rounded-full shadow-[0_0_8px_#E63946]"></span> 
                   DSP Vocal Chains
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { id: 'clean', name: 'Raw Signal', desc: 'No FX applied' },
                     { id: 'reverb', name: 'Cathedral', desc: 'Large room reverb' },
                     { id: 'radio', name: 'Telephone', desc: 'Bandpass filter' },
                     { id: 'bass', name: 'Thick Vocal', desc: 'Low shelf boost' },
                   ].map(preset => (
                     <div 
                        key={preset.id} 
                        onClick={() => onApplyPreset(preset.id)} 
                        className="group p-6 bg-[#0A0A0C] border border-[#111111]/40 rounded-[1rem] hover:border-[#E63946]/50 hover:bg-[#E63946]/5 hover:shadow-[0_10px_30px_rgba(230,57,70,0.1)] cursor-pointer transition-all duration-300 hover:-translate-y-1 active:scale-[0.98]"
                     >
                        <h5 className="text-xl font-serif italic text-[#F4F3EF] group-hover:text-[#E63946] transition-colors">{preset.name}</h5>
                        <p className="text-[8px] text-[#888888] uppercase tracking-[0.2em] mt-3 font-mono">{preset.desc}</p>
                     </div>
                   ))}
                </div>
             </div>
          )}
       </div>
    </div>
  );
}