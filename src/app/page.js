'use client';
import { useState, useEffect } from 'react';
import Menu from './components/Menu';
import Game from './components/Game/Game';
import Ranking from './components/Ranking';
import './globals.css';

export default function Home() {
  const [gameState, setGameState] = useState('menu'); // menu, game, ranking
  const [gameConfig, setGameConfig] = useState({
    players: [],
    isSinglePlayer: true,
    numPlayers: 1
  });

  const startGame = (config) => {
    setGameConfig(config);
    setGameState('game');
  };

  const endGame = (score, playerName) => {
    // Salvar pontuação no ranking
    const rankings = JSON.parse(localStorage.getItem('geniusRankings') || '[]');
    rankings.push({
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString(),
      mode: gameConfig.isSinglePlayer ? 'Single Player' : 'Multiplayer'
    });
    rankings.sort((a, b) => b.score - a.score);
    localStorage.setItem('geniusRankings', JSON.stringify(rankings.slice(0, 10)));
    
    setGameState('ranking');
  };

  const goToMenu = () => {
    setGameState('menu');
  };

  return (
    <div className="app">
      {gameState === 'menu' && <Menu onStartGame={startGame} onShowRanking={() => setGameState('ranking')} />}
      {gameState === 'game' && <Game config={gameConfig} onEndGame={endGame} onBackToMenu={goToMenu} />}
      {gameState === 'ranking' && <Ranking onBackToMenu={goToMenu} />}
    </div>
  );
}