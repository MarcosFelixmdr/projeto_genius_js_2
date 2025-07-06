
import { useState } from 'react';
import useAudio from '../Audios/useAudio';

export default function GameLogic(config, onEndGame) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(config.isSinglePlayer ? 0 : 1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activePlayers, setActivePlayers] = useState(
    config.players.map((name) => ({
      name,
      active: true,
      score: 0,
      roundsCompleted: 0,
    }))
  );
  const [speed, setSpeed] = useState(500);

  const { playSound } = useAudio();
  const cores = ['green', 'red', 'yellow', 'blue'];

  const nextRound = () => {
    const newColor = cores[Math.floor(Math.random() * cores.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    if (round % 3 === 0) {
      setSpeed((prev) => Math.max(250, prev - 100));
    }
    showSequence(newSequence);
    setRound((prev) => prev + 1);
  };

  const showSequence = async (seq) => {
    setIsShowingSequence(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setActiveColor(seq[i]);
      playSound(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, speed));
      setActiveColor(null);
    }
    setIsShowingSequence(false);
  };

  const startGame = () => {
    setGameStarted(true);
    if (config.isSinglePlayer) {
      nextRound();
    } else {
      const firstColor = cores[Math.floor(Math.random() * cores.length)];
      setSequence([firstColor]);
      setRound(1);
      setTimeout(() => {
        showSequence([firstColor]);
      }, 300);
      setCurrentPlayer(0);
      setPlayerSequence([]);
    }
  };

  const endSinglePlayerGame = () => {
    setGameOver(true);
    const currentPlayerName = config.players[0];
    const finalScore = activePlayers[0].score;
    setTimeout(() => {
      onEndGame(finalScore, currentPlayerName);
    }, 2000);
  };

  const addColorAndNextPlayer = () => {
    const newColor = cores[Math.floor(Math.random() * cores.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    
    const activePlayersList = activePlayers.filter((p) => p.active);
    const currentActiveIndex = activePlayersList.indexOf(activePlayers[currentPlayer]);
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayersList.length;
    const nextPlayerIndex = activePlayers.indexOf(activePlayersList[nextActiveIndex]);
    
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);
    showSequence(newSequence);
    
    if ((newSequence.length) % 3 === 0) {
      setSpeed((prev) => Math.max(250, prev - 100));
    }
    
    if (nextActiveIndex === 0) {
      setRound((prev) => prev + 1);
    }
  };

  const handleColorClick = (color) => {
    if (isShowingSequence || gameOver) return;
    
    playSound(color, 0.2);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);
    
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    
    const currentIndex = newPlayerSequence.length - 1;
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      if (config.isSinglePlayer) {
        endSinglePlayerGame();
      } else {
        // Retornar dados para eliminação
        return { shouldEliminate: true, playerIndex: currentPlayer };
      }
    } else if (newPlayerSequence.length === sequence.length) {
      if (config.isSinglePlayer) {
        const newScore = activePlayers[0].score + sequence.length * 10;
        setActivePlayers((prev) =>
          prev.map((p, i) =>
            i === 0 ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => nextRound(), 500);
      } else {
        const newScore = activePlayers[currentPlayer].score + sequence.length * 10;
        setActivePlayers((prev) =>
          prev.map((p, i) =>
            i === currentPlayer ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => addColorAndNextPlayer(), 800);
      }
    }
  };

  // Getters
  const getCurrentPlayerName = () => {
    if (config.isSinglePlayer) {
      return config.players[0];
    }
    return activePlayers[currentPlayer]?.name || '';
  };

  const getActivePlayersList = () => {
    return activePlayers.filter((p) => p.active).map((p) => p.name).join(', ');
  };

  const getCurrentScore = () => {
    if (config.isSinglePlayer) {
      return activePlayers[0]?.score || 0;
    }
    return activePlayers[currentPlayer]?.score || 0;
  };

  const getDifficultyLevel = () => {
    return Math.floor((sequence.length - 1) / 3) + 1;
  };

  return {
    // States
    sequence,
    playerSequence,
    currentPlayer,
    isShowingSequence,
    activeColor,
    round,
    gameStarted,
    gameOver,
    activePlayers,
    speed,
    cores,
    
    // Actions
    startGame,
    handleColorClick,
    setActivePlayers,
    setGameOver,
    showSequence,
    setCurrentPlayer,
    setPlayerSequence,
    
    // Getters
    getCurrentPlayerName,
    getActivePlayersList,
    getCurrentScore,
    getDifficultyLevel,
  };
}