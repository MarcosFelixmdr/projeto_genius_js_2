'use client';
import { useState, useEffect, useRef } from 'react';

export default function Game({ config, onEndGame, onBackToMenu }) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activePlayers, setActivePlayers] = useState(
    config.players.map((name) => ({
      name,
      active: true,
      score: 0,
      roundsCompleted: 0,
    }))
  );
  const [speed, setSpeed] = useState(500);
  const [eliminatedMessage, setEliminatedMessage] = useState('');
  const [showEliminatedMessage, setShowEliminatedMessage] = useState(false);
  const [winnerMessage, setWinnerMessage] = useState('');
  const [showWinnerMessage, setShowWinnerMessage] = useState(false);
  const audioContextRef = useRef(null);
  const gameContainerRef = useRef(null);

  const cores = ['green', 'red', 'yellow', 'blue'];
  const frequencias = {
    green: 164.81,
    red: 220,
    yellow: 277.18,
    blue: 329.63,
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const playSound = (color, duration = 0.3) => {
    if (!audioContextRef.current) return;
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    oscillator.frequency.setValueAtTime(frequencias[color], audioContextRef.current.currentTime);
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + duration);
  };

  const startGame = () => {
    setGameStarted(true);
    if (config.isSinglePlayer) {
      nextRound();
    } else {
      // Começa com uma cor na sequência
      const firstColor = cores[Math.floor(Math.random() * cores.length)];
      setSequence([firstColor]);
      setTimeout(() => {
        showSequence([firstColor]);
      }, 300);
      setCurrentPlayer(0);
      setPlayerSequence([]);
    }
  };

  const nextRound = () => {
    const newColor = cores[Math.floor(Math.random() * cores.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    if (round % 3 === 0) {
      setSpeed((prev) => Math.max(250, prev - 100));
    }
    showSequence(newSequence);
    setRound((prev) => prev + 1);
  };

  const showSequence = async (seq) => {
    setIsShowingSequence(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    for (let i = 0; i < seq.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      setActiveColor(seq[i]);
      playSound(seq[i]);
      await new Promise((resolve) => setTimeout(resolve, speed));
      setActiveColor(null);
    }
    setIsShowingSequence(false);
  };

  const handleColorClick = (color) => {
    if (isShowingSequence || gameOver || showEliminatedMessage || showWinnerMessage) return;
    playSound(color, 0.2);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);
    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);
    const currentIndex = newPlayerSequence.length - 1;
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Jogador errou
      if (config.isSinglePlayer) {
        endSinglePlayerGame();
      } else {
        eliminatePlayer();
      }
    } else if (newPlayerSequence.length === sequence.length) {
      // Jogador acertou a sequência
      if (config.isSinglePlayer) {
        const newScore = activePlayers[0].score + sequence.length * 10;
        setActivePlayers((prev) =>
          prev.map((p, i) =>
            i === 0 ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => nextRound(), 500);
        setRound((prev) => prev + 1);
      } else {
        // Jogador acertou, adiciona cor e passa para o próximo
        const newScore = activePlayers[currentPlayer].score + sequence.length * 10;
        setActivePlayers((prev) =>
          prev.map((p, i) =>
            i === currentPlayer ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => addColorAndNextPlayer(), 800);
      }
    }
  };

  // Função principal do multiplayer: adiciona cor e passa para o próximo
  const addColorAndNextPlayer = () => {
    const newColor = cores[Math.floor(Math.random() * cores.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);

    // Próximo jogador ativo
    const activePlayersList = activePlayers.filter((p) => p.active);
    const currentActiveIndex = activePlayersList.indexOf(activePlayers[currentPlayer]);
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayersList.length;
    const nextPlayerIndex = activePlayers.indexOf(activePlayersList[nextActiveIndex]);
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);

    // Mostra a nova sequência para o próximo jogador
    showSequence(newSequence);

    // Aumenta dificuldade a cada 3 jogadas (opcional)
    if ((newSequence.length) % 3 === 0) {
      setSpeed((prev) => Math.max(250, prev - 100));
    }
    // Opcional: incrementar round a cada ciclo completo de jogadores
    if (nextActiveIndex === 0) {
      setRound((prev) => prev + 1);
    }
  };

  const eliminatePlayer = () => {
    const playerName = activePlayers[currentPlayer].name;
    const playerScore = activePlayers[currentPlayer].score;
    const roundsCompleted = round - 1;
    setEliminatedMessage(
      `${playerName} foi eliminado!\nPontuação: ${playerScore}\nRodadas: ${roundsCompleted}`
    );
    setShowEliminatedMessage(true);
    const newActivePlayers = [...activePlayers];
    newActivePlayers[currentPlayer].active = false;
    setActivePlayers(newActivePlayers);
    setTimeout(() => {
      setShowEliminatedMessage(false);
      setEliminatedMessage('');
      const remainingPlayers = newActivePlayers.filter((p) => p.active);
      if (remainingPlayers.length === 1) {
        const winner = remainingPlayers[0];
        setWinnerMessage(
          `${winner.name} venceu!\nPontuação Final: ${winner.score}\nRodadas Completadas: ${winner.roundsCompleted}`
        );
        setShowWinnerMessage(true);
        setGameOver(true);
        setTimeout(() => {
          onEndGame(winner.score, winner.name);
        }, 3000);
      } else if (remainingPlayers.length === 0) {
        endSinglePlayerGame();
      } else {
        nextPlayerAfterElimination();
      }
    }, 2500);
  };

  // Após eliminação, passa para o próximo jogador ativo
  const nextPlayerAfterElimination = () => {
    const activePlayersList = activePlayers.filter((p) => p.active);
    if (activePlayersList.length === 0) return;
    const currentActiveIndex = activePlayersList.indexOf(activePlayers[currentPlayer]);
    const nextActiveIndex = (currentActiveIndex + 1) % activePlayersList.length;
    const nextPlayerIndex = activePlayers.indexOf(activePlayersList[nextActiveIndex]);
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);
    showSequence(sequence);
  };

  const endSinglePlayerGame = () => {
    setGameOver(true);
    const currentPlayerName = config.players[0];
    const finalScore = activePlayers[0].score;
    setTimeout(() => {
      onEndGame(finalScore, currentPlayerName);
    }, 2000);
  };

  const getCurrentPlayerName = () => {
    if (config.isSinglePlayer) {
      return config.players[0];
    }
    return activePlayers[currentPlayer]?.name || '';
  };

  const getActivePlayersList = () => {
    return activePlayers.filter((p) => p.active).map((p) => p.name).join(', ');
  };

  const getCurrentScore = () => {
    if (config.isSinglePlayer) {
      return activePlayers[0]?.score || 0;
    }
    return activePlayers[currentPlayer]?.score || 0;
  };

  const getDifficultyLevel = () => {
    return Math.floor((sequence.length - 1) / 3) + 1;
  };

  return (
    <div className="game" ref={gameContainerRef}>
      <div className="game-header">
        <button className="back-btn" onClick={onBackToMenu}>
          ← MENU
        </button>
        <div className="game-info">
          <div className="score">Pontuação: {getCurrentScore()}</div>
          <div className="round">Rodada: {round}</div>
          <div className="speed">Nível: {getDifficultyLevel()}</div>
        </div>
      </div>
      <div className="player-info">
        {config.isSinglePlayer ? (
          <div className="current-player">Jogador: {getCurrentPlayerName()}</div>
        ) : (
          <div>
            <div
              className="current-player"
              style={{ color: '#ffd700', fontWeight: 'bold' }}
            >
              Vez de: {getCurrentPlayerName()}
            </div>
            <div
              className="active-players"
              style={{ color: '#ccc', fontSize: '14px' }}
            >
              Jogadores ativos: {getActivePlayersList()}
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
                        player.name === getCurrentPlayerName()
                          ? 'rgba(255, 215, 0, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      border:
                        player.name === getCurrentPlayerName()
                          ? '1px solid #ffd700'
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
      {!gameStarted ? (
        <div className="start-screen">
          <button className="start-game-btn" onClick={startGame}>
            COMEÇAR
          </button>
        </div>
      ) : (
        <div className="genius-container">
          <div className={`genius-game ${gameOver ? 'game-over' : ''}`}>
            <div className="color-sections">
              {cores.map((color) => (
                <div
                  key={color}
                  className={`color-section ${color} ${
                    activeColor === color ? 'active' : ''
                  }`}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
            <div className="center-display">
              <div className="brand">Genius</div>
              <div className="controls">
                <div className="level-display">
                  <div className="level-bars">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`level-bar ${
                          getDifficultyLevel() >= level ? 'active' : ''
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
          </div>
        </div>
      )}
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
      {gameOver && config.isSinglePlayer && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>Fim de Jogo!</h2>
            <p>Pontuação Final: {getCurrentScore()}</p>
            <p>Rodadas Completadas: {round - 1}</p>
          </div>
        </div>
      )}
    </div>
  );
}