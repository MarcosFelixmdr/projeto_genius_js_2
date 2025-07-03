import { useRef, useEffect } from 'react';

const frequencias = {
  green: 164.81,
  red: 220,
  yellow: 277.18,
  blue: 329.63,
};

export default function useAudio() {
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playSound = (color, duration = 0.3) => {
    if (!audioContextRef.current) return;
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    oscillator.frequency.setValueAtTime(
      frequencias[color],
      audioContextRef.current.currentTime
    );
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(
      0.3,
      audioContextRef.current.currentTime
    );
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + duration
    );
    
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  return { playSound };
}