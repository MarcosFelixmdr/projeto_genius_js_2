import { useState } from 'react';

export default function PlayerElimination(onEndGame) {
  const [eliminatedMessage, setEliminatedMessage] = useState('');
  const [showEliminatedMessage, setShowEliminatedMessage] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [showWinnerMessage, setShowWinnerMessage] = useState(false);

  const eliminatePlayer = (
    currentPlayer,
    activePlayers,
    setActivePlayers,
    round,
    setGameOver,
    showSequence,
    sequence,
    setCurrentPlayer,
    setPlayerSequence
  ) => {
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
        // Todos eliminados
        setGameOver(true);
      } else {
        nextPlayerAfterElimination(
          activePlayers,
          currentPlayer,
          setCurrentPlayer,
          setPlayerSequence,
          showSequence,
          sequence
        );
      }
    }, 2500);
  };

  const nextPlayerAfterElimination = (
    activePlayers,
    currentPlayer,
    setCurrentPlayer,
    setPlayerSequence,
    showSequence,
    sequence
  ) => {
    const activePlayersList = activePlayers.filter((p) => p.active);
    if (activePlayersList.length === 0) return;
    
    const currentActiveIndex = activePlayersList.indexOf(activePlayers[currentPlayer]);
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayersList.length;
    const nextPlayerIndex = activePlayers.indexOf(activePlayersList[nextActiveIndex]);
    
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);
    showSequence(sequence);
  };

  return {
    eliminatedMessage,
    showEliminatedMessage,
    winnerMessage,
    showWinnerMessage,
    eliminatePlayer,
    setShowEliminatedMessage,
    setShowWinnerMessage,
  };
}