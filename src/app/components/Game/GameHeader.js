//Esse é um componente funcional React que representa o cabeçalho do jogo.
//Recebe 4 props:
//onBackToMenu: função chamada ao clicar no botão "← MENU";
//score: pontuação atual;
//round: número da rodada atual;
//difficultyLevel: nível de dificuldade atual (Define dificuldade).
export default function GameHeader({ onBackToMenu, score, round, difficultyLevel }) {


  return (
    //Um container principal com a classe CSS
    //game-header — provavelmente estilizado para parecer um cabeçalho fixo no topo do jogo.
    <div className="game-header">

     {/*Ao ser clicado, executa a função onBackToMenu,*/}
      {/*que leva o jogador de volta ao menu principal do jogo.*/}
      <button className="back-btn" onClick={onBackToMenu}>
        ← MENU
      </button>
      
      {/*informações do jogo, Rodada, Pontuação e Dificuldade*/}
      <div className="game-info">
        <div className="score">Pontuação: {score}</div>
        <div className="round">Rodada: {round}</div>
        <div className="speed">Nível: {difficultyLevel}</div>
      </div>
    </div>
  );
}

