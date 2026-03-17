import React, { useEffect, useRef, useState } from 'react';

interface WaveformProps {
  audioUrl: string;
  color?: string;
}

export default function WaveformBlock({ audioUrl, color = '#ffffff' }: WaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!audioUrl) return;
    
    let isMounted = true;

    const drawWaveform = async () => {
      try {
        // 1. Audio file download karo buffer mein
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        
        // 2. Audio Decode karo
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        // 3. Raw audio data nikaalo (PCM)
        const channelData = audioBuffer.getChannelData(0); // Left channel

        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 4. Canvas resolution setup
        const width = canvas.width;
        const height = canvas.height;
        ctx.clearRect(0, 0, width, height);

        // 5. Data ko compress karo width ke hisaab se
        const step = Math.ceil(channelData.length / width);
        const amp = height / 2;

        ctx.fillStyle = color;
        
        // 6. Draw Peaks
        for (let i = 0; i < width; i++) {
          let min = 1.0;
          let max = -1.0;
          for (let j = 0; j < step; j++) {
            const datum = channelData[i * step + j];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
          // Draw a vertical line for this chunk
          ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
        }
        
        setIsLoading(false);
      } catch (e) {
        console.error("Waveform draw error", e);
        setIsLoading(false);
      }
    };

    drawWaveform();

    return () => { isMounted = false; };
  }, [audioUrl, color]);

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none opacity-60 flex items-center justify-center overflow-hidden">
        {isLoading && <span className="text-[7px] animate-pulse text-white uppercase tracking-widest">Rendering Wave...</span>}
        <canvas ref={canvasRef} width={1000} height={60} className={`w-full h-full transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`} />
    </div>
  );
}