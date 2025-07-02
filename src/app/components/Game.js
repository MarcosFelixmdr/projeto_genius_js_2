'use client' // Indica ao Next.js que este componente deve ser renderizado no cliente (browser), não no servidor.
import { useState, useEffect, useRef } from 'react'; 
// Importa hooks do React: 
// - useState: para criar e gerenciar estados;
// - useEffect: para lidar com efeitos colaterais (como eventos, timers, etc);
// - useRef: para criar referências que persistem entre renderizações sem disparar re-render.
export default function Game({ config, onEndGame, onBackToMenu }) { 
// Define e exporta o componente Game como default. 
// Ele recebe três props: 
// - config: configurações do jogo (ex: jogadores);
// - onEndGame: função chamada quando o jogo termina;
// - onBackToMenu: função chamada quando o jogador quer voltar ao menu.
  const [sequence, setSequence] = useState([]); // Guarda a sequência de cores gerada pelo jogo.
  const [playerSequence, setPlayerSequence] = useState([]); // Guarda a sequência de cores que o jogador clicou.
  const [currentPlayer, setCurrentPlayer] = useState(0); // Guarda o índice do jogador atual na lista de jogadores ativos.
  const [isShowingSequence, setIsShowingSequence] = useState(false); 
  // Indica se o jogo está exibindo a sequência ao jogador (para memorizar).
  const [activeColor, setActiveColor] = useState(null); 
  // Guarda a cor atual sendo exibida (para efeitos visuais, como piscar).
  const [round, setRound] = useState(1); // Guarda o número da rodada atual.
  const [gameStarted, setGameStarted] = useState(false); // Indica se o jogo já foi iniciado.
  const [gameOver, setGameOver] = useState(false); // Indica se o jogo terminou.
  const [activePlayers, setActivePlayers] = useState(
    config.players.map((name) => ({
      name,
      active: true,
      score: 0,
      roundsCompleted: 0,
    }))
  ); 
  // Armazena a lista de jogadores ativos, com:
  // - name: nome do jogador
  // - active: se o jogador ainda está no jogo
  // - score: pontuação do jogador
  // - roundsCompleted: quantas rodadas o jogador completou
  const [speed, setSpeed] = useState(500); // Define a velocidade (em ms) para exibir as cores na sequência.  
  const [eliminatedMessage, setEliminatedMessage] = useState(''); // Guarda a mensagem de eliminação de um jogador.
  const [showEliminatedMessage, setShowEliminatedMessage] = useState(false); 
  // Controla se a mensagem de eliminação deve ser exibida na tela.
  const [winnerMessage, setWinnerMessage] = useState(''); // Guarda a mensagem de vitória do jogador vencedor.
  const [showWinnerMessage, setShowWinnerMessage] = useState(false); 
  // Controla se a mensagem de vitória deve ser exibida na tela.
  const audioContextRef = useRef(null); 
  // Ref para armazenar o contexto de áudio (para tocar sons sem recriar o contexto a cada render).
  const gameContainerRef = useRef(null); 
  // Ref para acessar diretamente o elemento container do jogo no DOM (ex: para foco, scroll, etc).
  const cores = ['green', 'red', 'yellow', 'blue']; 
// Define um array com as cores possíveis usadas no jogo.
// Isso representa as opções de cores da sequência (por exemplo, botões coloridos).
const frequencias = { 
// Cria um objeto que associa cada cor a uma frequência sonora.
// Cada cor tem um tom específico que será usado para gerar som quando a cor for ativada.
  green: 164.81,       // Frequência em Hz para a cor verde.
  red: 220,            // Frequência em Hz para a cor vermelha.
  yellow: 277.18,      // Frequência em Hz para a cor amarela.
  blue: 329.63,        // Frequência em Hz para a cor azul.
}

useEffect(() => { 
// Hook que executa um efeito colateral quando o componente é montado (porque o array de dependências é []).
// Aqui, ele inicializa o contexto de áudio apenas uma vez, ao carregar o componente.
  if (typeof window !== 'undefined') { 
  // Garante que o código só será executado no cliente (browser), porque o objeto window não existe no servidor.
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)(); 
    // Cria um novo contexto de áudio (compatível com navegadores mais antigos que usam webkitAudioContext)
    // Armazena na ref audioContextRef.
    // Esse contexto será usado para gerar sons ao longo do jogo.
  }
}, []); // O array vazio indica que este efeito será executado apenas na montagem do componente.

  const playSound = (color, duration = 0.3) => { 
// Declara uma função chamada playSound que:
// - recebe uma cor (color) para determinar o tom/frequência a tocar,
// - recebe uma duração (duration) em segundos.

  if (!audioContextRef.current) return; 
  // Se o contexto de áudio ainda não foi criado (por algum motivo), a função termina e não faz nada.
  const oscillator = audioContextRef.current.createOscillator(); // Cria um oscilador (gerador de onda sonora) que vai produzir o som.
  const gainNode = audioContextRef.current.createGain(); // Cria um nó de ganho (volume) para controlar a intensidade do som.
  oscillator.connect(gainNode); // Conecta o oscilador ao nó de ganho (o som passa primeiro pelo controle de volume).
  gainNode.connect(audioContextRef.current.destination); 
  // Conecta o nó de ganho ao destino final do áudio (as caixas de som / fones do usuário).
  oscillator.frequency.setValueAtTime(
    frequencias[color], 
    audioContextRef.current.currentTime
  ); // Define a frequência (tom) do oscilador baseada na cor recebida (por exemplo, 'green' = 164.81 Hz).
  oscillator.type = 'sine'; // Define o tipo de onda do oscilador como "senoidal", o que produz um som suave e puro.
  gainNode.gain.setValueAtTime(
    0.3, 
    audioContextRef.current.currentTime
  ); // Define o volume inicial do som (0.3 = 30% do volume máximo).
  gainNode.gain.exponentialRampToValueAtTime(
    0.01, 
    audioContextRef.current.currentTime + duration
  ); // Faz o volume diminuir exponencialmente até quase zero (0.01) no fim da duração do som,
  // criando um efeito de "desvanecimento" (fade-out).
  oscillator.start(audioContextRef.current.currentTime); // Inicia o som imediatamente.
  oscillator.stop(audioContextRef.current.currentTime + duration); 
  // Para o som após o tempo definido na duração (por padrão, 0.3 segundos).
};

 const startGame = () => { 
// Declara uma função chamada startGame, responsável por iniciar o jogo.
// Ela configura os estados iniciais dependendo se é single player ou multiplayer.
  setGameStarted(true); // Marca o estado do jogo como iniciado (gameStarted = true).
  if (config.isSinglePlayer) { // Verifica se o jogo está no modo single player (1 jogador).
    nextRound(); 
    // Se for single player, já inicia a primeira rodada chamando a função nextRound()
    // (presumivelmente ela gera a sequência inicial e começa a mostrar).
  } else { 
  // Se for multiplayer:
    // Começa com uma cor aleatória na sequência
    const firstColor = cores[Math.floor(Math.random() * cores.length)]; 
    // Escolhe aleatoriamente uma cor do array cores (green, red, yellow, blue)
    // e armazena em firstColor.
    setSequence([firstColor]); // Define a sequência inicial como um array contendo essa primeira cor sorteada.
    setTimeout(() => { // Aguarda 300 milissegundos antes de começar a exibir a sequência.
      showSequence([firstColor]); // Exibe a sequência inicial (com apenas a primeira cor sorteada).
    }, 300); 
    setCurrentPlayer(0); // Define o jogador atual como o primeiro da lista (índice 0).
    setPlayerSequence([]); 
    // Reseta a sequência de jogadas do jogador atual para um array vazio (o jogador ainda não jogou nada).
  }
};

  const nextRound = () => { 
// Declara a função nextRound, que inicia uma nova rodada no jogo.
// Ela sorteia uma nova cor, atualiza a sequência e exibe para o(s) jogador(es).
  const newColor = cores[Math.floor(Math.random() * cores.length)]; 
  // Sorteia aleatoriamente uma nova cor do array `cores` (green, red, yellow, blue).
  const newSequence = [...sequence, newColor]; // Cria uma nova sequência copiando a sequência atual e adicionando a nova cor ao final.
  setSequence(newSequence); // Atualiza o estado da sequência do jogo com a nova sequência.
  setPlayerSequence([]); // Limpa a sequência de jogadas do jogador atual (porque o jogador ainda não jogou nesta rodada).
  if (round % 3 === 0) { // Verifica se a rodada atual é múltiplo de 3 (ou seja, a cada 3 rodadas completas).
    setSpeed((prev) => Math.max(250, prev - 100)); 
    // Reduz a velocidade em 100ms (para aumentar a dificuldade), 
    // mas nunca abaixo de 250ms (limite mínimo de velocidade).
  }

  showSequence(newSequence); // Chama a função que exibe a nova sequência (mostra as cores para o jogador memorizar).
  setRound((prev) => prev + 1); // Incrementa o número da rodada (avança para a próxima rodada).
};

const showSequence = async (seq) => { 
// Declara uma função assíncrona chamada showSequence que:
// - recebe uma sequência de cores (seq)
// - exibe a sequência ao jogador, com sons e destaque visual.
  setIsShowingSequence(true); // Marca o estado como "mostrando a sequência" (para bloquear interação do jogador durante a exibição).
  await new Promise((resolve) => setTimeout(resolve, 500)); 
  // Aguarda 500ms antes de começar a exibir a sequência (pequena pausa inicial).
  for (let i = 0; i < seq.length; i++) { // Percorre cada cor da sequência.
    await new Promise((resolve) => setTimeout(resolve, 200)); // Aguarda 200ms antes de acender a próxima cor (pausa entre cores).
    setActiveColor(seq[i]); // Define a cor ativa (para acender a cor visualmente na interface).
    playSound(seq[i]); // Toca o som correspondente à cor atual.
    await new Promise((resolve) => setTimeout(resolve, speed)); 
    // Aguarda o tempo definido em `speed` com a cor acesa (duração da exibição da cor).
    setActiveColor(null); // Apaga a cor ativa (desativa o destaque visual).
  }

  setIsShowingSequence(false); 
  // Quando termina de exibir toda a sequência, marca que não está mais mostrando a sequência (o jogador pode interagir).
};

  const handleColorClick = (color) => {
    // Declara a função que será chamada quando o jogador clicar em uma cor.
    // Recebe a cor clicada como argumento.
    if (isShowingSequence || gameOver || showEliminatedMessage || showWinnerMessage) return;
    // Se o jogo está mostrando a sequência, já terminou, ou está exibindo uma mensagem de eliminado/vencedor,
    // o clique é ignorado (bloqueia interação nesses momentos).
    playSound(color, 0.2); // Toca o som da cor clicada, com duração de 0.2 segundos.
    setActiveColor(color); // Ativa visualmente a cor clicada (ex.: faz o botão piscar ou mudar de estilo).
    setTimeout(() => setActiveColor(null), 200); // Após 200 ms, desativa o destaque visual da cor.
    const newPlayerSequence = [...playerSequence, color]; 
    // Cria uma nova sequência do jogador, adicionando a cor clicada à sequência atual.
    setPlayerSequence(newPlayerSequence); // Atualiza o estado com a nova sequência do jogador.
    const currentIndex = newPlayerSequence.length - 1; 
    // Calcula o índice do último item clicado (para comparar com a sequência do jogo).
    if (newPlayerSequence[currentIndex] !== sequence[currentIndex]) {
      // Verifica se a cor clicada no índice atual está correta (comparada com a sequência do jogo).
      // Se Jogador errou elimina 
      if (config.isSinglePlayer) { // Se for modo single player:
        endSinglePlayerGame(); // Termina o jogo single player.
      } else { // Se for multiplayer:
        eliminatePlayer(); // Elimina o jogador atual.
      }
    } else if (newPlayerSequence.length === sequence.length) { // Se o jogador acertou até agora e completou toda a sequência:
      // Jogador acertou a sequência
      if (config.isSinglePlayer) { // Se for single player:
        const newScore = activePlayers[0].score + sequence.length * 10; 
        // Calcula o novo score (10 pontos por cor correta na sequência).
        setActivePlayers((prev) => // Atualiza o score e o número de rodadas concluídas do único jogador ativo.
          prev.map((p, i) =>
            i === 0 ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => nextRound(), 500); // Aguarda 500ms e inicia a próxima rodada.
        setRound((prev) => prev + 1); // Avança o número da rodada.
      } else { // Se for multiplayer:
        // Jogador acertou, adiciona cor e passa para o próximo
        const newScore = activePlayers[currentPlayer].score + sequence.length * 10; // Calcula o novo score do jogador atual.
        setActivePlayers((prev) => // Atualiza o score e as rodadas concluídas do jogador atual.
          prev.map((p, i) =>
            i === currentPlayer ? { ...p, score: newScore, roundsCompleted: round } : p
          )
        );
        setTimeout(() => addColorAndNextPlayer(), 800); 
        // Aguarda 800ms e chama a função que adiciona uma nova cor à sequência 
        // E passa para o próximo jogador.
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

  const eliminatePlayer = () => { // Declara a função eliminatePlayer, chamada quando um jogador erra e deve ser eliminado.
    const playerName = activePlayers[currentPlayer].name; // Pega o nome do jogador atual.
    const playerScore = activePlayers[currentPlayer].score; // Pega a pontuação do jogador atual.
    const roundsCompleted = round - 1; 
    // Calcula quantas rodadas o jogador completou (a rodada atual ainda não foi concluída porque ele errou).
    setEliminatedMessage( // Define a mensagem de eliminação, mostrando nome, pontuação e rodadas concluídas.
      `${playerName} foi eliminado!\nPontuação: ${playerScore}\nRodadas: ${roundsCompleted}`
    );
    setShowEliminatedMessage(true); // Exibe a mensagem de eliminação na interface.
    const newActivePlayers = [...activePlayers]; // Cria uma cópia da lista de jogadores ativos.
    newActivePlayers[currentPlayer].active = false; // Marca o jogador atual como inativo (eliminado).
    setActivePlayers(newActivePlayers); // Atualiza o estado dos jogadores ativos com o jogador eliminado.
    setTimeout(() => { // Aguarda 2,5 segundos para o jogador ver a mensagem de eliminação antes de seguir o fluxo do jogo.
      setShowEliminatedMessage(false); // Oculta a mensagem de eliminação.
      setEliminatedMessage(''); // Limpa o texto da mensagem de eliminação.
      const remainingPlayers = newActivePlayers.filter((p) => p.active); 
      // Cria um array com os jogadores que ainda estão ativos (não eliminados).
      if (remainingPlayers.length === 1) { // Se só sobrou um jogador:
        const winner = remainingPlayers[0]; // Pega o jogador vencedor.
        setWinnerMessage( // Define a mensagem de vitória com nome, pontuação final e rodadas completadas.
          `${winner.name} venceu!\nPontuação Final: ${winner.score}\nRodadas Completadas: ${winner.roundsCompleted}`
        );
        setShowWinnerMessage(true); // Exibe a mensagem de vitória.
        setGameOver(true); // Marca o jogo como encerrado.
        setTimeout(() => { // Aguarda 3 segundos para exibir a mensagem de vitória antes de encerrar de fato.
          onEndGame(winner.score, winner.name); // Chama a função de finalização do jogo, passando a pontuação e o nome do vencedor.
        }, 3000); // Tempo que exibe na tela em MS
      } else if (remainingPlayers.length === 0) {
        endSinglePlayerGame(); // Finaliza o jogo como se fosse um modo single player (encerramento genérico).
      } else { // Se ainda houver mais de um jogador ativo:
        nextPlayerAfterElimination(); // Chama a função que passa a vez para o próximo jogador após uma eliminação.
      }
    }, 2500); // Fim do timeout de 2,5 segundos.
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

  const endSinglePlayerGame = () => { // Declara a função endSinglePlayerGame, responsável por finalizar o jogo no modo single player.
    setGameOver(true); // Marca o estado do jogo como encerrado (gameOver = true).
    const currentPlayerName = config.players[0]; 
    // Pega o nome do único jogador no modo single player (é o primeiro da lista de players no config).
    const finalScore = activePlayers[0].score; // Pega a pontuação final do jogador (o primeiro e único na lista de activePlayers).
    setTimeout(() => { 
      // Aguarda 2 segundos antes de realmente finalizar o jogo (pode ser para exibir alguma mensagem de fim ou efeito visual).
      onEndGame(finalScore, currentPlayerName); 
      // Chama a função onEndGame passada por prop, entregando a pontuação final e o nome do jogador.
    }, 2000); // Define o tempo de espera (2000 ms = 2 segundos).
  };

  const getCurrentPlayerName = () => {
    // Declara a função getCurrentPlayerName, que devolve o nome do jogador atual,
    // seja no modo single player ou multiplayer.
    if (config.isSinglePlayer) { // Verifica se o jogo está no modo single player.
      return config.players[0]; // Se for single player, retorna o nome do único jogador (o primeiro da lista em config.players).
    }
    return activePlayers[currentPlayer]?.name || ''; 
    // Se for multiplayer:
    // - Tenta retornar o nome do jogador atual na lista de activePlayers usando optional chaining (?.)
    //   para evitar erro caso o índice esteja fora dos limites.
    // - Se não encontrar (undefined ou null), retorna string vazia como fallback.
  };

  const getActivePlayersList = () => {
    // Declara a função que gera uma lista (string) com os nomes dos jogadores que ainda estão ativos no jogo.
    return activePlayers.filter((p) => p.active).map((p) => p.name).join(', ');
    // activePlayers.filter filtra apenas os jogadores que ainda estão ativos (não eliminados).
    // Map extrai os nomes desses jogadores.
    // Join junta os nomes em uma string, separados por vírgula.
  };

  const getCurrentScore = () => { // Declara a função que retorna a pontuação do jogador atual.
    if (config.isSinglePlayer) { // Se o jogo for single player:
      return activePlayers[0]?.score || 0; // Retorna a pontuação do único jogador (ou 0 se não existir por algum motivo).
    }
    return activePlayers[currentPlayer]?.score || 0;
    // Se for multiplayer:
    // Retorna a pontuação do jogador atual (ou 0 se o jogador atual não existir).
  }; 

  const getDifficultyLevel = () => { // Declara a função que calcula o nível de dificuldade com base no comprimento da sequência.
    return Math.floor((sequence.length - 1) / 3) + 1;
    // Calcula o nível de dificuldade:
    // - Para cada 3 cores adicionadas à sequência, sobe 1 nível de dificuldade.
    // - Começa no nível 1.
    // Exemplo: 
    // sequência.length = 1 a 3 → nível 1
    // sequência.length = 4 a 6 → nível 2
    // sequência.length = 7 a 9 → nível 3, e assim por diante.
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
              style={{ color: ' #2a5298', fontWeight: 'bold' }}
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
                          ? ' #2a5298'
                          : 'rgba(255, 255, 255, 0.1)',
                      padding: '5px 10px',
                      borderRadius: '4px',
                      fontSize: '14px',
                      border:
                        player.name === getCurrentPlayerName()
                          ? '2px solid #000'
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