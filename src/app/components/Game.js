'use client';

import { useState, useEffect, useRef } from 'react';

export default function Game({ config, onEndGame, onBackToMenu }) {
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeColor, setActiveColor] = useState(null);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [activePlayers, setActivePlayers] = useState(config.players.map(name => ({ name, active: true })));
  const [speed, setSpeed] = useState(600); // velocidade inicial

  const audioContextRef = useRef(null);
  const gameContainerRef = useRef(null);

  const cores = ['green', 'red', 'yellow', 'blue'];
  const frequencias = { green: 164.81, red: 220, yellow: 277.18, blue: 329.63 };

  useEffect(() => {
    // Inicializar AudioContext
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
    nextRound();
  };

  const nextRound = () => {
    const newColor = cores[Math.floor(Math.random() * cores.length)];
    const newSequence = [...sequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);
    setScore(prev => prev + 10);
    
    // Aumentar dificuldade a cada 3 rodadas
    if (round % 3 === 0) {
      setSpeed(prev => Math.max(300, prev - 150));
    }
    
    showSequence(newSequence);
    setRound(prev => prev + 1);
  };

  const showSequence = async (seq) => {
    setIsShowingSequence(true);
    
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setActiveColor(seq[i]);
      playSound(seq[i]);
      await new Promise(resolve => setTimeout(resolve, speed));
      setActiveColor(null);
    }
    
    setIsShowingSequence(false);
  };

  const handleColorClick = (color) => {
    if (isShowingSequence || gameOver) return;

    playSound(color, 0.2);
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSequence = [...playerSequence, color];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Jogador errou
      if (config.isSinglePlayer) {
        endGame();
      } else {
        eliminatePlayer();
        setMessage()
      }
    } else if (newPlayerSequence.length === sequence.length) {
      // Jogador completou a sequência
      setTimeout(() => {
        if (config.isSinglePlayer) {
          nextRound();
        } else {
          nextPlayer();
        }
      }, 500);
    }
  };

  const eliminatePlayer = () => {
    const newActivePlayers = [...activePlayers];
    newActivePlayers[currentPlayer].active = false;
    setActivePlayers(newActivePlayers);

    const remainingPlayers = newActivePlayers.filter(p => p.active);
    
    if (remainingPlayers.length === 1) {
      // Último jogador restante venceu
      onEndGame(score, remainingPlayers[0].name);
    } else if (remainingPlayers.length === 0) {
      // Todos foram eliminados (não deveria acontecer, mas por segurança)
      endGame();
    } else {
      nextPlayer();
    }
  };

  const nextPlayer = () => {
    let nextPlayerIndex = (currentPlayer + 1) % activePlayers.length;
    
    // Encontrar próximo jogador ativo
    while (!activePlayers[nextPlayerIndex].active) {
      nextPlayerIndex = (nextPlayerIndex + 1) % activePlayers.length;
    }
    
    setCurrentPlayer(nextPlayerIndex);
    setPlayerSequence([]);
    
    // Se todos os jogadores ativos completaram a rodada, próxima sequência
    const activeCount = activePlayers.filter(p => p.active).length;
    const currentActiveIndex = activePlayers.filter((p, i) => i <= currentPlayer && p.active).length;
    
    if (currentActiveIndex === activeCount) {
      setTimeout(() => nextRound(), 1000);
    }
  };

  const endGame = () => {
    setGameOver(true);
    const currentPlayerName = config.players[currentPlayer] || config.players[0];
    setTimeout(() => {
      onEndGame(score, currentPlayerName);
    }, 2000);
  };

  const getCurrentPlayerName = () => {
    if (config.isSinglePlayer) {
      return config.players[0];
    }
    return activePlayers[currentPlayer]?.name || '';
  };

  const getActivePlayersList = () => {
    return activePlayers.filter(p => p.active).map(p => p.name).join(', ');
  };

  return (
    <div className="game" ref={gameContainerRef}>
      <div className="game-header">
        <button className="back-btn" onClick={onBackToMenu}>← MENU</button>
        <div className="game-info">
          <div className="score">Pontuação: {score}</div>
          <div className="round">Rodada: {round}</div>
          <div className="speed">Velocidade: {((1000 - speed) / 100 + 1).toFixed(1)}x</div>
        </div>
      </div>

      <div className="player-info">
        {config.isSinglePlayer ? (
          <div className="current-player">Jogador: {getCurrentPlayerName()}</div>
        ) : (
          <div>
            <div className="current-player">Vez de: {getCurrentPlayerName()}</div>
            <div className="active-players">Ativos: {getActivePlayersList()}</div>
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
                  className={`color-section ${color} ${activeColor === color ? 'active' : ''}`}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </div>
            
            <div className="center-display">
              <div className="brand">Genius</div>
              <div className="controls">
                <div className="level-display">
                  <div className="level-bars">
                    {[1, 2, 3, 4].map(level => (
                      <div 
                        key={level}
                        className={`level-bar ${Math.floor((round - 1) / 3) + 1 >= level ? 'active' : ''}`}
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

      {gameOver && (
        <div className="game-over-overlay">
          <div className="game-over-message">
            <h2>Fim de Jogo!</h2>
            <p>Pontuação Final: {score}</p>
            <p>Rodadas Completadas: {round - 1}</p>
          </div>
        </div>
      )}
    </div>
  );
}