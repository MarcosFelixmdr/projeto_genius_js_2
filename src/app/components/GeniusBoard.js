import ColorSections from './ColorSections';
import CenterDisplay from './CenterDisplay';

export default function GeniusBoard({
  colors,
  activeColor,
  onColorClick,
  gameOver,
  difficultyLevel
}) {
  return (
    <div className="genius-container">
      <div className={`genius-game ${gameOver ? 'game-over' : ''}`}>
        <ColorSections 
          colors={colors}
          activeColor={activeColor}
          onColorClick={onColorClick}
        />
        <CenterDisplay difficultyLevel={difficultyLevel} />
      </div>
    </div>
  );
}