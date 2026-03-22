import React, { useState, useRef } from 'react';

// ==========================================
// 🎤 TOOL 1: RECORD BARS (For Rapper/Lyricist)
// ==========================================
export const RecordBars = ({ onAudioDrop, accentColor, theme }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            onAudioDrop({
              id: Date.now(),
              type: 'vocal',
              name: `Vocal Take #${Math.floor(Math.random() * 1000)}`,
              audioData: reader.result, 
              color: '#E63946' 
            });
          };
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) { 
        alert("Mic access denied. Please allow microphone to record."); 
      }
    }
  };

  return (
    <button onClick={toggleRecording} className={`px-5 py-2.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md hover:-translate-y-0.5 ${isRecording ? 'bg-red-500 animate-pulse shadow-red-500/30' : ''}`} style={{ backgroundColor: !isRecording ? accentColor : undefined }}>
      {isRecording ? <><span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Recording...</> : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg> Record Bars</>}
    </button>
  );
};

// ==========================================
// 🎹 TOOL 2: DROP BEAT (ASLI FILE UPLOAD)
// ==========================================
export const DropBeat = ({ onBeatDrop, accentColor, theme }: any) => {
  
  // 🔥 THE FIX: ASLI PC KI FILE UPLOAD KAREGA YAHAN SE 🔥
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // File ko Base64 mein convert karke Canvas pe bhej rahe hain
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      onBeatDrop({
        id: Date.now(),
        type: 'beat',
        name: file.name, // Asli gaane ka naam
        audioData: reader.result, // Asli gaana play hone ke liye ready!
        color: accentColor
      });
    };
  };

  return (
    <div>
      <input type="file" id="beat-upload" accept="audio/*" className="hidden" onChange={handleFileChange} />
      <label htmlFor="beat-upload" className="px-5 py-2.5 rounded-full text-white text-[9px] font-black uppercase tracking-widest hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-md cursor-pointer" style={{ backgroundColor: accentColor, boxShadow: `0 5px 15px ${accentColor}40` }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        Upload Beat
      </label>
    </div>
  );
};

// ==========================================
// ✍️ TOOL 3: WRITE BARS (For Lyricist)
// ==========================================
export const WriteBars = ({ onLyricsDrop, theme }: any) => {
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleDrop = () => {
    if (!text.trim()) return;
    onLyricsDrop({
      id: Date.now(),
      type: 'lyrics',
      name: 'Written Draft',
      textContent: text,
      color: '#10B981' 
    });
    setText('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="px-5 py-2.5 rounded-full bg-white border border-[#111]/10 text-[#111] text-[9px] font-black uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Write Bars
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-white p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[#111]/10 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Draft Editor</span>
             <button onClick={() => setIsOpen(false)} className="opacity-50 hover:opacity-100"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
          </div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Spit your bars here..." autoFocus className="w-full h-32 p-4 text-xs font-medium font-serif italic bg-[#F4F5F7] border border-[#111]/5 rounded-xl outline-none resize-none mb-4 focus:border-[#10B981] transition-colors" />
          <button onClick={handleDrop} className="w-full py-3 bg-[#10B981] text-white text-[9px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-[#0A1A14] transition-colors">Push to Canvas</button>
        </div>
      )}
    </div>
  );
};