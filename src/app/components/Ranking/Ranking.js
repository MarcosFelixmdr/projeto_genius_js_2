'use client';

import { get } from 'http';
import { useState, useEffect } from 'react';

export default function Ranking({ onBackToMenu }) {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
  getRanking();

    // Requisicao do tipo GET (all) para o banco de dados com order by points desc limit 10
  }, []);

  const getRanking = async () => {
  try {
    const response = await fetch('/api/registers');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();
    const sortedRankings = data.sort((a, b) => b.points - a.points).slice(0, 10);

    setRankings(sortedRankings);
  } catch (error) {
    console.error('Erro ao buscar rankings:', error.message);
  }
};

  const clearRankings = () => {
    if (confirm('Tem certeza que deseja limpar todo o ranking?')) {

      // Requisicao para o banco de dados do tipo delete all

      localStorage.removeItem('geniusRankings');
      setRankings([]);
    }
  };

  return (
    <div className="ranking">
      <div className="ranking-container">
        <div className="ranking-header">
          <button className="back-btn" onClick={onBackToMenu}>← MENU</button>
          <h1>RANKING 🏆</h1>
          <button className="clear-btn" onClick={clearRankings}>LIMPAR</button>
        </div>

        <div className="ranking-content">
          {rankings.length === 0 ? (
            <div className="no-rankings">
              <p>Nenhuma pontuação registrada ainda.</p>
              <p>Jogue para aparecer no ranking!</p>
            </div>
          ) : (
            <div className="ranking-list">
              <div className="ranking-item header">
                <span className="position">#</span>
                <span className="avatar">Avatar</span>
                <span className="name">Jogador</span>
                <span className="score">Pontos</span>
                <span className="mode">Modo</span>
                <span className="date">Data</span>
              </div>
              
              {rankings.map((entry, index) => (
                <div key={index} className={`ranking-item ${index < 3 ? `top-${index + 1}` : ''}`}>
                  <span className="position">{index + 1}</span>
                  <span className="avatar">
                    <img
                      src={entry.avatar ? `/avatars/${entry.avatar}.png` : '/avatars/1.png'} // Fallback para avatar 1
                      alt={`Avatar ${entry.avatar}`}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '50%'  // se quiser circular
                      }}
                    />
                  </span>
                  <span className="name">{entry.name}</span>
                  <span className="score">{entry.points}</span>
                  <span className="mode">{entry.mode}</span>
                  <span className="date">
                    {new Date(entry.date).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}