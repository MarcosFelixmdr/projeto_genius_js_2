//O que faz?
//Traz ferramentas do React que permitem armazenar referências (useRef) e executar código
//em momentos específicos do ciclo de vida do componente (useEffect).

//Por quê?
//Porque a lógica que você está construindo (manipulação de áudio) depende do acesso ao navegador
//e precisa ser inicializada apenas uma vez.

import { useRef, useEffect } from 'react';

//O que faz?
//Define as frequências sonoras associadas a cada cor.

//Por quê?
//Isso permite que, ao informar uma cor (como "red"), o sistema saiba qual nota tocar.

const frequencias = {
  green: 164.81,
  red: 220,
  yellow: 277.18,
  blue: 329.63,
};

//Essa função é um hook customizado do React, ou seja, uma função que usa outros hooks
//(como useRef e useEffect) para encapsular lógica reutilizável — neste caso, relacionada a áudio.
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