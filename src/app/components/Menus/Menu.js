'use client';

import { useState } from 'react';
import MenuButton from './MenuButton';
import MenuPlayersInput from './MenuPlayersInput';
export default function Menu({ onStartGame, onShowRanking }) {
  const [isSinglePlayer, setIsSinglePlayer] = useState(true);
  /*const [isMultiplayer, setIsMultiplayer] = useState (true);*/
  const [numPlayers, setNumPlayers] = useState(1);
  const [playerNames, setPlayerNames] = useState(['']);

  const handlePlayerCountChange = (count) => {
    setNumPlayers(count);
    const names = Array(count).fill('').map((_, i) => playerNames[i] || '');
    setPlayerNames(names);
  };

  const handlePlayerNameChange = (index, name) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
  };

  const handleStartGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    if (validNames.length < numPlayers) {
      alert('Por favor, preencha o nome de todos os jogadores');
      return;
    }

    onStartGame({
      players: validNames,
      isSinglePlayer,
      numPlayers
    });
  };

  return (
    <div className="menu">
      <div className="menu-container">
        <h1 className="menu-title">GENIUS</h1>
        
        <div className="menu-section">
          <h2>Modo de Jogo</h2>
          <div className="game-mode-buttons">
            <button 
              className={`mode-btn ${isSinglePlayer ? 'active' : ''}`}
              onClick={() => {
                setIsSinglePlayer(true);
                setNumPlayers(1);
                setPlayerNames(['']);
              }}
            >
              Single Player
            </button>
            <button 
              className={`mode-btn ${!isSinglePlayer ? 'active' : ''}`}
              onClick={() => {
                setIsSinglePlayer(false);
                setNumPlayers(2);
                setPlayerNames(['', '']);
              }}
            >
              Multiplayer
            </button>
          </div>
        </div>

        {!isSinglePlayer && (
          <div className="menu-section">
            <h2>Número de Jogadores</h2>
            <div className="player-count-buttons">
              {[2, 3, 4].map(count => (
                <button
                  key={count}
                  className={`count-btn ${numPlayers === count ? 'active' : ''}`}
                  onClick={() => handlePlayerCountChange(count)}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}

        <MenuPlayersInput
          numPlayers={numPlayers}
          playerNames={playerNames}
          onChangeName={handlePlayerNameChange}
        />

        <MenuButton 
          onStartGame={handleStartGame} 
          onShowRanking={onShowRanking} 
        />

      </div>
    </div>
  );
}