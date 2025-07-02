export default function StartScreen({ onStartGame }) {
  return (
    <div className="start-screen">
      <button className="start-game-btn" onClick={onStartGame}>
        COMEÇAR
      </button>
    </div>
  );
}