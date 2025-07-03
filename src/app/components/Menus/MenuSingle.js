import React from "react"

export default function MenuSingle ({ handlePlayerCountChange, numPlayers, isSinglePlayer}) {
    return(
        <>
            {!isSinglePlayer && (
                <div className="menu-section">
                    <h2>Número de Jogadores</h2>
                    <div className="player-count-buttons">
                        {[2, 3, 4].map(count => (
                        <button
                    key={count}
                    className={`count-btn ${numPlayers === count ? 'active' : ''}`}
                    onClick={() => handlePlayerCountChange(count)}
                    >
                    {count}
                    </button>
                ))}
                    </div>
                </div>
            )}
        </>
    );
}