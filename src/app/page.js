'use client';
import { useState, useEffect } from 'react';
import Menu from './components/Menus/Menu';
import Game from './components/Game/Game';
import Ranking from './components/Ranking/Ranking';
import './globals.css';
import AvatarSelector, { avatarList } from './components/Menus/AvatarSelector';

export default function Home() {
  const [selectedAvatar, setSelectedAvatar] = useState(avatarList[0]);
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

  const endGame = async (score, playerName) => {
    // // Salvar pontuação no ranking
    // const rankings = JSON.parse(localStorage.getItem('geniusRankings') || '[]');
    // rankings.push({
    //   name: playerName,
    //   score: score,
    //   date: new Date().toLocaleDateString(),
    //   mode: gameConfig.isSinglePlayer ? 'Single Player' : 'Multiplayer'
    // });
    // rankings.sort((a, b) => b.score - a.score);
    // localStorage.setItem('geniusRankings', JSON.stringify(rankings.slice(0, 10)));
    
    setGameState('ranking');

    await fetch('/api/registers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ avatar: selectedAvatar?.id || '1', name: playerName, points: score, mode: gameConfig.isSinglePlayer ? 'Single Player' : 'Multiplayer' }), //mode
    });
    // Requisicao do tipo POST para o banco de dados com os dados do jogador(points e name)
  };

  const goToMenu = () => {
    setGameState('menu');
  };

  useEffect(() => {
    console.log('Avatar atualizado:', selectedAvatar);
  }, [selectedAvatar]);

  return (
    <div className="app">
      {gameState === 'menu' && <Menu onStartGame={startGame} onShowRanking={() => setGameState('ranking')} 
        avatarSelector={
          <AvatarSelector 
            selected={selectedAvatar} 
            onSelect={setSelectedAvatar} />}
        />}
      {gameState === 'game' && <Game config={gameConfig} onEndGame={endGame} onBackToMenu={goToMenu} />}
      {gameState === 'ranking' && <Ranking onBackToMenu={goToMenu} />}
    </div>
  );
}