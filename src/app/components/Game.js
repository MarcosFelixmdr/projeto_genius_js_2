'use client';
import { useState, useRef } from 'react';
import GameHeader from './GameHeader';
import PlayerInfo from './PlayerInfo';
import StartScreen from './StartScreen';
import GeniusBoard from './GeniusBoard';
import GameMessages from './GameMessages';
import useAudio from './useAudio';

export default function Game({ config, onEndGame, onBackToMenu }) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(0);
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
  const [eliminatedMessage, setEliminatedMessage] = useState('');
  const [showEliminatedMessage, setShowEliminatedMessage] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [showWinnerMessage, setShowWinnerMessage] = useState(false);

  const gameContainerRef = useRef(null);
  const { playSound } = useAudio();

  const cores = ['green', 'red', 'yellow', 'blue'];

  const startGame = () => {
    setGameStarted(true);
    if (config.isSinglePlayer) {
      nextRound();
    } else {
      const firstColor = cores[Math.floor(Math.random() * cores.length)];
      setSequence([firstColor]);
      setTimeout(() => {
        showSequence([firstColor]);
      }, 300);
      setCurrentPlayer(0);
      setPlayerSequence([]);
    }
  };

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

  const handleColorClick = (color) => {
    if (isShowingSequence || gameOver || showEliminatedMessage || showWinnerMessage) return;
    
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
        eliminatePlayer();
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

  const eliminatePlayer = () => {
    const playerName = activePlayers[currentPlayer].name;
    const playerScore = activePlayers[currentPlayer].score;
    const roundsCompleted = round - 1;
    
    setEliminatedMessage(
      `${playerName} foi eliminado!\nPontuação: ${playerScore}\nRodadas: ${roundsCompleted}`
    );
    setShowEliminatedMessage(true);
    
    const newActivePlayers = [...activePlayers];
    newActivePlayers[currentPlayer].active = false;
    setActivePlayers(newActivePlayers);
    
    setTimeout(() => {
      setShowEliminatedMessage(false);
      setEliminatedMessage('');
      
      const remainingPlayers = newActivePlayers.filter((p) => p.active);
      
      if (remainingPlayers.length === 1) {
        const winner = remainingPlayers[0];
        setWinnerMessage(
          `${winner.name} venceu!\nPontuação Final: ${winner.score}\nRodadas Completadas: ${winner.roundsCompleted}`
        );
        setShowWinnerMessage(true);
        setGameOver(true);
        setTimeout(() => {
          onEndGame(winner.score, winner.name);
        }, 3000);
      } else if (remainingPlayers.length === 0) {
        endSinglePlayerGame();
      } else {
        nextPlayerAfterElimination();
      }
    }, 2500);
  };

  const nextPlayerAfterElimination = () => {
    const activePlayersList = activePlayers.filter((p) => p.active);
    if (activePlayersList.length === 0) return;
    
    const currentActiveIndex = activePlayersList.indexOf(activePlayers[currentPlayer]);
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayersList.length;
    const nextPlayerIndex = activePlayers.indexOf(activePlayersList[nextActiveIndex]);
    
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);
    showSequence(sequence);
  };

  const endSinglePlayerGame = () => {
    setGameOver(true);
    const currentPlayerName = config.players[0];
    const finalScore = activePlayers[0].score;
    setTimeout(() => {
      onEndGame(finalScore, currentPlayerName);
    }, 2000);
  };

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

  return (
    <div className="game" ref={gameContainerRef}>
      <GameHeader
        onBackToMenu={onBackToMenu}
        score={getCurrentScore()}
        round={round}
        difficultyLevel={getDifficultyLevel()}
      />
      
      <PlayerInfo
        isSinglePlayer={config.isSinglePlayer}
        currentPlayerName={getCurrentPlayerName()}
        activePlayersList={getActivePlayersList()}
        activePlayers={activePlayers}
      />

      {!gameStarted ? (
        <StartScreen onStartGame={startGame} />
      ) : (
        <GeniusBoard
          colors={cores}
          activeColor={activeColor}
          onColorClick={handleColorClick}
          gameOver={gameOver}
          difficultyLevel={getDifficultyLevel()}
        />
      )}

      <GameMessages
        showEliminatedMessage={showEliminatedMessage}
        eliminatedMessage={eliminatedMessage}
        showWinnerMessage={showWinnerMessage}
        winnerMessage={winnerMessage}
        gameOver={gameOver}
        isSinglePlayer={config.isSinglePlayer}
        currentScore={getCurrentScore()}
        round={round}
      />
    </div>
  );
}