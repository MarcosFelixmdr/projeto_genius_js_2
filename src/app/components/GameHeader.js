export default function GameHeader({ onBackToMenu, score, round, difficultyLevel }) {
  return (
    <div className="game-header">
      <button className="back-btn" onClick={onBackToMenu}>
        ← MENU
      </button>
      <div className="game-info">
        <div className="score">Pontuação: {score}</div>
        <div className="round">Rodada: {round}</div>
        <div className="speed">Nível: {difficultyLevel}</div>
      </div>
    </div>
  );
}