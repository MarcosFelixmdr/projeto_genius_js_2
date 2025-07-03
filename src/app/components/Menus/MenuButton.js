import React from "react"

export default function MenuButtons({ onStartGame, onShowRanking }) {
  return (
    <div className="menu-buttons">
      <button className="start-btn" onClick={onStartGame}>
        INICIAR JOGO
      </button>
      <button className="ranking-btn" onClick={onShowRanking}>
        VER RANKING
      </button>
    </div>
  );
}