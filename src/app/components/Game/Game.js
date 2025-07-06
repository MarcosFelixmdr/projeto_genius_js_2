//Este componente Game é o centro da experiência interativa:
//Junta dados (gameLogic, playerElimination),
//Exibe componentes visuais (telas, tabuleiro, mensagens),
//Reage à interação do usuário (como clicar nas cores),
//Controla transições de estados (tela de início → jogo ativo → mensagens de fim).

//O que faz?
//Indica que este arquivo deve ser tratado como um componente de cliente no Next.js
//(quando usado com renderização híbrida SSR/CSR).
//Por quê?
//Porque esse componente depende de funcionalidades que só existem no navegador
//(como eventos, interações do usuário, etc).
"use client";

//O que faz?
//Importa o useRef, um hook do React usado para armazenar
//valores mutáveis sem causar re-renderizações.
//Por quê?
//Provavelmente será usado para controlar alguma referência interna no jogo
//(como o estado de áudio, animações ou controles temporais).
import { useRef } from "react";

//O que faz?
//Importa os componentes visuais e funcionais do jogo:
//GameHeader: cabeçalho do jogo.
//PlayerInfo: exibe informações sobre o jogador.
//StartScreen: tela inicial antes de começar o jogo.
//GeniusBoard: o tabuleiro com as cores (provavelmente o principal do jogo).
//GameMessages: mensagens de feedback para o jogador.
//Por quê?
//A composição modular permite separar lógica e visual de forma limpa e reutilizável.
import GameHeader from "./GameHeader";
import PlayerInfo from "../Player/PlayerInfo";
import StartScreen from "../Sections/StartScreen";
import GeniusBoard from "../Sections/GeniusBoard";
import GameMessages from "./GameMessages";
import useGameLogic from "./GameLogic";
import usePlayerElimination from "../Player/PlayerElimination";

//O que faz?
//Declara o componente principal do jogo.
//Recebe 3 props:
//config: contém configurações do jogo (como número de jogadores, nível de dificuldade etc.).
//onEndGame: função chamada quando o jogo termina.
//onBackToMenu: função chamada quando o jogador volta para o menu inicial.
//Por quê?
//Isso permite que o componente Game seja reutilizado em diferentes contextos e que sua lógica de encerramento
// ou reinício seja controlada de fora.
export default function Game({ config, onEndGame, onBackToMenu }) {
  const gameContainerRef = useRef(null);

  const gameLogic = useGameLogic(config, onEndGame);
  const playerElimination = usePlayerElimination(onEndGame);

  const handleColorClick = (color) => {
    if (
      gameLogic.isShowingSequence ||
      gameLogic.gameOver ||
      playerElimination.showEliminatedMessage ||
      playerElimination.showWinnerMessage
    )
      return;

    const result = gameLogic.handleColorClick(color);

    // Se deve eliminar jogador no modo multiplayer
    if (result?.shouldEliminate && !config.isSinglePlayer) {
      playerElimination.eliminatePlayer(
        gameLogic.currentPlayer,
        gameLogic.activePlayers,
        gameLogic.setActivePlayers,
        gameLogic.round,
        gameLogic.setGameOver,
        gameLogic.showSequence,
        gameLogic.sequence,
        gameLogic.setCurrentPlayer,
        gameLogic.setPlayerSequence
      );
    }
  };

  return (
    <div className="game" ref={gameContainerRef}>
      <GameHeader
        onBackToMenu={onBackToMenu}
        score={gameLogic.getCurrentScore()}
        round={gameLogic.round}
        difficultyLevel={gameLogic.getDifficultyLevel()}
      />

      <PlayerInfo
        isSinglePlayer={config.isSinglePlayer}
        currentPlayerName={gameLogic.getCurrentPlayerName()}
        activePlayersList={gameLogic.getActivePlayersList()}
        activePlayers={gameLogic.activePlayers}
      />

      {!gameLogic.gameStarted ? (
        <StartScreen onStartGame={gameLogic.startGame} />
      ) : (
        <GeniusBoard
          colors={gameLogic.cores}
          activeColor={gameLogic.activeColor}
          onColorClick={handleColorClick}
          gameOver={gameLogic.gameOver}
          difficultyLevel={gameLogic.getDifficultyLevel()}
        />
      )}

      <GameMessages
        showEliminatedMessage={playerElimination.showEliminatedMessage}
        eliminatedMessage={playerElimination.eliminatedMessage}
        showWinnerMessage={playerElimination.showWinnerMessage}
        winnerMessage={playerElimination.winnerMessage}
        gameOver={gameLogic.gameOver}
        isSinglePlayer={config.isSinglePlayer}
        currentScore={gameLogic.getCurrentScore()}
        round={gameLogic.round}
      />
    </div>
  );
}
