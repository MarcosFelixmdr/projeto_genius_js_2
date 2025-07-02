export default function PlayerInfo({ 
  isSinglePlayer, 
  currentPlayerName, 
  activePlayersList, 
  activePlayers 
}) {
  return (
    <div className="player-info">
      {isSinglePlayer ? (
        <div className="current-player">Jogador: {currentPlayerName}</div>
      ) : (
        <div>
          <div
            className="current-player"
            style={{ color: ' #2a5298', fontWeight: 'bold' }}
          >
            Vez de: {currentPlayerName}
          </div>
          <div
            className="active-players"
            style={{ color: '#ccc', fontSize: '14px' }}
          >
            Jogadores ativos: {activePlayersList}
          </div>
          <div
            className="players-scores"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
              marginTop: '10px',
              justifyContent: 'center',
            }}
          >
            {activePlayers
              .filter((p) => p.active)
              .map((player, index) => (
                <div
                  key={index}
                  style={{
                    background:
                      player.name === currentPlayerName
                        ? ' #2a5298'
                        : 'rgba(255, 255, 255, 0.1)',
                    padding: '5px 10px',
                    borderRadius: '4px',
                    fontSize: '14px',
                    border:
                      player.name === currentPlayerName
                        ? '2px solid #000'
                        : '1px solid transparent',
                  }}
                >
                  {player.name}: {player.score} pts
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}