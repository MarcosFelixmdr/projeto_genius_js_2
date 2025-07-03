import React from 'react';

export default function MenuPlayersInput({ numPlayers, playerNames, onChangeName }) {
  return (
    <div className="menu-section">
      <h2>Nome dos Jogadores</h2>
      <div className="player-inputs">
        {Array(numPlayers).fill(0).map((_, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Jogador ${index + 1}`}
            value={playerNames[index] || ''}
            onChange={(e) => onChangeName(index, e.target.value)}
            className="player-input"
            maxLength="15"
          />
        ))}
      </div>
    </div>
  );
}
