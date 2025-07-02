export default function ColorSections({ colors, activeColor, onColorClick }) {
  return (
    <div className="color-sections">
      {colors.map((color) => (
        <div
          key={color}
          className={`color-section ${color} ${
            activeColor === color ? 'active' : ''
          }`}
          onClick={() => onColorClick(color)}
        />
      ))}
    </div>
  );
}