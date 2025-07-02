export default function GameMessages({
  showEliminatedMessage,
  eliminatedMessage,
  showWinnerMessage,
  winnerMessage,
  gameOver,
  isSinglePlayer,
  currentScore,
  round
}) {
  return (
    <>
      {/* Mensagem de jogador eliminado */}
      {showEliminatedMessage && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>Jogador Eliminado!</h2>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {eliminatedMessage}
            </div>
          </div>
        </div>
      )}

      {/* Mensagem de vitória */}
      {showWinnerMessage && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>🎉 Vencedor!</h2>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
              {winnerMessage}
            </div>
          </div>
        </div>
      )}

      {/* Game Over para single player */}
      {gameOver && isSinglePlayer && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>Fim de Jogo!</h2>
            <p>Pontuação Final: {currentScore}</p>
            <p>Rodadas Completadas: {round - 1}</p>
          </div>
        </div>
      )}
    </>
  );
}