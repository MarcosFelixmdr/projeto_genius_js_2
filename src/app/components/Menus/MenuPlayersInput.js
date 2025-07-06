import React, { useState, useEffect } from 'react';
import AvatarSelector, { avatarList } from './AvatarSelector';

export default function MenuPlayersInput({ numPlayers, playerNames, onChangeName }) {
  // Defina os avatares padrão para cada jogador (ajuste conforme o número de jogadores)
  const defaultAvatars = [
    avatarList[0], // Jogador 1
    avatarList[1], // Jogador 2
    avatarList[2], // Jogador 3
    avatarList[3], // Jogador 4
    // ...adicione mais se necessário
  ];

  // Inicialize o estado com os avatares padrão
  const [avatars, setAvatars] = useState(
    Array(numPlayers).fill().map((_, i) => defaultAvatars[i] || avatarList[0])
  );

  // Atualiza o array de avatares se o número de jogadores mudar
  useEffect(() => {
    setAvatars(prev =>
      Array(numPlayers)
        .fill()
        .map((_, i) => prev[i] || defaultAvatars[i] || avatarList[0])
    );
  }, [numPlayers]);

  const handleAvatarSelect = (index, avatar) => {
    setAvatars(prev => {
      const next = [...prev];
      next[index] = avatar;
      return next;
    });
  };

  return (
    <div className="menu-section">
      <h2>Nome dos Jogadores</h2>
      <div className="player-inputs">
        {Array(numPlayers).fill(0).map((_, index) => (
          <div key={index} style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <AvatarSelector
              selected={avatars[index]}
              onSelect={avatar => handleAvatarSelect(index, avatar)}
            />
            <input
              type="text"
              placeholder={`Jogador ${index + 1}`}
              value={playerNames[index] || ''}
              onChange={(e) => onChangeName(index, e.target.value)}
              className="player-input"
              maxLength="15"
              style={{ marginLeft: 12 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}