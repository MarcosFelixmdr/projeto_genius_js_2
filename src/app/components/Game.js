'use client';
import { useRef } from 'react';
import GameHeader from './GameHeader';
import PlayerInfo from './PlayerInfo';
import StartScreen from './StartScreen';
import GeniusBoard from './GeniusBoard';
import GameMessages from './GameMessages';
import useGameLogic from './GameLogic';
import usePlayerElimination from './PlayerElimination';

export default function Game({ config, onEndGame, onBackToMenu }) {
  const gameContainerRef = useRef(null);
  
  const gameLogic = useGameLogic(config, onEndGame);
  const playerElimination = usePlayerElimination(onEndGame);

  const handleColorClick = (color) => {
    if (
      gameLogic.isShowingSequence || 
      gameLogic.gameOver || 
      playerElimination.showEliminatedMessage || 
      playerElimination.showWinnerMessage
    ) return;

    const result = gameLogic.handleColorClick(color);
    
    // Se deve eliminar jogador no modo multiplayer
    if (result?.shouldEliminate && !config.isSinglePlayer) {
      playerElimination.eliminatePlayer(
        gameLogic.currentPlayer,
        gameLogic.activePlayers,
        gameLogic.setActivePlayers,
        gameLogic.round,
        gameLogic.setGameOver,
        gameLogic.showSequence,
        gameLogic.sequence,
        gameLogic.setCurrentPlayer,
        gameLogic.setPlayerSequence
      );
    }
  };

  return (
    <div className="game" ref={gameContainerRef}>
      <GameHeader
        onBackToMenu={onBackToMenu}
        score={gameLogic.getCurrentScore()}
        round={gameLogic.round}
        difficultyLevel={gameLogic.getDifficultyLevel()}
      />
      
      <PlayerInfo
        isSinglePlayer={config.isSinglePlayer}
        currentPlayerName={gameLogic.getCurrentPlayerName()}
        activePlayersList={gameLogic.getActivePlayersList()}
        activePlayers={gameLogic.activePlayers}
      />

      {!gameLogic.gameStarted ? (
        <StartScreen onStartGame={gameLogic.startGame} />
      ) : (
        <GeniusBoard
          colors={gameLogic.cores}
          activeColor={gameLogic.activeColor}
          onColorClick={handleColorClick}
          gameOver={gameLogic.gameOver}
          difficultyLevel={gameLogic.getDifficultyLevel()}
        />
      )}

      <GameMessages
        showEliminatedMessage={playerElimination.showEliminatedMessage}
        eliminatedMessage={playerElimination.eliminatedMessage}
        showWinnerMessage={playerElimination.showWinnerMessage}
        winnerMessage={playerElimination.winnerMessage}
        gameOver={gameLogic.gameOver}
        isSinglePlayer={config.isSinglePlayer}
        currentScore={gameLogic.getCurrentScore()}
        round={gameLogic.round}
      />
    </div>
  );
}