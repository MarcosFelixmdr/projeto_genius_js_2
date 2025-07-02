export default function CenterDisplay({ difficultyLevel }) {
  return (
    <div className="center-display">
      <div className="brand">Genius</div>
      <div className="controls">
        <div className="level-display">
          <div className="level-bars">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`level-bar ${
                  difficultyLevel >= level ? 'active' : ''
                }`}
              />
            ))}
          </div>
        </div>
        <div className="control-buttons">
          <div className="control-row">
            <button className="control-btn yellow-btn">REPETE</button>
            <button className="control-btn red-btn">PARTIDA</button>
            <button className="control-btn yellow-btn">MAIS LONGO</button>
          </div>
          <div className="power-section">
            <div className="power-slider">
              <div className="slider-track"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}